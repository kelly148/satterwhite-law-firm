/*
 * AboutSection — The Satterwhite Law Firm, PLLC
 * Design: Asymmetric split — large image left, rich bio text right
 * Highlights military service, LSU, bar admissions, title company + 6,000+ real estate transactions
 */
import { useEffect, useRef, useState } from "react";
import { CheckCircle, Award, Scale, Music, Home, Briefcase } from "lucide-react";

const CONSULTATION_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/hero_main-LbNqbwr7wmQp2yqwZ8wV7f.webp";

const credentials = [
  { icon: Scale, text: "Licensed in Virginia (2016) & Maryland" },
  { icon: Award, text: "20 Years, United States Army Band — Principal Horn" },
  { icon: Music, text: "B.A. French Horn Performance, Louisiana State University (2003)" },
  { icon: Home, text: "6,000+ Real Estate Transactions — Commercial & Residential" },
  { icon: Briefcase, text: "Managed Three Highly Successful Title Company Offices" },
  { icon: CheckCircle, text: "Extensive Experience with Agents, Buyers, Sellers & Lenders" },
];

export default function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="py-24 bg-[#FAFAF8]" ref={ref}>
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image column */}
          <div
            className={`relative transition-all duration-700 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
          >
            <div className="relative">
              <img
                src={CONSULTATION_IMG}
                alt="Attorney consultation at The Satterwhite Law Firm"
                className="w-full object-cover shadow-2xl"
                style={{ aspectRatio: "4/5", objectPosition: "center top" }}
              />
              {/* Gold accent frame */}
              <div
                className="absolute -bottom-5 -right-5 w-full h-full border-2 border-[#C9A84C] -z-10"
                style={{ maxWidth: "calc(100% - 20px)", maxHeight: "calc(100% - 20px)" }}
              />
              {/* Stat badges */}
              <div className="absolute -bottom-6 left-8 bg-[#1D2B5F] text-white px-6 py-4 shadow-xl">
                <p className="text-3xl font-bold text-[#C9A84C]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>6,000+</p>
                <p className="text-xs tracking-widest uppercase text-white/70 mt-0.5">Real Estate Transactions</p>
              </div>
            </div>
          </div>

          {/* Text column */}
          <div
            className={`transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
          >
            <p className="section-eyebrow mb-4">About Kelly Satterwhite</p>
            <h2
              className="text-[#1D2B5F] mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 600 }}
            >
              A Unique Path to the Law — Built on Service, Precision, and Real-World Experience
            </h2>
            <div className="gold-divider mb-8" />

            <div className="space-y-5 text-[#3a3a3a] leading-relaxed" style={{ fontFamily: "'Lato', sans-serif", fontSize: "1rem" }}>
              <p>
                Kelly Satterwhite founded The Satterwhite Law Firm, PLLC after a remarkable career spanning
                the concert stage, the military, and the real estate industry. A native of Baytown, Texas,
                Kelly earned a degree in French Horn Performance from Louisiana State University in 2003
                before dedicating twenty years to the United States Army Band — eight of them as its
                Principal Horn.
              </p>
              <p>
                After being admitted to the Virginia Bar in 2016, Kelly brought to his legal practice
                something few attorneys possess: deep, hands-on expertise in real estate transactions.
                Having personally overseen <strong>more than 6,000 commercial and residential real estate
                closings</strong> while managing three highly successful title company offices, Kelly
                understands the full lifecycle of a real estate transaction from every angle — as counsel
                to buyers, sellers, agents, and lenders alike.
              </p>
              <p>
                That experience translates directly into superior legal service for clients navigating
                estate planning with real property, business succession involving real assets, 1031
                like-kind exchanges, and complex commercial transactions. When your estate or business
                involves real estate — and in the DMV, it almost always does — Kelly brings a depth of
                practical knowledge that sets this firm apart.
              </p>
            </div>

            {/* Credentials */}
            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              {credentials.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon size={16} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
                  <span className="text-[#3a3a3a] text-sm leading-snug" style={{ fontFamily: "'Lato', sans-serif" }}>{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={() => {
                  const el = document.querySelector("#contact");
                  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
                }}
                className="btn-navy text-xs"
              >
                Schedule a Consultation
              </button>
              <button
                onClick={() => {
                  const el = document.querySelector("#practice-areas");
                  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
                }}
                className="btn-outline-white text-xs"
                style={{ borderColor: "#1D2B5F", color: "#1D2B5F" }}
              >
                Our Practice Areas
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
