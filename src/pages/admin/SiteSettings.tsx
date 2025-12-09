import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { MediaManager } from "@/components/MediaManager";
import {
  Save,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit,
  Globe,
  FileText,
  Link as LinkIcon
} from "lucide-react";

type SiteSetting = {
  id: string;
  key: string;
  value: string | null;
  type: string;
  category: string | null;
  description: string | null;
};

type FooterLink = {
  id: string;
  title: string;
  url: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  opens_new_tab: boolean;
};

export default function SiteSettings() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    site_name: "",
    site_description: "",
    site_keywords: "",
    favicon_url: "",
    logo_url: "",
    copyright_text: "",
    contact_email: "",
    contact_phone: "",
    social_twitter: "",
    social_linkedin: "",
    social_facebook: "",
  });

  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [linkForm, setLinkForm] = useState({
    title: "",
    url: "",
    category: "company",
    sort_order: 0,
    opens_new_tab: false,
  });

  useEffect(() => {
    loadSettings();
    loadFooterLinks();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");

      if (error) throw error;

      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.key] = setting.value || "";
        return acc;
      }, {} as Record<string, string>);

      setSettings({
        site_name: settingsMap.site_name || "",
        site_description: settingsMap.site_description || "",
        site_keywords: settingsMap.site_keywords || "",
        favicon_url: settingsMap.favicon_url || "",
        logo_url: settingsMap.logo_url || "",
        copyright_text: settingsMap.copyright_text || "",
        contact_email: settingsMap.contact_email || "",
        contact_phone: settingsMap.contact_phone || "",
        social_twitter: settingsMap.social_twitter || "",
        social_linkedin: settingsMap.social_linkedin || "",
        social_facebook: settingsMap.social_facebook || "",
      });
    } catch (error: any) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFooterLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("footer_links")
        .select("*")
        .order("category")
        .order("sort_order");

      if (error) throw error;
      setFooterLinks(data || []);
    } catch (error: any) {
      console.error("Error loading footer links:", error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        type: "string",
        updated_by: profile?.id,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("site_settings")
          .upsert(update, { onConflict: "key" });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMediaSelect = (file: any) => {
    if (mediaTarget) {
      setSettings({ ...settings, [mediaTarget]: file.file_path });
    }
    setShowMediaManager(false);
    setMediaTarget(null);
  };

  const handleSaveLink = async () => {
    if (!linkForm.title || !linkForm.url) {
      toast({
        title: "Validation Error",
        description: "Title and URL are required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingLink) {
        const { error } = await supabase
          .from("footer_links")
          .update(linkForm)
          .eq("id", editingLink.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Link updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("footer_links")
          .insert(linkForm);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Link created successfully",
        });
      }

      setEditingLink(null);
      setLinkForm({
        title: "",
        url: "",
        category: "company",
        sort_order: 0,
        opens_new_tab: false,
      });
      loadFooterLinks();
    } catch (error: any) {
      console.error("Error saving link:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save link",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const { error } = await supabase
        .from("footer_links")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Link deleted successfully",
      });

      loadFooterLinks();
    } catch (error: any) {
      console.error("Error deleting link:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete link",
        variant: "destructive",
      });
    }
  };

  const handleToggleLink = async (link: FooterLink) => {
    try {
      const { error } = await supabase
        .from("footer_links")
        .update({ is_active: !link.is_active })
        .eq("id", link.id);

      if (error) throw error;
      loadFooterLinks();
    } catch (error: any) {
      console.error("Error toggling link:", error);
    }
  };

  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return (
      <Layout>
        <div className="container-responsive py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-gray-600">Access denied. Admin privileges required.</p>
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
              <p className="text-gray-600">Loading settings...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Settings</h1>
          <p className="text-gray-600">Manage your site configuration, branding, and content</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="footer">Footer Links</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic site information and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) =>
                      setSettings({ ...settings, site_name: e.target.value })
                    }
                    placeholder="ESGReport Platform"
                  />
                </div>

                <div>
                  <Label htmlFor="site_description">Site Description</Label>
                  <textarea
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) =>
                      setSettings({ ...settings, site_description: e.target.value })
                    }
                    className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="A comprehensive ESG reporting platform"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) =>
                        setSettings({ ...settings, contact_email: e.target.value })
                      }
                      placeholder="contact@esgreport.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={settings.contact_phone}
                      onChange={(e) =>
                        setSettings({ ...settings, contact_phone: e.target.value })
                      }
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="copyright_text">Copyright Text</Label>
                  <Input
                    id="copyright_text"
                    value={settings.copyright_text}
                    onChange={(e) =>
                      setSettings({ ...settings, copyright_text: e.target.value })
                    }
                    placeholder="© 2024 ESGReport Platform. All rights reserved."
                  />
                </div>

                <Button onClick={handleSaveSettings} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Manage your site's visual identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Favicon</Label>
                  <div className="flex items-center gap-4 mt-2">
                    {settings.favicon_url ? (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed">
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                    <div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMediaTarget("favicon_url");
                          setShowMediaManager(true);
                        }}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Select Favicon
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 32x32px or 16x16px, ICO or PNG
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4 mt-2">
                    {settings.logo_url ? (
                      <div className="w-32 h-16 bg-gray-100 rounded-lg flex items-center justify-center border">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-32 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed">
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                    <div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMediaTarget("logo_url");
                          setShowMediaManager(true);
                        }}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Select Logo
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: PNG with transparent background
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Social Media</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="social_twitter">Twitter URL</Label>
                      <Input
                        id="social_twitter"
                        value={settings.social_twitter}
                        onChange={(e) =>
                          setSettings({ ...settings, social_twitter: e.target.value })
                        }
                        placeholder="https://twitter.com/esgreport"
                      />
                    </div>

                    <div>
                      <Label htmlFor="social_linkedin">LinkedIn URL</Label>
                      <Input
                        id="social_linkedin"
                        value={settings.social_linkedin}
                        onChange={(e) =>
                          setSettings({ ...settings, social_linkedin: e.target.value })
                        }
                        placeholder="https://linkedin.com/company/esgreport"
                      />
                    </div>

                    <div>
                      <Label htmlFor="social_facebook">Facebook URL</Label>
                      <Input
                        id="social_facebook"
                        value={settings.social_facebook}
                        onChange={(e) =>
                          setSettings({ ...settings, social_facebook: e.target.value })
                        }
                        placeholder="https://facebook.com/esgreport"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Optimize your site for search engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="site_keywords">Meta Keywords</Label>
                  <Input
                    id="site_keywords"
                    value={settings.site_keywords}
                    onChange={(e) =>
                      setSettings({ ...settings, site_keywords: e.target.value })
                    }
                    placeholder="esg, sustainability, reporting, compliance"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Comma-separated keywords for search engines
                  </p>
                </div>

                <Button onClick={handleSaveSettings} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="footer" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Footer Links</CardTitle>
                    <CardDescription>Manage navigation links in the footer</CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingLink(null);
                      setLinkForm({
                        title: "",
                        url: "",
                        category: "company",
                        sort_order: 0,
                        opens_new_tab: false,
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {(editingLink || linkForm.title || !footerLinks.length) && (
                  <div className="p-4 border rounded-lg space-y-4">
                    <h3 className="font-semibold">
                      {editingLink ? "Edit Link" : "New Link"}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="link_title">Title</Label>
                        <Input
                          id="link_title"
                          value={linkForm.title}
                          onChange={(e) =>
                            setLinkForm({ ...linkForm, title: e.target.value })
                          }
                          placeholder="About Us"
                        />
                      </div>

                      <div>
                        <Label htmlFor="link_url">URL</Label>
                        <Input
                          id="link_url"
                          value={linkForm.url}
                          onChange={(e) =>
                            setLinkForm({ ...linkForm, url: e.target.value })
                          }
                          placeholder="/about"
                        />
                      </div>

                      <div>
                        <Label htmlFor="link_category">Category</Label>
                        <select
                          id="link_category"
                          value={linkForm.category}
                          onChange={(e) =>
                            setLinkForm({ ...linkForm, category: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="company">Company</option>
                          <option value="legal">Legal</option>
                          <option value="support">Support</option>
                          <option value="resources">Resources</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="link_sort">Sort Order</Label>
                        <Input
                          id="link_sort"
                          type="number"
                          value={linkForm.sort_order}
                          onChange={(e) =>
                            setLinkForm({
                              ...linkForm,
                              sort_order: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={linkForm.opens_new_tab}
                        onChange={(e) =>
                          setLinkForm({
                            ...linkForm,
                            opens_new_tab: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Open in new tab</span>
                    </label>

                    <div className="flex gap-3">
                      <Button onClick={handleSaveLink}>
                        <Save className="w-4 h-4 mr-2" />
                        {editingLink ? "Update Link" : "Create Link"}
                      </Button>
                      {editingLink && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingLink(null);
                            setLinkForm({
                              title: "",
                              url: "",
                              category: "company",
                              sort_order: 0,
                              opens_new_tab: false,
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {footerLinks.length > 0 && (
                  <div className="space-y-3">
                    {["company", "legal", "support", "resources"].map((category) => {
                      const links = footerLinks.filter((l) => l.category === category);
                      if (links.length === 0) return null;

                      return (
                        <div key={category}>
                          <h3 className="font-semibold text-sm text-gray-600 mb-2 capitalize">
                            {category}
                          </h3>
                          <div className="space-y-2">
                            {links.map((link) => (
                              <div
                                key={link.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <LinkIcon className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <p className="font-medium">{link.title}</p>
                                    <p className="text-xs text-gray-600">{link.url}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleLink(link)}
                                  >
                                    {link.is_active ? "Active" : "Inactive"}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingLink(link);
                                      setLinkForm({
                                        title: link.title,
                                        url: link.url,
                                        category: link.category,
                                        sort_order: link.sort_order,
                                        opens_new_tab: link.opens_new_tab,
                                      });
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteLink(link.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <MediaManager
          isOpen={showMediaManager}
          onClose={() => {
            setShowMediaManager(false);
            setMediaTarget(null);
          }}
          onSelect={handleMediaSelect}
          folder="logos"
          acceptTypes={["image/*"]}
        />
      </div>
    </Layout>
  );
}
