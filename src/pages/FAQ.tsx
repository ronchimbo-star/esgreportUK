import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqCategories = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I get started with ESGReport?",
        a: "Getting started is easy! Sign up for a free trial, complete the onboarding process to set up your organization, and you'll be ready to create your first ESG report. Our platform guides you through each step with helpful tooltips and documentation."
      },
      {
        q: "What frameworks does ESGReport support?",
        a: "We support 25+ frameworks including GRI, TCFD, SASB, CSRD, EU Taxonomy, IFRS S1/S2, CDP, UN SDGs, and many more. Our platform includes both mandatory regulatory frameworks and voluntary reporting standards."
      },
      {
        q: "Can I import existing ESG data?",
        a: "Yes! We support Excel/CSV imports, API integrations, and manual data entry. Our platform can map your existing data to multiple frameworks automatically, saving you time and reducing duplicate entry."
      },
      {
        q: "How long does it take to create a report?",
        a: "With our AI-assisted reporting and automated data mapping, most organizations can create their first report in a few hours instead of weeks. The exact time depends on your data readiness and framework complexity."
      }
    ]
  },
  {
    category: "Features & Functionality",
    questions: [
      {
        q: "What is AI-assisted reporting?",
        a: "Our AI analyzes your data, identifies gaps, generates draft sections, and provides recommendations for improvement. It helps you write better reports faster while ensuring framework compliance and data quality."
      },
      {
        q: "Can I manage multiple sites or locations?",
        a: "Absolutely! Our multi-site management feature allows you to collect data from different locations, track site-specific metrics, and generate both consolidated and individual site reports."
      },
      {
        q: "How does cross-framework mapping work?",
        a: "When you enter data for one framework, our intelligent mapping system automatically populates related fields in other frameworks. This eliminates duplicate data entry and ensures consistency across all your reports."
      },
      {
        q: "Can I customize report templates?",
        a: "Yes! You can create custom templates, add your branding, customize sections, and save them for reuse. We also provide industry-specific templates to help you get started quickly."
      }
    ]
  },
  {
    category: "Data & Security",
    questions: [
      {
        q: "Is my data secure?",
        a: "Security is our top priority. We use bank-level encryption, secure data centers, regular security audits, and comply with SOC 2, GDPR, and ISO 27001 standards. Your data is yours and always protected."
      },
      {
        q: "Where is my data stored?",
        a: "Data is stored in secure, certified data centers with automatic backups and disaster recovery. We offer region-specific hosting to comply with local data residency requirements."
      },
      {
        q: "Can I export my data?",
        a: "Yes! You can export your data at any time in multiple formats including Excel, CSV, JSON, and PDF. You maintain full ownership and control of your data."
      },
      {
        q: "How is data quality ensured?",
        a: "We use automated validation rules, quality scoring, completeness checks, and AI-powered anomaly detection to ensure your data is accurate and reliable before generating reports."
      }
    ]
  },
  {
    category: "Pricing & Plans",
    questions: [
      {
        q: "What plans are available?",
        a: "We offer Starter, Professional, and Enterprise plans. All plans include core features with different limits on frameworks, users, and reports. Start with our 14-day free trial to explore the platform."
      },
      {
        q: "Can I change plans later?",
        a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments."
      },
      {
        q: "Do you offer discounts for non-profits?",
        a: "Yes! We offer special pricing for non-profits, educational institutions, and small businesses. Contact our sales team to learn more about available discounts."
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards, bank transfers, and purchase orders for Enterprise customers. All payments are processed securely through Stripe."
      }
    ]
  },
  {
    category: "Collaboration & Teams",
    questions: [
      {
        q: "Can multiple team members work together?",
        a: "Yes! Invite team members with different roles and permissions. Collaborate in real-time with comments, task assignments, and approval workflows."
      },
      {
        q: "What user roles are available?",
        a: "We offer Admin, Editor, Contributor, and Viewer roles. Each role has specific permissions for data entry, report creation, approval, and publishing."
      },
      {
        q: "How do approval workflows work?",
        a: "Create custom approval workflows with multiple stages. Assign reviewers, track changes, add comments, and maintain a complete audit trail of all approvals."
      },
      {
        q: "Can I share reports with external stakeholders?",
        a: "Yes! Generate secure sharing links, create public report pages, export to PDF, or embed reports on your website. Control exactly what information is shared."
      }
    ]
  },
  {
    category: "Support & Training",
    questions: [
      {
        q: "What support do you offer?",
        a: "All plans include email support and access to our knowledge base. Professional and Enterprise plans include priority support, dedicated account managers, and phone support."
      },
      {
        q: "Do you provide training?",
        a: "Yes! We offer onboarding training, webinars, video tutorials, and documentation. Enterprise customers receive personalized training sessions for their teams."
      },
      {
        q: "How quickly do you respond to support requests?",
        a: "We aim to respond to all support requests within 24 hours. Professional and Enterprise customers receive priority support with faster response times."
      },
      {
        q: "Can you help with ESG strategy?",
        a: "While we provide software and technical support, we partner with ESG consultants who can help with strategy, materiality assessments, and compliance guidance."
      }
    ]
  }
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <Layout isAuthenticated={false}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-8">
              Find answers to common questions about ESGReport
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container-responsive max-w-4xl">
          <div className="space-y-12">
            {filteredFaqs.map((category) => (
              <div key={category.category}>
                <h2 className="text-2xl font-medium mb-6 text-gray-900">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, idx) => {
                    const itemId = `${category.category}-${idx}`;
                    const isOpen = openItems.includes(itemId);

                    return (
                      <Card key={idx} className="overflow-hidden">
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="w-full text-left"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between gap-4">
                              <h3 className="font-medium text-lg pr-4">{faq.q}</h3>
                              <ChevronDown
                                className={`h-5 w-5 text-gray-500 transition-transform flex-shrink-0 ${
                                  isOpen ? "transform rotate-180" : ""
                                }`}
                              />
                            </div>
                            {isOpen && (
                              <p className="mt-4 text-gray-600 leading-relaxed">
                                {faq.a}
                              </p>
                            )}
                          </CardContent>
                        </button>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">
                    No questions found matching your search. Try different keywords or{" "}
                    <a href="/contact" className="text-primary hover:underline">
                      contact support
                    </a>
                    .
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="mt-12 bg-blue-50 border-blue-200">
            <CardContent className="py-8 text-center">
              <h3 className="mb-2">Still have questions?</h3>
              <p className="text-gray-600 mb-6">
                Our support team is here to help you get the most out of ESGReport
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact" className="text-primary font-medium hover:underline">
                  Contact Support →
                </a>
                <a href="/support" className="text-primary font-medium hover:underline">
                  Visit Support Center →
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
