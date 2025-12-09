import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentsSection } from "@/components/CommentsSection";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import {
  FileText,
  Calendar,
  User,
  Clock,
  CheckCircle,
  FileEdit,
  Download,
  Share2,
  BarChart3,
  MessageSquare,
  History,
  ArrowLeft,
  Plus
} from "lucide-react";
import { format } from "date-fns";

type Report = {
  id: string;
  title: string;
  description: string;
  status: string;
  reporting_period_start: string;
  reporting_period_end: string;
  target_completion_date: string | null;
  created_at: string;
  updated_at: string;
  framework: {
    id: string;
    name: string;
    code: string;
    description: string;
  };
  creator: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

export default function ReportDetail() {
  const [match, params] = useRoute("/reports/:id");
  const { toast } = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataEntries, setDataEntries] = useState([]);

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
          *,
          framework:frameworks(id, name, code, description),
          creator:user_profiles!reports_created_by_fkey(first_name, last_name, email)
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
      const { data } = await supabase
        .from('data_entries')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });

      setDataEntries(data || []);
    } catch (error) {
      console.error('Error loading data entries:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { icon: FileEdit, color: "bg-gray-100 text-gray-800", label: "Draft" },
      in_progress: { icon: Clock, color: "bg-blue-100 text-blue-800", label: "In Progress" },
      review: { icon: FileText, color: "bg-yellow-100 text-yellow-800", label: "Under Review" },
      completed: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Completed" },
      published: { icon: CheckCircle, color: "bg-purple-100 text-purple-800", label: "Published" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!report) return;

    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', report.id);

      if (error) throw error;

      setReport({ ...report, status: newStatus });
      toast({
        title: "Success",
        description: "Report status updated"
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
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
        <div className="container-responsive py-16 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-6">The report you're looking for doesn't exist or you don't have access to it.</p>
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
          <Link href="/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
              {getStatusBadge(report.status)}
            </div>
            {report.description && (
              <p className="text-gray-600 mb-4">{report.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {report.framework.name}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {format(new Date(report.reporting_period_start), 'MMM yyyy')} - {format(new Date(report.reporting_period_end), 'MMM yyyy')}
              </span>
              <span className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {report.creator.first_name} {report.creator.last_name}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/reports/${report.id}/data`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Data
              </Button>
            </Link>
            <Link href={`/reports/${report.id}/preview`}>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
            <Link href={`/reports/${report.id}/share`}>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </Link>
            <Link href={`/reports/${report.id}/preview`}>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completion</p>
                  <p className="text-2xl font-bold">0%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Data Points</p>
                  <p className="text-2xl font-bold">{dataEntries.length}</p>
                </div>
                <FileText className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Comments</p>
                  <p className="text-2xl font-bold">{comments.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                  <p className="text-sm font-medium">
                    {format(new Date(report.updated_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                <History className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="data">Data Entries</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Framework</p>
                    <p className="text-gray-900">{report.framework.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <div className="mt-1">{getStatusBadge(report.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reporting Period</p>
                    <p className="text-gray-900">
                      {format(new Date(report.reporting_period_start), 'MMM dd, yyyy')} - {format(new Date(report.reporting_period_end), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  {report.target_completion_date && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Target Completion</p>
                      <p className="text-gray-900">
                        {format(new Date(report.target_completion_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => handleStatusChange('in_progress')}>
                    Mark as In Progress
                  </Button>
                  <Button variant="outline" onClick={() => handleStatusChange('review')}>
                    Send for Review
                  </Button>
                  <Button variant="outline" onClick={() => handleStatusChange('completed')}>
                    Mark as Completed
                  </Button>
                  <Button variant="outline" onClick={() => handleStatusChange('published')}>
                    Publish Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Data Entries</CardTitle>
                  <Link href={`/reports/${report.id}/data`}>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Data
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  ESG data collected for this report
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dataEntries.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No data entries yet</p>
                    <Link href={`/reports/${report.id}/data`}>
                      <Button>Start Adding Data</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dataEntries.map((entry: any) => (
                      <Card key={entry.id}>
                        <CardContent className="pt-4">
                          <p className="font-medium">{entry.metric_name}</p>
                          <p className="text-sm text-gray-600">
                            {entry.value} {entry.unit}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                    <Link href={`/reports/${report.id}/data`}>
                      <Button variant="outline" className="w-full">View All Data Entries</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <CommentsSection reportId={report.id} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
                <CardDescription>
                  Timeline of changes and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Activity history coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
