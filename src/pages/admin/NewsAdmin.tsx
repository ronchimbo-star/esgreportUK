import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { MediaManager } from "@/components/MediaManager";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Save,
  X
} from "lucide-react";
import { format } from "date-fns";

type NewsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  featured_image_id: string | null;
  seo_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  category: string | null;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export default function NewsAdmin() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NewsPost | null>(null);
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [formData, setFormData] = useState<Partial<NewsPost>>({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    seo_title: "",
    meta_description: "",
    meta_keywords: [],
    tags: [],
    is_published: false,
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error("Error loading posts:", error);
      toast({
        title: "Error",
        description: "Failed to load news posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const slug = formData.slug || generateSlug(formData.title);
      const postData = {
        ...formData,
        slug,
        author_id: user?.id,
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        const { error } = await supabase
          .from("news_posts")
          .update(postData)
          .eq("id", editing.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Post updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("news_posts")
          .insert({
            ...postData,
            created_at: new Date().toISOString(),
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Post created successfully",
        });
      }

      setEditing(null);
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        category: "",
        seo_title: "",
        meta_description: "",
        meta_keywords: [],
        tags: [],
        is_published: false,
      });
      loadPosts();
    } catch (error: any) {
      console.error("Error saving post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save post",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase
        .from("news_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });

      loadPosts();
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (post: NewsPost) => {
    try {
      const { error } = await supabase
        .from("news_posts")
        .update({
          is_published: !post.is_published,
          published_at: !post.is_published ? new Date().toISOString() : null,
        })
        .eq("id", post.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Post ${!post.is_published ? "published" : "unpublished"} successfully`,
      });

      loadPosts();
    } catch (error: any) {
      console.error("Error toggling publish status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (post: NewsPost) => {
    setEditing(post);
    setFormData(post);
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      seo_title: "",
      meta_description: "",
      meta_keywords: [],
      tags: [],
      is_published: false,
    });
  };

  const handleMediaSelect = (file: any) => {
    setFormData({
      ...formData,
      featured_image: file.file_path,
      featured_image_id: file.id,
    });
  };

  const handleArrayInput = (field: "tags" | "meta_keywords", value: string) => {
    const items = value.split(",").map(item => item.trim()).filter(Boolean);
    setFormData({ ...formData, [field]: items });
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

  return (
    <Layout>
      <div className="container-responsive py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">News Management</h1>
          <p className="text-gray-600">Create and manage news posts with SEO optimization</p>
        </div>

        {(editing || !posts.length) ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editing ? "Edit Post" : "Create New Post"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter post title"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="Auto-generated from title"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <textarea
                    id="excerpt"
                    value={formData.excerpt || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Brief description of the post"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="content">Content *</Label>
                  <textarea
                    id="content"
                    value={formData.content || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    placeholder="Enter post content (Markdown supported)"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g., Updates, Features"
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags?.join(", ") || ""}
                    onChange={(e) => handleArrayInput("tags", e.target.value)}
                    placeholder="e.g., ESG, Sustainability"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Featured Image</h3>
                <div className="flex items-center gap-4">
                  {formData.featured_image ? (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMediaManager(true)}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Select Image
                    </Button>
                    {formData.featured_image && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            featured_image: null,
                            featured_image_id: null,
                          })
                        }
                        className="ml-2"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <Input
                      id="seo_title"
                      value={formData.seo_title || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, seo_title: e.target.value })
                      }
                      placeholder="Leave empty to use post title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <textarea
                      id="meta_description"
                      value={formData.meta_description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meta_description: e.target.value,
                        })
                      }
                      className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Description for search engines (150-160 characters)"
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.meta_description?.length || 0}/160 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="meta_keywords">Meta Keywords (comma separated)</Label>
                    <Input
                      id="meta_keywords"
                      value={formData.meta_keywords?.join(", ") || ""}
                      onChange={(e) =>
                        handleArrayInput("meta_keywords", e.target.value)
                      }
                      placeholder="e.g., esg, sustainability, reporting"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published || false}
                    onChange={(e) =>
                      setFormData({ ...formData, is_published: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Publish immediately</span>
                </label>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  {editing ? "Update Post" : "Create Post"}
                </Button>
                {editing && (
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mb-6">
            <Button onClick={() => setEditing({} as NewsPost)}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Post
            </Button>
          </div>
        )}

        {!editing && (
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading posts...</p>
                </CardContent>
              </Card>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <p className="text-gray-600">No posts yet</p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{post.title}</h3>
                          <Badge
                            variant={post.is_published ? "default" : "secondary"}
                          >
                            {post.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        {post.excerpt && (
                          <p className="text-gray-600 mb-3">{post.excerpt}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Category: {post.category || "Uncategorized"}</span>
                          {post.published_at && (
                            <span>
                              Published: {format(new Date(post.published_at), "MMM dd, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePublish(post)}
                        >
                          {post.is_published ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Publish
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(post)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        <MediaManager
          isOpen={showMediaManager}
          onClose={() => setShowMediaManager(false)}
          onSelect={handleMediaSelect}
          folder="news"
          acceptTypes={["image/*"]}
        />
      </div>
    </Layout>
  );
}
