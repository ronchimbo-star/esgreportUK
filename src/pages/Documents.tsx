import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  File,
  Image,
  FileSpreadsheet,
  Search,
  Filter,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

type Document = {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  description: string | null;
  created_at: string;
  report: {
    title: string;
  } | null;
  uploader: {
    first_name: string;
    last_name: string;
  } | null;
};

export default function Documents() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          report:esg_reports(title),
          uploader:users!documents_uploaded_by_fkey(first_name, last_name)
        `)
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data as any || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDocuments(documents.filter(d => d.id !== id));
      toast({
        title: "Success",
        description: "Document deleted"
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return FileSpreadsheet;
    if (fileType.includes('pdf')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeBadge = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Badge className="bg-green-100 text-green-800">Image</Badge>;
    if (fileType.includes('pdf')) return <Badge className="bg-red-100 text-red-800">PDF</Badge>;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <Badge className="bg-blue-100 text-blue-800">Excel</Badge>;
    if (fileType.includes('word')) return <Badge className="bg-purple-100 text-purple-800">Word</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">File</Badge>;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'images') return matchesSearch && doc.file_type.startsWith('image/');
    if (filter === 'pdfs') return matchesSearch && doc.file_type.includes('pdf');
    if (filter === 'spreadsheets') return matchesSearch && (doc.file_type.includes('spreadsheet') || doc.file_type.includes('excel'));
    return matchesSearch;
  });

  const stats = {
    total: documents.length,
    images: documents.filter(d => d.file_type.startsWith('image/')).length,
    pdfs: documents.filter(d => d.file_type.includes('pdf')).length,
    spreadsheets: documents.filter(d => d.file_type.includes('spreadsheet') || d.file_type.includes('excel')).length,
    totalSize: documents.reduce((sum, d) => sum + d.file_size, 0)
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Library</h1>
            <p className="text-gray-600">Manage your ESG evidence and supporting documents</p>
          </div>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Documents</p>
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
                  <p className="text-sm text-gray-600 mb-1">PDFs</p>
                  <p className="text-3xl font-bold">{stats.pdfs}</p>
                </div>
                <FileText className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Images</p>
                  <p className="text-3xl font-bold">{stats.images}</p>
                </div>
                <Image className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Size</p>
                  <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
                </div>
                <FileSpreadsheet className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>All Documents</CardTitle>
                <CardDescription>Browse and manage uploaded files</CardDescription>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="images">Images</option>
                  <option value="pdfs">PDFs</option>
                  <option value="spreadsheets">Spreadsheets</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {searchTerm || filter !== 'all'
                    ? 'No documents match your search'
                    : 'No documents uploaded yet'}
                </p>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First Document
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => {
                  const IconComponent = getFileIcon(doc.file_type);
                  return (
                    <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <IconComponent className="w-6 h-6 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{doc.file_name}</p>
                            <p className="text-xs text-gray-600">{formatFileSize(doc.file_size)}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          {getFileTypeBadge(doc.file_type)}
                          {doc.description && (
                            <p className="text-sm text-gray-700 line-clamp-2">{doc.description}</p>
                          )}
                          {doc.report && (
                            <p className="text-xs text-gray-600">
                              Report: {doc.report.title}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(doc.created_at), 'MMM dd, yyyy')}
                          </span>
                          {doc.uploader && (
                            <span>
                              {doc.uploader.first_name} {doc.uploader.last_name}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
    </Layout>
  );
}
