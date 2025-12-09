import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import {
  Search as SearchIcon,
  FileText,
  Database,
  Upload,
  MessageSquare,
  Filter,
  Clock,
  TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type SearchResult = {
  id: string;
  type: 'report' | 'data_entry' | 'document' | 'comment';
  title: string;
  description: string;
  metadata: any;
  created_at: string;
  relevance: number;
};

export default function Search() {
  const [, setLocation] = useLocation();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const results: SearchResult[] = [];

      if (filterType === 'all' || filterType === 'report') {
        const { data: reports, error: reportsError } = await supabase
          .from('esg_reports')
          .select('*')
          .eq('organization_id', profile?.organization_id)
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .limit(10);

        if (!reportsError && reports) {
          results.push(...reports.map(r => ({
            id: r.id,
            type: 'report' as const,
            title: r.title,
            description: r.description || '',
            metadata: { framework: r.framework, status: r.status },
            created_at: r.created_at,
            relevance: calculateRelevance(searchTerm, r.title, r.description)
          })));
        }
      }

      if (filterType === 'all' || filterType === 'data_entry') {
        const { data: dataEntries, error: dataError } = await supabase
          .from('data_entries')
          .select(`
            *,
            report:esg_reports(title)
          `)
          .eq('organization_id', profile?.organization_id)
          .or(`metric_name.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
          .limit(10);

        if (!dataError && dataEntries) {
          results.push(...dataEntries.map((d: any) => ({
            id: d.id,
            type: 'data_entry' as const,
            title: d.metric_name,
            description: d.notes || '',
            metadata: { report: d.report?.title, value: d.value, unit: d.unit },
            created_at: d.created_at,
            relevance: calculateRelevance(searchTerm, d.metric_name, d.notes)
          })));
        }
      }

      if (filterType === 'all' || filterType === 'document') {
        const { data: documents, error: docsError } = await supabase
          .from('documents')
          .select('*')
          .eq('organization_id', profile?.organization_id)
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .limit(10);

        if (!docsError && documents) {
          results.push(...documents.map(d => ({
            id: d.id,
            type: 'document' as const,
            title: d.name,
            description: d.description || '',
            metadata: { type: d.type, size: d.size },
            created_at: d.created_at,
            relevance: calculateRelevance(searchTerm, d.name, d.description)
          })));
        }
      }

      if (filterType === 'all' || filterType === 'comment') {
        const { data: comments, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            report:esg_reports(title),
            user:users(first_name, last_name)
          `)
          .ilike('content', `%${searchTerm}%`)
          .limit(10);

        if (!commentsError && comments) {
          results.push(...comments.map((c: any) => ({
            id: c.id,
            type: 'comment' as const,
            title: `Comment on ${c.report?.title || 'Report'}`,
            description: c.content,
            metadata: {
              author: `${c.user?.first_name || ''} ${c.user?.last_name || ''}`.trim(),
              report: c.report?.title
            },
            created_at: c.created_at,
            relevance: calculateRelevance(searchTerm, '', c.content)
          })));
        }
      }

      results.sort((a, b) => b.relevance - a.relevance);
      setResults(results);

      const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to perform search",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateRelevance = (term: string, ...fields: (string | null | undefined)[]) => {
    let score = 0;
    const lowerTerm = term.toLowerCase();

    fields.forEach((field, index) => {
      if (!field) return;
      const lowerField = field.toLowerCase();

      if (lowerField === lowerTerm) {
        score += 100 * (fields.length - index);
      } else if (lowerField.startsWith(lowerTerm)) {
        score += 50 * (fields.length - index);
      } else if (lowerField.includes(lowerTerm)) {
        score += 25 * (fields.length - index);
      }
    });

    return score;
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'report':
        setLocation(`/reports/${result.id}`);
        break;
      case 'data_entry':
        setLocation(`/reports/${result.metadata.report_id || ''}/data`);
        break;
      case 'document':
        setLocation('/documents');
        break;
      case 'comment':
        setLocation(`/reports/${result.metadata.report_id || ''}`);
        break;
    }
  };

  const getResultIcon = (type: string) => {
    const icons = {
      report: FileText,
      data_entry: Database,
      document: Upload,
      comment: MessageSquare
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getResultColor = (type: string) => {
    const colors = {
      report: 'bg-blue-100 text-blue-800',
      data_entry: 'bg-green-100 text-green-800',
      document: 'bg-purple-100 text-purple-800',
      comment: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="container-responsive py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
            <p className="text-gray-600">Search across reports, data, documents, and comments</p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search for anything..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 text-lg"
                    autoFocus
                  />
                </div>
                <Button onClick={handleSearch} disabled={loading} size="lg">
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterType === 'report' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('report')}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Reports
                </Button>
                <Button
                  variant={filterType === 'data_entry' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('data_entry')}
                >
                  <Database className="w-4 h-4 mr-1" />
                  Data
                </Button>
                <Button
                  variant={filterType === 'document' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('document')}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Documents
                </Button>
                <Button
                  variant={filterType === 'comment' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('comment')}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Comments
                </Button>
              </div>
            </CardContent>
          </Card>

          {recentSearches.length > 0 && results.length === 0 && !loading && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Clock className="w-5 h-5 text-gray-400 mr-2" />
                  <h3 className="font-semibold text-gray-900">Recent Searches</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm(search);
                        handleSearch();
                      }}
                    >
                      {search}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Found {results.length} result{results.length !== 1 ? 's' : ''} for "{searchTerm}"
                </p>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {results.map((result) => {
                const Icon = getResultIcon(result.type);
                return (
                  <Card
                    key={`${result.type}-${result.id}`}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleResultClick(result)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${getResultColor(result.type)}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{result.title}</h3>
                              {result.description && (
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                  {result.description}
                                </p>
                              )}
                            </div>
                            <Badge className="ml-4 capitalize">{result.type.replace('_', ' ')}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {result.metadata && Object.entries(result.metadata).map(([key, value]) => (
                              value && (
                                <span key={key} className="flex items-center">
                                  <span className="font-medium capitalize mr-1">{key}:</span>
                                  {String(value)}
                                </span>
                              )
                            ))}
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                            </span>
                            {result.relevance > 50 && (
                              <span className="flex items-center text-blue-600">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                High relevance
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {results.length === 0 && !loading && searchTerm && (
            <Card>
              <CardContent className="py-12 text-center">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No results found for "{searchTerm}"</p>
                <p className="text-sm text-gray-500">Try different keywords or filters</p>
              </CardContent>
            </Card>
          )}

          {results.length === 0 && !loading && !searchTerm && (
            <Card>
              <CardContent className="py-12 text-center">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Start searching</p>
                <p className="text-sm text-gray-500">Enter keywords to search across all your ESG data</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
