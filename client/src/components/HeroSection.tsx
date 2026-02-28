/*
 * HeroSection — The Satterwhite Law Firm, PLLC
 * Design: Full-width dark hero with courthouse background, centered headline,
 * gold accent, dual CTAs, and animated entrance
 */
import { useEffect, useState } from "react";
import { ArrowRight, Phone } from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/hero_dark_overlay-NGx9p89C3Sti9qRJbZpJj9.webp";

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ paddingTop: "110px" }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#14284a]/85 via-[#2c5282]/80 to-[#14284a]/90" />

      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 container text-center">
        <div
          className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#90cdf4]" />
            <p className="section-eyebrow">Alexandria, Virginia · Serving VA & MD</p>
            <div className="h-px w-12 bg-[#90cdf4]" />
          </div>

          {/* Main headline */}
          <h1
            className="text-white mb-6 leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            }}
          >
            Protecting Your Legacy.
            <br />
            <span className="text-[#90cdf4] italic">Securing Your Family's Future.</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-white/80 mb-10 max-w-2xl mx-auto"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
              lineHeight: 1.8,
              fontWeight: 300,
            }}
          >
            The Satterwhite Law Firm, PLLC provides personalized estate planning, trust
            administration, and business legal services to families and individuals throughout
            Virginia and Maryland.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => scrollTo("#contact")}
              className="btn-gold text-sm px-8 py-4 shadow-lg shadow-[#90cdf4]/20"
            >
              Schedule a Free Consultation
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => scrollTo("#practice-areas")}
              className="btn-outline-white text-sm px-8 py-4"
            >
              Explore Our Services
            </button>
          </div>

          {/* Trust bar */}
          <div className="mt-14 flex flex-wrap justify-center gap-8 text-white/60 text-xs tracking-widest uppercase">
            {[
              "Licensed in Virginia & Maryland",
              "20 Years U.S. Army Service",
              "Boutique Personal Service",
              "Free Initial Consultation",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#90cdf4]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-xs tracking-widest uppercase">
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-[#90cdf4] animate-pulse" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
