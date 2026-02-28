/*
 * Navigation — The Satterwhite Law Firm, PLLC
 * Design: Sticky nav, transparent-to-solid on scroll, navy + gold
 * Logo left, links center-right, phone + CTA right
 */
import { useState, useEffect } from "react";
import { Phone, Menu, X, ChevronDown } from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg";

const navLinks = [
  { label: "Home", href: "#home" },
  {
    label: "Practice Areas",
    href: "#practice-areas",
    children: [
      { label: "Estate Planning", href: "#estate-planning" },
      { label: "Wills & Trusts", href: "#wills-trusts" },
      { label: "Powers of Attorney", href: "#powers-attorney" },
      { label: "Business Succession", href: "#business-succession" },
      { label: "Business Formation", href: "#business-formation" },
      { label: "1031 Exchanges", href: "#1031-exchanges" },
    ],
  },
  { label: "About", href: "#about" },
  { label: "Why Choose Us", href: "#why-us" },
  { label: "Resources", href: "#resources" },
  { label: "Contact", href: "#contact" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    setOpenDropdown(null);
    const el = document.querySelector(href);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
          scrolled
            ? "bg-[#1D2B5F] shadow-lg shadow-navy/20"
            : "bg-[#1D2B5F]/95 backdrop-blur-sm"
        }`}
        style={{ fontFamily: "'Lato', sans-serif" }}
      >
        {/* Top bar */}
        <div className="bg-[#16224d] border-b border-white/10">
          <div className="container flex items-center justify-between py-1.5">
            <p className="text-white/60 text-xs tracking-wide">
              Serving Virginia & Maryland | Alexandria, VA
            </p>
            <a
              href="tel:7038557380"
              className="flex items-center gap-1.5 text-[#C9A84C] text-xs font-bold tracking-wide hover:text-white transition-colors"
            >
              <Phone size={11} />
              (703) 855-7380
            </a>
          </div>
        </div>

        {/* Main nav */}
        <div className="container flex items-center justify-between py-3">
          {/* Logo */}
          <button
            onClick={() => handleNavClick("#home")}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <img
              src={LOGO_URL}
              alt="The Satterwhite Law Firm, PLLC"
              className="h-14 w-auto object-contain rounded"
              style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 8px' }}
            />
          </button>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 text-white/85 hover:text-[#C9A84C] text-sm font-medium tracking-wide transition-colors">
                    {link.label}
                    <ChevronDown size={13} className={`transition-transform ${openDropdown === link.label ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === link.label && (
                    <div className="absolute top-full left-0 bg-white shadow-xl border-t-2 border-[#C9A84C] min-w-[220px] py-2 z-50">
                      {link.children.map((child) => (
                        <button
                          key={child.label}
                          onClick={() => handleNavClick(child.href)}
                          className="block w-full text-left px-5 py-2.5 text-sm text-[#1D2B5F] hover:bg-[#f5f3ef] hover:text-[#C9A84C] transition-colors font-medium"
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="px-3 py-2 text-white/85 hover:text-[#C9A84C] text-sm font-medium tracking-wide transition-colors"
                >
                  {link.label}
                </button>
              )
            )}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => handleNavClick("#contact")}
              className="btn-gold text-xs py-2.5 px-5"
            >
              Free Consultation
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#1D2B5F] pt-[110px] overflow-y-auto">
          <div className="container py-6 flex flex-col gap-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                <button
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left py-3 border-b border-white/10 text-white text-lg font-medium"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {link.label}
                </button>
                {link.children && (
                  <div className="pl-4">
                    {link.children.map((child) => (
                      <button
                        key={child.label}
                        onClick={() => handleNavClick(child.href)}
                        className="block w-full text-left py-2.5 border-b border-white/5 text-white/70 text-base"
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={() => handleNavClick("#contact")}
              className="btn-gold mt-6 justify-center"
            >
              Schedule a Free Consultation
            </button>
          </div>
        </div>
      )}
    </>
  );
}
