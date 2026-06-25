/*
 * ContactSection — The Satterwhite Law Firm, PLLC
 * Design: Split — left navy with contact info + map, right ivory with form
 * Form now wired to tRPC contact.submit → notifyOwner → kelly@thesatterwhitelawfirm.com
 */
import { useState, useRef, useEffect } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

const VA_LANDSCAPE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/virginia_landscape-MVVVXWwaNfsUDa52hrMXCQ.webp";

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "(703) 855-7380",
    href: "tel:7038557380",
  },
  {
    icon: Mail,
    label: "Email",
    value: "kelly@thesatterwhitelawfirm.com",
    href: "mailto:kelly@thesatterwhitelawfirm.com",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "1605 Fort Hunt Court\nAlexandria, Virginia 22307",
    href: "https://maps.google.com/?q=1605+Fort+Hunt+Court+Alexandria+Virginia+22307",
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "Monday – Friday: 9:00 AM – 5:00 PM\nEvening & Weekend by Appointment",
    href: null,
  },
];

const practiceAreas = [
  "Estate Planning",
  "Wills & Trusts",
  "Powers of Attorney",
  "Advance Directives",
  "Business Succession",
  "Business Formation",
  "1031 Exchanges",
  "Asset Protection",
  "Mergers & Acquisitions",
  "Other",
];

export default function ContactSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    practiceArea: "",
    message: "",
    consent: false,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // tRPC mutation — sends submission to server which notifies the owner
  const submitMutation = trpc.contact.submit.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = `${form.firstName} ${form.lastName}`.trim();
    await submitMutation.mutateAsync({
      name,
      email: form.email,
      phone: form.phone || undefined,
      service: form.practiceArea || undefined,
      message: form.message,
      preferredContact: "either",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const isSubmitted = submitMutation.isSuccess;
  const isLoading = submitMutation.isPending;
  const isError = submitMutation.isError;

  return (
    <section id="contact" ref={ref} className="bg-white">
      {/* Virginia landscape banner */}
      <div
        className="relative h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${VA_LANDSCAPE})` }}
      >
        <div className="absolute inset-0 bg-[#2c5282]/70" />
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div>
            <p className="section-eyebrow mb-2">Get in Touch</p>
            <h2
              className="text-white"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 600 }}
            >
              Schedule Your Free Consultation
            </h2>
          </div>
        </div>
      </div>

      {/* Main contact grid */}
      <div className="grid lg:grid-cols-2">
        {/* Left: Navy contact info */}
        <div className="bg-[#2c5282] p-12 lg:p-16">
          <h3
            className="text-white mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 600 }}
          >
            Contact Information
          </h3>
          <div className="gold-divider mb-8" />

          <div className="space-y-8">
            {contactInfo.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={18} className="text-[#90cdf4]" />
                </div>
                <div>
                  <p className="text-white/50 text-xs tracking-widest uppercase mb-1" style={{ fontFamily: "'Lato', sans-serif" }}>
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-white hover:text-[#90cdf4] transition-colors whitespace-pre-line"
                      style={{ fontFamily: "'Lato', sans-serif", fontSize: "0.95rem" }}
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-white whitespace-pre-line" style={{ fontFamily: "'Lato', sans-serif", fontSize: "0.95rem" }}>
                      {value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Map embed */}
          <div className="mt-10">
            <div className="bg-white/5 border border-white/10 overflow-hidden" style={{ height: "220px" }}>
              <iframe
                title="The Satterwhite Law Firm Location"
                src="https://maps.google.com/maps?q=1605%20Fort%20Hunt%20Court%2C%20Alexandria%2C%20VA%2022307&z=15&output=embed"
                width="100%"
                height="220"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href="https://maps.google.com/?q=1605+Fort+Hunt+Court+Alexandria+Virginia+22307"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-[#90cdf4] text-xs tracking-widest uppercase mt-3 hover:text-white transition-colors"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Get Directions →
            </a>
          </div>

          {/* Serving area note */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-white/50 text-xs tracking-widest uppercase mb-2" style={{ fontFamily: "'Lato', sans-serif" }}>
              Serving
            </p>
            <p className="text-white/75 text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
              Alexandria, Arlington, Fairfax, McLean, Bethesda, Rockville, and throughout
              Northern Virginia and the Maryland suburbs.
            </p>
          </div>
        </div>

        {/* Right: Contact form */}
        <div
          className={`bg-[#ebf4ff] p-12 lg:p-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          {isSubmitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <CheckCircle size={56} className="text-[#2c5282] mb-6" />
              <h3
                className="text-[#2c5282] mb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 600 }}
              >
                Thank You
              </h3>
              <p className="text-[#555] max-w-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
                Your message has been received. Kelly Satterwhite will be in touch within one
                business day to schedule your complimentary consultation.
              </p>
            </div>
          ) : (
            <>
              <h3
                className="text-[#2c5282] mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 600 }}
              >
                Request a Free Consultation
              </h3>
              <p className="text-[#888] text-sm mb-8" style={{ fontFamily: "'Lato', sans-serif" }}>
                Complete the form below and we will respond within one business day.
              </p>

              {/* Error state */}
              {isError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded p-4 mb-6">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
                    There was an error sending your message. Please try again or call us directly at{" "}
                    <a href="tel:7038557380" className="font-bold underline">(703) 855-7380</a>.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-[#2c5282] mb-2" style={{ fontFamily: "'Lato', sans-serif" }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full border border-[#ddd] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#2c5282] transition-colors"
                      style={{ fontFamily: "'Lato', sans-serif" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-[#2c5282] mb-2" style={{ fontFamily: "'Lato', sans-serif" }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full border border-[#ddd] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#2c5282] transition-colors"
                      style={{ fontFamily: "'Lato', sans-serif" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-[#2c5282] mb-2" style={{ fontFamily: "'Lato', sans-serif" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-[#ddd] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#2c5282] transition-colors"
                    style={{ fontFamily: "'Lato', sans-serif" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-[#2c5282] mb-2" style={{ fontFamily: "'Lato', sans-serif" }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border border-[#ddd] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#2c5282] transition-colors"
                    style={{ fontFamily: "'Lato', sans-serif" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-[#2c5282] mb-2" style={{ fontFamily: "'Lato', sans-serif" }}>
                    Area of Interest
                  </label>
                  <select
                    name="practiceArea"
                    value={form.practiceArea}
                    onChange={handleChange}
                    className="w-full border border-[#ddd] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#2c5282] transition-colors appearance-none"
                    style={{ fontFamily: "'Lato', sans-serif" }}
                  >
                    <option value="">Select a practice area</option>
                    {practiceAreas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-[#2c5282] mb-2" style={{ fontFamily: "'Lato', sans-serif" }}>
                    How Can We Help You? *
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    minLength={10}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Briefly describe your legal needs..."
                    className="w-full border border-[#ddd] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#2c5282] transition-colors resize-none"
                    style={{ fontFamily: "'Lato', sans-serif" }}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="consent"
                    id="consent"
                    checked={form.consent}
                    onChange={handleChange}
                    required
                    className="mt-1 flex-shrink-0"
                  />
                  <label htmlFor="consent" className="text-xs text-[#888] leading-relaxed" style={{ fontFamily: "'Lato', sans-serif" }}>
                    I understand that submitting this form does not create an attorney-client
                    relationship. No confidential information should be shared until a formal
                    engagement agreement is signed.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-navy w-full justify-center text-sm py-4 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send size={15} />
                    </>
                  )}
                </button>

                {/* Pay Invoice CTA */}
                <div style={{ marginTop: 12, textAlign: "center" }}>
                  <span style={{ fontSize: 13, color: "#a0aec0" }}>Already have an invoice?{" "}</span>
                  <a
                    href="/pay"
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#b8913f",
                      textDecoration: "underline",
                    }}
                  >
                    Pay Online →
                  </a>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
