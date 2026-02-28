/*
 * PracticeAreasSection — The Satterwhite Law Firm, PLLC
 * Design: Navy background intro + white card grid with gold hover accents
 * SEO: Each card has keyword-rich descriptions for Virginia & Maryland
 */
import { useEffect, useRef, useState } from "react";
import {
  FileText, Shield, Users, Briefcase, Building2, ArrowLeftRight,
  Heart, Scale, ChevronRight
} from "lucide-react";

const practices = [
  {
    id: "estate-planning",
    icon: FileText,
    title: "Estate Planning",
    subtitle: "Virginia & Maryland",
    description:
      "Comprehensive estate plans tailored to your unique family situation and financial goals. We guide you through every decision — from simple to complex — ensuring your wishes are legally protected and your loved ones are provided for.",
    items: ["Last Wills & Testaments", "Revocable Living Trusts", "Irrevocable Trusts", "Beneficiary Designations", "Asset Titling Strategies"],
  },
  {
    id: "wills-trusts",
    icon: Scale,
    title: "Wills & Trusts",
    subtitle: "Personalized Planning",
    description:
      "Whether you need a straightforward will or a sophisticated trust structure, we craft documents that reflect your values and protect your estate from unnecessary taxes, probate delays, and family disputes.",
    items: ["Simple & Complex Wills", "Revocable Living Trusts", "Special Needs Trusts", "Charitable Trusts", "Trust Administration"],
  },
  {
    id: "powers-attorney",
    icon: Shield,
    title: "Powers of Attorney & Advance Directives",
    subtitle: "Protecting You Today",
    description:
      "Prepare for life's uncertainties with durable financial powers of attorney and advance medical directives. These critical documents ensure your financial and healthcare decisions are made by someone you trust if you become incapacitated.",
    items: ["Durable Power of Attorney", "Healthcare Power of Attorney", "Living Wills", "Advance Medical Directives", "HIPAA Authorizations"],
  },
  {
    id: "business-succession",
    icon: Users,
    title: "Business Succession Planning",
    subtitle: "Preserving What You Built",
    description:
      "Your business is often your most valuable asset. We develop succession strategies that ensure a smooth transition of ownership — whether to family members, key employees, or outside buyers — while minimizing tax exposure.",
    items: ["Buy-Sell Agreements", "Family Business Transfers", "Key Employee Succession", "Ownership Transition Plans", "Valuation Planning"],
  },
  {
    id: "business-formation",
    icon: Building2,
    title: "Business Entity Formation",
    subtitle: "Starting Strong",
    description:
      "Form the right business structure from the start. We advise on LLCs, corporations, partnerships, and other entities, ensuring your business is properly organized to limit liability and achieve your long-term goals.",
    items: ["LLC Formation", "Corporation Formation", "Partnership Agreements", "Operating Agreements", "General Business Transactions"],
  },
  {
    id: "1031-exchanges",
    icon: ArrowLeftRight,
    title: "1031 Exchanges",
    subtitle: "Qualified Intermediary Services",
    description:
      "As a qualified intermediary, The Satterwhite Law Firm facilitates tax-deferred like-kind exchanges under IRC §1031, allowing real estate investors to defer capital gains taxes and reinvest proceeds into replacement properties.",
    items: ["Qualified Intermediary Services", "Like-Kind Exchange Facilitation", "Delayed Exchanges", "Reverse Exchanges", "Real Property Transactions"],
  },
  {
    id: "asset-protection",
    icon: Briefcase,
    title: "Asset Protection",
    subtitle: "Shielding Your Wealth",
    description:
      "Protect your hard-earned assets from creditors, lawsuits, and unforeseen liabilities through strategic planning. We implement legal structures designed to safeguard your wealth for you and your heirs.",
    items: ["Irrevocable Trust Structures", "LLC Asset Protection", "Homestead Exemptions", "Creditor Protection Strategies", "Wealth Preservation Planning"],
  },
  {
    id: "mergers-acquisitions",
    icon: Heart,
    title: "Mergers, Acquisitions & Asset Sales",
    subtitle: "Business Transactions",
    description:
      "From asset purchase agreements to full business acquisitions, we provide experienced legal counsel for buyers and sellers navigating complex commercial transactions in Virginia and Maryland.",
    items: ["Asset Purchase Agreements", "Stock Purchase Agreements", "Business Acquisitions", "Due Diligence", "Closing Documentation"],
  },
];

export default function PracticeAreasSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="practice-areas" className="py-0" ref={ref}>
      {/* Navy intro band */}
      <div className="bg-[#1D2B5F] py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="section-eyebrow mb-4">What We Do</p>
          <h2
            className="text-white mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 4vw, 3.5rem)", fontWeight: 600 }}
          >
            Comprehensive Legal Services for Virginia & Maryland Families
          </h2>
          <div className="gold-divider mx-auto mb-6" />
          <p className="text-white/70 text-base leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: "'Lato', sans-serif" }}>
            From straightforward wills to complex trust structures, business transactions, and
            tax-deferred exchanges, The Satterwhite Law Firm provides the full spectrum of estate
            planning and business legal services — all under one roof, with personalized attention
            at every step.
          </p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="bg-[#F5F3EF] py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {practices.map((practice, i) => {
              const Icon = practice.icon;
              const isExpanded = expanded === practice.id;
              return (
                <div
                  key={practice.id}
                  id={practice.id}
                  className={`practice-card cursor-pointer transition-all duration-500 ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                  onClick={() => setExpanded(isExpanded ? null : practice.id)}
                >
                  {/* Icon */}
                  <div className="w-12 h-12 bg-[#1D2B5F]/8 flex items-center justify-center mb-4 rounded-sm">
                    <Icon size={22} className="text-[#1D2B5F]" />
                  </div>

                  {/* Title */}
                  <p className="text-[#C9A84C] text-xs font-bold tracking-widest uppercase mb-1" style={{ fontFamily: "'Lato', sans-serif" }}>
                    {practice.subtitle}
                  </p>
                  <h3
                    className="text-[#1D2B5F] mb-3"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 600 }}
                  >
                    {practice.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#555] text-sm leading-relaxed mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>
                    {practice.description}
                  </p>

                  {/* Expandable items */}
                  {isExpanded && (
                    <ul className="space-y-1.5 mb-4 border-t border-[#e8e4dc] pt-4">
                      {practice.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-[#1D2B5F]" style={{ fontFamily: "'Lato', sans-serif" }}>
                          <ChevronRight size={13} className="text-[#C9A84C] flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    className="text-[#C9A84C] text-xs font-bold tracking-widest uppercase flex items-center gap-1 hover:gap-2 transition-all"
                    style={{ fontFamily: "'Lato', sans-serif" }}
                  >
                    {isExpanded ? "Show Less" : "Learn More"}
                    <ChevronRight size={13} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-14">
            <p className="text-[#555] mb-6 text-base" style={{ fontFamily: "'Lato', sans-serif" }}>
              Not sure which service is right for you? We offer a free initial consultation.
            </p>
            <button
              onClick={() => {
                const el = document.querySelector("#contact");
                if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
              }}
              className="btn-navy"
            >
              Schedule Your Free Consultation
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
