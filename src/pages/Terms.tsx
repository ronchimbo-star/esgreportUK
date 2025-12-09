import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  return (
    <Layout isAuthenticated={false}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6">Terms of Service</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Last updated: December 8, 2025
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container-responsive max-w-4xl">
          <Card className="mb-8">
            <CardContent className="p-8 md:p-12">
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                These Terms of Service govern your access to and use of ESGReport's platform and services.
                By accessing or using our services, you agree to be bound by these terms.
              </p>

              <div className="space-y-10">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-gray-600 leading-relaxed">
                    By creating an account or using ESGReport, you acknowledge that you have read, understood,
                    and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree,
                    you may not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    ESGReport provides a cloud-based platform for environmental, social, and governance (ESG)
                    reporting and data management. Our services include:
                  </p>
                  <ul className="space-y-2 text-gray-600 ml-6">
                    <li className="list-disc">ESG data collection and management tools</li>
                    <li className="list-disc">Multi-framework reporting capabilities</li>
                    <li className="list-disc">AI-assisted report generation</li>
                    <li className="list-disc">Analytics and benchmarking</li>
                    <li className="list-disc">Collaboration and workflow management</li>
                    <li className="list-disc">API access for data integration</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
                  <div className="space-y-4 ml-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">3.1 Eligibility</h3>
                      <p className="text-gray-600 leading-relaxed">
                        You must be at least 18 years old and have the authority to enter into this agreement
                        on behalf of your organization. You represent that all information provided during
                        registration is accurate and complete.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">3.2 Account Security</h3>
                      <p className="text-gray-600 leading-relaxed">
                        You are responsible for maintaining the confidentiality of your account credentials
                        and for all activities that occur under your account. You must notify us immediately
                        of any unauthorized access or security breach.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">3.3 Organization Accounts</h3>
                      <p className="text-gray-600 leading-relaxed">
                        When you create an account on behalf of an organization, you represent that you have
                        the authority to bind that organization to these terms.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Subscription Plans and Billing</h2>
                  <div className="space-y-4 ml-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">4.1 Plans and Pricing</h3>
                      <p className="text-gray-600 leading-relaxed">
                        We offer various subscription plans with different features and pricing. Current pricing
                        is available on our Pricing page. We reserve the right to modify pricing with 30 days
                        notice to existing customers.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">4.2 Payment Terms</h3>
                      <ul className="space-y-2 text-gray-600 ml-6">
                        <li className="list-disc">Subscription fees are billed in advance on a monthly or annual basis</li>
                        <li className="list-disc">All fees are non-refundable except as required by law</li>
                        <li className="list-disc">You authorize us to charge your payment method automatically</li>
                        <li className="list-disc">Failed payments may result in service suspension</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">4.3 Free Trials</h3>
                      <p className="text-gray-600 leading-relaxed">
                        We may offer free trials. At the end of the trial period, you will be automatically
                        charged unless you cancel before the trial ends.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Use of Service</h2>
                  <div className="space-y-4 ml-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">5.1 Permitted Use</h3>
                      <p className="text-gray-600 leading-relaxed mb-2">You may use our services for lawful purposes including:</p>
                      <ul className="space-y-2 text-gray-600 ml-6">
                        <li className="list-disc">Creating and managing ESG reports</li>
                        <li className="list-disc">Collecting and analyzing ESG data</li>
                        <li className="list-disc">Collaborating with team members</li>
                        <li className="list-disc">Sharing reports with authorized stakeholders</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">5.2 Prohibited Conduct</h3>
                      <p className="text-gray-600 leading-relaxed mb-2">You agree not to:</p>
                      <ul className="space-y-2 text-gray-600 ml-6">
                        <li className="list-disc">Violate any applicable laws or regulations</li>
                        <li className="list-disc">Infringe on intellectual property rights</li>
                        <li className="list-disc">Attempt to gain unauthorized access to our systems</li>
                        <li className="list-disc">Interfere with or disrupt the service</li>
                        <li className="list-disc">Use the service for any fraudulent purpose</li>
                        <li className="list-disc">Reverse engineer or copy any part of the platform</li>
                        <li className="list-disc">Resell or redistribute our services</li>
                        <li className="list-disc">Upload malicious code or harmful content</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Data and Content</h2>
                  <div className="space-y-4 ml-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">6.1 Your Data</h3>
                      <p className="text-gray-600 leading-relaxed">
                        You retain all rights to the data and content you upload to our platform. You grant
                        us a limited license to process and store your data solely to provide our services.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">6.2 Data Accuracy</h3>
                      <p className="text-gray-600 leading-relaxed">
                        You are responsible for the accuracy and completeness of your data. We are not
                        responsible for any consequences arising from inaccurate or incomplete data.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">6.3 Data Backup</h3>
                      <p className="text-gray-600 leading-relaxed">
                        While we maintain regular backups, you are responsible for maintaining your own
                        backups of critical data.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
                  <div className="space-y-4 ml-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">7.1 Our Rights</h3>
                      <p className="text-gray-600 leading-relaxed">
                        ESGReport and its platform, including all software, designs, text, graphics, and other
                        content, are owned by us and protected by intellectual property laws.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">7.2 License Grant</h3>
                      <p className="text-gray-600 leading-relaxed">
                        We grant you a limited, non-exclusive, non-transferable license to access and use
                        our services according to these terms and your subscription plan.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Third-Party Services</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Our platform may integrate with third-party services. Your use of such services is
                    governed by their respective terms and privacy policies. We are not responsible for
                    third-party services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
                  <p className="text-gray-600 leading-relaxed mb-2">For questions about these Terms of Service, contact us:</p>
                  <ul className="space-y-2 text-gray-600 ml-6">
                    <li className="list-disc">Email: legal@esgreport.com</li>
                    <li className="list-disc">Phone: 01892 336 315</li>
                    <li className="list-disc">Support: support@esgreport.com</li>
                  </ul>
                </section>
              </div>

              <div className="bg-blue-50 border-l-4 border-primary p-6 mt-8 rounded-r-xl">
                <p className="font-medium mb-2">Questions About These Terms?</p>
                <p className="text-sm text-gray-600">
                  We're committed to transparency and fairness. If you have questions about these
                  terms or need clarification, please reach out to our legal team.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
