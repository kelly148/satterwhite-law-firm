/**
 * PrivacyPolicy — The Satterwhite Law Firm, PLLC
 * Attorney-advertising-compliant privacy policy page
 * Covers: data collection, use, cookies, third-party services (Calendly),
 *         contact form, intake form, client rights, and attorney-client disclaimer
 */

import { useEffect } from "react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: `The Satterwhite Law Firm, PLLC ("the Firm," "we," "us," or "our") is committed to protecting the privacy of visitors to our website located at thesatterwhitelawfirm.com (the "Website") and individuals who contact us or submit information through our online forms. This Privacy Policy explains what information we collect, how we use it, with whom we share it, and the choices you have regarding your information.

By accessing or using our Website, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not use our Website.

This Privacy Policy was last updated on February 28, 2026. We reserve the right to update this policy at any time, and any changes will be posted on this page with an updated effective date.`,
  },
  {
    id: "information-collected",
    title: "2. Information We Collect",
    content: `We collect information in the following ways:

Information You Provide Directly. When you use our contact form, client intake form, or otherwise communicate with us, you may provide personal information such as your name, email address, phone number, mailing address, date of birth, marital status, information about your family members and beneficiaries, asset information, and other estate planning details. We collect only the information you voluntarily provide.

Scheduling Information. When you schedule a consultation through our Calendly scheduling tool, Calendly collects and processes your name, email address, and any other information you provide during the booking process. Please review Calendly's Privacy Policy at calendly.com/privacy for information on how they handle your data.

Automatically Collected Information. When you visit our Website, we may automatically collect certain technical information, including your IP address, browser type and version, operating system, referring URLs, pages viewed, and the date and time of your visit. This information is collected through standard web server logs and analytics tools and does not personally identify you.

Cookies and Similar Technologies. Our Website may use cookies and similar tracking technologies to enhance your browsing experience. You may configure your browser to refuse cookies; however, some features of the Website may not function properly without them.`,
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Information",
    content: `We use the information we collect for the following purposes:

To respond to your inquiries and provide legal services. When you contact us through the Website, we use your information to respond to your questions, schedule consultations, and provide the legal services you request.

To communicate with you. We may use your contact information to send you information about your matter, respond to your questions, or provide updates about our services. We do not send unsolicited commercial emails.

To improve our Website. We use automatically collected technical information to analyze how visitors use our Website, identify areas for improvement, and enhance the overall user experience.

To comply with legal obligations. We may use or disclose your information as required by applicable law, court order, or governmental authority.

To protect our rights. We may use your information to protect the rights, property, or safety of the Firm, our clients, or others.

We do not sell, rent, or trade your personal information to third parties for their marketing purposes.`,
  },
  {
    id: "attorney-client",
    title: "4. Attorney-Client Relationship & Confidentiality",
    content: `IMPORTANT NOTICE: Submitting information through our Website's contact form or client intake form does not create an attorney-client relationship between you and The Satterwhite Law Firm, PLLC. An attorney-client relationship is only established through a signed engagement letter and fee agreement.

Please do not submit confidential or sensitive legal information through our Website forms until an attorney-client relationship has been formally established. While we treat all information submitted to us with care and discretion, information submitted prior to the formation of an attorney-client relationship may not be protected by attorney-client privilege.

If you are an existing client of the Firm, please communicate confidential information through our secure client communication channels rather than through the Website contact form.`,
  },
  {
    id: "information-sharing",
    title: "5. Information Sharing and Disclosure",
    content: `We do not sell, rent, or trade your personal information. We may share your information in the following limited circumstances:

Service Providers. We may share your information with trusted third-party service providers who assist us in operating our Website and conducting our business, such as web hosting providers, analytics services, and scheduling tools (Calendly). These service providers are contractually obligated to use your information only as necessary to provide services to us and to maintain appropriate security measures.

Legal Requirements. We may disclose your information if required to do so by law or in response to valid legal process, such as a subpoena, court order, or government request.

Protection of Rights. We may disclose information when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request.

Business Transfers. In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction. We will notify you of any such change in ownership or control of your personal information.

With Your Consent. We may share your information with third parties when you have given us your explicit consent to do so.`,
  },
  {
    id: "third-party",
    title: "6. Third-Party Services",
    content: `Our Website integrates with the following third-party services that have their own privacy practices:

Calendly (Scheduling). We use Calendly to allow visitors to schedule consultations. When you use the scheduling feature, you interact directly with Calendly's platform. Calendly's privacy policy governs the collection and use of information you provide during scheduling. Please visit calendly.com/privacy to review their policy.

Analytics. We may use web analytics services to understand how visitors interact with our Website. These services may use cookies and similar technologies to collect information about your use of the Website. This information is used in aggregate form and does not personally identify individual visitors.

We are not responsible for the privacy practices of third-party websites or services. We encourage you to review the privacy policies of any third-party services you use in connection with our Website.`,
  },
  {
    id: "data-security",
    title: "7. Data Security",
    content: `We take reasonable measures to protect the information you provide to us from unauthorized access, use, alteration, or disclosure. Our Website uses industry-standard SSL/TLS encryption to protect data transmitted between your browser and our servers.

However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security. You provide information to us at your own risk.

We retain personal information only for as long as necessary to fulfill the purposes for which it was collected, to comply with our legal obligations, or as otherwise required by applicable law.`,
  },
  {
    id: "your-rights",
    title: "8. Your Rights and Choices",
    content: `Depending on your jurisdiction, you may have certain rights regarding your personal information, including:

Access. You may request access to the personal information we hold about you.

Correction. You may request that we correct inaccurate or incomplete personal information.

Deletion. You may request that we delete your personal information, subject to certain exceptions required by law or legitimate business purposes.

Opt-Out of Communications. If you have received communications from us, you may opt out by contacting us directly at kelly@thesatterwhitelawfirm.com or by calling (703) 855-7380.

To exercise any of these rights, please contact us using the information provided in the "Contact Us" section below. We will respond to your request within a reasonable timeframe and in accordance with applicable law.

Virginia and Maryland residents may have additional rights under the Virginia Consumer Data Protection Act (VCDPA) and applicable Maryland privacy laws. Please contact us for more information about your specific rights.`,
  },
  {
    id: "childrens-privacy",
    title: "9. Children's Privacy",
    content: `Our Website is not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately at kelly@thesatterwhitelawfirm.com and we will take steps to delete such information.`,
  },
  {
    id: "changes",
    title: "10. Changes to This Privacy Policy",
    content: `We reserve the right to update or modify this Privacy Policy at any time. Any changes will be effective immediately upon posting the revised Privacy Policy on the Website, with an updated "Last Updated" date. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.

Your continued use of the Website after any changes to this Privacy Policy constitutes your acceptance of the revised policy.`,
  },
  {
    id: "contact",
    title: "11. Contact Us",
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:

The Satterwhite Law Firm, PLLC
1605 Fort Hunt Court
Alexandria, Virginia 22307

Phone: (703) 855-7380
Email: kelly@thesatterwhitelawfirm.com

We will make every reasonable effort to respond to your inquiry within five (5) business days.`,
  },
];

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy | The Satterwhite Law Firm, PLLC";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Top bar */}
      <div className="bg-[#16224d] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between py-2">
          <p className="text-white/60 text-xs tracking-wide">Serving Virginia & Maryland | Alexandria, VA</p>
          <a href="tel:7038557380" className="text-[#90cdf4] text-xs font-bold hover:text-white transition-colors">
            (703) 855-7380
          </a>
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-[#2c5282] shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="The Satterwhite Law Firm, PLLC"
              className="h-12 w-auto object-contain rounded"
              style={{ background: "rgba(255,255,255,0.12)", padding: "3px 7px" }}
            />
          </a>
          <div className="flex items-center gap-4">
            <a href="/" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              ← Back to Home
            </a>
            <a
              href="/#contact"
              className="bg-[#90cdf4] text-[#1a365d] text-xs font-bold tracking-widest uppercase py-2.5 px-5 hover:bg-white transition-colors"
            >
              Free Consultation
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-[#2c5282] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#90cdf4] text-xs font-bold tracking-[0.25em] uppercase mb-4">
            Legal Information
          </p>
          <h1
            className="text-white mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 600,
            }}
          >
            Privacy Policy
          </h1>
          <p className="text-white/70 text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
            The Satterwhite Law Firm, PLLC &nbsp;·&nbsp; Effective Date: February 28, 2026
          </p>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="bg-[#ebf4ff] border-b border-[#bee3f8]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2
            className="text-[#1a365d] mb-4 text-lg font-semibold"
            style={{ fontFamily: "'Cormorant Garamath', serif" }}
          >
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-[#2c5282] text-sm hover:text-[#1a365d] hover:underline transition-colors py-0.5"
              >
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Attorney-Client Notice Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 max-w-4xl mx-auto mt-10 mx-4 px-6 py-5 rounded-r" style={{ margin: "2.5rem auto", maxWidth: "56rem", padding: "1.25rem 1.5rem" }}>
        <p className="text-amber-800 text-sm font-semibold mb-1">Attorney Advertising Notice</p>
        <p className="text-amber-700 text-sm leading-relaxed">
          This website is for informational purposes only. Use of this website does not create an attorney-client relationship.
          Do not send confidential information through this website until an attorney-client relationship has been established
          through a signed engagement agreement.
        </p>
      </div>

      {/* Policy Content */}
      <div className="max-w-4xl mx-auto px-4 py-10 pb-20">
        {sections.map((section) => (
          <div
            key={section.id}
            id={section.id}
            className="mb-12 scroll-mt-24"
          >
            <h2
              className="text-[#1a365d] mb-4 pb-2 border-b border-[#bee3f8]"
              style={{
                fontFamily: "'Cormorant Garamath', serif",
                fontSize: "1.4rem",
                fontWeight: 600,
              }}
            >
              {section.title}
            </h2>
            <div className="text-[#374151] leading-relaxed text-sm space-y-4">
              {section.content.split("\n\n").map((paragraph, i) => (
                <p key={i} className={paragraph.match(/^[A-Z].*\.$/) && paragraph.length < 80 ? "font-semibold text-[#2c5282]" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* Back to top */}
        <div className="text-center pt-8 border-t border-[#bee3f8]">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-[#2c5282] text-sm font-medium hover:underline transition-colors"
          >
            ↑ Back to Top
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#16224d] text-white/60 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs mb-2">
            © {new Date().getFullYear()} The Satterwhite Law Firm, PLLC. All rights reserved.
          </p>
          <p className="text-xs mb-4">
            1605 Fort Hunt Court, Alexandria, Virginia 22307 &nbsp;·&nbsp;
            <a href="tel:7038557380" className="hover:text-white transition-colors">(703) 855-7380</a> &nbsp;·&nbsp;
            <a href="mailto:kelly@thesatterwhitelawfirm.com" className="hover:text-white transition-colors">kelly@thesatterwhitelawfirm.com</a>
          </p>
          <p className="text-xs text-white/40">
            Attorney Advertising. The information on this website is for general informational purposes only and does not constitute legal advice.
            No attorney-client relationship is formed by use of this website.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <a href="/" className="text-xs hover:text-white transition-colors">Home</a>
            <a href="/privacy-policy" className="text-xs text-white/80 hover:text-white transition-colors">Privacy Policy</a>
            <a href="/#contact" className="text-xs hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
