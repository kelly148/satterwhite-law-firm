/*
 * ResourcesSection — The Satterwhite Law Firm, PLLC
 * Design: Navy intro + FAQ accordion + educational resource cards + interactive checklist
 * SEO: Keyword-rich FAQ answers targeting Virginia & Maryland estate planning searches
 */
import { useState, useRef, useEffect } from "react";
import { ChevronDown, BookOpen, FileText, Scale, Home } from "lucide-react";
import EstatePlanningChecklist from "./EstatePlanningChecklist";

const DOCS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/documents_desk-JBfNVDj2HF4nqNoMa7RRXb.webp";

const faqs = [
  {
    q: "Do I need an estate plan if I don't have a large estate?",
    a: "Absolutely. Estate planning is not just for the wealthy. Even if your assets are modest, a proper estate plan ensures your property passes to the people you choose, names guardians for minor children, designates someone to manage your finances if you become incapacitated, and specifies your healthcare wishes. Without these documents, Virginia and Maryland law — not you — will decide what happens to your assets and who makes decisions on your behalf.",
  },
  {
    q: "What is the difference between a will and a revocable living trust?",
    a: "A will is a legal document that directs how your assets are distributed after death, but it must go through probate — a court-supervised process that can be time-consuming and costly. A revocable living trust holds your assets during your lifetime and transfers them to your beneficiaries at death without probate, offering greater privacy, speed, and flexibility. Many clients benefit from having both: a trust for major assets and a 'pour-over' will to capture anything not titled in the trust.",
  },
  {
    q: "What is a Power of Attorney and why do I need one?",
    a: "A durable power of attorney authorizes a trusted person (your 'agent') to manage your financial affairs if you become unable to do so yourself. Without one, your family may need to petition a court for guardianship — an expensive and emotionally difficult process. A healthcare power of attorney similarly designates someone to make medical decisions on your behalf. These documents are among the most important in any estate plan.",
  },
  {
    q: "How does a 1031 exchange work?",
    a: "Under Internal Revenue Code §1031, a real estate investor can defer capital gains taxes on the sale of investment property by reinvesting the proceeds into a 'like-kind' replacement property within specific time limits. The Satterwhite Law Firm acts as a Qualified Intermediary (QI), holding the sale proceeds and facilitating the exchange to ensure compliance with IRS requirements. Proper QI services are legally required for a valid 1031 exchange.",
  },
  {
    q: "Does Virginia have an estate tax?",
    a: "Virginia does not impose a state-level estate tax or inheritance tax. However, Maryland does have both an estate tax (on estates over $5 million) and an inheritance tax (on certain non-direct-descendant beneficiaries). For clients with assets in both states, or those who may relocate, this distinction is an important planning consideration. Federal estate tax applies to estates exceeding the federal exemption amount (currently over $13 million per individual, though this is scheduled to change in 2026).",
  },
  {
    q: "What is business succession planning and when should I start?",
    a: "Business succession planning is the process of preparing for the eventual transfer of your business — whether to family members, key employees, or an outside buyer. It addresses ownership transition, management continuity, tax minimization, and family equity. The best time to start is well before you need it: ideally 5–10 years before a planned transition. Early planning provides the most options and the greatest tax efficiency.",
  },
  {
    q: "How long does it take to create an estate plan?",
    a: "A straightforward estate plan — including a will, trust, powers of attorney, and advance directives — can typically be completed within 2–4 weeks of your initial consultation. More complex plans involving business interests, special needs provisions, or multi-state assets may take longer. We work efficiently while ensuring every document is precise and thoroughly reviewed with you before signing.",
  },
  {
    q: "How often should I update my estate plan?",
    a: "We recommend reviewing your estate plan every 3–5 years, or whenever a significant life event occurs: marriage, divorce, birth of a child or grandchild, death of a beneficiary or named fiduciary, a major change in assets, relocation to a new state, or significant changes in tax law. An outdated plan can be as problematic as no plan at all.",
  },
];

const resources = [
  {
    icon: BookOpen,
    title: "Estate Planning Checklist",
    desc: "A comprehensive guide to the documents every Virginia and Maryland family should have in place.",
    tag: "Guide",
  },
  {
    icon: FileText,
    title: "Understanding Trusts in Virginia",
    desc: "Learn how revocable and irrevocable trusts work under Virginia law and when each is appropriate.",
    tag: "Article",
  },
  {
    icon: Scale,
    title: "Virginia vs. Maryland Probate",
    desc: "A comparison of the probate processes in both states and strategies to avoid it entirely.",
    tag: "Article",
  },
  {
    icon: Home,
    title: "1031 Exchange Timeline & Rules",
    desc: "The critical deadlines, identification rules, and requirements for a valid like-kind exchange.",
    tag: "Guide",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#bee3f8]">
      <button
        className="w-full text-left py-5 flex items-start justify-between gap-4 group"
        onClick={() => setOpen(!open)}
      >
        <span
          className="text-[#2c5282] font-medium group-hover:text-[#90cdf4] transition-colors"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 600 }}
        >
          {q}
        </span>
        <ChevronDown
          size={18}
          className={`text-[#90cdf4] flex-shrink-0 mt-0.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pb-5 pr-8">
          <p className="text-[#555] leading-relaxed text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ResourcesSection() {
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
    <section id="resources" ref={ref}>
      {/* FAQ + Checklist Section */}
      <div className="bg-[#ebf4ff] py-24">
        <div className="container">
          <div className="text-center mb-16">
            <p className="section-eyebrow mb-4">Client Resources</p>
            <h2
              className="text-[#2c5282]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 600 }}
            >
              Frequently Asked Questions & Planning Tools
            </h2>
            <div className="gold-divider mx-auto mt-6" />
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Left: FAQ accordion — spans 2 columns */}
            <div
              className={`lg:col-span-2 transition-all duration-700 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
            >
              <p className="text-[#555] leading-relaxed mb-8" style={{ fontFamily: "'Lato', sans-serif" }}>
                Estate planning can feel overwhelming. We believe an informed client makes better
                decisions — and that our job is to make the complex simple. Below are answers to
                the questions we hear most often from Virginia and Maryland families.
              </p>
              <div>
                {faqs.map((faq) => (
                  <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>

              {/* Docs image below FAQ */}
              <div className="relative mt-10">
                <img
                  src={DOCS_IMG}
                  alt="Estate planning documents"
                  className="w-full object-cover shadow-xl"
                  style={{ aspectRatio: "16/7" }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2c5282]/90 to-transparent p-6">
                  <p
                    className="text-white italic"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem" }}
                  >
                    "The best time to plan your estate is today. The second best time is tomorrow."
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Interactive checklist */}
            <div
              className={`transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
            >
              <EstatePlanningChecklist />
            </div>
          </div>
        </div>
      </div>

      {/* Resource Cards */}
      <div className="bg-[#2c5282] py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="section-eyebrow mb-4">Educational Resources</p>
            <h2
              className="text-white"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 600 }}
            >
              Guides & Articles for Virginia & Maryland Families
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map(({ icon: Icon, title, desc, tag }, i) => (
              <div
                key={title}
                className={`bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
                onClick={() => {
                  const el = document.querySelector("#contact");
                  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon size={20} className="text-[#90cdf4]" />
                  <span className="text-xs text-[#90cdf4] font-bold tracking-widest uppercase" style={{ fontFamily: "'Lato', sans-serif" }}>
                    {tag}
                  </span>
                </div>
                <h3
                  className="text-white mb-2 group-hover:text-[#90cdf4] transition-colors"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 600 }}
                >
                  {title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: "'Lato', sans-serif" }}>
                  {desc}
                </p>
                <p className="text-[#90cdf4] text-xs font-bold tracking-widest uppercase mt-4" style={{ fontFamily: "'Lato', sans-serif" }}>
                  Request This Guide →
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
