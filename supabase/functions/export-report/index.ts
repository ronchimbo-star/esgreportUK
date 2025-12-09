import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ExportRequest {
  reportId: string;
  format: 'pdf' | 'excel' | 'json' | 'csv';
  includeCharts?: boolean;
  sections?: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const body: ExportRequest = await req.json();
    const { reportId, format, includeCharts = true, sections } = body;

    const { data: report, error: reportError } = await supabase
      .from('esg_reports')
      .select('*, organization:organizations(*)')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      throw new Error('Report not found');
    }

    const { data: reportSections, error: sectionsError } = await supabase
      .from('report_sections')
      .select('*')
      .eq('report_id', reportId)
      .order('order_index');

    if (sectionsError) {
      throw new Error('Failed to fetch report sections');
    }

    const { data: dataEntries, error: dataError } = await supabase
      .from('data_entries')
      .select('*')
      .eq('report_id', reportId)
      .order('category, metric_name');

    if (dataError) {
      throw new Error('Failed to fetch data entries');
    }

    let exportData;
    let contentType;
    let filename;

    switch (format) {
      case 'json':
        exportData = JSON.stringify({
          report,
          sections: reportSections,
          data: dataEntries,
        }, null, 2);
        contentType = 'application/json';
        filename = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        break;

      case 'csv':
        exportData = generateCSV(dataEntries);
        contentType = 'text/csv';
        filename = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'excel':
        exportData = generateExcelFormat(report, reportSections, dataEntries);
        contentType = 'application/json';
        filename = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        break;

      case 'pdf':
        exportData = generatePDFData(report, reportSections, dataEntries);
        contentType = 'application/json';
        filename = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        break;

      default:
        throw new Error('Unsupported format');
    }

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      organization_id: report.organization_id,
      action: 'report_exported',
      entity_type: 'esg_report',
      entity_id: reportId,
      details: { format }
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: exportData,
        filename,
        contentType,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Export Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function generateCSV(dataEntries: any[]): string {
  const headers = ['Category', 'Metric Name', 'Value', 'Unit', 'Quality Score', 'Notes', 'Data Source'];
  const rows = dataEntries.map(entry => [
    entry.category || '',
    entry.metric_name || '',
    entry.value?.toString() || '',
    entry.unit || '',
    entry.quality_score?.toString() || '',
    entry.notes || '',
    entry.data_source || '',
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

function generateExcelFormat(report: any, sections: any[], data: any[]) {
  return {
    sheets: [
      {
        name: 'Report Summary',
        data: [
          ['Title', report.title],
          ['Framework', report.framework],
          ['Reporting Period', report.reporting_period],
          ['Status', report.status],
          ['Overall Score', report.overall_score || 'N/A'],
          ['Created', new Date(report.created_at).toLocaleDateString()],
        ],
      },
      {
        name: 'Sections',
        data: [
          ['Title', 'Content', 'Order'],
          ...sections.map(s => [s.title, s.content, s.order_index]),
        ],
      },
      {
        name: 'Data',
        data: [
          ['Category', 'Metric', 'Value', 'Unit', 'Quality', 'Notes'],
          ...data.map(d => [
            d.category,
            d.metric_name,
            d.value,
            d.unit,
            d.quality_score || 'N/A',
            d.notes || '',
          ]),
        ],
      },
    ],
  };
}

function generatePDFData(report: any, sections: any[], data: any[]) {
  const groupedData = data.reduce((acc: any, entry: any) => {
    const category = entry.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(entry);
    return acc;
  }, {});

  return {
    title: report.title,
    subtitle: `${report.framework} Report - ${report.reporting_period}`,
    metadata: {
      organization: report.organization?.name || 'Organization',
      framework: report.framework,
      period: report.reporting_period,
      status: report.status,
      score: report.overall_score,
      generated: new Date().toISOString(),
    },
    sections: sections.map(section => ({
      title: section.title,
      content: section.content,
    })),
    dataByCategory: Object.entries(groupedData).map(([category, entries]: [string, any]) => ({
      category,
      metrics: entries.map((e: any) => ({
        name: e.metric_name,
        value: e.value,
        unit: e.unit,
        quality: e.quality_score,
        notes: e.notes,
      })),
    })),
  };
}
