import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  FileEdit,
  Trash2,
  Eye,
  Calendar,
  User
} from "lucide-react";
import { format } from "date-fns";

type Report = {
  id: string;
  title: string;
  status: string;
  reporting_period_start: string;
  reporting_period_end: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  framework: {
    id: string;
    name: string;
    code: string;
  };
  creator: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

export default function Reports() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('esg_reports')
        .select(`
          id,
          title,
          status,
          start_date,
          end_date,
          created_at,
          updated_at,
          created_by,
          framework,
          organization:organizations(id, name)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedReports = (data || []).map(report => ({
        id: report.id,
        title: report.title,
        status: report.status,
        reporting_period_start: report.start_date,
        reporting_period_end: report.end_date,
        created_at: report.created_at,
        updated_at: report.updated_at,
        created_by: report.created_by,
        framework: {
          id: report.framework,
          name: report.framework,
          code: report.framework
        },
        creator: {
          first_name: '',
          last_name: '',
          email: ''
        }
      }));

      setReports(formattedReports as any);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { icon: FileEdit, color: "bg-gray-100 text-gray-800", label: "Draft" },
      in_progress: { icon: Clock, color: "bg-blue-100 text-blue-800", label: "In Progress" },
      review: { icon: Eye, color: "bg-yellow-100 text-yellow-800", label: "Under Review" },
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

  const getFilteredReports = () => {
    let filtered = reports;

    if (searchQuery) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.framework.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    return filtered;
  };

  const getReportsByStatus = (status: string) => {
    return reports.filter(report => report.status === status);
  };

  const stats = [
    { label: "Total Reports", value: reports.length, color: "text-blue-600" },
    { label: "Draft", value: getReportsByStatus('draft').length, color: "text-gray-600" },
    { label: "In Progress", value: getReportsByStatus('in_progress').length, color: "text-blue-600" },
    { label: "Completed", value: getReportsByStatus('completed').length + getReportsByStatus('published').length, color: "text-green-600" }
  ];

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ESG Reports</h1>
            <p className="text-gray-600">Manage and track your sustainability reports</p>
          </div>
          <Link href="/reports/new">
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              New Report
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search reports by title or framework..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === null ? "default" : "outline"}
                  onClick={() => setStatusFilter(null)}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "draft" ? "default" : "outline"}
                  onClick={() => setStatusFilter("draft")}
                >
                  Draft
                </Button>
                <Button
                  variant={statusFilter === "in_progress" ? "default" : "outline"}
                  onClick={() => setStatusFilter("in_progress")}
                >
                  In Progress
                </Button>
                <Button
                  variant={statusFilter === "completed" ? "default" : "outline"}
                  onClick={() => setStatusFilter("completed")}
                >
                  Completed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {getFilteredReports().length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {reports.length === 0 ? "No reports yet" : "No reports match your filters"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {reports.length === 0
                    ? "Get started by creating your first ESG report"
                    : "Try adjusting your search or filters"}
                </p>
                {reports.length === 0 && (
                  <Link href="/reports/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Report
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {getFilteredReports().map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{report.title}</CardTitle>
                        {getStatusBadge(report.status)}
                      </div>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {report.framework.name}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(report.reporting_period_start), 'MMM yyyy')} - {format(new Date(report.reporting_period_end), 'MMM yyyy')}
                        </span>
                        {report.creator && (
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {report.creator.first_name} {report.creator.last_name}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/reports/${report.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/reports/${report.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <FileEdit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      Created: {format(new Date(report.created_at), 'MMM dd, yyyy')}
                    </span>
                    <span>
                      Last updated: {format(new Date(report.updated_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
