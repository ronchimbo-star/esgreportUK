import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import {
  FileDown,
  Printer,
  Share2,
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";

type Report = {
  id: string;
  title: string;
  description: string;
  framework: string;
  status: string;
  reporting_period: string;
  start_date: string;
  end_date: string;
  overall_score: number;
  environmental_score: number;
  social_score: number;
  governance_score: number;
  created_at: string;
  organization: {
    name: string;
    industry: string;
  };
  sections: Array<{
    title: string;
    content: string;
    section_number: number;
  }>;
};

export default function ReportPreview() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadReport();
  }, [params.id]);

  const loadReport = async () => {
    try {
      const { data: reportData, error: reportError } = await supabase
        .from('esg_reports')
        .select(`
          *,
          organization:organizations(name, industry)
        `)
        .eq('id', params.id)
        .single();

      if (reportError) throw reportError;

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('report_sections')
        .select('*')
        .eq('report_id', params.id)
        .order('section_number');

      if (sectionsError) throw sectionsError;

      setReport({
        ...(reportData as any),
        sections: sectionsData || []
      });
    } catch (error) {
      console.error('Error loading report:', error);
      toast({
        title: "Error",
        description: "Failed to load report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from('report_exports')
        .insert({
          report_id: params.id,
          export_format: 'pdf',
          exported_by: profile?.id,
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;

      window.print();

      toast({
        title: "Export Started",
        description: "Use your browser's print dialog to save as PDF"
      });
    } catch (error) {
      console.error('Error exporting:', error);
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const handleShare = () => {
    setLocation(`/reports/${params.id}/share`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading report...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Report not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="no-print bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container-responsive py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setLocation(`/reports/${params.id}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Report
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button onClick={handleExportPDF} disabled={exporting}>
                  <FileDown className="w-4 h-4 mr-2" />
                  {exporting ? "Exporting..." : "Export PDF"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl py-12 px-4">
          <Card className="print:shadow-none print:border-0">
            <CardContent className="p-12">
              <div className="mb-12 text-center border-b border-gray-200 pb-8">
                <div className="mb-4">
                  <Badge className="mb-4">{report.framework}</Badge>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {report.title}
                </h1>
                <p className="text-xl text-gray-600 mb-6">{report.description}</p>
                <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    {report.organization.name}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {report.reporting_period}
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {report.status}
                  </div>
                </div>
              </div>

              {report.overall_score !== null && (
                <div className="mb-12 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8 print:bg-gray-50">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Overall ESG Performance
                  </h2>
                  <div className="grid grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Overall Score</p>
                      <p className="text-4xl font-bold text-blue-600">
                        {report.overall_score?.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Environmental</p>
                      <p className="text-4xl font-bold text-green-600">
                        {report.environmental_score?.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Social</p>
                      <p className="text-4xl font-bold text-purple-600">
                        {report.social_score?.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Governance</p>
                      <p className="text-4xl font-bold text-orange-600">
                        {report.governance_score?.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {report.sections && report.sections.length > 0 ? (
                <div className="space-y-10">
                  {report.sections.map((section) => (
                    <div key={section.section_number} className="break-inside-avoid">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        {section.section_number}. {section.title}
                      </h2>
                      <div
                        className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: section.content || 'No content available.' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No sections have been added to this report yet.</p>
                </div>
              )}

              <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
                <p>
                  This report was generated on {format(new Date(), 'MMMM dd, yyyy')} by{' '}
                  {report.organization.name}
                </p>
                <p className="mt-2">
                  Reporting Period: {report.start_date && format(new Date(report.start_date), 'MMM dd, yyyy')}
                  {' '}-{' '}
                  {report.end_date && format(new Date(report.end_date), 'MMM dd, yyyy')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .no-print {
            display: none !important;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 2cm;
          }
        }
      `}</style>
    </Layout>
  );
}
