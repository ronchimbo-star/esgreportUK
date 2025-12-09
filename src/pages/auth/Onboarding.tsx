import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { ESGReportLogo } from '@/components/ui/esgreport-logo';
import { supabase } from '@/lib/supabase';
import { Building2, Users, Globe } from 'lucide-react';

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [organizationName, setOrganizationName] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState<'small' | 'medium' | 'large' | 'enterprise'>('medium');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName,
          slug: slug,
          industry,
          size,
          website,
          subscription_tier: 'starter',
          subscription_status: 'trialing',
        })
        .select()
        .single();

      if (orgError) throw orgError;

      const { error: userError } = await supabase
        .from('users')
        .update({
          organization_id: org.id,
          role: 'admin',
        })
        .eq('id', user?.id);

      if (userError) throw userError;

      toast({
        title: 'Success!',
        description: 'Your organization has been set up.',
      });

      setLocation('/dashboard');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to set up organization',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="mb-4">
            <ESGReportLogo />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome! Let's Set Up Your Organization
          </CardTitle>
          <CardDescription className="text-center">
            Tell us about your organization to get started with ESG reporting
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="organizationName" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Organization Name
              </Label>
              <Input
                id="organizationName"
                type="text"
                placeholder="Acme Corporation"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                type="text"
                placeholder="e.g., Technology, Manufacturing, Finance"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Organization Size
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'small', label: '1-50' },
                  { value: 'medium', label: '51-250' },
                  { value: 'large', label: '251-1000' },
                  { value: 'enterprise', label: '1000+' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSize(option.value as any)}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                      size === option.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Country
                </Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="United Kingdom"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-medium mb-1">14-Day Free Trial</p>
              <p>
                Start with our Starter plan. No credit card required. Upgrade anytime to unlock
                more frameworks and features.
              </p>
            </div>
          </CardContent>

          <div className="px-6 pb-6 flex justify-end">
            <Button type="submit" disabled={loading || !organizationName} className="min-w-32">
              {loading ? 'Setting up...' : 'Get Started'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
