/*
 * EstatePlanningChecklist — The Satterwhite Law Firm, PLLC
 * Design: Interactive checklist widget — navy + gold, animated progress bar
 * Users check off items they have; shows % complete + CTA to fill gaps
 */
import { useState } from "react";
import { CheckCircle, Circle, ChevronRight } from "lucide-react";

const checklistItems = [
  { id: "will", label: "Last Will & Testament", desc: "Directs distribution of your assets at death" },
  { id: "trust", label: "Revocable Living Trust", desc: "Avoids probate and provides flexible asset management" },
  { id: "poa-financial", label: "Durable Power of Attorney (Financial)", desc: "Authorizes someone to manage your finances if incapacitated" },
  { id: "poa-health", label: "Healthcare Power of Attorney", desc: "Designates a healthcare decision-maker" },
  { id: "living-will", label: "Living Will / Advance Directive", desc: "Specifies your end-of-life medical wishes" },
  { id: "beneficiaries", label: "Beneficiary Designations Updated", desc: "Ensures retirement accounts and life insurance align with your plan" },
  { id: "asset-titling", label: "Asset Titling Reviewed", desc: "Property titled correctly to work with your estate plan" },
  { id: "guardian", label: "Guardian Named for Minor Children", desc: "Designates who will care for your children" },
  { id: "digital", label: "Digital Asset Plan", desc: "Addresses online accounts, passwords, and digital property" },
  { id: "business", label: "Business Succession Plan", desc: "For business owners: plan for transition of ownership" },
];

export default function EstatePlanningChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pct = Math.round((checked.size / checklistItems.length) * 100);
  const missing = checklistItems.filter((item) => !checked.has(item.id));

  const scrollToContact = () => {
    const el = document.querySelector("#contact");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  return (
    <div className="bg-white border border-[#e8e4dc] shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-[#1D2B5F] p-6">
        <h3
          className="text-white mb-1"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 600 }}
        >
          Estate Plan Readiness Checklist
        </h3>
        <p className="text-white/60 text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
          Check the documents you already have in place
        </p>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/60 mb-2" style={{ fontFamily: "'Lato', sans-serif" }}>
            <span>{checked.size} of {checklistItems.length} complete</span>
            <span className="text-[#C9A84C] font-bold">{pct}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C9A84C] transition-all duration-500 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="divide-y divide-[#f0ede8]">
        {checklistItems.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`w-full text-left flex items-start gap-3 p-4 transition-colors ${
                isChecked ? "bg-[#f8f6f2]" : "hover:bg-[#fafaf8]"
              }`}
            >
              {isChecked ? (
                <CheckCircle size={20} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
              ) : (
                <Circle size={20} className="text-[#ccc] flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`text-sm font-bold ${isChecked ? "text-[#888] line-through" : "text-[#1D2B5F]"}`}
                  style={{ fontFamily: "'Lato', sans-serif" }}
                >
                  {item.label}
                </p>
                <p className="text-xs text-[#999] mt-0.5" style={{ fontFamily: "'Lato', sans-serif" }}>
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Result / CTA */}
      <div className="p-6 bg-[#FAFAF8] border-t border-[#e8e4dc]">
        {pct === 100 ? (
          <div className="text-center">
            <p className="text-[#1D2B5F] font-bold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem" }}>
              Excellent — your plan looks complete!
            </p>
            <p className="text-[#666] text-sm mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>
              We recommend a periodic review every 3–5 years to ensure your plan stays current.
            </p>
            <button onClick={scrollToContact} className="btn-navy text-xs w-full justify-center">
              Schedule a Review
            </button>
          </div>
        ) : missing.length > 0 ? (
          <div>
            <p className="text-[#1D2B5F] font-bold mb-2 text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
              {missing.length} item{missing.length > 1 ? "s" : ""} to address:
            </p>
            <ul className="space-y-1 mb-4">
              {missing.slice(0, 3).map((item) => (
                <li key={item.id} className="flex items-center gap-2 text-xs text-[#666]" style={{ fontFamily: "'Lato', sans-serif" }}>
                  <ChevronRight size={12} className="text-[#C9A84C]" />
                  {item.label}
                </li>
              ))}
              {missing.length > 3 && (
                <li className="text-xs text-[#999]" style={{ fontFamily: "'Lato', sans-serif" }}>
                  + {missing.length - 3} more
                </li>
              )}
            </ul>
            <button onClick={scrollToContact} className="btn-gold text-xs w-full justify-center">
              Fill the Gaps — Free Consultation
              <ChevronRight size={13} />
            </button>
          </div>
        ) : (
          <button onClick={scrollToContact} className="btn-navy text-xs w-full justify-center">
            Get Started — Free Consultation
            <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
