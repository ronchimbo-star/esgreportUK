import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  FileText,
  TrendingUp,
  Globe,
  BarChart3,
  Activity,
  Building2,
  MapPin
} from "lucide-react";
import { format } from "date-fns";

type AnalyticsData = {
  totalUsers: number;
  activeUsers: number;
  totalReports: number;
  completedReports: number;
  reportsByFramework: { framework: string; count: number }[];
  reportsByIndustry: { industry: string; count: number }[];
  userActivity: {
    user_email: string;
    report_count: number;
    last_activity: string;
    last_ip: string | null;
  }[];
  recentSessions: {
    email: string;
    ip_address: string;
    login_at: string;
    city: string | null;
    country: string | null;
  }[];
};

export default function AnalyticsDashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalReports: 0,
    completedReports: 0,
    reportsByFramework: [],
    reportsByIndustry: [],
    userActivity: [],
    recentSessions: [],
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const [
        usersResult,
        reportsResult,
        organizationsResult,
        sessionsResult,
      ] = await Promise.all([
        supabase.from("users").select("id, is_active, is_banned, email, last_login_ip"),
        supabase.from("esg_reports").select("id, status, framework, organization_id, created_by, created_at"),
        supabase.from("organizations").select("id, industry"),
        supabase
          .from("user_sessions")
          .select(`
            ip_address,
            login_at,
            city,
            country,
            user:users(email)
          `)
          .order("login_at", { ascending: false })
          .limit(20),
      ]);

      const users = usersResult.data || [];
      const reports = reportsResult.data || [];
      const organizations = organizationsResult.data || [];
      const sessions = sessionsResult.data || [];

      const totalUsers = users.length;
      const activeUsers = users.filter(
        (u) => u.is_active && !u.is_banned
      ).length;

      const totalReports = reports.length;
      const completedReports = reports.filter(
        (r) => r.status === "completed" || r.status === "published"
      ).length;

      const frameworkCounts = reports.reduce((acc, report) => {
        const framework = report.framework || "Unknown";
        acc[framework] = (acc[framework] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const reportsByFramework = Object.entries(frameworkCounts)
        .map(([framework, count]) => ({ framework, count }))
        .sort((a, b) => b.count - a.count);

      const orgMap = new Map(organizations.map((o) => [o.id, o.industry]));
      const industryCounts = reports.reduce((acc, report) => {
        const industry = orgMap.get(report.organization_id) || "Unknown";
        acc[industry] = (acc[industry] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const reportsByIndustry = Object.entries(industryCounts)
        .map(([industry, count]) => ({ industry, count }))
        .sort((a, b) => b.count - a.count);

      const userReportCounts = reports.reduce((acc, report) => {
        const userId = report.created_by;
        if (!userId) return acc;
        if (!acc[userId]) {
          acc[userId] = { count: 0, lastActivity: report.created_at };
        }
        acc[userId].count++;
        if (new Date(report.created_at) > new Date(acc[userId].lastActivity)) {
          acc[userId].lastActivity = report.created_at;
        }
        return acc;
      }, {} as Record<string, { count: number; lastActivity: string }>);

      const userActivity = users
        .map((user) => ({
          user_email: user.email,
          report_count: userReportCounts[user.id]?.count || 0,
          last_activity: userReportCounts[user.id]?.lastActivity || "",
          last_ip: user.last_login_ip,
        }))
        .filter((u) => u.report_count > 0)
        .sort((a, b) => b.report_count - a.report_count)
        .slice(0, 10);

      const recentSessions = sessions.map((s: any) => ({
        email: s.user?.email || "Unknown",
        ip_address: s.ip_address,
        login_at: s.login_at,
        city: s.city,
        country: s.country,
      }));

      setAnalytics({
        totalUsers,
        activeUsers,
        totalReports,
        completedReports,
        reportsByFramework,
        reportsByIndustry,
        userActivity,
        recentSessions,
      });
    } catch (error: any) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Users",
      value: analytics.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Active Users",
      value: analytics.activeUsers,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Total Reports",
      value: analytics.totalReports,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "Completed Reports",
      value: analytics.completedReports,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ];

  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return (
      <Layout>
        <div className="container-responsive py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-gray-600">
                Access denied. Admin privileges required.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container-responsive py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-responsive py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive insights into platform usage and activity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="users">User Activity</TabsTrigger>
            <TabsTrigger value="sessions">Login Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Reports by Framework
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.reportsByFramework.length === 0 ? (
                    <p className="text-gray-600 text-sm">No data available</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.reportsByFramework.map((item) => (
                        <div
                          key={item.framework}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm font-medium">
                            {item.framework}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(item.count / analytics.totalReports) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <Badge variant="secondary">{item.count}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Reports by Industry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.reportsByIndustry.length === 0 ? (
                    <p className="text-gray-600 text-sm">No data available</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.reportsByIndustry.map((item) => (
                        <div
                          key={item.industry}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm font-medium">
                            {item.industry}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${(item.count / analytics.totalReports) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <Badge variant="secondary">{item.count}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Users by Report Generation</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.userActivity.length === 0 ? (
                  <p className="text-gray-600 text-sm">No user activity data</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.userActivity.map((user, index) => (
                      <div
                        key={user.user_email}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.user_email}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              {user.last_activity && (
                                <span>
                                  Last active:{" "}
                                  {format(
                                    new Date(user.last_activity),
                                    "MMM dd, yyyy"
                                  )}
                                </span>
                              )}
                              {user.last_ip && (
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {user.last_ip}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {user.report_count} reports
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Login Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.recentSessions.length === 0 ? (
                  <p className="text-gray-600 text-sm">No session data available</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.recentSessions.map((session, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{session.email}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {session.ip_address}
                            </span>
                            {session.city && session.country && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {session.city}, {session.country}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {format(
                            new Date(session.login_at),
                            "MMM dd, HH:mm"
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
