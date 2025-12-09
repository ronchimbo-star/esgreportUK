import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Check,
  AlertCircle,
  Calendar,
  Target,
  BarChart3
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Report = {
  id: string;
  title: string;
  framework: string;
  status: string;
  overall_score: number | null;
  reporting_period: string;
  created_at: string;
  updated_at: string;
};

type DataEntry = {
  metric_name: string;
  value: number;
  unit: string;
  quality_score: number | null;
};

export default function ReportCompare() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [availableReports, setAvailableReports] = useState<Report[]>([]);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [comparisonData, setComparisonData] = useState<{ [reportId: string]: DataEntry[] }>({});
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    loadReports();
  }, [profile?.organization_id]);

  const loadReports = async () => {
    if (!profile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('esg_reports')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addReportToComparison = (report: Report) => {
    if (selectedReports.length >= 3) {
      toast({
        title: "Maximum reports reached",
        description: "You can compare up to 3 reports at a time",
        variant: "destructive"
      });
      return;
    }

    if (selectedReports.find(r => r.id === report.id)) {
      toast({
        title: "Already selected",
        description: "This report is already in the comparison",
        variant: "destructive"
      });
      return;
    }

    setSelectedReports([...selectedReports, report]);
  };

  const removeReportFromComparison = (reportId: string) => {
    setSelectedReports(selectedReports.filter(r => r.id !== reportId));
    const newData = { ...comparisonData };
    delete newData[reportId];
    setComparisonData(newData);
  };

  const compareReports = async () => {
    if (selectedReports.length < 2) {
      toast({
        title: "Not enough reports",
        description: "Select at least 2 reports to compare",
        variant: "destructive"
      });
      return;
    }

    setComparing(true);
    try {
      const dataPromises = selectedReports.map(async (report) => {
        const { data, error } = await supabase
          .from('data_entries')
          .select('metric_name, value, unit, quality_score')
          .eq('report_id', report.id)
          .order('metric_name');

        if (error) throw error;
        return { reportId: report.id, data: data || [] };
      });

      const results = await Promise.all(dataPromises);
      const newComparisonData: { [reportId: string]: DataEntry[] } = {};
      results.forEach(({ reportId, data }) => {
        newComparisonData[reportId] = data;
      });

      setComparisonData(newComparisonData);
    } catch (error) {
      console.error('Error comparing reports:', error);
      toast({
        title: "Error",
        description: "Failed to compare reports",
        variant: "destructive"
      });
    } finally {
      setComparing(false);
    }
  };

  const getAllMetrics = () => {
    const metrics = new Set<string>();
    Object.values(comparisonData).forEach(entries => {
      entries.forEach(entry => metrics.add(entry.metric_name));
    });
    return Array.from(metrics).sort();
  };

  const getMetricValue = (reportId: string, metricName: string) => {
    const entries = comparisonData[reportId] || [];
    return entries.find(e => e.metric_name === metricName);
  };

  const calculateTrend = (reportId1: string, reportId2: string, metricName: string) => {
    const value1 = getMetricValue(reportId1, metricName);
    const value2 = getMetricValue(reportId2, metricName);

    if (!value1 || !value2) return null;

    const diff = value2.value - value1.value;
    const percentChange = (diff / value1.value) * 100;

    return {
      diff,
      percentChange,
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same'
    };
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-orange-100 text-orange-800',
      review: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-responsive py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Reports</h1>
          <p className="text-gray-600">Compare ESG reports side by side to track progress and identify trends</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Select Reports ({selectedReports.length}/3)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableReports.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No reports available</p>
                  </div>
                ) : (
                  availableReports.map((report) => {
                    const isSelected = selectedReports.find(r => r.id === report.id);
                    return (
                      <div
                        key={report.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => !isSelected && addReportToComparison(report)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm text-gray-900">{report.title}</h4>
                          {isSelected && <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Badge variant="outline" className="text-xs">{report.framework}</Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {selectedReports.length >= 2 && (
                <Button
                  onClick={compareReports}
                  disabled={comparing}
                  className="w-full mt-4"
                >
                  {comparing ? 'Comparing...' : 'Compare Reports'}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Selected Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedReports.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports selected</h3>
                  <p className="text-gray-600">Select reports from the list to start comparing</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedReports.map((report, index) => (
                    <Card key={report.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                            </div>
                            <h4 className="font-semibold text-gray-900">{report.title}</h4>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeReportFromComparison(report.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Framework:</span>
                            <Badge variant="outline">{report.framework}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Status:</span>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {report.overall_score !== null && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Score:</span>
                              <span className="font-medium text-blue-600 flex items-center">
                                <Target className="w-3 h-3 mr-1" />
                                {report.overall_score.toFixed(1)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Period:</span>
                            <span className="font-medium">{report.reporting_period}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Updated:</span>
                            <span className="text-gray-500 flex items-center text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDistanceToNow(new Date(report.updated_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {Object.keys(comparisonData).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Comparison Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Metric</th>
                      {selectedReports.map((report, index) => (
                        <th key={report.id} className="text-left py-3 px-4 font-semibold text-gray-900">
                          Report {index + 1}
                        </th>
                      ))}
                      {selectedReports.length === 2 && (
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Trend</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {getAllMetrics().map((metric) => (
                      <tr key={metric} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-700">{metric}</td>
                        {selectedReports.map((report) => {
                          const value = getMetricValue(report.id, metric);
                          return (
                            <td key={report.id} className="py-3 px-4">
                              {value ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {value.value.toLocaleString()} {value.unit}
                                  </span>
                                  {value.quality_score !== null && (
                                    <Badge
                                      variant="outline"
                                      className={
                                        value.quality_score >= 80
                                          ? 'bg-green-50 text-green-700'
                                          : value.quality_score >= 60
                                          ? 'bg-orange-50 text-orange-700'
                                          : 'bg-red-50 text-red-700'
                                      }
                                    >
                                      Q: {value.quality_score}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">No data</span>
                              )}
                            </td>
                          );
                        })}
                        {selectedReports.length === 2 && (
                          <td className="py-3 px-4">
                            {(() => {
                              const trend = calculateTrend(
                                selectedReports[0].id,
                                selectedReports[1].id,
                                metric
                              );
                              if (!trend) return <span className="text-gray-400">-</span>;

                              return (
                                <div className="flex items-center gap-2">
                                  {trend.direction === 'up' && (
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                  )}
                                  {trend.direction === 'down' && (
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                  )}
                                  {trend.direction === 'same' && (
                                    <Minus className="w-4 h-4 text-gray-600" />
                                  )}
                                  <span
                                    className={`font-medium ${
                                      trend.direction === 'up'
                                        ? 'text-green-600'
                                        : trend.direction === 'down'
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                    }`}
                                  >
                                    {trend.percentChange > 0 ? '+' : ''}
                                    {trend.percentChange.toFixed(1)}%
                                  </span>
                                </div>
                              );
                            })()}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {getAllMetrics().length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No data available for comparison</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
