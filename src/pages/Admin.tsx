import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Link } from "wouter";
import {
  Settings,
  Users,
  FileText,
  BarChart3,
  Newspaper,
  Layers,
  TrendingUp,
  Activity,
  UserCheck,
  AlertCircle,
  ArrowRight,
  Globe,
  DollarSign,
  Mail
} from "lucide-react";

type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalReports: number;
  completedReports: number;
  draftReports: number;
  publishedNews: number;
  totalNews: number;
  recentActivity: {
    user_email: string;
    action: string;
    created_at: string;
    entity_type: string;
  }[];
};

export default function Admin() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    totalReports: 0,
    completedReports: 0,
    draftReports: 0,
    publishedNews: 0,
    totalNews: 0,
    recentActivity: [],
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      const [usersResult, reportsResult, newsResult, activityResult] =
        await Promise.all([
          supabase.from("users").select("id, is_active, is_banned"),
          supabase.from("esg_reports").select("id, status"),
          supabase.from("news_posts").select("id, is_published"),
          supabase
            .from("activity_logs")
            .select(`
              action,
              entity_type,
              created_at,
              user:users(email)
            `)
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

      const users = usersResult.data || [];
      const reports = reportsResult.data || [];
      const news = newsResult.data || [];
      const activity = activityResult.data || [];

      setStats({
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.is_active && !u.is_banned).length,
        bannedUsers: users.filter((u) => u.is_banned).length,
        totalReports: reports.length,
        completedReports: reports.filter(
          (r) => r.status === "completed" || r.status === "published"
        ).length,
        draftReports: reports.filter((r) => r.status === "draft").length,
        publishedNews: news.filter((n) => n.is_published).length,
        totalNews: news.length,
        recentActivity: activity.map((a: any) => ({
          user_email: a.user?.email || "Unknown",
          action: a.action,
          created_at: a.created_at,
          entity_type: a.entity_type,
        })),
      });
    } catch (error: any) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const adminModules = [
    {
      title: "Analytics",
      description: "View platform analytics, user activity, and report metrics",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "User Management",
      description: "Manage users, view sessions, ban/activate accounts",
      icon: Users,
      href: "/admin/users",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Contact Inquiries",
      description: "View and respond to contact form submissions",
      icon: Mail,
      href: "/admin/contacts",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    {
      title: "Financial Management",
      description: "Manage billing, invoices, subscriptions, and custom charges",
      icon: DollarSign,
      href: "/admin/financial",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "News Management",
      description: "Create and manage news posts with SEO optimization",
      icon: Newspaper,
      href: "/admin/news",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Framework Admin",
      description: "Manage ESG frameworks and templates",
      icon: Layers,
      href: "/admin/frameworks",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Site Settings",
      description: "Configure site settings, branding, and footer links",
      icon: Settings,
      href: "/admin/settings",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  ];

  const quickStats = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      subtext: `${stats.activeUsers} active`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Total Reports",
      value: stats.totalReports,
      subtext: `${stats.completedReports} completed`,
      icon: FileText,
      color: "text-green-600",
    },
    {
      label: "News Posts",
      value: stats.totalNews,
      subtext: `${stats.publishedNews} published`,
      icon: Newspaper,
      color: "text-purple-600",
    },
    {
      label: "Banned Users",
      value: stats.bannedUsers,
      subtext: "Requires attention",
      icon: AlertCircle,
      color: "text-red-600",
    },
  ];

  const getActionLabel = (action: string) => {
    return action
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return (
      <Layout>
        <div className="container-responsive py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600">
                You don't have permission to access the admin panel
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
              <p className="text-gray-600">Loading dashboard...</p>
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {profile?.first_name || "Admin"}! Here's an overview of your platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Admin Modules</CardTitle>
                <CardDescription>
                  Quick access to all administration features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminModules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <Link key={module.title} href={module.href}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg ${module.bgColor}`}>
                                <Icon className={`w-6 h-6 ${module.color}`} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">
                                  {module.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                  {module.description}
                                </p>
                                <Button variant="ghost" size="sm" className="p-0">
                                  Open <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-600">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="pb-3 border-b last:border-0 last:pb-0"
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.user_email}
                            </p>
                            <p className="text-xs text-gray-600">
                              {getActionLabel(activity.action)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.activeUsers}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Draft Reports</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.draftReports}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalReports > 0
                      ? Math.round(
                          (stats.completedReports / stats.totalReports) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
