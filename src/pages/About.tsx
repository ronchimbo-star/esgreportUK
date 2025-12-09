import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Heart, Lightbulb, Award, Globe, TrendingUp, CheckCircle } from "lucide-react";

export default function About() {
  return (
    <Layout isAuthenticated={false}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-responsive text-center">
          <h1 className="mb-6">Empowering Sustainable Business Transformation</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            We're building the world's most comprehensive platform for ESG reporting,
            making sustainability accessible to organizations everywhere.
          </p>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              To accelerate the global transition to sustainable business practices by
              providing organizations with the tools, insights, and confidence they need
              to measure, report, and improve their environmental, social, and governance
              performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-t-blue-500">
              <CardContent className="pt-8 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Purpose-Driven</h3>
                <p className="text-gray-600 leading-relaxed">
                  We're committed to accelerating the global transition to sustainable
                  business practices.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-t-green-500">
              <CardContent className="pt-8 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Integrity First</h3>
                <p className="text-gray-600 leading-relaxed">
                  We ensure accurate, transparent, and reliable sustainability reporting
                  for all stakeholders.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-t-yellow-500">
              <CardContent className="pt-8 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Lightbulb className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p className="text-gray-600 leading-relaxed">
                  We leverage cutting-edge technology to simplify complex ESG challenges.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-t-purple-500">
              <CardContent className="pt-8 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Impact Focus</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every feature we build is designed to create measurable environmental
                  and social impact.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gray-50">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold mb-8 text-center">Our Story</h2>
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p className="text-lg">
                  ESGReport was born from the frustration of working with fragmented, complex
                  sustainability reporting tools that made compliance a burden rather than an
                  opportunity for positive impact.
                </p>
                <p>
                  Our founders, having led sustainability initiatives at major corporations,
                  experienced firsthand the challenges of managing multiple frameworks,
                  inconsistent data collection, and manual reporting processes.
                </p>
                <p>
                  We envisioned a platform that would make ESG reporting as intuitive as modern
                  business tools, while maintaining the rigor and accuracy required for
                  regulatory compliance and stakeholder trust.
                </p>
                <p>
                  Today, ESGReport serves organizations from startups to Fortune 500 companies
                  across Construction, Water, and Energy sectors, providing specialized
                  frameworks that automatically populate global ESG reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="container-responsive">
          <h2 className="text-3xl font-semibold text-center mb-12">By the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-blue-50">
              <div className="text-5xl font-bold text-primary mb-2">1,000+</div>
              <div className="text-gray-600 font-medium">Organizations Served</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-green-50">
              <div className="text-5xl font-bold text-green-600 mb-2">50,000+</div>
              <div className="text-gray-600 font-medium">Reports Generated</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-yellow-50">
              <div className="text-5xl font-bold text-yellow-600 mb-2">2.5M+</div>
              <div className="text-gray-600 font-medium">tCO2e Tracked</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-purple-50">
              <div className="text-5xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600 font-medium">Countries</div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold mb-12 text-center">Why Choose ESGReport?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Comprehensive Framework Support</h3>
                  <p className="text-blue-100">Support for GRI, TCFD, SASB, CSRD, CDP and more</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">AI-Powered Insights</h3>
                  <p className="text-blue-100">Smart recommendations and automated report generation</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Real-time Collaboration</h3>
                  <p className="text-blue-100">Work seamlessly with your team across departments</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Enterprise-Grade Security</h3>
                  <p className="text-blue-100">SOC 2 compliant with end-to-end encryption</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Industry-Specific Tools</h3>
                  <p className="text-blue-100">Specialized toolkits for Construction, Water, and Energy</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Expert Support</h3>
                  <p className="text-blue-100">Dedicated support team with ESG expertise</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
