import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";

export default function Privacy() {
  return (
    <Layout isAuthenticated={false}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6">Privacy Policy</h1>
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
                At ESGReport, we take your privacy seriously. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you use our platform and services.
              </p>

              <div className="space-y-10">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                  <div className="space-y-4 ml-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">1.1 Information You Provide</h3>
                      <ul className="space-y-2 text-gray-600 ml-6">
                        <li className="list-disc">Account information (name, email, password)</li>
                        <li className="list-disc">Organization details (company name, industry, size)</li>
                        <li className="list-disc">ESG data and metrics you enter into the platform</li>
                        <li className="list-disc">Payment and billing information</li>
                        <li className="list-disc">Communications with our support team</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">1.2 Information Collected Automatically</h3>
                      <ul className="space-y-2 text-gray-600 ml-6">
                        <li className="list-disc">Device and browser information</li>
                        <li className="list-disc">IP address and location data</li>
                        <li className="list-disc">Usage data and analytics</li>
                        <li className="list-disc">Cookies and similar tracking technologies</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                  <p className="text-gray-600 leading-relaxed mb-2">We use the information we collect to:</p>
                  <ul className="space-y-2 text-gray-600 ml-6">
                    <li className="list-disc">Provide, maintain, and improve our services</li>
                    <li className="list-disc">Process your transactions and billing</li>
                    <li className="list-disc">Send you technical notices and support messages</li>
                    <li className="list-disc">Respond to your requests and inquiries</li>
                    <li className="list-disc">Analyze usage patterns to improve user experience</li>
                    <li className="list-disc">Detect, prevent, and address fraud and security issues</li>
                    <li className="list-disc">Comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Data Sharing and Disclosure</h2>
                  <div className="space-y-4 ml-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">3.1 We Do Not Sell Your Data</h3>
                      <p className="text-gray-600 leading-relaxed">
                        We will never sell your personal information or ESG data to third parties.
                        Your data belongs to you.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">3.2 Service Providers</h3>
                      <p className="text-gray-600 leading-relaxed mb-2">
                        We may share information with trusted service providers who assist us in operating
                        our platform, including:
                      </p>
                      <ul className="space-y-2 text-gray-600 ml-6">
                        <li className="list-disc">Cloud hosting providers</li>
                        <li className="list-disc">Payment processors</li>
                        <li className="list-disc">Analytics services</li>
                        <li className="list-disc">Customer support tools</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">3.3 Legal Requirements</h3>
                      <p className="text-gray-600 leading-relaxed">
                        We may disclose information if required by law, legal process, or to protect
                        the rights, property, or safety of ESGReport, our users, or others.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                  <p className="text-gray-600 leading-relaxed mb-2">We implement industry-standard security measures including:</p>
                  <ul className="space-y-2 text-gray-600 ml-6">
                    <li className="list-disc">End-to-end encryption for data in transit and at rest</li>
                    <li className="list-disc">Regular security audits and penetration testing</li>
                    <li className="list-disc">Multi-factor authentication</li>
                    <li className="list-disc">Access controls and monitoring</li>
                    <li className="list-disc">SOC 2 Type II compliance</li>
                    <li className="list-disc">ISO 27001 certification</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
                  <p className="text-gray-600 leading-relaxed">
                    We retain your information for as long as your account is active or as needed
                    to provide services. You may request deletion of your data at any time, subject
                    to legal retention requirements.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
                  <p className="text-gray-600 leading-relaxed mb-2">You have the right to:</p>
                  <ul className="space-y-2 text-gray-600 ml-6">
                    <li className="list-disc">Access your personal information</li>
                    <li className="list-disc">Correct inaccurate data</li>
                    <li className="list-disc">Request deletion of your data</li>
                    <li className="list-disc">Export your data</li>
                    <li className="list-disc">Opt-out of marketing communications</li>
                    <li className="list-disc">Object to automated decision-making</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. GDPR Compliance</h2>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    For users in the European Economic Area (EEA), we comply with the General Data
                    Protection Regulation (GDPR). This includes:
                  </p>
                  <ul className="space-y-2 text-gray-600 ml-6">
                    <li className="list-disc">Lawful basis for processing your data</li>
                    <li className="list-disc">Data minimization principles</li>
                    <li className="list-disc">Right to data portability</li>
                    <li className="list-disc">Right to be forgotten</li>
                    <li className="list-disc">Data protection by design</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Your information may be transferred to and processed in countries other than
                    your country of residence. We ensure appropriate safeguards are in place,
                    including Standard Contractual Clauses approved by the European Commission.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking</h2>
                  <p className="text-gray-600 leading-relaxed mb-2">We use cookies and similar technologies to:</p>
                  <ul className="space-y-2 text-gray-600 ml-6">
                    <li className="list-disc">Remember your preferences</li>
                    <li className="list-disc">Analyze site traffic and usage</li>
                    <li className="list-disc">Improve our services</li>
                    <li className="list-disc">Provide personalized content</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    You can control cookies through your browser settings. Note that disabling
                    cookies may affect platform functionality.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Our services are not intended for individuals under 16 years of age. We do not
                    knowingly collect personal information from children.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
                  <p className="text-gray-600 leading-relaxed">
                    We may update this Privacy Policy periodically. We will notify you of significant
                    changes via email or platform notification. Your continued use of our services
                    after changes indicates acceptance.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    If you have questions about this Privacy Policy or wish to exercise your rights,
                    please contact us:
                  </p>
                  <ul className="space-y-2 text-gray-600 ml-6">
                    <li className="list-disc">Email: privacy@esgreport.com</li>
                    <li className="list-disc">Phone: 01892 336 315</li>
                    <li className="list-disc">Data Protection Officer: dpo@esgreport.com</li>
                  </ul>
                </section>
              </div>

              <div className="bg-blue-50 border-l-4 border-primary p-6 mt-8 rounded-r-xl">
                <p className="font-medium mb-2">Your Privacy Matters</p>
                <p className="text-sm text-gray-600">
                  We are committed to protecting your privacy and being transparent about our
                  data practices. If you have any concerns, please don't hesitate to reach out.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
