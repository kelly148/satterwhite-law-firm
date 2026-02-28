/**
 * PrivacyPolicy — The Satterwhite Law Firm, PLLC
 * Attorney-advertising-compliant privacy policy page
 * Polished design matching the firm's Steel Blue & White scheme
 */

import { useEffect } from "react";
import { Phone, Mail, MapPin } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg";

const EFFECTIVE_DATE = "February 28, 2026";

// ─── Section data ────────────────────────────────────────────────────────────

interface PolicySection {
  id: string;
  title: string;
  body: React.ReactNode;
}

// We render each section's body as JSX so we get proper formatting
function useSections(): PolicySection[] {
  return [
    {
      id: "introduction",
      title: "1. Introduction",
      body: (
        <>
          <p>
            The Satterwhite Law Firm, PLLC ("the Firm," "we," "us," or "our") is committed to
            protecting the privacy of visitors to our website located at{" "}
            <strong>thesatterwhitelawfirm.com</strong> (the "Website") and individuals who contact
            us or submit information through our online forms. This Privacy Policy explains what
            information we collect, how we use it, with whom we share it, and the choices you have
            regarding your information.
          </p>
          <p>
            By accessing or using our Website, you acknowledge that you have read, understood, and
            agree to be bound by this Privacy Policy. If you do not agree with the terms of this
            Privacy Policy, please do not use our Website.
          </p>
          <p>
            This Privacy Policy was last updated on <strong>{EFFECTIVE_DATE}</strong>. We reserve
            the right to update this policy at any time, and any changes will be posted on this
            page with an updated effective date.
          </p>
        </>
      ),
    },
    {
      id: "information-collected",
      title: "2. Information We Collect",
      body: (
        <>
          <p>We collect information in the following ways:</p>
          <SubHeading>Information You Provide Directly</SubHeading>
          <p>
            When you use our contact form, client intake form, or otherwise communicate with us,
            you may provide personal information such as your name, email address, phone number,
            mailing address, date of birth, marital status, information about your family members
            and beneficiaries, asset information, and other estate planning details. We collect
            only the information you voluntarily provide.
          </p>
          <SubHeading>Scheduling Information</SubHeading>
          <p>
            When you schedule a consultation through our Calendly scheduling tool, Calendly
            collects and processes your name, email address, and any other information you provide
            during the booking process. Please review Calendly's Privacy Policy at{" "}
            <ExternalLink href="https://calendly.com/privacy">calendly.com/privacy</ExternalLink>{" "}
            for information on how they handle your data.
          </p>
          <SubHeading>Automatically Collected Information</SubHeading>
          <p>
            When you visit our Website, we may automatically collect certain technical information,
            including your IP address, browser type and version, operating system, referring URLs,
            pages viewed, and the date and time of your visit. This information is collected
            through standard web server logs and analytics tools and does not personally identify
            you.
          </p>
          <SubHeading>Cookies and Similar Technologies</SubHeading>
          <p>
            Our Website may use cookies and similar tracking technologies to enhance your browsing
            experience. You may configure your browser to refuse cookies; however, some features of
            the Website may not function properly without them.
          </p>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: "3. How We Use Your Information",
      body: (
        <>
          <p>We use the information we collect for the following purposes:</p>
          <SubHeading>To Respond to Inquiries and Provide Legal Services</SubHeading>
          <p>
            When you contact us through the Website, we use your information to respond to your
            questions, schedule consultations, and provide the legal services you request.
          </p>
          <SubHeading>To Communicate With You</SubHeading>
          <p>
            We may use your contact information to send you information about your matter, respond
            to your questions, or provide updates about our services. We do not send unsolicited
            commercial emails.
          </p>
          <SubHeading>To Improve Our Website</SubHeading>
          <p>
            We use automatically collected technical information to analyze how visitors use our
            Website, identify areas for improvement, and enhance the overall user experience.
          </p>
          <SubHeading>To Comply With Legal Obligations</SubHeading>
          <p>
            We may use or disclose your information as required by applicable law, court order, or
            governmental authority.
          </p>
          <SubHeading>To Protect Our Rights</SubHeading>
          <p>
            We may use your information to protect the rights, property, or safety of the Firm,
            our clients, or others.
          </p>
          <p className="font-semibold text-[#2c5282]">
            We do not sell, rent, or trade your personal information to third parties for their
            marketing purposes.
          </p>
        </>
      ),
    },
    {
      id: "attorney-client",
      title: "4. Attorney-Client Relationship & Confidentiality",
      body: (
        <>
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r px-5 py-4 mb-4">
            <p className="text-amber-800 font-semibold text-sm mb-1">Important Notice</p>
            <p className="text-amber-700 text-sm leading-relaxed">
              Submitting information through our Website's contact form or client intake form{" "}
              <strong>does not create an attorney-client relationship</strong> between you and The
              Satterwhite Law Firm, PLLC. An attorney-client relationship is only established
              through a signed engagement letter and fee agreement.
            </p>
          </div>
          <p>
            Please do not submit confidential or sensitive legal information through our Website
            forms until an attorney-client relationship has been formally established. While we
            treat all information submitted to us with care and discretion, information submitted
            prior to the formation of an attorney-client relationship may not be protected by
            attorney-client privilege.
          </p>
          <p>
            If you are an existing client of the Firm, please communicate confidential information
            through our secure client communication channels rather than through the Website
            contact form.
          </p>
        </>
      ),
    },
    {
      id: "information-sharing",
      title: "5. Information Sharing and Disclosure",
      body: (
        <>
          <p>
            We do not sell, rent, or trade your personal information. We may share your information
            in the following limited circumstances:
          </p>
          <SubHeading>Service Providers</SubHeading>
          <p>
            We may share your information with trusted third-party service providers who assist us
            in operating our Website and conducting our business, such as web hosting providers,
            analytics services, and scheduling tools (Calendly). These service providers are
            contractually obligated to use your information only as necessary to provide services
            to us and to maintain appropriate security measures.
          </p>
          <SubHeading>Legal Requirements</SubHeading>
          <p>
            We may disclose your information if required to do so by law or in response to valid
            legal process, such as a subpoena, court order, or government request.
          </p>
          <SubHeading>Protection of Rights</SubHeading>
          <p>
            We may disclose information when we believe in good faith that disclosure is necessary
            to protect our rights, protect your safety or the safety of others, investigate fraud,
            or respond to a government request.
          </p>
          <SubHeading>Business Transfers</SubHeading>
          <p>
            In the event of a merger, acquisition, or sale of all or a portion of our assets, your
            information may be transferred as part of that transaction. We will notify you of any
            such change in ownership or control of your personal information.
          </p>
          <SubHeading>With Your Consent</SubHeading>
          <p>
            We may share your information with third parties when you have given us your explicit
            consent to do so.
          </p>
        </>
      ),
    },
    {
      id: "third-party",
      title: "6. Third-Party Services",
      body: (
        <>
          <p>
            Our Website integrates with the following third-party services that have their own
            privacy practices:
          </p>
          <SubHeading>Calendly (Scheduling)</SubHeading>
          <p>
            We use Calendly to allow visitors to schedule consultations. When you use the
            scheduling feature, you interact directly with Calendly's platform. Calendly's privacy
            policy governs the collection and use of information you provide during scheduling.
            Please visit{" "}
            <ExternalLink href="https://calendly.com/privacy">calendly.com/privacy</ExternalLink>{" "}
            to review their policy.
          </p>
          <SubHeading>Analytics</SubHeading>
          <p>
            We may use web analytics services to understand how visitors interact with our Website.
            These services may use cookies and similar technologies to collect information about
            your use of the Website. This information is used in aggregate form and does not
            personally identify individual visitors.
          </p>
          <p>
            We are not responsible for the privacy practices of third-party websites or services.
            We encourage you to review the privacy policies of any third-party services you use in
            connection with our Website.
          </p>
        </>
      ),
    },
    {
      id: "data-security",
      title: "7. Data Security",
      body: (
        <>
          <p>
            We take reasonable measures to protect the information you provide to us from
            unauthorized access, use, alteration, or disclosure. Our Website uses
            industry-standard SSL/TLS encryption to protect data transmitted between your browser
            and our servers.
          </p>
          <p>
            However, no method of transmission over the Internet or method of electronic storage
            is 100% secure. While we strive to use commercially acceptable means to protect your
            personal information, we cannot guarantee its absolute security. You provide
            information to us at your own risk.
          </p>
          <p>
            We retain personal information only for as long as necessary to fulfill the purposes
            for which it was collected, to comply with our legal obligations, or as otherwise
            required by applicable law.
          </p>
        </>
      ),
    },
    {
      id: "your-rights",
      title: "8. Your Rights and Choices",
      body: (
        <>
          <p>
            Depending on your jurisdiction, you may have certain rights regarding your personal
            information, including:
          </p>
          <ul className="list-none space-y-3 my-4">
            {[
              {
                label: "Access",
                text: "You may request access to the personal information we hold about you.",
              },
              {
                label: "Correction",
                text: "You may request that we correct inaccurate or incomplete personal information.",
              },
              {
                label: "Deletion",
                text: "You may request that we delete your personal information, subject to certain exceptions required by law or legitimate business purposes.",
              },
              {
                label: "Opt-Out of Communications",
                text: "If you have received communications from us, you may opt out by contacting us directly.",
              },
            ].map(({ label, text }) => (
              <li key={label} className="flex gap-3">
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#2c5282] mt-2" />
                <span>
                  <strong className="text-[#1a365d]">{label}.</strong> {text}
                </span>
              </li>
            ))}
          </ul>
          <p>
            To exercise any of these rights, please contact us using the information provided in
            the "Contact Us" section below. We will respond to your request within a reasonable
            timeframe and in accordance with applicable law.
          </p>
          <p>
            Virginia and Maryland residents may have additional rights under the{" "}
            <strong>Virginia Consumer Data Protection Act (VCDPA)</strong> and applicable Maryland
            privacy laws. Please contact us for more information about your specific rights.
          </p>
        </>
      ),
    },
    {
      id: "childrens-privacy",
      title: "9. Children's Privacy",
      body: (
        <p>
          Our Website is not directed to children under the age of 13, and we do not knowingly
          collect personal information from children under 13. If you are a parent or guardian and
          believe that your child has provided us with personal information, please contact us
          immediately at{" "}
          <a
            href="mailto:kelly@thesatterwhitelawfirm.com"
            className="text-[#2c5282] font-medium hover:underline"
          >
            kelly@thesatterwhitelawfirm.com
          </a>{" "}
          and we will take steps to delete such information.
        </p>
      ),
    },
    {
      id: "changes",
      title: "10. Changes to This Privacy Policy",
      body: (
        <>
          <p>
            We reserve the right to update or modify this Privacy Policy at any time. Any changes
            will be effective immediately upon posting the revised Privacy Policy on the Website,
            with an updated "Last Updated" date. We encourage you to review this Privacy Policy
            periodically to stay informed about how we are protecting your information.
          </p>
          <p>
            Your continued use of the Website after any changes to this Privacy Policy constitutes
            your acceptance of the revised policy.
          </p>
        </>
      ),
    },
    {
      id: "contact",
      title: "11. Contact Us",
      body: (
        <>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or our
            privacy practices, please contact us using any of the methods below. We will make every
            reasonable effort to respond within five (5) business days.
          </p>
          <div className="mt-6 bg-[#ebf4ff] border border-[#bee3f8] rounded-lg p-6">
            <p
              className="text-[#1a365d] font-semibold mb-4 text-base"
              style={{ fontFamily: "'Cormorant Garamath', serif", fontSize: "1.15rem" }}
            >
              The Satterwhite Law Firm, PLLC
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#2c5282] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[#374151] text-sm">1605 Fort Hunt Court</p>
                  <p className="text-[#374151] text-sm">Alexandria, Virginia 22307</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#2c5282] flex-shrink-0" />
                <a
                  href="tel:7038557380"
                  className="text-[#2c5282] text-sm font-semibold hover:underline"
                >
                  (703) 855-7380
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#2c5282] flex-shrink-0" />
                <a
                  href="mailto:kelly@thesatterwhitelawfirm.com"
                  className="text-[#2c5282] text-sm font-semibold hover:underline"
                >
                  kelly@thesatterwhitelawfirm.com
                </a>
              </div>
            </div>
          </div>
        </>
      ),
    },
  ];
}

// ─── Helper sub-components ────────────────────────────────────────────────────

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-semibold text-[#1a365d] mt-4 mb-1" style={{ fontFamily: "'Lato', sans-serif" }}>
      {children}
    </p>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#2c5282] font-medium hover:underline"
    >
      {children}
    </a>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PrivacyPolicy() {
  const sections = useSections();

  useEffect(() => {
    document.title = "Privacy Policy | The Satterwhite Law Firm, PLLC";

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link") as HTMLLinkElement;
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", "https://www.satterwhitelawfirmpllc.com/privacy-policy");

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content",
        "Privacy Policy for The Satterwhite Law Firm, PLLC — Learn how we collect, use, and protect your personal information. Estate planning attorney serving Virginia and Maryland."
      );
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Lato', sans-serif" }}>

      {/* ── Top bar ── */}
      <div className="bg-[#16224d] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between py-2">
          <p className="text-white/60 text-xs tracking-wide">
            Serving Virginia &amp; Maryland | Alexandria, VA
          </p>
          <a href="tel:7038557380" className="text-[#90cdf4] text-xs font-bold hover:text-white transition-colors">
            (703) 855-7380
          </a>
        </div>
      </div>

      {/* ── Sticky nav ── */}
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

      {/* ── Hero ── */}
      <div className="bg-[#2c5282] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#90cdf4] text-xs font-bold tracking-[0.25em] uppercase mb-4">
            Legal Information
          </p>
          <h1
            className="text-white mb-3"
            style={{
              fontFamily: "'Cormorant Garamath', serif",
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 600,
            }}
          >
            Privacy Policy
          </h1>
          <p className="text-white/70 text-sm">
            The Satterwhite Law Firm, PLLC &nbsp;·&nbsp; Effective Date: {EFFECTIVE_DATE}
          </p>
        </div>
      </div>

      {/* ── Table of Contents ── */}
      <div className="bg-[#ebf4ff] border-b border-[#bee3f8]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2
            className="text-[#1a365d] mb-4"
            style={{ fontFamily: "'Cormorant Garamath', serif", fontSize: "1.25rem", fontWeight: 600 }}
          >
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-6">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-[#2c5282] text-sm hover:text-[#1a365d] hover:underline transition-colors py-0.5"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Attorney Advertising Banner ── */}
      <div className="max-w-4xl mx-auto px-4 mt-10">
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r px-6 py-4">
          <p className="text-amber-800 text-sm font-semibold mb-1">Attorney Advertising Notice</p>
          <p className="text-amber-700 text-sm leading-relaxed">
            This website is for informational purposes only. Use of this website does not create an
            attorney-client relationship. Do not send confidential information through this website
            until an attorney-client relationship has been established through a signed engagement
            agreement.
          </p>
        </div>
      </div>

      {/* ── Policy Sections ── */}
      <div className="max-w-4xl mx-auto px-4 py-10 pb-20">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            id={section.id}
            className={`scroll-mt-24 ${idx < sections.length - 1 ? "mb-12 pb-12 border-b border-[#e2ecf8]" : "mb-12"}`}
          >
            <h2
              className="text-[#1a365d] mb-5"
              style={{
                fontFamily: "'Cormorant Garamath', serif",
                fontSize: "1.45rem",
                fontWeight: 600,
              }}
            >
              {section.title}
            </h2>
            <div
              className="text-[#374151] leading-relaxed text-sm space-y-3"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              {section.body}
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

      {/* ── Footer ── */}
      <footer className="bg-[#16224d] text-white/60 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs mb-2">
            © {new Date().getFullYear()} The Satterwhite Law Firm, PLLC. All rights reserved.
          </p>
          <p className="text-xs mb-4 space-x-2">
            <span>1605 Fort Hunt Court, Alexandria, Virginia 22307</span>
            <span className="text-white/20">·</span>
            <a href="tel:7038557380" className="hover:text-white transition-colors">
              (703) 855-7380
            </a>
            <span className="text-white/20">·</span>
            <a href="mailto:kelly@thesatterwhitelawfirm.com" className="hover:text-white transition-colors">
              kelly@thesatterwhitelawfirm.com
            </a>
          </p>
          <p className="text-xs text-white/40 max-w-2xl mx-auto leading-relaxed">
            Attorney Advertising. The information on this website is for general informational
            purposes only and does not constitute legal advice. No attorney-client relationship is
            formed by use of this website.
          </p>
          <div className="mt-5 flex justify-center gap-6">
            <a href="/" className="text-xs hover:text-white transition-colors">Home</a>
            <a href="/privacy-policy" className="text-xs text-white/80 hover:text-white transition-colors">Privacy Policy</a>
            <a href="/intake" className="text-xs hover:text-white transition-colors">Client Intake Form</a>
            <a href="/#contact" className="text-xs hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
