import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Lock,
  Globe,
  CheckCircle
} from "lucide-react";

type Template = {
  id: string;
  name: string;
  description: string | null;
  framework: string;
  structure: any[];
  is_default: boolean;
  is_public: boolean;
  created_at: string;
  creator: {
    first_name: string;
    last_name: string;
  } | null;
};

export default function ReportTemplates() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'public' | 'organization'>('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select(`
          *,
          creator:users!report_templates_created_by_fkey(first_name, last_name)
        `)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data as any || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .insert({
          name: `${template.name} (Copy)`,
          description: template.description,
          framework: template.framework,
          structure: template.structure,
          is_default: false,
          is_public: false,
          created_by: profile?.id,
          organization_id: profile?.organization_id
        })
        .select(`
          *,
          creator:users!report_templates_created_by_fkey(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      setTemplates([data as any, ...templates]);
      toast({
        title: "Success",
        description: "Template duplicated successfully"
      });
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== id));
      toast({
        title: "Success",
        description: "Template deleted"
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (filter === 'all') return true;
    if (filter === 'public') return template.is_public;
    if (filter === 'organization') return !template.is_public && template.creator;
    return true;
  });

  const stats = {
    total: templates.length,
    public: templates.filter(t => t.is_public).length,
    organization: templates.filter(t => !t.is_public).length,
    default: templates.filter(t => t.is_default).length
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading templates...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Templates</h1>
            <p className="text-gray-600">Browse and manage report templates for different frameworks</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Templates</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Public Templates</p>
                  <p className="text-3xl font-bold">{stats.public}</p>
                </div>
                <Globe className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Organization</p>
                  <p className="text-3xl font-bold">{stats.organization}</p>
                </div>
                <Lock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Default Templates</p>
                  <p className="text-3xl font-bold">{stats.default}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Templates</CardTitle>
                <CardDescription>Select a template to get started with your report</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'public' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('public')}
                >
                  Public
                </Button>
                <Button
                  variant={filter === 'organization' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('organization')}
                >
                  Organization
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No templates found</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className="bg-blue-100 text-blue-800">{template.framework}</Badge>
                            {template.is_default && (
                              <Badge className="bg-purple-100 text-purple-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Default
                              </Badge>
                            )}
                            {template.is_public ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Globe className="w-3 h-3 mr-1" />
                                Public
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-800">
                                <Lock className="w-3 h-3 mr-1" />
                                Private
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {template.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {template.description}
                        </p>
                      )}

                      <div className="bg-gray-50 rounded p-3 mb-4">
                        <p className="text-xs text-gray-600 mb-1">Sections:</p>
                        <p className="text-sm font-semibold">{template.structure.length} sections</p>
                      </div>

                      {template.creator && (
                        <p className="text-xs text-gray-500 mb-3">
                          Created by {template.creator.first_name} {template.creator.last_name}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-1" />
                          Use Template
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateTemplate(template)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {!template.is_default && template.creator && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
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
