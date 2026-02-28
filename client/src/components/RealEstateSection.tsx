/*
 * RealEstateSection — The Satterwhite Law Firm, PLLC
 * Design: Dark navy background with gold accents, split layout
 * Highlights 6,000+ real estate transactions, commercial & residential expertise
 * Positioned after PracticeAreasSection
 */
import { useEffect, useRef, useState } from "react";
import { Home, Building2, Users, Scale, ArrowRight, CheckCircle } from "lucide-react";

const stats = [
  { number: "6,000+", label: "Real Estate Transactions Overseen" },
  { number: "Dual", label: "Commercial & Residential Expertise" },
  { number: "VA & MD", label: "Licensed in Both States" },
  { number: "360°", label: "Buyer, Seller, Agent & Lender Perspective" },
];

const services = [
  {
    icon: Home,
    title: "Residential Real Estate Transactions",
    items: [
      "Purchase and sale agreement review and negotiation",
      "Title examination and title insurance coordination",
      "Closing representation for buyers and sellers",
      "Deed preparation and recordation",
      "Homestead and property tax exemption guidance",
      "Post-closing dispute resolution",
    ],
  },
  {
    icon: Building2,
    title: "Commercial Real Estate Transactions",
    items: [
      "Commercial purchase, sale, and lease agreements",
      "Due diligence review and risk assessment",
      "Commercial closing representation",
      "Entity structuring for property ownership",
      "Commercial title and lien resolution",
      "Asset sale and acquisition documentation",
    ],
  },
  {
    icon: Scale,
    title: "1031 Like-Kind Exchanges",
    items: [
      "Qualified Intermediary (QI) services",
      "Exchange agreement preparation",
      "45-day identification period guidance",
      "180-day closing timeline management",
      "Reverse and improvement exchanges",
      "Multi-property exchange coordination",
    ],
  },
  {
    icon: Users,
    title: "Working with Real Estate Professionals",
    items: [
      "Legal counsel to agents and brokers",
      "Lender coordination and closing support",
      "Contract review for real estate professionals",
      "Commission dispute resolution",
      "Referral partner relationships",
      "Title and escrow issue resolution",
    ],
  },
];

const REAL_ESTATE_IMG = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80";

export default function RealEstateSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const scrollToContact = () => {
    const el = document.querySelector("#contact");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  return (
    <section id="real-estate" ref={ref}>
      {/* Hero banner */}
      <div className="relative bg-[#2c5282] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(${REAL_ESTATE_IMG})` }}
        />
        <div className="relative container py-20">
          <div className="max-w-3xl">
            <p className="section-eyebrow mb-4" style={{ color: "#90cdf4" }}>Real Estate Legal Services</p>
            <h2
              className="text-white mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 600, lineHeight: 1.2 }}
            >
              Over 6,000 Transactions.<br />
              <span style={{ color: "#90cdf4" }}>Unmatched Real Estate Expertise.</span>
            </h2>
            <div className="gold-divider mb-8" />
            <p className="text-white/75 leading-relaxed max-w-2xl" style={{ fontFamily: "'Lato', sans-serif", fontSize: "1.05rem" }}>
              Few attorneys in the DMV can match Kelly Satterwhite's depth of real estate experience.
              Having personally overseen more than 6,000 commercial and residential closings — and having
              managed three title company offices serving buyers, sellers, agents, and lenders — Kelly
              brings a practical, transactional perspective to every real estate legal matter that
              textbook knowledge simply cannot replicate.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {stats.map(({ number, label }, i) => (
              <div
                key={label}
                className={`border border-white/10 p-6 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 100}ms`, background: "rgba(255,255,255,0.05)" }}
              >
                <p
                  className="text-[#90cdf4] font-bold mb-1"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem" }}
                >
                  {number}
                </p>
                <p className="text-white/60 text-xs tracking-wide uppercase" style={{ fontFamily: "'Lato', sans-serif" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services tabs */}
      <div className="bg-[#ebf4ff] py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="section-eyebrow mb-3">What We Handle</p>
            <h3
              className="text-[#2c5282]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 600 }}
            >
              Comprehensive Real Estate Legal Services
            </h3>
          </div>

          {/* Tab buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {services.map(({ icon: Icon, title }, i) => (
              <button
                key={title}
                onClick={() => setActiveService(i)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold tracking-wide transition-all ${
                  activeService === i
                    ? "bg-[#2c5282] text-white"
                    : "bg-white border border-[#bee3f8] text-[#2c5282] hover:border-[#90cdf4]"
                }`}
                style={{ fontFamily: "'Lato', sans-serif" }}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{title.split(" ").slice(0, 3).join(" ")}</span>
                <span className="sm:hidden">{title.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* Active service panel */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              className={`transition-all duration-500 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
            >
              {(() => {
                const { icon: Icon, title, items } = services[activeService];
                return (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-[#2c5282] flex items-center justify-center flex-shrink-0">
                        <Icon size={22} className="text-[#90cdf4]" />
                      </div>
                      <h4
                        className="text-[#2c5282]"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 600 }}
                      >
                        {title}
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <CheckCircle size={16} className="text-[#90cdf4] mt-0.5 flex-shrink-0" />
                          <span className="text-[#555] text-sm leading-relaxed" style={{ fontFamily: "'Lato', sans-serif" }}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={scrollToContact}
                      className="btn-navy text-xs mt-8 flex items-center gap-2"
                    >
                      Discuss Your Real Estate Matter
                      <ArrowRight size={14} />
                    </button>
                  </>
                );
              })()}
            </div>

            {/* Right: differentiator callout */}
            <div className="bg-[#2c5282] p-10">
              <p
                className="text-[#90cdf4] font-bold mb-4 text-xs tracking-widest uppercase"
                style={{ fontFamily: "'Lato', sans-serif" }}
              >
                Why This Matters to You
              </p>
              <h4
                className="text-white mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, lineHeight: 1.3 }}
              >
                The Attorney Who Has Sat on Every Side of the Table
              </h4>
              <div className="gold-divider mb-6" />
              <p className="text-white/70 leading-relaxed mb-6" style={{ fontFamily: "'Lato', sans-serif", fontSize: "0.95rem" }}>
                Most real estate attorneys have handled transactions from one perspective. Kelly has
                worked directly with buyers, sellers, real estate agents, and mortgage lenders across
                thousands of closings — in both commercial and residential contexts.
              </p>
              <p className="text-white/70 leading-relaxed mb-6" style={{ fontFamily: "'Lato', sans-serif", fontSize: "0.95rem" }}>
                That 360-degree view means he anticipates problems before they arise, communicates
                fluently with every party at the table, and resolves issues efficiently — saving
                clients time, money, and stress.
              </p>
              <div className="border-t border-white/10 pt-6 mt-6">
                <p
                  className="text-white italic"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}
                >
                  "In the DMV, real estate and estate planning are inseparable. I help clients protect
                  both their property and their legacy — with the experience to back it up."
                </p>
                <p className="text-[#90cdf4] text-xs font-bold tracking-widest uppercase mt-3" style={{ fontFamily: "'Lato', sans-serif" }}>
                  — Kelly Satterwhite, Attorney at Law
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
