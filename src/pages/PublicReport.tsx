import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import {
  FileText,
  Calendar,
  Building2,
  CheckCircle,
  Lock,
  Eye,
  Download,
  Printer,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ESGReportLogo } from "@/components/ui/esgreport-logo";

type Report = {
  id: string;
  title: string;
  description: string;
  framework: string;
  status: string;
  reporting_period: string;
  start_date: string;
  end_date: string;
  overall_score: number;
  environmental_score: number;
  social_score: number;
  governance_score: number;
  created_at: string;
  organization: {
    name: string;
    industry: string;
  };
  sections: Array<{
    title: string;
    content: string;
    section_number: number;
  }>;
};

type ShareLink = {
  id: string;
  report_id: string;
  access_type: string;
  password: string | null;
  expires_at: string | null;
  is_active: boolean;
};

export default function PublicReport() {
  const params = useParams();
  const { toast } = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    loadShareLink();
  }, [params.token]);

  const loadShareLink = async () => {
    try {
      const { data: linkData, error: linkError } = await supabase
        .from('report_shares')
        .select('*')
        .eq('token', params.token)
        .maybeSingle();

      if (linkError) throw linkError;

      if (!linkData) {
        toast({
          title: "Error",
          description: "Invalid or expired share link",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!linkData.is_active) {
        toast({
          title: "Error",
          description: "This share link has been deactivated",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
        toast({
          title: "Error",
          description: "This share link has expired",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      setShareLink(linkData);

      if (linkData.password) {
        setRequiresPassword(true);
        setLoading(false);
      } else {
        await loadReport(linkData.report_id);
        setAccessGranted(true);
      }
    } catch (error) {
      console.error('Error loading share link:', error);
      toast({
        title: "Error",
        description: "Failed to load report",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const loadReport = async (reportId: string) => {
    try {
      const { data: reportData, error: reportError } = await supabase
        .from('esg_reports')
        .select(`
          *,
          organization:organizations(name, industry)
        `)
        .eq('id', reportId)
        .single();

      if (reportError) throw reportError;

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('report_sections')
        .select('*')
        .eq('report_id', reportId)
        .order('section_number');

      if (sectionsError) throw sectionsError;

      setReport({
        ...(reportData as any),
        sections: sectionsData || []
      });

      await supabase
        .from('report_shares')
        .update({ view_count: supabase.rpc('increment', { x: 1 }) })
        .eq('token', params.token);

      setLoading(false);
    } catch (error) {
      console.error('Error loading report:', error);
      toast({
        title: "Error",
        description: "Failed to load report",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(false);

    if (!shareLink) return;

    if (password === shareLink.password) {
      setAccessGranted(true);
      setRequiresPassword(false);
      await loadReport(shareLink.report_id);
    } else {
      setPasswordError(true);
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive"
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Protected</h2>
              <p className="text-gray-600">This report requires a password to access</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={passwordError ? 'border-red-500' : ''}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-600 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Incorrect password
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Access Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report || !accessGranted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Report not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="no-print bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ESGReportLogo size="sm" />
              <div className="border-l border-gray-300 pl-4">
                <Badge className="bg-blue-100 text-blue-800">
                  <Eye className="w-3 h-3 mr-1" />
                  {shareLink?.access_type === 'view' ? 'View Only' : 'View & Comment'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button onClick={handlePrint}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-12">
            <div className="mb-12 text-center border-b border-gray-200 pb-8">
              <div className="mb-4">
                <Badge className="mb-4">{report.framework}</Badge>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {report.title}
              </h1>
              <p className="text-xl text-gray-600 mb-6">{report.description}</p>
              <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  {report.organization.name}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {report.reporting_period}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {report.status}
                </div>
              </div>
            </div>

            {report.overall_score !== null && (
              <div className="mb-12 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8 print:bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Overall ESG Performance
                </h2>
                <div className="grid grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Overall Score</p>
                    <p className="text-4xl font-bold text-blue-600">
                      {report.overall_score?.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Environmental</p>
                    <p className="text-4xl font-bold text-green-600">
                      {report.environmental_score?.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Social</p>
                    <p className="text-4xl font-bold text-orange-600">
                      {report.social_score?.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Governance</p>
                    <p className="text-4xl font-bold text-teal-600">
                      {report.governance_score?.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {report.sections && report.sections.length > 0 ? (
              <div className="space-y-10">
                {report.sections.map((section) => (
                  <div key={section.section_number} className="break-inside-avoid">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                      {section.section_number}. {section.title}
                    </h2>
                    <div
                      className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: section.content || 'No content available.' }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No sections have been added to this report yet.</p>
              </div>
            )}

            <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
              <p>
                This report was generated on {format(new Date(), 'MMMM dd, yyyy')} by{' '}
                {report.organization.name}
              </p>
              <p className="mt-2">
                Reporting Period: {report.start_date && format(new Date(report.start_date), 'MMM dd, yyyy')}
                {' '}-{' '}
                {report.end_date && format(new Date(report.end_date), 'MMM dd, yyyy')}
              </p>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Powered by <span className="font-semibold">ESGReport</span> - Professional ESG Reporting Platform
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .no-print {
            display: none !important;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 2cm;
          }
        }
      `}</style>
    </div>
  );
}
