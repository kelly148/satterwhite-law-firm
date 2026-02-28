/*
 * SchedulingSection — The Satterwhite Law Firm, PLLC
 * Design: Steel Blue & White — full-width Calendly inline embed
 * Calendly URL: https://calendly.com/kelly-thesatterwhitelawfirm/30min
 */
import { useEffect, useRef, useState } from "react";
import { Calendar, Clock, Shield, CheckCircle } from "lucide-react";

const CALENDLY_URL = "https://calendly.com/kelly-thesatterwhitelawfirm/30min";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, string>;
        utm?: Record<string, string>;
      }) => void;
    };
  }
}

const benefits = [
  { icon: Clock, text: "30-minute free consultation" },
  { icon: Shield, text: "Confidential & no obligation" },
  { icon: CheckCircle, text: "Available in Virginia & Maryland" },
  { icon: Calendar, text: "Flexible weekday & evening slots" },
];

export default function SchedulingSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // Intersection observer for section entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Load Calendly widget script
  useEffect(() => {
    // Check if already loaded
    if (window.Calendly) {
      setScriptReady(true);
      return;
    }
    const existing = document.getElementById("calendly-script");
    if (existing) {
      existing.addEventListener("load", () => setScriptReady(true));
      return;
    }
    const script = document.createElement("script");
    script.id = "calendly-script";
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.head.appendChild(script);

    // Also load Calendly CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    document.head.appendChild(link);
  }, []);

  // Initialize inline widget once script is ready and container is visible
  useEffect(() => {
    if (!scriptReady || !containerRef.current || !visible) return;
    if (loaded) return;

    const tryInit = () => {
      if (window.Calendly && containerRef.current) {
        window.Calendly.initInlineWidget({
          url: CALENDLY_URL,
          parentElement: containerRef.current,
        });
        setLoaded(true);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(tryInit, 300);
    return () => clearTimeout(timer);
  }, [scriptReady, visible, loaded]);

  return (
    <section id="schedule" ref={ref} className="py-0 bg-[#ebf4ff]">
      {/* Section header */}
      <div
        className={`bg-[#2c5282] py-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="container text-center">
          <p className="section-eyebrow mb-4" style={{ color: "#90cdf4" }}>Book Your Appointment</p>
          <h2
            className="text-white mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 600,
            }}
          >
            Schedule a Free Consultation
          </h2>
          <p
            className="text-white/75 max-w-2xl mx-auto mb-10"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "1rem", lineHeight: 1.8 }}
          >
            Select a time that works for you. Your 30-minute consultation is completely free,
            confidential, and carries no obligation. Kelly Satterwhite will personally speak with you
            about your estate planning, business, or transactional needs.
          </p>

          {/* Benefits row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {benefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white/80 text-sm justify-center">
                <Icon size={15} className="text-[#90cdf4] flex-shrink-0" />
                <span style={{ fontFamily: "'Lato', sans-serif" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendly inline embed */}
      <div
        className={`bg-white transition-all duration-700 delay-200 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        {/* Loading placeholder */}
        {!loaded && (
          <div className="flex flex-col items-center justify-center py-24 text-[#4a6fa5]">
            <div className="w-10 h-10 border-2 border-[#2c5282] border-t-transparent rounded-full animate-spin mb-4" />
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "0.9rem" }}>
              Loading scheduling calendar…
            </p>
          </div>
        )}

        {/* Calendly container */}
        <div
          ref={containerRef}
          style={{
            minWidth: "320px",
            height: loaded ? "700px" : "0px",
            overflow: "hidden",
            transition: "height 0.4s ease",
          }}
        />
      </div>

      {/* Bottom note */}
      <div className="bg-[#ebf4ff] border-t border-[#bee3f8] py-8 text-center">
        <p
          className="text-[#4a6fa5] text-sm mb-4"
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          Prefer to call?{" "}
          <a
            href="tel:7038557380"
            className="text-[#2c5282] font-bold hover:underline"
          >
            (703) 855-7380
          </a>
          {" "}· Or email{" "}
          <a
            href="mailto:kelly@thesatterwhitelawfirm.com"
            className="text-[#2c5282] font-bold hover:underline"
          >
            kelly@thesatterwhitelawfirm.com
          </a>
        </p>
        <div className="border-t border-[#bee3f8] pt-6 mt-2">
          <p className="text-[#2c5282] text-sm font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}>
            Already scheduled? Complete your Client Intake Form in advance.
          </p>
          <p className="text-[#4a6fa5] text-xs mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>
            Save time at your consultation by submitting your estate planning information beforehand.
          </p>
          <a
            href="/intake"
            className="inline-flex items-center gap-2 bg-[#2c5282] text-white text-xs font-bold tracking-widest uppercase py-3 px-8 hover:bg-[#1a365d] transition-colors"
            style={{ fontFamily: "'Lato', sans-serif", letterSpacing: "0.12em" }}
          >
            Complete Client Intake Form →
          </a>
        </div>
      </div>
    </section>
  );
}
