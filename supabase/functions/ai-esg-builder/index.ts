import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AIRequest {
  type: 'generate_report' | 'suggest_metrics' | 'analyze_data' | 'improve_content';
  framework?: string;
  industry?: string;
  reportingPeriod?: string;
  context?: string;
  content?: string;
  metrics?: any[];
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

    const body: AIRequest = await req.json();

    let response;
    switch (body.type) {
      case 'generate_report':
        response = await generateReportContent(body);
        break;
      case 'suggest_metrics':
        response = await suggestMetrics(body);
        break;
      case 'analyze_data':
        response = await analyzeData(body);
        break;
      case 'improve_content':
        response = await improveContent(body);
        break;
      default:
        throw new Error('Invalid request type');
    }

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'ai_assistant_used',
      entity_type: 'ai_request',
      details: { type: body.type }
    });

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('AI Builder Error:', error);
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

async function generateReportContent(req: AIRequest) {
  const { framework, industry, reportingPeriod } = req;
  
  const frameworkTemplates: { [key: string]: any } = {
    'GRI': {
      title: `GRI Standards ESG Report ${reportingPeriod}`,
      sections: [
        {
          title: 'Organizational Profile',
          content: `This section provides an overview of our organization's activities, governance, and commitment to sustainable development during ${reportingPeriod}. Our ${industry} operations demonstrate our dedication to transparent and comprehensive ESG reporting in accordance with GRI Standards.`,
        },
        {
          title: 'Economic Performance',
          content: `Our economic performance reflects sustainable value creation while maintaining strong financial discipline. We focus on long-term value generation that benefits all stakeholders, ensuring business resilience and contributing to sustainable economic development.`,
        },
        {
          title: 'Environmental Impact',
          content: `We recognize the importance of environmental stewardship. Our environmental management system focuses on reducing our carbon footprint, optimizing resource efficiency, and minimizing waste. Key initiatives include energy efficiency programs, water conservation, and circular economy practices.`,
        },
        {
          title: 'Social Responsibility',
          content: `Our commitment to social responsibility encompasses employee wellbeing, diversity and inclusion, community engagement, and human rights. We maintain fair labor practices, provide safe working conditions, and invest in employee development and community programs.`,
        },
        {
          title: 'Governance',
          content: `Strong governance forms the foundation of our ESG strategy. Our governance framework ensures ethical business conduct, risk management, compliance, and stakeholder engagement. We maintain transparent reporting and accountability at all organizational levels.`,
        },
      ],
    },
    'SASB': {
      title: `SASB ${industry} Report ${reportingPeriod}`,
      sections: [
        {
          title: 'Material Topics',
          content: `This report addresses material sustainability topics specific to the ${industry} sector as identified by SASB standards. We focus on industry-specific metrics that are most relevant to our investors and stakeholders.`,
        },
        {
          title: 'Environmental Metrics',
          content: `Industry-specific environmental performance indicators demonstrate our commitment to reducing environmental impact while maintaining operational excellence. We track energy consumption, emissions, water usage, and waste management metrics.`,
        },
        {
          title: 'Social Capital',
          content: `Our approach to social capital management includes customer welfare, data security, employee engagement, and community relations. We maintain high standards for product quality and customer service while ensuring data privacy and security.`,
        },
        {
          title: 'Human Capital',
          content: `Human capital metrics reflect our investment in workforce development, health and safety, and inclusive practices. We provide competitive compensation, comprehensive benefits, and opportunities for professional growth.`,
        },
        {
          title: 'Business Model & Innovation',
          content: `We continuously innovate to address sustainability challenges and create long-term value. Our business model integrates sustainability considerations into strategic decision-making and operational processes.`,
        },
      ],
    },
    'TCFD': {
      title: `TCFD Climate-Related Financial Disclosures ${reportingPeriod}`,
      sections: [
        {
          title: 'Governance',
          content: `Our Board of Directors provides oversight of climate-related risks and opportunities. The Board reviews climate strategy quarterly and ensures adequate resources are allocated to climate risk management.`,
        },
        {
          title: 'Strategy',
          content: `We have identified climate-related risks and opportunities across short, medium, and long-term time horizons. Our strategy addresses physical risks (acute and chronic) and transition risks (policy, technology, market, and reputation) while capitalizing on opportunities in resource efficiency and new markets.`,
        },
        {
          title: 'Risk Management',
          content: `Climate-related risks are integrated into our enterprise risk management framework. We assess, prioritize, and manage climate risks alongside other business risks through regular scenario analysis and monitoring.`,
        },
        {
          title: 'Metrics and Targets',
          content: `We track Scope 1, 2, and 3 greenhouse gas emissions and have established science-based targets aligned with limiting global warming to 1.5°C. Key metrics include carbon intensity, energy efficiency, and renewable energy usage.`,
        },
      ],
    },
  };

  const template = frameworkTemplates[framework || 'GRI'] || frameworkTemplates['GRI'];
  
  return {
    success: true,
    data: {
      title: template.title,
      sections: template.sections,
      suggestedMetrics: await suggestMetrics({ framework, industry }),
    },
  };
}

async function suggestMetrics(req: AIRequest) {
  const { framework, industry } = req;
  
  const metricsByFramework: { [key: string]: any[] } = {
    'GRI': [
      { name: 'Total Energy Consumption', unit: 'MWh', category: 'Environmental', description: 'Total energy consumed from all sources' },
      { name: 'GHG Emissions (Scope 1)', unit: 'tCO2e', category: 'Environmental', description: 'Direct greenhouse gas emissions' },
      { name: 'GHG Emissions (Scope 2)', unit: 'tCO2e', category: 'Environmental', description: 'Indirect emissions from purchased energy' },
      { name: 'Water Consumption', unit: 'm³', category: 'Environmental', description: 'Total water withdrawn and consumed' },
      { name: 'Waste Generated', unit: 'tonnes', category: 'Environmental', description: 'Total waste generated' },
      { name: 'Waste Diverted from Disposal', unit: 'tonnes', category: 'Environmental', description: 'Waste recycled or reused' },
      { name: 'Employee Turnover Rate', unit: '%', category: 'Social', description: 'Percentage of employees who left' },
      { name: 'Training Hours per Employee', unit: 'hours', category: 'Social', description: 'Average training hours provided' },
      { name: 'Women in Management', unit: '%', category: 'Social', description: 'Percentage of women in leadership roles' },
      { name: 'Lost Time Injury Frequency Rate', unit: 'per million hours', category: 'Social', description: 'Workplace injury frequency' },
      { name: 'Board Independence', unit: '%', category: 'Governance', description: 'Percentage of independent board members' },
      { name: 'Ethics Training Completion', unit: '%', category: 'Governance', description: 'Employees completing ethics training' },
    ],
    'SASB': [
      { name: 'Energy Intensity', unit: 'MWh/unit', category: 'Environmental', description: 'Energy consumption per unit of production' },
      { name: 'Carbon Intensity', unit: 'tCO2e/revenue', category: 'Environmental', description: 'GHG emissions per dollar of revenue' },
      { name: 'Renewable Energy Percentage', unit: '%', category: 'Environmental', description: 'Percentage of energy from renewable sources' },
      { name: 'Water Intensity', unit: 'm³/unit', category: 'Environmental', description: 'Water usage per unit of production' },
      { name: 'Customer Satisfaction Score', unit: 'score', category: 'Social', description: 'Net Promoter Score or similar metric' },
      { name: 'Data Security Incidents', unit: 'count', category: 'Social', description: 'Number of data breaches or security incidents' },
      { name: 'Employee Engagement Score', unit: 'score', category: 'Social', description: 'Employee satisfaction and engagement' },
      { name: 'Supplier ESG Assessments', unit: 'count', category: 'Governance', description: 'Suppliers assessed for ESG criteria' },
    ],
    'TCFD': [
      { name: 'Scope 1 Emissions', unit: 'tCO2e', category: 'Environmental', description: 'Direct GHG emissions from operations' },
      { name: 'Scope 2 Emissions', unit: 'tCO2e', category: 'Environmental', description: 'Indirect emissions from electricity' },
      { name: 'Scope 3 Emissions', unit: 'tCO2e', category: 'Environmental', description: 'Value chain emissions' },
      { name: 'Climate Risk Exposure', unit: 'USD', category: 'Governance', description: 'Financial exposure to climate risks' },
      { name: 'Climate Opportunities Value', unit: 'USD', category: 'Governance', description: 'Value of climate-related opportunities' },
      { name: 'Internal Carbon Price', unit: 'USD/tCO2e', category: 'Governance', description: 'Internal price on carbon emissions' },
    ],
  };

  const metrics = metricsByFramework[framework || 'GRI'] || metricsByFramework['GRI'];
  
  return {
    success: true,
    data: {
      metrics,
      recommendations: [
        'Start with material topics most relevant to your industry',
        'Ensure data collection processes are documented',
        'Set baseline values for year-over-year comparisons',
        'Align metrics with stakeholder expectations',
        'Consider industry benchmarks for target setting',
      ],
    },
  };
}

async function analyzeData(req: AIRequest) {
  const { metrics } = req;
  
  if (!metrics || metrics.length === 0) {
    return {
      success: true,
      data: {
        insights: ['No data available for analysis'],
        recommendations: ['Start by adding metrics to your report'],
      },
    };
  }

  const insights = [];
  const recommendations = [];
  
  const avgQuality = metrics.reduce((sum: number, m: any) => sum + (m.quality_score || 0), 0) / metrics.length;
  
  if (avgQuality < 60) {
    insights.push('Data quality scores are below target threshold');
    recommendations.push('Improve data collection and validation processes');
    recommendations.push('Consider implementing automated data collection systems');
  } else if (avgQuality < 80) {
    insights.push('Data quality is acceptable but has room for improvement');
    recommendations.push('Document data sources and calculation methodologies');
  } else {
    insights.push('High data quality across most metrics');
    recommendations.push('Maintain current data quality standards');
  }
  
  const envMetrics = metrics.filter((m: any) => m.category === 'Environmental');
  if (envMetrics.length < 5) {
    insights.push('Limited environmental data coverage');
    recommendations.push('Expand environmental metric tracking');
    recommendations.push('Consider adding energy, water, and waste metrics');
  }
  
  const socialMetrics = metrics.filter((m: any) => m.category === 'Social');
  if (socialMetrics.length < 3) {
    insights.push('Social metrics could be more comprehensive');
    recommendations.push('Add workforce diversity and safety metrics');
  }
  
  insights.push(`Total of ${metrics.length} metrics tracked across ${new Set(metrics.map((m: any) => m.category)).size} categories`);
  recommendations.push('Continue expanding metric coverage for comprehensive reporting');
  
  return {
    success: true,
    data: {
      insights,
      recommendations,
      qualityScore: avgQuality.toFixed(1),
      coverageAnalysis: {
        environmental: envMetrics.length,
        social: socialMetrics.length,
        governance: metrics.filter((m: any) => m.category === 'Governance').length,
      },
    },
  };
}

async function improveContent(req: AIRequest) {
  const { content, context } = req;
  
  if (!content) {
    throw new Error('Content is required');
  }
  
  const improvements = [
    'Consider adding specific quantitative targets',
    'Include year-over-year comparison data',
    'Reference relevant frameworks and standards',
    'Add stakeholder engagement information',
    'Specify measurement methodologies',
  ];
  
  const enhancedContent = content + '\n\nKey Performance Indicators:\n- Progress tracked against established targets\n- Regular monitoring and reporting processes in place\n- Stakeholder feedback incorporated into strategy';
  
  return {
    success: true,
    data: {
      original: content,
      enhanced: enhancedContent,
      suggestions: improvements,
      improvementAreas: [
        { area: 'Specificity', score: 75, suggestion: 'Add more specific metrics and targets' },
        { area: 'Completeness', score: 80, suggestion: 'Include all material topics' },
        { area: 'Clarity', score: 85, suggestion: 'Use clear, concise language' },
      ],
    },
  };
}
