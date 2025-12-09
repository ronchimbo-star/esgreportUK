import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Key, Lock, Zap, Database, Shield } from "lucide-react";

export default function API() {
  return (
    <Layout isAuthenticated={false}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6">ESGReport API</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Integrate ESG data into your applications with our powerful REST API.
              Automate reporting, sync data, and build custom integrations.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container-responsive">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Fast & Reliable</CardTitle>
                <CardDescription>
                  99.9% uptime with response times under 200ms
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Secure by Default</CardTitle>
                <CardDescription>
                  OAuth 2.0, API keys, and rate limiting included
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Database className="h-10 w-10 text-primary mb-2" />
                <CardTitle>RESTful Design</CardTitle>
                <CardDescription>
                  Clean, predictable endpoints with JSON responses
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Tabs defaultValue="quickstart" className="space-y-8">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
              <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="quickstart" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>
                    Start making API calls in minutes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">1. Get your API key</h4>
                    <p className="text-sm text-gray-600">
                      Navigate to Settings → API Keys in your dashboard and create a new API key.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">2. Make your first request</h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto">
                      <pre className="text-sm">
{`curl https://api.esgreport.com/v1/reports \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">3. Handle the response</h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto">
                      <pre className="text-sm">
{`{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "2024 Sustainability Report",
      "framework": "GRI",
      "status": "published",
      "year": 2024
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "per_page": 20
  }
}`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auth" className="space-y-6">
              <Card>
                <CardHeader>
                  <Key className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Authentication</CardTitle>
                  <CardDescription>
                    Secure your API requests with authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">API Key Authentication</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Include your API key in the Authorization header with every request:
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-xl">
                      <pre className="text-sm">
{`Authorization: Bearer YOUR_API_KEY`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Rate Limits</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm">Starter Plan</span>
                        <Badge>1,000 requests/hour</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm">Professional Plan</span>
                        <Badge>10,000 requests/hour</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm">Enterprise Plan</span>
                        <Badge>Custom limits</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-6">
              <Card>
                <CardHeader>
                  <Code className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>API Endpoints</CardTitle>
                  <CardDescription>
                    Available endpoints and resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Reports</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Badge variant="default">GET</Badge>
                          <code className="text-sm">/v1/reports</code>
                          <span className="text-sm text-gray-600 ml-auto">List all reports</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Badge variant="default">GET</Badge>
                          <code className="text-sm">/v1/reports/:id</code>
                          <span className="text-sm text-gray-600 ml-auto">Get report details</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Badge className="bg-green-600">POST</Badge>
                          <code className="text-sm">/v1/reports</code>
                          <span className="text-sm text-gray-600 ml-auto">Create new report</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Badge className="bg-orange-600">PUT</Badge>
                          <code className="text-sm">/v1/reports/:id</code>
                          <span className="text-sm text-gray-600 ml-auto">Update report</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Data Entries</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Badge variant="default">GET</Badge>
                          <code className="text-sm">/v1/data-entries</code>
                          <span className="text-sm text-gray-600 ml-auto">List data entries</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Badge className="bg-green-600">POST</Badge>
                          <code className="text-sm">/v1/data-entries</code>
                          <span className="text-sm text-gray-600 ml-auto">Submit data</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Frameworks</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Badge variant="default">GET</Badge>
                          <code className="text-sm">/v1/frameworks</code>
                          <span className="text-sm text-gray-600 ml-auto">List frameworks</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Badge variant="default">GET</Badge>
                          <code className="text-sm">/v1/frameworks/:id/metrics</code>
                          <span className="text-sm text-gray-600 ml-auto">Get metrics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Code Examples</CardTitle>
                  <CardDescription>
                    Sample code in popular languages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">JavaScript / Node.js</h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto">
                      <pre className="text-sm">
{`const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.esgreport.com/v1',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Create a new report
const report = await api.post('/reports', {
  title: '2024 ESG Report',
  framework: 'GRI',
  year: 2024
});

console.log(report.data);`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Python</h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto">
                      <pre className="text-sm">
{`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.esgreport.com/v1/reports',
    headers=headers
)

reports = response.json()
print(reports)`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-12 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                Our team is here to support your integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Documentation</h4>
                  <p className="text-sm text-gray-600">
                    Explore our complete API documentation with detailed examples
                  </p>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Support</h4>
                  <p className="text-sm text-gray-600">
                    Contact our support team for technical assistance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
