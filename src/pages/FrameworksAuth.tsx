import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Database, FrameworkWithCategory } from "@/types/database.types";
import { Clock, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Framework = Database['public']['Tables']['frameworks']['Row'];
type FrameworkCategory = Database['public']['Tables']['framework_categories']['Row'];

export default function FrameworksAuth() {
  const { profile } = useAuth();
  const [frameworks, setFrameworks] = useState<FrameworkWithCategory[]>([]);
  const [categories, setCategories] = useState<FrameworkCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [{ data: categoriesData }, { data: frameworksData }] = await Promise.all([
        supabase
          .from('framework_categories')
          .select('*')
          .order('sort_order'),
        supabase
          .from('frameworks')
          .select(`
            *,
            category:framework_categories(*)
          `)
          .order('sort_order')
      ]);

      if (categoriesData) setCategories(categoriesData);
      if (frameworksData) setFrameworks(frameworksData as any);
      if (categoriesData && categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].id);
      }
    } catch (error) {
      console.error('Error loading frameworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredFrameworks = () => {
    if (!selectedCategory) return [];
    return frameworks.filter(f => f.category_id === selectedCategory);
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      very_high: 'bg-red-100 text-red-800'
    };
    const labels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      very_high: 'Very High'
    };
    return (
      <Badge className={colors[difficulty as keyof typeof colors]}>
        {labels[difficulty as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'coming_soon') {
      return (
        <Badge variant="outline" className="border-gray-300 text-gray-600">
          <Clock className="w-3 h-3 mr-1" />
          Coming Soon
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Available
      </Badge>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading frameworks...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container-responsive text-center">
          <h1 className="mb-4">ESG Framework Catalog</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Comprehensive support for {frameworks.length}+ international frameworks including mandatory
            regulatory requirements, emerging standards, and voluntary reporting guidelines.
          </p>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container-responsive">
          <Tabs value={selectedCategory || undefined} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 md:grid-cols-6 mb-12">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                {category.description && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                    <p className="text-sm text-blue-900">{category.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredFrameworks().map((framework) => (
                    <Card key={framework.id} className={`hover:shadow-lg transition-shadow ${
                      framework.status === 'coming_soon' ? 'opacity-75' : ''
                    }`}>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <div style={{ color: framework.color_accent || '#3B82F6' }}>
                            {framework.icon && <Sparkles className="w-8 h-8" />}
                          </div>
                          {getStatusBadge(framework.status)}
                        </div>
                        <CardTitle className="text-xl">{framework.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {framework.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Difficulty:</span>
                            {getDifficultyBadge(framework.difficulty)}
                          </div>

                          {framework.estimated_weeks && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Timeline:</span>
                              <span className="font-medium text-gray-900">
                                <Clock className="w-4 h-4 inline mr-1" />
                                {framework.estimated_weeks}
                              </span>
                            </div>
                          )}

                          {framework.key_features && framework.key_features.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-2">Key Features:</p>
                              <ul className="space-y-1">
                                {framework.key_features.slice(0, 3).map((feature, idx) => (
                                  <li key={idx} className="text-xs text-gray-600 flex items-start">
                                    <CheckCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0 text-green-600" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {framework.coverage_description && (
                            <div className="bg-gray-50 rounded p-3">
                              <p className="text-xs text-gray-700">{framework.coverage_description}</p>
                            </div>
                          )}

                          {framework.status === 'available' && (
                            <Button className="w-full" variant="outline">
                              Start Report
                            </Button>
                          )}

                          {framework.status === 'coming_soon' && (
                            <Button className="w-full" variant="outline" disabled>
                              Coming Soon
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {getFilteredFrameworks().length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No frameworks found in this category</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
