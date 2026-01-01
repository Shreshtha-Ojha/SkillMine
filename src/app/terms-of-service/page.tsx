"use client";

import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-300">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: January 1, 2025</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using SkillMine (&quot;the Service&quot;), you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use our Service.
              These terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p>
              SkillMine provides an educational platform offering technical roadmaps, learning paths,
              AI-powered interview practice, coding challenges, skill assessments, and certification
              programs. The Service is designed to help users improve their programming skills and
              prepare for technical careers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-medium text-white mb-3">Registration</h3>
            <p className="mb-4">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3 mt-6">Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms,
              engage in fraudulent activity, or misuse the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use</h2>
            <p className="mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Share your account credentials with others</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Distribute malware or harmful content</li>
              <li>Scrape or collect data without permission</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Use automated systems to access the Service excessively</li>
              <li>Circumvent any rate limits or access restrictions</li>
              <li>Share or redistribute paid content without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Intellectual Property</h2>
            <h3 className="text-xl font-medium text-white mb-3">Our Content</h3>
            <p className="mb-4">
              All content on SkillMine, including roadmaps, blog posts, assessments, and educational
              materials, is owned by us or our licensors and protected by intellectual property laws.
              You may not reproduce, distribute, or create derivative works without permission.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">Your Content</h3>
            <p>
              By submitting content (such as blog posts, comments, or interview responses), you grant
              us a non-exclusive, worldwide license to use, display, and distribute that content in
              connection with the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Certifications</h2>
            <p>
              Certifications earned through SkillMine represent completion of specific learning paths
              and assessments. While we strive to maintain high standards, certifications are for
              educational purposes and do not guarantee employment or specific outcomes. Employers
              may have their own evaluation criteria.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. AI-Powered Features</h2>
            <p>
              Our platform uses AI technology for interview practice and feedback. While we strive
              for accuracy, AI-generated content may contain errors. The feedback provided is for
              educational purposes and should not be considered professional advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Payment Terms</h2>
            <p className="mb-4">For paid features:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prices are displayed in the applicable currency</li>
              <li>Payment is processed through secure third-party providers</li>
              <li>Subscriptions auto-renew unless cancelled</li>
              <li>Refunds are handled on a case-by-case basis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
              WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
              YOUR USE OF THE SERVICE IS AT YOUR OWN RISK.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SKILLMINE SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM
              YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY
              YOU IN THE PAST 12 MONTHS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless SkillMine and its affiliates from any claims,
              damages, or expenses arising from your use of the Service or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of
              significant changes via email or through the Service. Continued use after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with applicable laws,
              without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-4">
              <strong className="text-white">Email:</strong>{" "}
              <a href="mailto:support@skillmine.tech" className="text-[#D4AF37] hover:underline">
                support@skillmine.tech
              </a>
            </p>
            <p className="mt-2">
              <strong className="text-white">Website:</strong>{" "}
              <a href="https://www.skillmine.tech" className="text-[#D4AF37] hover:underline">
                www.skillmine.tech
              </a>
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm">
          <Link href="/privacy-policy" className="text-[#D4AF37] hover:underline">
            Privacy Policy
          </Link>
          <Link href="/contact-support" className="text-[#D4AF37] hover:underline">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
