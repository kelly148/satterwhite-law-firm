/*
 * Home Page — The Satterwhite Law Firm, PLLC
 * Design: "Modern Counsel: Precision & Warmth"
 * Navy (#2c5282) + Gold (#90cdf4) + Cormorant Garamond + Lato
 * Full single-page layout with all sections assembled
 * SEO: Schema.org LegalService + LocalBusiness JSON-LD
 */
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ValueBanner from "@/components/ValueBanner";
import AboutSection from "@/components/AboutSection";
import PracticeAreasSection from "@/components/PracticeAreasSection";
import WhyUsSection from "@/components/WhyUsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ResourcesSection from "@/components/ResourcesSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";

// Schema.org JSON-LD for SEO
const schemaMarkup = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "The Satterwhite Law Firm, PLLC",
  "alternateName": "Satterwhite Law Firm",
  "url": "https://thesatterwhitelawfirm.com",
  "logo": "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg",
  "description": "The Satterwhite Law Firm, PLLC provides personalized estate planning, trust administration, wills, powers of attorney, business succession planning, business entity formation, and 1031 exchange qualified intermediary services in Virginia and Maryland.",
  "telephone": "+17038557380",
  "email": "kelly@thesatterwhitelawfirm.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "1605 Fort Hunt Court",
    "addressLocality": "Alexandria",
    "addressRegion": "VA",
    "postalCode": "22307",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 38.7498,
    "longitude": -77.0785
  },
  "areaServed": [
    { "@type": "State", "name": "Virginia" },
    { "@type": "State", "name": "Maryland" },
    { "@type": "City", "name": "Alexandria" },
    { "@type": "City", "name": "Arlington" },
    { "@type": "City", "name": "Fairfax" },
    { "@type": "City", "name": "McLean" },
    { "@type": "City", "name": "Bethesda" },
    { "@type": "City", "name": "Rockville" }
  ],
  "serviceType": [
    "Estate Planning",
    "Wills and Trusts",
    "Powers of Attorney",
    "Advance Directives",
    "Business Succession Planning",
    "Business Entity Formation",
    "1031 Exchange Qualified Intermediary",
    "Asset Protection",
    "Mergers and Acquisitions"
  ],
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  ],
  "priceRange": "$$",
  "founder": {
    "@type": "Attorney",
    "name": "Kelly Satterwhite",
    "jobTitle": "Attorney at Law",
    "alumniOf": "Louisiana State University",
    "memberOf": [
      { "@type": "Organization", "name": "Virginia State Bar" },
      { "@type": "Organization", "name": "Maryland State Bar" }
    ]
  }
};

export default function Home() {
  useEffect(() => {
    // Inject Schema.org JSON-LD
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaMarkup);
    document.head.appendChild(script);

    // Update meta tags for SEO
    document.title = "The Satterwhite Law Firm, PLLC | Estate Planning Attorney | Alexandria, VA";

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content",
        "The Satterwhite Law Firm, PLLC — Estate planning, wills, trusts, powers of attorney, business succession, and 1031 exchange services in Alexandria, Virginia and Maryland. Free initial consultation. Call (703) 855-7380."
      );
    }

    // Open Graph tags
    const ogTags = [
      { property: "og:title", content: "The Satterwhite Law Firm, PLLC | Estate Planning Attorney | Alexandria, VA" },
      { property: "og:description", content: "Personalized estate planning, trust administration, and business legal services for Virginia and Maryland families. Free initial consultation." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
    ];
    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Lato', sans-serif" }}>
      <Navigation />
      <main>
        <HeroSection />
        <ValueBanner />
        <AboutSection />
        <PracticeAreasSection />
        <WhyUsSection />
        <TestimonialsSection />
        <ResourcesSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  );
}
