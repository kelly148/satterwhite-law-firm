/*
 * TestimonialsSection — The Satterwhite Law Firm, PLLC
 * Credentials & trust band. Client testimonials removed pending verified,
 * client-consented reviews (VA RPC 7.1 / MD analog compliance).
 */
import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

const trustBadges = [
  { label: "Virginia State Bar", sub: "Licensed Member" },
  { label: "Maryland State Bar", sub: "Licensed Member" },
  { label: "U.S. Army Veteran", sub: "20 Years of Service" },
  { label: "1031 Exchanges", sub: "Like-Kind Exchange Guidance" },
  { label: "Free Consultations", sub: "No Obligation" },
];

export default function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[#F5F3EF] py-24">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-eyebrow mb-4">Credentials You Can Trust</p>
          <h2
            className="text-[#2c5282]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 600 }}
          >
            Experience, Licensure &amp; Commitment
          </h2>
          <div className="gold-divider mx-auto mt-6" />
          <p
            className="text-[#555] text-base leading-relaxed max-w-2xl mx-auto mt-8"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            Every engagement is handled personally by Kelly Satterwhite — an attorney licensed in
            Virginia and Maryland, bringing two decades of disciplined service and real-world
            business experience to clients throughout the DMV.
          </p>
        </div>

        {/* Trust badges */}
        <div
          className={`pt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {trustBadges.map(({ label, sub }) => (
            <div key={label} className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#2c5282] mx-auto mb-3 flex items-center justify-center">
                <Star size={18} className="text-white fill-white" />
              </div>
              <p className="text-[#2c5282] font-bold text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>{label}</p>
              <p className="text-[#888] text-xs mt-0.5" style={{ fontFamily: "'Lato', sans-serif" }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
