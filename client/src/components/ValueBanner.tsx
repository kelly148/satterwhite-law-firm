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
    <section className="bg-white border-y border-[#bee3f8] py-0">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#bee3f8]">
        {values.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-4 p-8 lg:p-10 hover:bg-[#ebf4ff] transition-colors">
            <div className="w-10 h-10 bg-[#2c5282] flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <h3
                className="text-[#2c5282] mb-1"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 600 }}
              >
                {title}
              </h3>
              <p className="text-[#4a6fa5] text-sm leading-relaxed" style={{ fontFamily: "'Lato', sans-serif" }}>
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
