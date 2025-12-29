import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Phone, Building, Trash2, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

export default function ContactManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error("Error loading inquiries:", error);
      toast({
        title: "Error",
        description: "Failed to load contact inquiries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("contact_inquiries")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setInquiries(prev =>
        prev.map(inquiry =>
          inquiry.id === id ? { ...inquiry, status } : inquiry
        )
      );

      toast({
        title: "Status Updated",
        description: `Inquiry marked as ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      const { error } = await supabase
        .from("contact_inquiries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setInquiries(prev => prev.filter(inquiry => inquiry.id !== id));

      toast({
        title: "Deleted",
        description: "Inquiry deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete inquiry",
        variant: "destructive",
      });
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesFilter = filter === "all" || inquiry.status === filter;
    const matchesSearch =
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.company && inquiry.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500";
      case "in_progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return (
      <Layout>
        <div className="container-responsive py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">
                You don't have permission to access this page
              </p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Inquiries</h1>
          <p className="text-gray-600">Manage and respond to contact form submissions</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              size="sm"
            >
              All ({inquiries.length})
            </Button>
            <Button
              variant={filter === "new" ? "default" : "outline"}
              onClick={() => setFilter("new")}
              size="sm"
            >
              New ({inquiries.filter(i => i.status === "new").length})
            </Button>
            <Button
              variant={filter === "in_progress" ? "default" : "outline"}
              onClick={() => setFilter("in_progress")}
              size="sm"
            >
              In Progress ({inquiries.filter(i => i.status === "in_progress").length})
            </Button>
            <Button
              variant={filter === "resolved" ? "default" : "outline"}
              onClick={() => setFilter("resolved")}
              size="sm"
            >
              Resolved ({inquiries.filter(i => i.status === "resolved").length})
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading inquiries...</p>
            </CardContent>
          </Card>
        ) : filteredInquiries.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-gray-600">No inquiries found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry) => (
              <Card key={inquiry.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <a href={`mailto:${inquiry.email}`} className="hover:text-primary">
                            {inquiry.email}
                          </a>
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <a href={`tel:${inquiry.phone}`} className="hover:text-primary">
                              {inquiry.phone}
                            </a>
                          </div>
                        )}
                        {inquiry.company && (
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span>{inquiry.company}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(inquiry.status)} text-white`}>
                        {inquiry.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="font-semibold text-sm mb-1">Subject:</p>
                    <p className="text-sm text-gray-700">{inquiry.subject}</p>
                  </div>
                  <div className="mb-4">
                    <p className="font-semibold text-sm mb-1">Message:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {inquiry.status === "new" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(inquiry.id, "in_progress")}
                      >
                        Mark In Progress
                      </Button>
                    )}
                    {inquiry.status === "in_progress" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(inquiry.id, "resolved")}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark Resolved
                      </Button>
                    )}
                    {inquiry.status === "resolved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(inquiry.id, "closed")}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Close
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteInquiry(inquiry.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
