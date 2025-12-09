import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrafficLights, ESGIndicator } from "@/components/ui/traffic-lights";
import {
  FileText,
  Brain,
  BarChart3,
  Shield,
  Users,
  Globe,
  Building,
  Droplet,
  Zap,
  CheckCircle,
  TrendingUp,
  Database,
  Calculator,
  Upload,
  Eye,
  AlertCircle,
  Save,
  Download
} from "lucide-react";

export default function Landing() {
  return (
    <Layout isAuthenticated={false}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6">
              Professional ESG Reporting
              <br />
              <span className="text-green-400">Made Simple</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100 leading-relaxed">
              Sector-specific data collection that automatically populates your global ESG reports.
              Complete Construction, Water, and Energy frameworks with intelligent cross-framework mapping.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/signup">
                <Button size="lg" variant="secondary">
                  Sign Up
                </Button>
              </Link>
            </div>
            <div className="flex justify-center">
              <TrafficLights size="lg" animated />
            </div>

            <div className="grid grid-cols-3 gap-8 mt-12 text-center">
              <div>
                <div className="text-4xl font-bold">1,000+</div>
                <div className="text-blue-100">Organizations</div>
              </div>
              <div>
                <div className="text-4xl font-bold">50+</div>
                <div className="text-blue-100">Countries</div>
              </div>
              <div>
                <div className="text-4xl font-bold">25+</div>
                <div className="text-blue-100">Frameworks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="mb-4">Comprehensive ESG Framework Coverage</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Support for 25+ international frameworks including mandatory regulatory requirements,
              emerging standards, and voluntary reporting guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-red-200">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Shield className="h-8 w-8 text-red-500" />
                  <Badge variant="destructive">Mandatory</Badge>
                </div>
                <CardTitle>Regulatory Frameworks</CardTitle>
                <CardDescription>
                  CSRD, EU Taxonomy, UK SDS, California Climate, SEC Climate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-red-500" />
                    Corporate Sustainability Reporting Directive (CSRD)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-red-500" />
                    EU Taxonomy Regulation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-red-500" />
                    UK Sustainability Disclosure Standards
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-8 w-8 text-yellow-600" />
                  <Badge className="bg-yellow-500">Emerging</Badge>
                </div>
                <CardTitle>Emerging Standards</CardTitle>
                <CardDescription>
                  IFRS S1/S2, TNFD, SDGs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-yellow-600" />
                    IFRS S1 & S2 (ISSB Standards)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-yellow-600" />
                    Taskforce on Nature-related Disclosures (TNFD)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-yellow-600" />
                    UN Sustainable Development Goals (SDGs)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Globe className="h-8 w-8 text-green-600" />
                  <Badge className="bg-green-500">Voluntary</Badge>
                </div>
                <CardTitle>Voluntary Frameworks</CardTitle>
                <CardDescription>
                  GRI, TCFD, SASB, CDP, UN Global Compact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Global Reporting Initiative (GRI)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Task Force on Climate-related Disclosures (TCFD)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Sustainability Accounting Standards Board (SASB)
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="mb-4">Intelligent ESG Platform Features</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Sector-specific data collection with automatic cross-framework mapping to global ESG standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Smart Data Collection</CardTitle>
                <CardDescription>
                  Step-by-step forms with contextual tooltips and validation rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Framework-specific questions adapt based on your sector selection.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Contextual help tooltips
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Real-time validation
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Auto-save drafts
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calculator className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Automated Calculations</CardTitle>
                <CardDescription>
                  Convert fuel consumption to CO2e using GHG Protocol formulas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Industry benchmarking included.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    GHG Protocol compliance
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Industry benchmarking
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Scope 1, 2, 3 calculations
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Download className="h-10 w-10 text-yellow-600 mb-2" />
                <CardTitle>Multiple Output Formats</CardTitle>
                <CardDescription>
                  Generate branded PDF reports, Excel workbooks with pivot tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Shareable online versions.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Branded PDF templates
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Excel with pivot tables
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Shareable online links
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>Stakeholder-Specific Views</CardTitle>
                <CardDescription>
                  Toggle between investor, regulator, and employee views
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Relevant metrics for each audience.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Investor focus (TCFD risks)
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Regulatory compliance
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Employee engagement
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Upload className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Bulk Data Import</CardTitle>
                <CardDescription>
                  Upload data from existing systems via Excel templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Automatic data validation and error checking.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Excel template downloads
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Data validation
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Error reporting
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-10 w-10 text-red-600 mb-2" />
                <CardTitle>Role-Based Access Control</CardTitle>
                <CardDescription>
                  Super Admin, Admin, and User roles with appropriate permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Organization management.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Organization hierarchy
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Permission controls
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    Audit logging
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="py-16 bg-blue-600 text-white">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-white">Sector-Specific Toolkits</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Specialized modules for Construction, Water, and Energy sectors with
              industry-specific frameworks and certifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <Building className="h-12 w-12 mb-4" />
                <CardTitle className="text-white">Construction & Infrastructure</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• BREEAM UK 2018</li>
                  <li>• LEED v4.1 BD+C</li>
                  <li>• CEEQUAL Version 6</li>
                  <li>• WELL Building Standard</li>
                  <li>• Life Cycle Assessment (LCA)</li>
                  <li>• Whole Life Carbon (WLC)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <Droplet className="h-12 w-12 mb-4" />
                <CardTitle className="text-white">Water & Utilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• AWS Standard v2.0</li>
                  <li>• GRI 303: Water & Effluents</li>
                  <li>• TCFD Water Risks</li>
                  <li>• Water footprint analysis</li>
                  <li>• Consumption tracking</li>
                  <li>• Quality monitoring</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <Zap className="h-12 w-12 mb-4" />
                <CardTitle className="text-white">Energy Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• GRI GRID</li>
                  <li>• SBTi Energy</li>
                  <li>• RE100 Commitments</li>
                  <li>• Net Zero frameworks</li>
                  <li>• Renewable energy tracking</li>
                  <li>• Carbon accounting</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container-responsive text-center">
          <h2 className="mb-6">Ready to Transform Your ESG Reporting?</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of organizations who trust ESGReport to manage their
            sustainability reporting and drive positive impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg">
              Sign Up Now
            </Button>
            <Button size="lg" variant="outline">
              Schedule a Demo
            </Button>
          </div>
          <div className="flex flex-col items-center gap-3">
            <img
              src="/esgreport_icon.png"
              alt="ESG"
              className="h-16 w-auto"
            />
            <TrafficLights size="lg" animated />
          </div>
        </div>
      </div>
    </Layout>
  );
}
