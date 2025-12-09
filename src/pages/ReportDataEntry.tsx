import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { format } from "date-fns";

type DataEntry = {
  id: string;
  metric_name: string;
  metric_category: string;
  value: string;
  unit: string;
  data_period: string;
  notes: string;
  quality_score: number;
  created_at: string;
};

type Report = {
  id: string;
  title: string;
  framework: {
    name: string;
    code: string;
  };
};

export default function ReportDataEntry() {
  const [match, params] = useRoute("/reports/:id/data");
  const { user } = useAuth();
  const { toast } = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newEntry, setNewEntry] = useState({
    metric_name: "",
    metric_category: "environmental",
    value: "",
    unit: "",
    data_period: "",
    notes: ""
  });

  const metricCategories = [
    { value: "environmental", label: "Environmental", color: "bg-green-100 text-green-800" },
    { value: "social", label: "Social", color: "bg-blue-100 text-blue-800" },
    { value: "governance", label: "Governance", color: "bg-purple-100 text-purple-800" },
    { value: "economic", label: "Economic", color: "bg-orange-100 text-orange-800" }
  ];

  const commonMetrics = {
    environmental: [
      { name: "Total GHG Emissions (Scope 1)", unit: "tCO2e" },
      { name: "Total GHG Emissions (Scope 2)", unit: "tCO2e" },
      { name: "Total GHG Emissions (Scope 3)", unit: "tCO2e" },
      { name: "Energy Consumption", unit: "MWh" },
      { name: "Renewable Energy Use", unit: "%" },
      { name: "Water Consumption", unit: "m³" },
      { name: "Waste Generated", unit: "tonnes" },
      { name: "Waste Recycled", unit: "%" }
    ],
    social: [
      { name: "Total Employees", unit: "count" },
      { name: "Employee Turnover Rate", unit: "%" },
      { name: "Women in Leadership", unit: "%" },
      { name: "Employee Training Hours", unit: "hours" },
      { name: "Workplace Incidents", unit: "count" },
      { name: "Lost Time Injury Rate", unit: "per 100 FTE" }
    ],
    governance: [
      { name: "Board Independence", unit: "%" },
      { name: "Board Diversity", unit: "%" },
      { name: "Ethics Training Completion", unit: "%" },
      { name: "Data Breaches", unit: "count" },
      { name: "Anti-Corruption Policies", unit: "yes/no" }
    ],
    economic: [
      { name: "Revenue", unit: "currency" },
      { name: "EBITDA", unit: "currency" },
      { name: "Economic Value Generated", unit: "currency" },
      { name: "Tax Paid", unit: "currency" }
    ]
  };

  useEffect(() => {
    if (params?.id) {
      loadReport(params.id);
      loadDataEntries(params.id);
    }
  }, [params?.id]);

  const loadReport = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id,
          title,
          framework:frameworks(name, code)
        `)
        .eq('id', reportId)
        .single();

      if (error) throw error;
      setReport(data as any);
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

  const loadDataEntries = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDataEntries(data || []);
    } catch (error) {
      console.error('Error loading data entries:', error);
    }
  };

  const handleAddEntry = async () => {
    if (!params?.id || !newEntry.metric_name || !newEntry.value) {
      toast({
        title: "Required Fields",
        description: "Please fill in metric name and value",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .insert({
          report_id: params.id,
          metric_name: newEntry.metric_name,
          metric_category: newEntry.metric_category,
          value: newEntry.value,
          unit: newEntry.unit,
          data_period: newEntry.data_period || null,
          notes: newEntry.notes || null,
          quality_score: 75,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setDataEntries([data, ...dataEntries]);
      setNewEntry({
        metric_name: "",
        metric_category: "environmental",
        value: "",
        unit: "",
        data_period: "",
        notes: ""
      });

      toast({
        title: "Success",
        description: "Data entry added successfully"
      });
    } catch (error) {
      console.error('Error adding entry:', error);
      toast({
        title: "Error",
        description: "Failed to add data entry",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setDataEntries(dataEntries.filter(e => e.id !== entryId));
      toast({
        title: "Success",
        description: "Data entry deleted"
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive"
      });
    }
  };

  const getQualityBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">High Quality</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Medium Quality</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low Quality</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const config = metricCategories.find(c => c.value === category);
    return <Badge className={config?.color}>{config?.label}</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="container-responsive py-16 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
          <Link href="/reports">
            <Button>Back to Reports</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-responsive py-8">
        <div className="mb-6">
          <Link href={`/reports/${params?.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Report
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Entry</h1>
          <p className="text-gray-600">{report.title} - {report.framework.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Entries</p>
                  <p className="text-3xl font-bold">{dataEntries.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Quality</p>
                  <p className="text-3xl font-bold">
                    {dataEntries.length > 0
                      ? Math.round(dataEntries.reduce((sum, e) => sum + e.quality_score, 0) / dataEntries.length)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Categories</p>
                  <p className="text-3xl font-bold">
                    {new Set(dataEntries.map(e => e.metric_category)).size}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Data Entry</CardTitle>
            <CardDescription>Enter your ESG metrics and data points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={newEntry.metric_category}
                    onChange={(e) => setNewEntry({ ...newEntry, metric_category: e.target.value, metric_name: "", unit: "" })}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {metricCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="metric">Metric Name *</Label>
                  <select
                    id="metric"
                    value={newEntry.metric_name}
                    onChange={(e) => {
                      const selectedMetric = commonMetrics[newEntry.metric_category as keyof typeof commonMetrics]
                        .find(m => m.name === e.target.value);
                      setNewEntry({
                        ...newEntry,
                        metric_name: e.target.value,
                        unit: selectedMetric?.unit || ""
                      });
                    }}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a metric...</option>
                    {commonMetrics[newEntry.metric_category as keyof typeof commonMetrics].map(metric => (
                      <option key={metric.name} value={metric.name}>{metric.name}</option>
                    ))}
                    <option value="custom">Custom Metric...</option>
                  </select>
                </div>
              </div>

              {newEntry.metric_name === "custom" && (
                <div>
                  <Label htmlFor="custom_metric">Custom Metric Name</Label>
                  <Input
                    id="custom_metric"
                    placeholder="Enter custom metric name"
                    onChange={(e) => setNewEntry({ ...newEntry, metric_name: e.target.value })}
                    className="mt-2"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    value={newEntry.value}
                    onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                    placeholder="e.g., 1250.5"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={newEntry.unit}
                    onChange={(e) => setNewEntry({ ...newEntry, unit: e.target.value })}
                    placeholder="e.g., tCO2e, kWh, %"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="period">Data Period</Label>
                  <Input
                    id="period"
                    type="date"
                    value={newEntry.data_period}
                    onChange={(e) => setNewEntry({ ...newEntry, data_period: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  placeholder="Add any relevant context, methodology, or assumptions..."
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleAddEntry} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Add Entry"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Entries ({dataEntries.length})</CardTitle>
            <CardDescription>All data points for this report</CardDescription>
          </CardHeader>
          <CardContent>
            {dataEntries.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No data entries yet. Add your first metric above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dataEntries.map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">{entry.metric_name}</h4>
                            {getCategoryBadge(entry.metric_category)}
                            {getQualityBadge(entry.quality_score)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">Value</p>
                              <p className="font-medium text-lg">
                                {entry.value} {entry.unit && <span className="text-sm text-gray-600">{entry.unit}</span>}
                              </p>
                            </div>
                            {entry.data_period && (
                              <div>
                                <p className="text-sm text-gray-600">Period</p>
                                <p className="font-medium flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {format(new Date(entry.data_period), 'MMM dd, yyyy')}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-gray-600">Created</p>
                              <p className="font-medium">
                                {format(new Date(entry.created_at), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          {entry.notes && (
                            <div className="bg-gray-50 rounded p-3 mb-2">
                              <p className="text-sm text-gray-700">{entry.notes}</p>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
