import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import { useLocation } from "wouter";

const PRICE_IDS = {
  starter: 'price_starter_monthly',
  professional: 'price_professional_monthly',
  enterprise: 'price_enterprise_custom',
};

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: string, priceId: string) => {
    if (!user) {
      setLocation('/login?redirect=/pricing');
      return;
    }

    if (tier === 'enterprise') {
      setLocation('/contact?subject=Enterprise Plan');
      return;
    }

    setLoading(tier);

    try {
      const origin = window.location.origin;
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId,
          tier,
          successUrl: `${origin}/dashboard/billing?success=true`,
          cancelUrl: `${origin}/pricing?cancelled=true`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start checkout process',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Layout isAuthenticated={!!user}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container-responsive text-center">
          <h1 className="mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-blue-100">
            Choose the plan that fits your organization's sustainability journey
          </p>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container-responsive">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>For small organizations starting their ESG journey</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">£299</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Up to 50 users</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>2 ESG frameworks</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Basic reporting</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Email support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Standard data import</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleSubscribe('starter', PRICE_IDS.starter)}
                  disabled={loading !== null}
                >
                  {loading === 'starter' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-primary border-2 hover:shadow-xl transition-shadow relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <CardDescription>For growing organizations with advanced needs</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">£599</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Up to 200 users</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>All ESG frameworks</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>AI-assisted reporting</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Multi-site management</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe('professional', PRICE_IDS.professional)}
                  disabled={loading !== null}
                >
                  {loading === 'professional' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For large organizations with custom requirements</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Unlimited users</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>White-label branding</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Dedicated success manager</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>SLA guarantees</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Advanced security</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>On-premise deployment option</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleSubscribe('enterprise', PRICE_IDS.enterprise)}
                  disabled={loading !== null}
                >
                  Contact Sales
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="container-responsive text-center">
          <h2 className="mb-8">All Plans Include</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <CheckCircle className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">GDPR Compliant</h3>
              <p className="text-gray-600 text-sm">
                Full compliance with data protection regulations
              </p>
            </div>
            <div>
              <CheckCircle className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">99.9% Uptime</h3>
              <p className="text-gray-600 text-sm">
                Enterprise-grade reliability and performance
              </p>
            </div>
            <div>
              <CheckCircle className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Data Encryption</h3>
              <p className="text-gray-600 text-sm">
                Bank-level security for your ESG data
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container-responsive">
          <h2 className="text-center mb-8">Detailed Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-4 font-semibold text-gray-900 border-b-2 border-gray-200">Feature</th>
                  <th className="text-center p-4 font-semibold text-gray-900 border-b-2 border-gray-200">Starter</th>
                  <th className="text-center p-4 font-semibold text-gray-900 border-b-2 border-gray-200">Professional</th>
                  <th className="text-center p-4 font-semibold text-gray-900 border-b-2 border-gray-200">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-medium">Framework Support</td>
                  <td className="p-4 text-center">2 frameworks</td>
                  <td className="p-4 text-center">All frameworks</td>
                  <td className="p-4 text-center">All + Custom</td>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="p-4 font-medium">Users Included</td>
                  <td className="p-4 text-center">50 users</td>
                  <td className="p-4 text-center">200 users</td>
                  <td className="p-4 text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-medium">Reports per Month</td>
                  <td className="p-4 text-center">10 reports</td>
                  <td className="p-4 text-center">Unlimited</td>
                  <td className="p-4 text-center">Unlimited</td>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="p-4 font-medium">Data Storage</td>
                  <td className="p-4 text-center">10 GB</td>
                  <td className="p-4 text-center">100 GB</td>
                  <td className="p-4 text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-medium">API Access</td>
                  <td className="p-4 text-center text-red-600">✗</td>
                  <td className="p-4 text-center text-green-600">✓</td>
                  <td className="p-4 text-center text-green-600">✓ Custom</td>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="p-4 font-medium">White-label Branding</td>
                  <td className="p-4 text-center text-red-600">✗</td>
                  <td className="p-4 text-center text-red-600">✗</td>
                  <td className="p-4 text-center text-green-600">✓</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-medium">AI-Assisted Reporting</td>
                  <td className="p-4 text-center text-red-600">✗</td>
                  <td className="p-4 text-center text-green-600">✓</td>
                  <td className="p-4 text-center text-green-600">✓</td>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="p-4 font-medium">Support</td>
                  <td className="p-4 text-center">Email</td>
                  <td className="p-4 text-center">Priority Email</td>
                  <td className="p-4 text-center">Dedicated Manager</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-medium">SLA Guarantee</td>
                  <td className="p-4 text-center text-red-600">✗</td>
                  <td className="p-4 text-center text-red-600">✗</td>
                  <td className="p-4 text-center text-green-600">✓ 99.9%</td>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="p-4 font-medium">Custom Integrations</td>
                  <td className="p-4 text-center text-red-600">✗</td>
                  <td className="p-4 text-center text-red-600">✗</td>
                  <td className="p-4 text-center text-green-600">✓</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Scroll horizontally on mobile to view all features
          </p>
        </div>
      </div>
    </Layout>
  );
}
