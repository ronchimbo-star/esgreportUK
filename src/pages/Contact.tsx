import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });

  const [contactPhone, setContactPhone] = useState("01892 336 315");

  // Load phone number from site settings
  useState(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "contact_phone")
        .maybeSingle();

      if (data?.value) {
        setContactPhone(data.value);
      }
    };
    loadSettings();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from("contact_inquiries")
        .insert([
          {
            name: formData.name,
            email: formData.email,
            company: formData.company || null,
            subject: formData.subject || "General Inquiry",
            message: formData.message,
            status: "new",
          },
        ]);

      if (insertError) throw insertError;

      await supabase.functions.invoke("send-email", {
        body: {
          to: "support@esgreport.co.uk",
          subject: `New Contact Form Submission: ${formData.subject || "General Inquiry"}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Company:</strong> ${formData.company || "N/A"}</p>
            <p><strong>Subject:</strong> ${formData.subject || "General Inquiry"}</p>
            <p><strong>Message:</strong></p>
            <p>${formData.message.replace(/\n/g, "<br>")}</p>
          `,
        },
      });

      toast({
        title: "Message Sent",
        description: "Thank you for contacting us. We'll be in touch soon!",
      });

      setFormData({
        name: "",
        email: "",
        company: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Contact form error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout isAuthenticated={false}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container-responsive text-center">
          <h1 className="mb-4">Get in Touch</h1>
          <p className="text-xl text-blue-100">
            Have questions? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container-responsive">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h2 className="mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    className="mt-1"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="mt-1"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Your company"
                    className="mt-1"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    className="mt-1"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="Tell us more about your needs..."
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button size="lg" className="w-full" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </div>

            <div>
              <h2 className="mb-6">Contact Information</h2>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">Email</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <a href="mailto:support@esgreport.co.uk" className="text-primary hover:underline">
                      support@esgreport.co.uk
                    </a>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">Phone</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <a href={`tel:+44${contactPhone.replace(/\s/g, "")}`} className="text-primary hover:underline">
                      {contactPhone}
                    </a>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">Office Hours</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM GMT</p>
                    <p className="text-gray-600">Saturday - Sunday: Closed</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Schedule a Demo</h3>
                <p className="text-gray-600 mb-4">
                  See ESGReport in action. Book a personalized demo with our team.
                </p>
                <Button variant="outline">Book a Demo</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
