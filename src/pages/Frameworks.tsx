import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, Globe, Building, Droplet, Zap, DollarSign } from "lucide-react";

export default function Frameworks() {
  return (
    <Layout isAuthenticated={false}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container-responsive text-center">
          <h1 className="mb-4">ESG Framework Coverage</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Comprehensive support for 25+ international frameworks including mandatory
            regulatory requirements, emerging standards, and voluntary reporting guidelines.
          </p>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container-responsive">
          <Tabs defaultValue="mandatory" className="w-full">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 mb-12">
              <TabsTrigger value="mandatory">Mandatory</TabsTrigger>
              <TabsTrigger value="emerging">Emerging</TabsTrigger>
              <TabsTrigger value="voluntary">Voluntary</TabsTrigger>
              <TabsTrigger value="financial">Financial Services</TabsTrigger>
            </TabsList>

            <TabsContent value="mandatory">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-red-200">
                  <CardHeader>
                    <Shield className="h-8 w-8 text-red-500 mb-2" />
                    <CardTitle>CSRD</CardTitle>
                    <Badge variant="destructive" className="w-fit">EU Mandatory</Badge>
                    <CardDescription className="mt-2">
                      Corporate Sustainability Reporting Directive
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Mandatory for EU companies from 2024+. Comprehensive sustainability
                      reporting covering environmental, social, and governance factors.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <Shield className="h-8 w-8 text-red-500 mb-2" />
                    <CardTitle>EU Taxonomy</CardTitle>
                    <Badge variant="destructive" className="w-fit">EU Mandatory</Badge>
                    <CardDescription className="mt-2">
                      Classification for Sustainable Activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Classification system for environmentally sustainable economic
                      activities. Essential for green finance and investments.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <Shield className="h-8 w-8 text-red-500 mb-2" />
                    <CardTitle>UK SDS</CardTitle>
                    <Badge variant="destructive" className="w-fit">UK Mandatory</Badge>
                    <CardDescription className="mt-2">
                      UK Sustainability Disclosure Standards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      UK-specific sustainability disclosure requirements effective 2024+.
                      Aligned with international standards.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <Shield className="h-8 w-8 text-red-500 mb-2" />
                    <CardTitle>SEC Climate</CardTitle>
                    <Badge variant="destructive" className="w-fit">US Mandatory</Badge>
                    <CardDescription className="mt-2">
                      SEC Climate Disclosure Rules
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      US Securities and Exchange Commission climate-related disclosure
                      requirements for public companies.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <Shield className="h-8 w-8 text-red-500 mb-2" />
                    <CardTitle>California Climate</CardTitle>
                    <Badge variant="destructive" className="w-fit">California Mandatory</Badge>
                    <CardDescription className="mt-2">
                      California Climate Disclosure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      State-level climate disclosure requirements for companies doing
                      business in California.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="emerging">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-yellow-200">
                  <CardHeader>
                    <TrendingUp className="h-8 w-8 text-yellow-600 mb-2" />
                    <CardTitle>IFRS S1</CardTitle>
                    <Badge className="w-fit bg-yellow-500">Emerging</Badge>
                    <CardDescription className="mt-2">
                      General Sustainability Disclosure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      ISSB's general requirements for disclosure of sustainability-related
                      financial information.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200">
                  <CardHeader>
                    <TrendingUp className="h-8 w-8 text-yellow-600 mb-2" />
                    <CardTitle>IFRS S2</CardTitle>
                    <Badge className="w-fit bg-yellow-500">Emerging</Badge>
                    <CardDescription className="mt-2">
                      Climate-related Disclosure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      ISSB's specific requirements for climate-related disclosures,
                      incorporating TCFD recommendations.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200">
                  <CardHeader>
                    <TrendingUp className="h-8 w-8 text-yellow-600 mb-2" />
                    <CardTitle>TNFD</CardTitle>
                    <Badge className="w-fit bg-yellow-500">Emerging</Badge>
                    <CardDescription className="mt-2">
                      Nature-related Financial Disclosures
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Taskforce on Nature-related Financial Disclosures framework for
                      reporting nature risks.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200">
                  <CardHeader>
                    <TrendingUp className="h-8 w-8 text-yellow-600 mb-2" />
                    <CardTitle>SDGs</CardTitle>
                    <Badge className="w-fit bg-yellow-500">Emerging</Badge>
                    <CardDescription className="mt-2">
                      UN Sustainable Development Goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Framework for aligning business practices with the UN's 17 Sustainable
                      Development Goals.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="voluntary">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-green-200">
                  <CardHeader>
                    <Globe className="h-8 w-8 text-green-600 mb-2" />
                    <CardTitle>GRI</CardTitle>
                    <Badge className="w-fit bg-green-500">Voluntary</Badge>
                    <CardDescription className="mt-2">
                      Global Reporting Initiative
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Most widely used sustainability reporting framework. Comprehensive
                      standards for economic, environmental, and social impacts.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <Globe className="h-8 w-8 text-green-600 mb-2" />
                    <CardTitle>TCFD</CardTitle>
                    <Badge className="w-fit bg-green-500">Voluntary</Badge>
                    <CardDescription className="mt-2">
                      Task Force on Climate-related Disclosures
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Framework for climate-related financial risk disclosures. Widely
                      adopted by financial institutions.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <Globe className="h-8 w-8 text-green-600 mb-2" />
                    <CardTitle>SASB</CardTitle>
                    <Badge className="w-fit bg-green-500">Voluntary</Badge>
                    <CardDescription className="mt-2">
                      Sustainability Accounting Standards Board
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Industry-specific sustainability accounting standards focused on
                      financially material information.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <Globe className="h-8 w-8 text-green-600 mb-2" />
                    <CardTitle>CDP</CardTitle>
                    <Badge className="w-fit bg-green-500">Voluntary</Badge>
                    <CardDescription className="mt-2">
                      Carbon Disclosure Project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Global disclosure system for managing environmental impacts. Focus on
                      climate, water, and forests.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <Globe className="h-8 w-8 text-green-600 mb-2" />
                    <CardTitle>UN Global Compact</CardTitle>
                    <Badge className="w-fit bg-green-500">Voluntary</Badge>
                    <CardDescription className="mt-2">
                      Ten Principles for Sustainable Business
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Framework based on ten principles covering human rights, labor,
                      environment, and anti-corruption.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-blue-200">
                  <CardHeader>
                    <DollarSign className="h-8 w-8 text-blue-600 mb-2" />
                    <CardTitle>PRB</CardTitle>
                    <Badge className="w-fit bg-blue-500">Banking</Badge>
                    <CardDescription className="mt-2">
                      Principles for Responsible Banking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      UN Environment Programme framework for banks to align business strategy
                      with the SDGs and Paris Climate Agreement. Single framework and common
                      language for responsible banking.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardHeader>
                    <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
                    <CardTitle>PRI</CardTitle>
                    <Badge className="w-fit bg-blue-500">Investment</Badge>
                    <CardDescription className="mt-2">
                      Principles for Responsible Investment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Six principles providing a global framework for responsible investors to
                      incorporate ESG factors into investment decisions. World's leading proponent
                      of responsible investment with 5,000+ signatories.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardHeader>
                    <Globe className="h-8 w-8 text-blue-600 mb-2" />
                    <CardTitle>PCAF</CardTitle>
                    <Badge className="w-fit bg-blue-500">Carbon Accounting</Badge>
                    <CardDescription className="mt-2">
                      Partnership for Carbon Accounting Financials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Global standard for measuring and disclosing GHG emissions associated with
                      loans and investments. Enables financial institutions to measure portfolio
                      emissions in line with the GHG Protocol.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="container-responsive">
          <h2 className="text-center mb-12">Sector-Specific Toolkits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Building className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Construction & Infrastructure</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• BREEAM UK 2018</li>
                  <li>• LEED v4.1 BD+C</li>
                  <li>• CEEQUAL Version 6</li>
                  <li>• WELL Building Standard</li>
                  <li>• Part L modelling</li>
                  <li>• TM54 & TM59</li>
                  <li>• Life Cycle Assessment (LCA)</li>
                  <li>• Whole Life Carbon (WLC)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Droplet className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Water & Utilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• AWS Standard v2.0</li>
                  <li>• GRI 303: Water & Effluents</li>
                  <li>• TCFD Water Risks</li>
                  <li>• Water footprint analysis</li>
                  <li>• Consumption tracking</li>
                  <li>• Quality monitoring</li>
                  <li>• Wastewater management</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Energy Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• GRI GRID</li>
                  <li>• SBTi Energy</li>
                  <li>• RE100 Commitments</li>
                  <li>• Net Zero frameworks</li>
                  <li>• Renewable energy tracking</li>
                  <li>• Carbon accounting (Scope 1, 2, 3)</li>
                  <li>• Energy efficiency metrics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
