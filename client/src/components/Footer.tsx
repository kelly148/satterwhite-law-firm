/*
 * Footer — The Satterwhite Law Firm, PLLC
 * Design: Deep navy background, gold accents, logo, links, disclaimer
 */
import { Phone, Mail, MapPin } from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg";

const practiceLinks = [
  { label: "Estate Planning", href: "#estate-planning" },
  { label: "Wills & Trusts", href: "#wills-trusts" },
  { label: "Powers of Attorney", href: "#powers-attorney" },
  { label: "Business Succession", href: "#business-succession" },
  { label: "Business Formation", href: "#business-formation" },
  { label: "1031 Exchanges", href: "#1031-exchanges" },
  { label: "Asset Protection", href: "#asset-protection" },
  { label: "Mergers & Acquisitions", href: "#mergers-acquisitions" },
];

const quickLinks = [
  { label: "Home", href: "#home", isPage: false },
  { label: "About Kelly Satterwhite", href: "#about", isPage: false },
  { label: "Why Choose Us", href: "#why-us", isPage: false },
  { label: "Client Resources & FAQ", href: "#resources", isPage: false },
  { label: "Contact & Directions", href: "#contact", isPage: false },
  { label: "Schedule a Consultation", href: "#contact", isPage: false },
  { label: "💳 Pay Invoice Online", href: "/pay", isPage: true },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#14284a] text-white">
      {/* CTA band */}
      <div className="bg-[#2c5282] py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p
              className="text-white font-bold"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem" }}
            >
              Ready to protect your family's future?
            </p>
            <p className="text-white/80 text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
              Schedule a free, no-obligation consultation today.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="tel:7038557380"
              className="bg-white text-[#2c5282] px-6 py-3 font-bold text-sm tracking-widest uppercase hover:bg-[#ebf4ff] transition-colors flex items-center gap-2"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              <Phone size={15} />
              (703) 855-7380
            </a>
            <button
              onClick={() => scrollTo("#contact")}
              className="bg-[#2c5282] text-white px-6 py-3 font-bold text-sm tracking-widest uppercase hover:bg-[#14284a] transition-colors"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-16">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <img
              src={LOGO_URL}
              alt="The Satterwhite Law Firm, PLLC"
              className="h-20 w-auto object-contain mb-6"
              style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: '4px' }}
            />
            <p className="text-white/60 text-sm leading-relaxed mb-6" style={{ fontFamily: "'Lato', sans-serif" }}>
              Personalized estate planning, trust administration, and business legal services
              for families and individuals throughout Virginia and Maryland.
            </p>
            <div className="space-y-3">
              <a href="tel:7038557380" className="flex items-center gap-2 text-white/60 hover:text-[#90cdf4] transition-colors text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
                <Phone size={14} className="text-[#90cdf4]" />
                (703) 855-7380
              </a>
              <a href="mailto:kelly@thesatterwhitelawfirm.com" className="flex items-center gap-2 text-white/60 hover:text-[#90cdf4] transition-colors text-sm break-all" style={{ fontFamily: "'Lato', sans-serif" }}>
                <Mail size={14} className="text-[#90cdf4] flex-shrink-0" />
                kelly@thesatterwhitelawfirm.com
              </a>
              <a
                href="https://maps.google.com/?q=1605+Fort+Hunt+Court+Alexandria+Virginia+22307"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-white/60 hover:text-[#90cdf4] transition-colors text-sm"
                style={{ fontFamily: "'Lato', sans-serif" }}
              >
                <MapPin size={14} className="text-[#90cdf4] flex-shrink-0 mt-0.5" />
                1605 Fort Hunt Court<br />Alexandria, VA 22307
              </a>
            </div>
          </div>

          {/* Practice Areas */}
          <div>
            <h4
              className="text-white font-bold mb-6 pb-3 border-b border-white/10"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}
            >
              Practice Areas
            </h4>
            <ul className="space-y-2.5">
              {practiceLinks.map(({ label, href }) => (
                <li key={label}>
                  <button
                    onClick={() => scrollTo(href)}
                    className="text-white/60 hover:text-[#90cdf4] transition-colors text-sm text-left"
                    style={{ fontFamily: "'Lato', sans-serif" }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-white font-bold mb-6 pb-3 border-b border-white/10"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, href, isPage }) => (
                <li key={label}>
                  {isPage ? (
                    <a
                      href={href}
                      className="text-[#e2b96a] hover:text-[#f0d090] transition-colors text-sm text-left font-semibold"
                      style={{ fontFamily: "'Lato', sans-serif" }}
                    >
                      {label}
                    </a>
                  ) : (
                    <button
                      onClick={() => scrollTo(href)}
                      className="text-white/60 hover:text-[#90cdf4] transition-colors text-sm text-left"
                      style={{ fontFamily: "'Lato', sans-serif" }}
                    >
                      {label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Service Area */}
          <div>
            <h4
              className="text-white font-bold mb-6 pb-3 border-b border-white/10"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}
            >
              Service Area
            </h4>
            <p className="text-white/60 text-sm leading-relaxed mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>
              We serve clients throughout Northern Virginia and the Maryland suburbs, including:
            </p>
            <div className="flex flex-wrap gap-2">
              {["Alexandria", "Arlington", "Fairfax", "McLean", "Falls Church", "Reston", "Bethesda", "Rockville", "Silver Spring", "Chevy Chase", "Potomac", "Gaithersburg"].map((city) => (
                <span
                  key={city}
                  className="text-xs text-white/50 bg-white/5 px-2 py-1"
                  style={{ fontFamily: "'Lato', sans-serif" }}
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-6">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40" style={{ fontFamily: "'Lato', sans-serif" }}>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p>© {new Date().getFullYear()} The Satterwhite Law Firm, PLLC. All Rights Reserved.</p>
            <span className="hidden sm:inline text-white/20">|</span>
            <a
              href="/privacy-policy"
              className="text-white/50 hover:text-white/80 transition-colors underline underline-offset-2"
            >
              Privacy Policy
            </a>
            <span className="hidden sm:inline text-white/20">|</span>
            <a
              href="/intake"
              className="text-white/50 hover:text-white/80 transition-colors underline underline-offset-2"
            >
              Client Intake Form
            </a>
            <span className="hidden sm:inline text-white/20">|</span>
            <a
              href="/pay"
              className="text-[#e2b96a] hover:text-[#f0d090] transition-colors underline underline-offset-2 font-semibold"
            >
              Pay Invoice
            </a>
          </div>
          <p className="text-center sm:text-right max-w-xl leading-relaxed">
            <strong className="text-white/50">Attorney Advertising.</strong> The information on this website is for general informational purposes only and does not constitute legal advice. No attorney-client relationship is formed by use of this site. Results may vary. Licensed in Virginia and Maryland.
          </p>
        </div>
      </div>
    </footer>
  );
}
