import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/useToast";
import {
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Calendar,
  Building
} from "lucide-react";

type Framework = {
  id: string;
  name: string;
  code: string;
  description: string;
  difficulty: string;
  estimated_weeks: string;
  status: string;
  category_id: string;
};

type FormData = {
  framework_id: string;
  title: string;
  description: string;
  reporting_period_start: string;
  reporting_period_end: string;
  target_completion_date: string;
};

export default function ReportNew() {
  const { user, profile } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    framework_id: "",
    title: "",
    description: "",
    reporting_period_start: "",
    reporting_period_end: "",
    target_completion_date: ""
  });

  useEffect(() => {
    loadFrameworks();
  }, []);

  const loadFrameworks = async () => {
    try {
      const { data, error } = await supabase
        .from('frameworks')
        .select('*')
        .eq('status', 'available')
        .order('sort_order');

      if (error) throw error;
      setFrameworks(data || []);
    } catch (error) {
      console.error('Error loading frameworks:', error);
      toast({
        title: "Error",
        description: "Failed to load frameworks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedFramework = frameworks.find(f => f.id === formData.framework_id);

  const handleNext = () => {
    if (currentStep === 1 && !formData.framework_id) {
      toast({
        title: "Framework Required",
        description: "Please select a framework to continue",
        variant: "destructive"
      });
      return;
    }

    if (currentStep === 2) {
      if (!formData.title || !formData.reporting_period_start || !formData.reporting_period_end) {
        toast({
          title: "Required Fields",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          framework_id: formData.framework_id,
          title: formData.title,
          description: formData.description,
          reporting_period_start: formData.reporting_period_start,
          reporting_period_end: formData.reporting_period_end,
          target_completion_date: formData.target_completion_date || null,
          status: 'draft',
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your report has been created successfully"
      });

      navigate(`/reports/${data.id}`);
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "Failed to create report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      very_high: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || colors.medium;
  };

  const steps = [
    { number: 1, title: "Select Framework", icon: FileText },
    { number: 2, title: "Report Details", icon: Building },
    { number: 3, title: "Review & Create", icon: CheckCircle }
  ];

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

  return (
    <Layout>
      <div className="container-responsive py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Report</h1>
          <p className="text-gray-600">Follow the steps below to create your ESG report</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select ESG Framework</CardTitle>
              <CardDescription>
                Choose the framework you want to report against
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {frameworks.map((framework) => (
                  <Card
                    key={framework.id}
                    className={`cursor-pointer transition-all ${
                      formData.framework_id === framework.id
                        ? 'ring-2 ring-blue-600 border-blue-600'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, framework_id: framework.id })
                    }
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg">{framework.name}</CardTitle>
                        {formData.framework_id === framework.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <CardDescription>{framework.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Badge className={getDifficultyColor(framework.difficulty)}>
                          {framework.difficulty}
                        </Badge>
                        {framework.estimated_weeks && (
                          <Badge variant="outline">{framework.estimated_weeks}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
              <CardDescription>
                Provide information about your report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., 2024 Annual Sustainability Report"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this report..."
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Reporting Period Start *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.reporting_period_start}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reporting_period_start: e.target.value
                      })
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">Reporting Period End *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.reporting_period_end}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reporting_period_end: e.target.value
                      })
                    }
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="target_date">Target Completion Date (Optional)</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_completion_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_completion_date: e.target.value
                    })
                  }
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Create</CardTitle>
              <CardDescription>
                Please review your report details before creating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Framework</h3>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{selectedFramework?.name}</p>
                        <p className="text-sm text-gray-600">{selectedFramework?.description}</p>
                      </div>
                      <Badge className={getDifficultyColor(selectedFramework?.difficulty || 'medium')}>
                        {selectedFramework?.difficulty}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Report Information</h3>
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Title</p>
                      <p className="font-medium">{formData.title}</p>
                    </div>
                    {formData.description && (
                      <div>
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="font-medium">{formData.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Reporting Period Start</p>
                        <p className="font-medium flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formData.reporting_period_start}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reporting Period End</p>
                        <p className="font-medium flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formData.reporting_period_end}
                        </p>
                      </div>
                    </div>
                    {formData.target_completion_date && (
                      <div>
                        <p className="text-sm text-gray-600">Target Completion Date</p>
                        <p className="font-medium flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formData.target_completion_date}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < 3 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating...' : 'Create Report'}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
