/*
 * TestimonialsSection — The Satterwhite Law Firm, PLLC
 * Design: Warm ivory background, large quote marks, rotating testimonials
 * Includes trust badges and bar admissions
 */
import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    text: "Kelly took the time to truly understand our family's situation and crafted an estate plan that gave us complete peace of mind. He explained every document in plain language and made the entire process feel manageable. We couldn't recommend him more highly.",
    author: "Robert & Susan M.",
    location: "Alexandria, Virginia",
    stars: 5,
  },
  {
    text: "I came to The Satterwhite Law Firm needing both a business succession plan and personal estate planning. Kelly handled both seamlessly and brought a level of thoroughness I hadn't experienced with other attorneys. His military background really shows in how organized and precise he is.",
    author: "James T.",
    location: "Bethesda, Maryland",
    stars: 5,
  },
  {
    text: "The 1031 exchange process can be intimidating, but Kelly walked us through every step as our qualified intermediary. He was responsive, knowledgeable, and made sure we met every deadline. Our investment portfolio is better positioned because of his guidance.",
    author: "Patricia & David L.",
    location: "McLean, Virginia",
    stars: 5,
  },
  {
    text: "After my husband passed, I was overwhelmed by the estate administration process. Kelly was compassionate, patient, and incredibly competent. He handled everything efficiently and kept me informed throughout. I am so grateful I found him.",
    author: "Margaret H.",
    location: "Fairfax, Virginia",
    stars: 5,
  },
  {
    text: "We needed to set up an LLC and draft comprehensive operating agreements for our new business venture. Kelly's advice was practical, thorough, and clearly informed by real business experience. We're starting on solid legal footing thanks to him.",
    author: "Michael & Andrea K.",
    location: "Rockville, Maryland",
    stars: 5,
  },
];

const trustBadges = [
  { label: "Virginia State Bar", sub: "Licensed Member" },
  { label: "Maryland State Bar", sub: "Licensed Member" },
  { label: "U.S. Army Veteran", sub: "20 Years of Service" },
  { label: "Qualified Intermediary", sub: "IRC §1031 Exchanges" },
  { label: "Free Consultations", sub: "No Obligation" },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
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

  useEffect(() => {
    const interval = setInterval(() => {
      advance(1);
    }, 6000);
    return () => clearInterval(interval);
  }, [current]);

  const advance = (dir: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((c) => (c + dir + testimonials.length) % testimonials.length);
      setAnimating(false);
    }, 300);
  };

  const t = testimonials[current];

  return (
    <section ref={ref} className="bg-[#F5F3EF] py-24">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-eyebrow mb-4">Client Stories</p>
          <h2
            className="text-[#2c5282]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 600 }}
          >
            What Our Clients Say
          </h2>
          <div className="gold-divider mx-auto mt-6" />
        </div>

        {/* Testimonial carousel */}
        <div className="max-w-4xl mx-auto">
          <div
            className={`testimonial-card transition-opacity duration-300 ${animating ? "opacity-0" : "opacity-100"}`}
          >
            <Quote size={40} className="text-[#2c5282]/20 mb-4" />

            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {Array.from({ length: t.stars }).map((_, i) => (
                <Star key={i} size={16} className="text-[#2c5282] fill-[#2c5282]" />
              ))}
            </div>

            <blockquote
              className="text-[#2a2a2a] mb-8 italic"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.1rem, 2vw, 1.4rem)", lineHeight: 1.7 }}
            >
              "{t.text}"
            </blockquote>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#2c5282]" style={{ fontFamily: "'Lato', sans-serif" }}>{t.author}</p>
                <p className="text-[#888] text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>{t.location}</p>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => advance(-1)}
                  className="w-10 h-10 border border-[#2c5282]/20 flex items-center justify-center hover:bg-[#2c5282] hover:text-white transition-colors text-[#2c5282]"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-[#888]" style={{ fontFamily: "'Lato', sans-serif" }}>
                  {current + 1} / {testimonials.length}
                </span>
                <button
                  onClick={() => advance(1)}
                  className="w-10 h-10 border border-[#2c5282]/20 flex items-center justify-center hover:bg-[#2c5282] hover:text-white transition-colors text-[#2c5282]"
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 transition-all duration-300 ${i === current ? "w-8 bg-[#2c5282]" : "w-2 bg-[#2c5282]/20"}`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div
          className={`mt-20 pt-12 border-t border-[#bee3f8] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {trustBadges.map(({ label, sub }) => (
            <div key={label} className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#2c5282] mx-auto mb-3 flex items-center justify-center">
                <Star size={18} className="text-[#2c5282] fill-[#2c5282]" />
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
