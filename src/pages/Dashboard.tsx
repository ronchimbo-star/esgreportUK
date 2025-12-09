import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import {
  FileText,
  CheckCircle,
  Clock,
  FileEdit,
  Plus,
  TrendingUp,
  Users,
  BarChart3,
  Activity,
  Sparkles,
  ArrowRight,
  Calendar,
  Target
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Report = {
  id: string;
  title: string;
  framework: string;
  status: string;
  overall_score: number | null;
  updated_at: string;
};

type ActivityItem = {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
  } | null;
};

export default function Dashboard() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    draft: 0
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [frameworkCoverage, setFrameworkCoverage] = useState<{ framework: string; count: number }[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [profile?.organization_id]);

  const loadDashboardData = async () => {
    if (!profile?.organization_id) return;

    try {
      const { data: reports, error: reportsError } = await supabase
        .from('esg_reports')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('updated_at', { ascending: false });

      if (reportsError) throw reportsError;

      const total = reports?.length || 0;
      const completed = reports?.filter(r => r.status === 'published').length || 0;
      const inProgress = reports?.filter(r => r.status === 'in_progress').length || 0;
      const draft = reports?.filter(r => r.status === 'draft').length || 0;

      setStats({ total, completed, inProgress, draft });
      setRecentReports(reports?.slice(0, 5) || []);

      const frameworkMap = new Map<string, number>();
      reports?.forEach(r => {
        frameworkMap.set(r.framework, (frameworkMap.get(r.framework) || 0) + 1);
      });
      setFrameworkCoverage(
        Array.from(frameworkMap.entries())
          .map(([framework, count]) => ({ framework, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );

      const { data: activity, error: activityError } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user:users(first_name, last_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activityError) throw activityError;
      setRecentActivity(activity as any || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Reports",
      value: stats.total.toString(),
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Completed",
      value: stats.completed.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "In Progress",
      value: stats.inProgress.toString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Draft",
      value: stats.draft.toString(),
      icon: FileEdit,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    }
  ];

  const quickActions = [
    {
      title: "Start New Report",
      description: "Create a new ESG report from scratch",
      icon: Plus,
      href: "/reports/new",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Browse Frameworks",
      description: "Explore available ESG frameworks",
      icon: FileText,
      href: "/frameworks-auth",
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "AI Assistant",
      description: "Get help with ESG reporting",
      icon: Sparkles,
      href: "/ai-assistant",
      color: "bg-purple-600 hover:bg-purple-700"
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-orange-100 text-orange-800',
      review: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getActionLabel = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-responsive py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.first_name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            Here's an overview of your ESG reporting progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Reports</CardTitle>
                    <CardDescription>
                      Your most recently updated ESG reports
                    </CardDescription>
                  </div>
                  <Link href="/reports">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentReports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No reports yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Get started by creating your first ESG report
                    </p>
                    <Link href="/reports/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Report
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <Link key={report.id} href={`/reports/${report.id}`}>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-1">{report.title}</h4>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Badge variant="outline">{report.framework}</Badge>
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatDistanceToNow(new Date(report.updated_at), { addSuffix: true })}
                                </span>
                                {report.overall_score !== null && (
                                  <span className="flex items-center font-medium text-blue-600">
                                    <Target className="w-3 h-3 mr-1" />
                                    Score: {report.overall_score.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Completion Rate
                  </CardTitle>
                  <CardDescription>
                    Your report completion progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.total === 0 ? (
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">
                        Performance data will appear once you complete your first report
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-gray-900 mb-2">
                          {Math.round((stats.completed / stats.total) * 100)}%
                        </p>
                        <p className="text-sm text-gray-600">
                          {stats.completed} of {stats.total} reports completed
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-600" />
                    Framework Coverage
                  </CardTitle>
                  <CardDescription>
                    Frameworks you're currently reporting on
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {frameworkCoverage.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">
                        Start reporting to see framework coverage
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {frameworkCoverage.map((item) => (
                        <div key={item.framework} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{item.framework}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{item.count} report{item.count !== 1 ? 's' : ''}</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(item.count / stats.total) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest updates and changes to your reports
                    </CardDescription>
                  </div>
                  <Link href="/activity">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No activity yet
                    </h3>
                    <p className="text-gray-600">
                      Your activity feed will appear here once you start working on reports
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-gray-200"
                      >
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {getActionLabel(activity.action)}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {activity.user ? (
                              <>
                                {activity.user.first_name} {activity.user.last_name}
                                {' • '}
                              </>
                            ) : (
                              <>System • </>
                            )}
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize flex-shrink-0">
                          {activity.entity_type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.title} href={action.href}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardContent className="pt-6">
                        <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {stats.total === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Get Started Guide
              </CardTitle>
              <CardDescription>
                Follow these steps to set up your ESG reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Choose Your Framework</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Browse our framework catalog and select the standards that apply to your organization
                    </p>
                    <Link href="/frameworks-auth">
                      <Button size="sm" variant="outline">Browse Frameworks</Button>
                    </Link>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Create Your First Report</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Start a new report and our AI will guide you through the data collection process
                    </p>
                    <Link href="/reports/new">
                      <Button size="sm" variant="outline">Create Report</Button>
                    </Link>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm">3</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Collect & Validate Data</h4>
                    <p className="text-sm text-gray-600">
                      Use our intelligent forms, bulk import tools, and AI assistance to gather your ESG data
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm">4</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Generate & Export Reports</h4>
                    <p className="text-sm text-gray-600">
                      Review your report, generate professional PDFs, and publish to stakeholders
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
