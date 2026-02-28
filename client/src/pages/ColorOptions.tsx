/*
 * ColorOptions — The Satterwhite Law Firm, PLLC
 * Shows 5 distinct blue-toned color scheme options for the hero/landing section
 * Each scheme is a full mini hero with nav, headline, CTA, and value strip
 */

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg";
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/hero_dark_overlay-NGx9p89C3Sti9qRJbZpJj9.webp";

const schemes = [
  {
    id: 1,
    name: "Current: Navy & Champagne Gold",
    tagline: "Classic authority — the existing scheme",
    nav: "#1D2B5F",
    navText: "#ffffff",
    overlay: "rgba(13,24,51,0.82)",
    headlineColor: "#ffffff",
    accentColor: "#C9A84C",
    accentText: "#1D2B5F",
    ctaPrimary: "#C9A84C",
    ctaPrimaryText: "#1D2B5F",
    ctaSecondary: "transparent",
    ctaSecondaryText: "#ffffff",
    ctaSecondaryBorder: "#ffffff",
    valueBg: "#ffffff",
    valueBorder: "#e8e4dc",
    valueIconBg: "#1D2B5F",
    valueIconColor: "#C9A84C",
    valueTitleColor: "#1D2B5F",
    valueDescColor: "#666666",
    eyebrowColor: "#C9A84C",
    subColor: "rgba(255,255,255,0.8)",
    trustColor: "rgba(255,255,255,0.6)",
    trustDot: "#C9A84C",
  },
  {
    id: 2,
    name: "Option 2: Royal Blue & Silver",
    tagline: "Crisp, modern prestige — cool and commanding",
    nav: "#1a3a6b",
    navText: "#ffffff",
    overlay: "rgba(10,28,70,0.85)",
    headlineColor: "#ffffff",
    accentColor: "#A8C0E8",
    accentText: "#1a3a6b",
    ctaPrimary: "#A8C0E8",
    ctaPrimaryText: "#1a3a6b",
    ctaSecondary: "transparent",
    ctaSecondaryText: "#ffffff",
    ctaSecondaryBorder: "rgba(255,255,255,0.6)",
    valueBg: "#f4f7fc",
    valueBorder: "#d0ddf0",
    valueIconBg: "#1a3a6b",
    valueIconColor: "#A8C0E8",
    valueTitleColor: "#1a3a6b",
    valueDescColor: "#4a5568",
    eyebrowColor: "#A8C0E8",
    subColor: "rgba(255,255,255,0.75)",
    trustColor: "rgba(255,255,255,0.55)",
    trustDot: "#A8C0E8",
  },
  {
    id: 3,
    name: "Option 3: Midnight Blue & Copper",
    tagline: "Warm sophistication — deep and distinguished",
    nav: "#0f1f3d",
    navText: "#ffffff",
    overlay: "rgba(8,16,36,0.88)",
    headlineColor: "#ffffff",
    accentColor: "#B87333",
    accentText: "#ffffff",
    ctaPrimary: "#B87333",
    ctaPrimaryText: "#ffffff",
    ctaSecondary: "transparent",
    ctaSecondaryText: "#ffffff",
    ctaSecondaryBorder: "rgba(255,255,255,0.5)",
    valueBg: "#faf8f5",
    valueBorder: "#e5ddd4",
    valueIconBg: "#0f1f3d",
    valueIconColor: "#B87333",
    valueTitleColor: "#0f1f3d",
    valueDescColor: "#5a4a3a",
    eyebrowColor: "#B87333",
    subColor: "rgba(255,255,255,0.72)",
    trustColor: "rgba(255,255,255,0.5)",
    trustDot: "#B87333",
  },
  {
    id: 4,
    name: "Option 4: Steel Blue & White",
    tagline: "Clean, open, approachable — modern law firm",
    nav: "#2c5282",
    navText: "#ffffff",
    overlay: "rgba(20,45,85,0.80)",
    headlineColor: "#ffffff",
    accentColor: "#ffffff",
    accentText: "#2c5282",
    ctaPrimary: "#ffffff",
    ctaPrimaryText: "#2c5282",
    ctaSecondary: "transparent",
    ctaSecondaryText: "#ffffff",
    ctaSecondaryBorder: "rgba(255,255,255,0.7)",
    valueBg: "#ebf4ff",
    valueBorder: "#bee3f8",
    valueIconBg: "#2c5282",
    valueIconColor: "#ffffff",
    valueTitleColor: "#2c5282",
    valueDescColor: "#4a6fa5",
    eyebrowColor: "#90cdf4",
    subColor: "rgba(255,255,255,0.78)",
    trustColor: "rgba(255,255,255,0.55)",
    trustDot: "#90cdf4",
  },
  {
    id: 5,
    name: "Option 5: Deep Navy & Emerald",
    tagline: "Distinctive and memorable — bold contrast",
    nav: "#1D2B5F",
    navText: "#ffffff",
    overlay: "rgba(13,24,51,0.84)",
    headlineColor: "#ffffff",
    accentColor: "#2D9B6F",
    accentText: "#ffffff",
    ctaPrimary: "#2D9B6F",
    ctaPrimaryText: "#ffffff",
    ctaSecondary: "transparent",
    ctaSecondaryText: "#ffffff",
    ctaSecondaryBorder: "rgba(255,255,255,0.55)",
    valueBg: "#f0faf5",
    valueBorder: "#b2dfcc",
    valueIconBg: "#1D2B5F",
    valueIconColor: "#2D9B6F",
    valueTitleColor: "#1D2B5F",
    valueDescColor: "#2d5a45",
    eyebrowColor: "#2D9B6F",
    subColor: "rgba(255,255,255,0.78)",
    trustColor: "rgba(255,255,255,0.55)",
    trustDot: "#2D9B6F",
  },
];

function SchemePreview({ s }: { s: typeof schemes[0] }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200" style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Scheme label */}
      <div className="bg-gray-900 text-white px-5 py-3 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400 mr-3">
            {s.id === 1 ? "✓ Current" : `Option ${s.id}`}
          </span>
          <span className="text-white font-semibold text-sm">{s.name.replace(/^Option \d+: /, "").replace(/^Current: /, "")}</span>
        </div>
        <span className="text-xs text-gray-400 italic">{s.tagline}</span>
      </div>

      {/* Mini Nav */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ background: s.nav }}
      >
        <img src={LOGO_URL} alt="Logo" style={{ height: 36, background: "rgba(255,255,255,0.12)", padding: "3px 6px", borderRadius: 3 }} />
        <div className="flex items-center gap-5">
          {["Home", "Practice Areas", "About", "Contact"].map(l => (
            <span key={l} className="text-xs font-medium" style={{ color: s.navText, opacity: 0.85 }}>{l}</span>
          ))}
        </div>
        <div
          className="text-xs font-bold px-4 py-2 tracking-widest uppercase"
          style={{ background: s.accentColor, color: s.accentText }}
        >
          Free Consultation
        </div>
      </div>

      {/* Mini Hero */}
      <div
        className="relative flex flex-col items-center justify-center text-center py-14 px-8"
        style={{ minHeight: 340 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0" style={{ background: s.overlay }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10" style={{ background: s.eyebrowColor }} />
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: s.eyebrowColor }}>
              Alexandria, Virginia · Serving VA & MD
            </p>
            <div className="h-px w-10" style={{ background: s.eyebrowColor }} />
          </div>

          {/* Headline */}
          <h1
            className="mb-4 leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 600,
              color: s.headlineColor,
              textShadow: "0 2px 16px rgba(0,0,0,0.3)",
            }}
          >
            Protecting Your Legacy.
            <br />
            <span style={{ color: s.accentColor, fontStyle: "italic" }}>Securing Your Family's Future.</span>
          </h1>

          {/* Sub */}
          <p className="mb-8 text-sm leading-relaxed" style={{ color: s.subColor }}>
            The Satterwhite Law Firm, PLLC provides personalized estate planning, trust
            administration, and business legal services throughout Virginia and Maryland.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div
              className="px-7 py-3 text-xs font-bold tracking-widest uppercase cursor-pointer"
              style={{ background: s.ctaPrimary, color: s.ctaPrimaryText }}
            >
              Schedule a Free Consultation →
            </div>
            <div
              className="px-7 py-3 text-xs font-bold tracking-widest uppercase cursor-pointer"
              style={{
                background: s.ctaSecondary,
                color: s.ctaSecondaryText,
                border: `1.5px solid ${s.ctaSecondaryBorder}`,
              }}
            >
              Explore Our Services
            </div>
          </div>

          {/* Trust bar */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs tracking-widest uppercase" style={{ color: s.trustColor }}>
            {["Licensed in VA & MD", "20 Years Army Service", "Boutique Personal Service", "Free Consultation"].map(item => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full" style={{ background: s.trustDot }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mini Value Banner */}
      <div
        className="grid grid-cols-4 divide-x"
        style={{ background: s.valueBg, borderTop: `1px solid ${s.valueBorder}`, borderBottom: `1px solid ${s.valueBorder}` }}
      >
        {[
          { title: "Comprehensive Protection", desc: "Full-spectrum estate planning" },
          { title: "Personalized Counsel", desc: "Direct access to Kelly Satterwhite" },
          { title: "Virginia & Maryland", desc: "Licensed in both states" },
          { title: "Free Consultation", desc: "No obligation, no pressure" },
        ].map(({ title, desc }) => (
          <div key={title} className="flex items-start gap-3 p-4" style={{ borderColor: s.valueBorder }}>
            <div
              className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: s.valueIconBg }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: s.valueIconColor }} />
            </div>
            <div>
              <p className="text-xs font-bold mb-0.5" style={{ fontFamily: "'Cormorant Garamond', serif", color: s.valueTitleColor, fontSize: "0.85rem" }}>
                {title}
              </p>
              <p className="text-xs" style={{ color: s.valueDescColor }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Color swatches */}
      <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-t border-gray-200">
        <span className="text-xs text-gray-500 font-medium mr-1">Palette:</span>
        {[s.nav, s.accentColor, s.valueBg, s.valueIconColor].map((color, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full border border-gray-300 shadow-sm" style={{ background: color }} />
            <span className="text-xs text-gray-400 font-mono">{color}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ColorOptions() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Page header */}
        <div className="text-center mb-12">
          <h1
            className="text-gray-900 mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 600 }}
          >
            Color Scheme Options
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto" style={{ fontFamily: "'Lato', sans-serif" }}>
            Five blue-toned palettes for The Satterwhite Law Firm, PLLC. Each preview shows the
            navigation, hero section, and value banner. Tell Kelly which number you prefer and
            the full site will be updated immediately.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-4 py-2 rounded-full" style={{ fontFamily: "'Lato', sans-serif" }}>
            <span className="font-bold">✓ Option 1</span> is the current live scheme
          </div>
        </div>

        {/* Scheme previews */}
        <div className="space-y-10">
          {schemes.map(s => (
            <SchemePreview key={s.id} s={s} />
          ))}
        </div>

        <div className="text-center mt-12 text-gray-400 text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
          Just reply with your preferred option number (1–5) and the entire website will be updated.
        </div>
      </div>
    </div>
  );
}
