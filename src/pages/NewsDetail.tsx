import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react";
import { format } from "date-fns";

type NewsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  tags: string[] | null;
  published_at: string;
  author_name: string | null;
  featured_image: string | null;
};

export default function NewsDetail() {
  const [, params] = useRoute("/news/:slug");
  const { toast } = useToast();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.slug) {
      loadPost(params.slug);
    }
  }, [params?.slug]);

  const loadPost = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('news_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;

      setPost(data);

      if (data.category) {
        const { data: related } = await supabase
          .from('news_posts')
          .select('id, title, slug, excerpt, category, published_at')
          .eq('category', data.category)
          .eq('is_published', true)
          .neq('id', data.id)
          .order('published_at', { ascending: false })
          .limit(3);

        setRelatedPosts(related || []);
      }
    } catch (error) {
      console.error('Error loading post:', error);
      toast({
        title: "Error",
        description: "Failed to load news post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard"
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading article...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container-responsive py-12">
          <Card>
            <CardContent className="py-20 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Article not found</h2>
              <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
              <Link href="/news">
                <a>
                  <Button>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to News
                  </Button>
                </a>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="container-responsive">
          <Link href="/news">
            <a>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Button>
            </a>
          </Link>
        </div>
      </div>

      <article className="container-responsive py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            {post.category && (
              <Badge className="mb-4">{post.category}</Badge>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
              {post.author_name && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(post.published_at), 'MMMM d, yyyy')}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {post.excerpt && (
              <p className="text-xl text-gray-700 leading-relaxed mb-8 pb-8 border-b">
                {post.excerpt}
              </p>
            )}
          </div>

          {post.featured_image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <div className="bg-gray-50 py-12">
          <div className="container-responsive">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Card key={related.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    {related.category && (
                      <Badge className="mb-3">{related.category}</Badge>
                    )}
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                      {related.title}
                    </h3>
                    {related.excerpt && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {related.excerpt}
                      </p>
                    )}
                    <Link href={`/news/${related.slug}`}>
                      <a>
                        <Button variant="outline" size="sm" className="w-full">
                          Read More
                        </Button>
                      </a>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
