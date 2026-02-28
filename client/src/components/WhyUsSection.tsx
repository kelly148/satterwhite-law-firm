/*
 * WhyUsSection — The Satterwhite Law Firm, PLLC
 * Design: Split — left dark navy with large stats, right ivory with differentiators
 * Then a numbered process section below
 */
import { useEffect, useRef, useState } from "react";
import { UserCheck, MapPin, Clock, Star, Phone, FileCheck } from "lucide-react";

const FAMILY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/family_legacy-RzEnsDEYqHGiQSgpGwbNEG.webp";

const differentiators = [
  {
    icon: UserCheck,
    title: "Boutique, Personalized Service",
    desc: "You work directly with Kelly Satterwhite — not a paralegal or associate. Every client receives undivided attention and a plan tailored specifically to their family and financial situation.",
  },
  {
    icon: MapPin,
    title: "Deeply Rooted in the DMV",
    desc: "Based in Alexandria, Virginia, we understand the unique estate planning considerations of the Virginia and Maryland markets — from state estate taxes to real property law and local probate procedures.",
  },
  {
    icon: Star,
    title: "Rare Cross-Disciplinary Experience",
    desc: "Two decades of military discipline, 6,000+ real estate transactions across commercial and residential closings, and nearly a decade of legal practice combine to give clients a perspective no other attorney in the DMV can match.",
  },
  {
    icon: Clock,
    title: "Responsive & Accessible",
    desc: "We respond promptly to every inquiry and keep you informed throughout the process. Estate planning shouldn't feel like a bureaucratic ordeal — it should feel like a conversation with a trusted advisor.",
  },
  {
    icon: FileCheck,
    title: "Comprehensive Under One Roof",
    desc: "From your will and trust to your business succession plan and 1031 exchange, we handle the full spectrum of your legal needs — eliminating the need to coordinate between multiple attorneys.",
  },
  {
    icon: Phone,
    title: "Free Initial Consultation",
    desc: "We offer a complimentary initial consultation so you can understand your options, ask questions, and determine whether our firm is the right fit — with no obligation and no pressure.",
  },
];

const processSteps = [
  {
    num: "01",
    title: "Free Initial Consultation",
    desc: "We begin with a no-obligation conversation to understand your goals, your family situation, and your assets. This allows us to identify the right planning strategies for you.",
  },
  {
    num: "02",
    title: "Customized Planning Strategy",
    desc: "We develop a comprehensive legal strategy tailored to your specific needs — whether that's a simple will, a complex trust structure, a business succession plan, or all of the above.",
  },
  {
    num: "03",
    title: "Document Drafting & Review",
    desc: "We draft all necessary legal documents with precision and clarity, then walk you through every provision so you understand exactly what you're signing and why.",
  },
  {
    num: "04",
    title: "Execution & Implementation",
    desc: "We guide you through the signing process, ensure all documents are properly witnessed and notarized, and help you implement your plan — including asset retitling and beneficiary updates.",
  },
  {
    num: "05",
    title: "Ongoing Support",
    desc: "Life changes — and your estate plan should too. We remain available for updates, questions, and periodic reviews to ensure your plan continues to reflect your wishes.",
  },
];

export default function WhyUsSection() {
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
    <section id="why-us" ref={ref}>
      {/* Why Choose Us — split layout */}
      <div className="grid lg:grid-cols-2">
        {/* Left: Navy with image overlay */}
        <div className="relative min-h-[500px] overflow-hidden">
          <img
            src={FAMILY_IMG}
            alt="Family legacy planning with The Satterwhite Law Firm"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1D2B5F]/80" />
          <div className="relative z-10 p-12 lg:p-16 flex flex-col justify-center h-full">
            <p className="section-eyebrow mb-4">Why Choose Us</p>
            <h2
              className="text-white mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 600 }}
            >
              A Firm Built on Service, Precision & Personal Commitment
            </h2>
            <div className="gold-divider mb-8" />
            <p className="text-white/75 leading-relaxed" style={{ fontFamily: "'Lato', sans-serif" }}>
              The Satterwhite Law Firm was founded on the belief that every person — regardless of the
              size of their estate — deserves thoughtful, expert legal counsel to protect their family
              and preserve their legacy. We bring the same dedication to each client that defined
              twenty years of military service.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mt-10 pt-10 border-t border-white/20">
              {[
                { val: "6,000+", label: "Real Estate Transactions" },
                { val: "9+", label: "Years in Practice" },
                { val: "VA & MD", label: "Licensed States" },
                { val: "20", label: "Years Military Service" },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <p className="text-[#C9A84C] font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem" }}>{val}</p>
                  <p className="text-white/60 text-xs tracking-wide mt-1" style={{ fontFamily: "'Lato', sans-serif" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Differentiators grid */}
        <div className="bg-[#FAFAF8] p-12 lg:p-16">
          <div className="grid sm:grid-cols-2 gap-8">
            {differentiators.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start gap-3 mb-2">
                  <Icon size={18} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
                  <h3
                    className="text-[#1D2B5F]"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontWeight: 600 }}
                  >
                    {title}
                  </h3>
                </div>
                <p className="text-[#555] text-sm leading-relaxed pl-7" style={{ fontFamily: "'Lato', sans-serif" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Process */}
      <div className="bg-white py-24">
        <div className="container">
          <div className="text-center mb-16">
            <p className="section-eyebrow mb-4">How We Work</p>
            <h2
              className="text-[#1D2B5F]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 600 }}
            >
              Our Process
            </h2>
            <div className="gold-divider mx-auto mt-6" />
          </div>

          <div className="grid md:grid-cols-5 gap-0 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-px bg-[#e8e4dc]" />

            {processSteps.map((step, i) => (
              <div
                key={step.num}
                className={`relative text-center px-4 transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Number circle */}
                <div className="w-20 h-20 rounded-full bg-[#1D2B5F] flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg">
                  <span
                    className="text-[#C9A84C] font-bold"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem" }}
                  >
                    {step.num}
                  </span>
                </div>
                <h3
                  className="text-[#1D2B5F] mb-3"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 600 }}
                >
                  {step.title}
                </h3>
                <p className="text-[#666] text-sm leading-relaxed" style={{ fontFamily: "'Lato', sans-serif" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
