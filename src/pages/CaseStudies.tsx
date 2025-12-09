import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Target, CheckCircle } from "lucide-react";
import { Link } from "wouter";

const caseStudies = [
  {
    id: 1,
    company: "TechCorp Global",
    industry: "Technology",
    logo: "🏢",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    challenge: "Needed to comply with CSRD requirements across 15 European subsidiaries",
    solution: "Implemented ESGReport's multi-site management and CSRD framework",
    results: [
      "90% reduction in reporting time",
      "100% compliance achieved in first year",
      "Unified data collection across all sites",
      "Generated reports for 5 frameworks simultaneously"
    ],
    metrics: {
      timeReduction: "90%",
      sites: "15",
      frameworks: "5"
    }
  },
  {
    id: 2,
    company: "GreenBuild Construction",
    industry: "Construction",
    logo: "🏗️",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    challenge: "Managing carbon data for 50+ active construction projects",
    solution: "Deployed sector-specific Construction toolkit with BREEAM integration",
    results: [
      "Real-time carbon tracking across all projects",
      "Achieved BREEAM Excellent on 80% of projects",
      "Reduced embodied carbon by 25%",
      "Automated PAS 2080 compliance reporting"
    ],
    metrics: {
      carbonReduction: "25%",
      projects: "50+",
      rating: "Excellent"
    }
  },
  {
    id: 3,
    company: "AquaPure Utilities",
    industry: "Water & Utilities",
    logo: "💧",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    challenge: "Required comprehensive water stewardship reporting for stakeholders",
    solution: "Implemented Water toolkit with AWS Standard and GRI 303 frameworks",
    results: [
      "Achieved AWS certification across 12 facilities",
      "35% improvement in water efficiency",
      "Comprehensive stakeholder reporting",
      "Risk assessment automation"
    ],
    metrics: {
      efficiency: "35%",
      facilities: "12",
      certification: "AWS"
    }
  },
  {
    id: 4,
    company: "RetailCo International",
    industry: "Retail",
    logo: "🛍️",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    challenge: "Managing ESG data across 200+ retail locations in 12 countries",
    solution: "ESGReport platform with custom data collection workflows",
    results: [
      "Centralized ESG data from 200+ locations",
      "Improved ESG score by 40 points",
      "Published first GRI-compliant sustainability report",
      "Automated monthly progress tracking"
    ],
    metrics: {
      locations: "200+",
      scoreImprovement: "40pts",
      countries: "12"
    }
  },
  {
    id: 5,
    company: "EnergyCorp Renewables",
    industry: "Energy",
    logo: "⚡",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    challenge: "Tracking renewable energy portfolio and net-zero commitments",
    solution: "Energy sector toolkit with SBTi and RE100 framework support",
    results: [
      "Met Science-Based Targets 2 years ahead",
      "Achieved RE100 certification",
      "80% reduction in Scope 1 & 2 emissions",
      "Comprehensive climate risk disclosure"
    ],
    metrics: {
      emissionsReduction: "80%",
      renewable: "100%",
      targetMet: "2 years early"
    }
  },
  {
    id: 6,
    company: "FinServe Bank",
    industry: "Financial Services",
    logo: "🏦",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    challenge: "TCFD compliance and climate risk assessment for loan portfolio",
    solution: "Financial services ESG platform with TCFD and EU Taxonomy",
    results: [
      "Complete TCFD disclosure in annual report",
      "Assessed climate risk for €10B portfolio",
      "Integrated ESG into lending decisions",
      "Achieved top ESG rating from agencies"
    ],
    metrics: {
      portfolio: "€10B",
      rating: "A+",
      compliance: "100%"
    }
  }
];

export default function CaseStudies() {
  return (
    <Layout isAuthenticated={false}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6">Case Studies</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              See how organizations across industries are transforming their ESG reporting
              with ESGReport. Real results from real companies.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container-responsive">
          <div className="space-y-8">
            {caseStudies.map((study, index) => (
              <Card key={study.id} className={`hover:shadow-xl transition-all duration-300 ${study.bgColor} border-2 ${study.borderColor}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{study.logo}</div>
                      <div>
                        <CardTitle className="text-2xl">{study.company}</CardTitle>
                        <CardDescription className="text-base">
                          <Badge variant="outline" className="mt-2">{study.industry}</Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="h-5 w-5 text-red-500" />
                        <h4 className="font-medium">Challenge</h4>
                      </div>
                      <p className="text-gray-600">{study.challenge}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="h-5 w-5 text-blue-500" />
                        <h4 className="font-medium">Solution</h4>
                      </div>
                      <p className="text-gray-600">{study.solution}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <h4 className="font-medium">Results</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {study.results.map((result, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-4 border-t">
                    {Object.entries(study.metrics).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-3xl font-medium text-primary mb-1">{value}</div>
                        <div className="text-sm text-gray-500 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-12 bg-blue-50 border-blue-200">
            <CardContent className="py-12 text-center">
              <h3 className="mb-4">Ready to Transform Your ESG Reporting?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join these industry leaders and start your ESG reporting journey today.
                Get started with a free trial or schedule a demo with our team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg">Start Free Trial</Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">Schedule Demo</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
