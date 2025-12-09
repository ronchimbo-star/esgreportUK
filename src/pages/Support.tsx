import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Book, Video, Mail, Phone, Clock, FileText } from "lucide-react";
import { Link } from "wouter";

export default function Support() {
  return (
    <Layout isAuthenticated={false}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6">Support Center</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              We're here to help you succeed with your ESG reporting.
              Choose how you'd like to get support.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container-responsive">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>
                  Get instant answers from our support team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (window.Tawk_API) {
                      window.Tawk_API.maximize();
                    }
                  }}
                >
                  Start Chat
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Available 9am-5pm GMT
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Mail className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle>Email Support</CardTitle>
                <CardDescription>
                  Send us a message anytime
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/contact">
                  <Button variant="outline" className="w-full">Send Email</Button>
                </Link>
                <p className="text-xs text-gray-500 mt-2">
                  Response within 24 hours
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                    <Phone className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                <CardTitle>Phone Support</CardTitle>
                <CardDescription>
                  Speak with our experts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a href="tel:+4401892336315">
                  <Button variant="outline" className="w-full">
                    01892 336 315
                  </Button>
                </a>
                <p className="text-xs text-gray-500 mt-2">
                  Professional & Enterprise
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <Book className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Comprehensive guides and tutorials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Getting Started Guide
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Framework Implementation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Data Collection Best Practices
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      API Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Report Templates Guide
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Video className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Video Tutorials</CardTitle>
                <CardDescription>
                  Learn by watching step-by-step videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Platform Overview (5 min)
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Creating Your First Report (10 min)
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Data Import & Mapping (8 min)
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Using AI Assistant (7 min)
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Team Collaboration (6 min)
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12">
            <CardHeader>
              <Clock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Support Hours & Response Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium mb-2">Starter Plan</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Email support</li>
                    <li>Knowledge base access</li>
                    <li>Response within 48 hours</li>
                    <li>Business hours support</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border-2 border-primary">
                  <h4 className="font-medium mb-2">Professional Plan</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Priority email support</li>
                    <li>Live chat support</li>
                    <li>Response within 24 hours</li>
                    <li>Extended hours support</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium mb-2">Enterprise Plan</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Dedicated account manager</li>
                    <li>Phone & video support</li>
                    <li>Response within 4 hours</li>
                    <li>24/7 emergency support</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-12 text-center">
              <h3 className="mb-4">Quick Links</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/faq">
                  <Button variant="outline">View FAQs</Button>
                </Link>
                <Link href="/api">
                  <Button variant="outline">API Docs</Button>
                </Link>
                <Link href="/case-studies">
                  <Button variant="outline">Case Studies</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline">Contact Us</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
