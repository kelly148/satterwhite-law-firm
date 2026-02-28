/*
 * ValueBanner — The Satterwhite Law Firm, PLLC
 * Design: Warm ivory strip with 4 key value propositions + gold icons
 * Positioned between Hero and About sections
 */
import { Shield, Users, MapPin, Phone } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Comprehensive Protection",
    desc: "Full-spectrum estate planning from simple wills to complex trust structures",
  },
  {
    icon: Users,
    title: "Personalized Counsel",
    desc: "You work directly with Kelly Satterwhite — every client, every time",
  },
  {
    icon: MapPin,
    title: "Virginia & Maryland",
    desc: "Licensed and deeply experienced in both states' laws and probate procedures",
  },
  {
    icon: Phone,
    title: "Free Consultation",
    desc: "Begin with a complimentary, no-obligation conversation about your needs",
  },
];

export default function ValueBanner() {
  return (
    <section className="bg-white border-y border-[#e8e4dc] py-0">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#e8e4dc]">
        {values.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-4 p-8 lg:p-10 hover:bg-[#FAFAF8] transition-colors">
            <div className="w-10 h-10 bg-[#1D2B5F] flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-[#C9A84C]" />
            </div>
            <div>
              <h3
                className="text-[#1D2B5F] mb-1"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 600 }}
              >
                {title}
              </h3>
              <p className="text-[#666] text-sm leading-relaxed" style={{ fontFamily: "'Lato', sans-serif" }}>
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
