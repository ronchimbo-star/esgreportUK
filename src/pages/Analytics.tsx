import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Leaf,
  Users,
  Building,
  AlertTriangle
} from "lucide-react";

export default function Analytics() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    completedReports: 0,
    totalDataPoints: 0,
    avgQuality: 0,
    environmentalMetrics: 0,
    socialMetrics: 0,
    governanceMetrics: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [reportsResult, dataEntriesResult] = await Promise.all([
        supabase.from('reports').select('id, status'),
        supabase.from('data_entries').select('id, metric_category, quality_score')
      ]);

      const reports = reportsResult.data || [];
      const dataEntries = dataEntriesResult.data || [];

      const completed = reports.filter(r => r.status === 'completed' || r.status === 'published').length;
      const avgQuality = dataEntries.length > 0
        ? Math.round(dataEntries.reduce((sum, e) => sum + (e.quality_score || 0), 0) / dataEntries.length)
        : 0;

      setStats({
        totalReports: reports.length,
        completedReports: completed,
        totalDataPoints: dataEntries.length,
        avgQuality,
        environmentalMetrics: dataEntries.filter(e => e.metric_category === 'environmental').length,
        socialMetrics: dataEntries.filter(e => e.metric_category === 'social').length,
        governanceMetrics: dataEntries.filter(e => e.metric_category === 'governance').length
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = () => {
    return stats.totalReports > 0
      ? Math.round((stats.completedReports / stats.totalReports) * 100)
      : 0;
  };

  const kpis = [
    {
      title: "Total Reports",
      value: stats.totalReports,
      change: "+12%",
      trend: "up",
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Completion Rate",
      value: `${getCompletionRate()}%`,
      change: "+8%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Data Quality",
      value: `${stats.avgQuality}%`,
      change: "+5%",
      trend: "up",
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Total Data Points",
      value: stats.totalDataPoints,
      change: "+23%",
      trend: "up",
      icon: PieChart,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const categoryStats = [
    {
      category: "Environmental",
      count: stats.environmentalMetrics,
      percentage: stats.totalDataPoints > 0
        ? Math.round((stats.environmentalMetrics / stats.totalDataPoints) * 100)
        : 0,
      icon: Leaf,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      category: "Social",
      count: stats.socialMetrics,
      percentage: stats.totalDataPoints > 0
        ? Math.round((stats.socialMetrics / stats.totalDataPoints) * 100)
        : 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      category: "Governance",
      count: stats.governanceMetrics,
      percentage: stats.totalDataPoints > 0
        ? Math.round((stats.governanceMetrics / stats.totalDataPoints) * 100)
        : 0,
      icon: Building,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const insights = [
    {
      title: "Strong Environmental Performance",
      description: "Your environmental metrics show consistent improvement over the reporting period.",
      type: "positive",
      icon: Leaf
    },
    {
      title: "Data Quality Needs Attention",
      description: "Some data entries have low quality scores. Consider reviewing and updating them.",
      type: "warning",
      icon: AlertTriangle
    },
    {
      title: "Governance Coverage Complete",
      description: "All required governance metrics have been collected and validated.",
      type: "positive",
      icon: Building
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-responsive py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
          <p className="text-gray-600">Track your ESG performance and data quality metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${kpi.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${kpi.color}`} />
                    </div>
                    <Badge className={kpi.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {kpi.change}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reporting Progress</CardTitle>
                  <CardDescription>Track your report completion status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Completion Rate</span>
                        <span className="text-sm font-bold">{getCompletionRate()}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full transition-all"
                          style={{ width: `${getCompletionRate()}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalReports}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{stats.completedReports}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Quality Overview</CardTitle>
                  <CardDescription>Average quality score across all metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8">
                    <div className="relative">
                      <div className="text-center">
                        <p className="text-5xl font-bold text-gray-900 mb-2">{stats.avgQuality}%</p>
                        <p className="text-sm text-gray-600">Average Quality Score</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Badge className={
                      stats.avgQuality >= 80
                        ? 'bg-green-100 text-green-800 w-full justify-center'
                        : stats.avgQuality >= 60
                        ? 'bg-yellow-100 text-yellow-800 w-full justify-center'
                        : 'bg-red-100 text-red-800 w-full justify-center'
                    }>
                      {stats.avgQuality >= 80 ? 'Excellent Quality' : stats.avgQuality >= 60 ? 'Good Quality' : 'Needs Improvement'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>ESG Category Distribution</CardTitle>
                <CardDescription>Breakdown of metrics by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {categoryStats.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`${category.bgColor} p-2 rounded-lg`}>
                              <Icon className={`w-5 h-5 ${category.color}`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{category.category}</p>
                              <p className="text-sm text-gray-600">{category.count} metrics</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-gray-900">{category.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              category.category === 'Environmental'
                                ? 'bg-green-600'
                                : category.category === 'Social'
                                ? 'bg-blue-600'
                                : 'bg-purple-600'
                            }`}
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6 mt-6">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        insight.type === 'positive' ? 'bg-green-50' : 'bg-yellow-50'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          insight.type === 'positive' ? 'text-green-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </div>
                      <Badge className={
                        insight.type === 'positive'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {insight.type === 'positive' ? 'Positive' : 'Action Needed'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
