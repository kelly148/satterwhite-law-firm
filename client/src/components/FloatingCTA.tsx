/*
 * FloatingCTA — The Satterwhite Law Firm, PLLC
 * Design: Sticky bottom bar on mobile, floating side button on desktop
 * Appears after scrolling past hero section
 */
import { useState, useEffect } from "react";
import { Phone, Calendar } from "lucide-react";

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToContact = () => {
    const el = document.querySelector("#schedule") || document.querySelector("#contact");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <>
      {/* Mobile: bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#2c5282] border-t border-white/10 flex">
        <a
          href="tel:7038557380"
          className="flex-1 flex items-center justify-center gap-2 py-4 text-white text-sm font-bold tracking-wide border-r border-white/10 hover:bg-[#1a365d] transition-colors"
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          <Phone size={16} />
          Call Now
        </a>
        <button
          onClick={scrollToContact}
          className="flex-1 flex items-center justify-center gap-2 py-4 text-white text-sm font-bold tracking-wide bg-[#1a365d] hover:bg-[#14284a] transition-colors"
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          <Calendar size={16} />
          Free Consult
        </button>
      </div>

      {/* Desktop: floating side button */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-0">
        <a
          href="tel:7038557380"
          className="bg-[#2c5282] text-white px-3 py-4 flex flex-col items-center gap-2 hover:bg-[#1a365d] transition-colors group shadow-lg"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          title="Call (703) 855-7380"
        >
          <Phone size={14} className="rotate-90" />
          <span className="text-xs font-bold tracking-widest" style={{ fontFamily: "'Lato', sans-serif" }}>
            (703) 855-7380
          </span>
        </a>
        <button
          onClick={scrollToContact}
          className="bg-[#1a365d] text-white px-3 py-4 flex flex-col items-center gap-2 hover:bg-[#14284a] transition-colors shadow-lg"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          title="Free Consultation"
        >
          <Calendar size={14} className="rotate-90" />
          <span className="text-xs font-bold tracking-widest" style={{ fontFamily: "'Lato', sans-serif" }}>
            Free Consult
          </span>
        </button>
      </div>
    </>
  );
}
