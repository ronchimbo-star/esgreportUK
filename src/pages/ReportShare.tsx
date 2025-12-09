import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import {
  Share2,
  Copy,
  ExternalLink,
  Trash2,
  Eye,
  Lock,
  Calendar,
  ArrowLeft,
  Link as LinkIcon,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";

type ShareLink = {
  id: string;
  token: string;
  access_type: string;
  password: string | null;
  expires_at: string | null;
  view_count: number;
  is_active: boolean;
  created_at: string;
};

export default function ReportShare() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [shareForm, setShareForm] = useState({
    access_type: 'view',
    password: '',
    expires_at: ''
  });

  useEffect(() => {
    loadShareLinks();
  }, []);

  const loadShareLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('report_shares')
        .select('*')
        .eq('report_id', params.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShareLinks(data || []);
    } catch (error) {
      console.error('Error loading share links:', error);
      toast({
        title: "Error",
        description: "Failed to load share links",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShare = async () => {
    setCreating(true);
    try {
      const shareData: any = {
        report_id: params.id,
        shared_by: user?.id,
        access_type: shareForm.access_type,
        password: shareForm.password || null,
        expires_at: shareForm.expires_at || null
      };

      const { data, error } = await supabase
        .from('report_shares')
        .insert(shareData)
        .select()
        .single();

      if (error) throw error;

      setShareLinks([data, ...shareLinks]);
      setShareForm({ access_type: 'view', password: '', expires_at: '' });

      toast({
        title: "Share Link Created",
        description: "Your shareable link has been generated"
      });
    } catch (error) {
      console.error('Error creating share link:', error);
      toast({
        title: "Error",
        description: "Failed to create share link",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const shareUrl = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard"
    });
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('report_shares')
        .update({ is_active: !currentActive })
        .eq('id', id);

      if (error) throw error;

      setShareLinks(shareLinks.map(link =>
        link.id === id ? { ...link, is_active: !currentActive } : link
      ));

      toast({
        title: "Success",
        description: `Link ${!currentActive ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      console.error('Error toggling link:', error);
      toast({
        title: "Error",
        description: "Failed to update link",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this share link?')) return;

    try {
      const { error } = await supabase
        .from('report_shares')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setShareLinks(shareLinks.filter(link => link.id !== id));
      toast({
        title: "Success",
        description: "Share link deleted"
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive"
      });
    }
  };

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
      <div className="container-responsive py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => setLocation(`/reports/${params.id}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Report
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Report</h1>
          <p className="text-gray-600">Create shareable links for external stakeholders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create New Share Link</CardTitle>
                <CardDescription>Generate a secure link to share this report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="access_type">Access Type</Label>
                  <select
                    id="access_type"
                    value={shareForm.access_type}
                    onChange={(e) => setShareForm({ ...shareForm, access_type: e.target.value })}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="view">View Only</option>
                    <option value="comment">View & Comment</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="password">Password Protection (Optional)</Label>
                  <Input
                    id="password"
                    type="text"
                    value={shareForm.password}
                    onChange={(e) => setShareForm({ ...shareForm, password: e.target.value })}
                    placeholder="Leave empty for no password"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={shareForm.expires_at}
                    onChange={(e) => setShareForm({ ...shareForm, expires_at: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <Button onClick={handleCreateShare} disabled={creating} className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  {creating ? "Creating..." : "Create Share Link"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Share Links ({shareLinks.length})</CardTitle>
                <CardDescription>Manage existing share links</CardDescription>
              </CardHeader>
              <CardContent>
                {shareLinks.length === 0 ? (
                  <div className="text-center py-12">
                    <LinkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No share links created yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shareLinks.map((link) => {
                      const shareUrl = `${window.location.origin}/shared/${link.token}`;
                      const isExpired = link.expires_at && new Date(link.expires_at) < new Date();

                      return (
                        <Card key={link.id} className={!link.is_active || isExpired ? 'opacity-60' : ''}>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {link.access_type === 'view' ? (
                                      <Badge className="bg-blue-100 text-blue-800">
                                        <Eye className="w-3 h-3 mr-1" />
                                        View Only
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        View & Comment
                                      </Badge>
                                    )}
                                    {link.password && (
                                      <Badge className="bg-yellow-100 text-yellow-800">
                                        <Lock className="w-3 h-3 mr-1" />
                                        Password Protected
                                      </Badge>
                                    )}
                                    {!link.is_active && (
                                      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                                    )}
                                    {isExpired && (
                                      <Badge className="bg-gray-100 text-gray-800">Expired</Badge>
                                    )}
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-sm break-all">
                                    {shareUrl}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center">
                                    <Eye className="w-4 h-4 mr-1" />
                                    {link.view_count} views
                                  </span>
                                  {link.expires_at && (
                                    <span className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      Expires {format(new Date(link.expires_at), 'MMM dd, yyyy')}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopyLink(link.token)}
                                  >
                                    {copied === link.token ? (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(shareUrl, '_blank')}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleActive(link.id, link.is_active)}
                                  >
                                    {link.is_active ? 'Deactivate' : 'Activate'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteLink(link.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Sharing Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">🔒 Password Protection</h4>
                  <p className="text-gray-600">
                    Add a password to ensure only authorized people can access your report.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📅 Expiration Dates</h4>
                  <p className="text-gray-600">
                    Set an expiration date to automatically revoke access after a certain time.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">👁️ Access Control</h4>
                  <p className="text-gray-600">
                    Choose between view-only or view & comment access levels.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📊 Track Views</h4>
                  <p className="text-gray-600">
                    Monitor how many times your report has been viewed via each link.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">⚡ Quick Actions</h4>
                  <p className="text-gray-600">
                    Deactivate or delete links anytime to revoke access immediately.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
