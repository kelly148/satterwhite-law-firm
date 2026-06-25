/*
 * Home Page — The Satterwhite Law Firm, PLLC
 * Design: "Modern Counsel: Precision & Warmth"
 * Navy (#2c5282) + Steel Blue + Cormorant Garamond + Lato
 * Full single-page layout with all sections assembled
 * SEO: Schema.org LegalService + LocalBusiness JSON-LD
 * Canonical: https://www.satterwhitelawfirmpllc.com/
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
import SchedulingSection from "@/components/SchedulingSection";

const CANONICAL_URL = "https://www.satterwhitelawfirmpllc.com";

// Schema.org JSON-LD — LegalService + Attorney + LocalBusiness
const schemaMarkup = [
  {
    "@context": "https://schema.org",
    "@type": ["LegalService", "LocalBusiness"],
    "@id": `${CANONICAL_URL}/#organization`,
    "name": "The Satterwhite Law Firm, PLLC",
    "alternateName": ["Satterwhite Law Firm", "Satterwhite Law PLLC"],
    "url": CANONICAL_URL,
    "logo": {
      "@type": "ImageObject",
      "url": "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg",
      "width": 600,
      "height": 400
    },
    "image": "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg",
    "description": "The Satterwhite Law Firm, PLLC provides personalized estate planning, trust administration, wills, revocable trusts, powers of attorney, advance directives, business succession planning, LLC formation, general business transactions, and 1031 exchange qualified intermediary services in Virginia and Maryland.",
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
    "hasMap": "https://maps.google.com/?q=1605+Fort+Hunt+Court+Alexandria+VA+22307",
    "areaServed": [
      { "@type": "State", "name": "Virginia" },
      { "@type": "State", "name": "Maryland" },
      { "@type": "City", "name": "Alexandria", "sameAs": "https://en.wikipedia.org/wiki/Alexandria,_Virginia" },
      { "@type": "City", "name": "Arlington" },
      { "@type": "City", "name": "Fairfax" },
      { "@type": "City", "name": "McLean" },
      { "@type": "City", "name": "Falls Church" },
      { "@type": "City", "name": "Reston" },
      { "@type": "City", "name": "Bethesda" },
      { "@type": "City", "name": "Rockville" },
      { "@type": "City", "name": "Silver Spring" },
      { "@type": "City", "name": "Chevy Chase" },
      { "@type": "City", "name": "Washington DC" }
    ],
    "serviceType": [
      "Estate Planning",
      "Wills and Trusts",
      "Revocable Living Trusts",
      "Irrevocable Trusts",
      "Trust Administration",
      "Powers of Attorney",
      "Advance Directives",
      "Healthcare Directives",
      "Business Succession Planning",
      "Business Entity Formation",
      "LLC Formation",
      "1031 Exchange Facilitation",
      "Asset Protection Planning",
      "Mergers and Acquisitions",
      "Asset Sales"
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
    "paymentAccepted": "Cash, Check, Credit Card",
    "currenciesAccepted": "USD",
    "sameAs": [
      "https://satterwhitelawfirmpllc.com"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "Attorney",
    "@id": `${CANONICAL_URL}/#attorney`,
    "name": "Kelly Satterwhite",
    "jobTitle": "Attorney at Law",
    "description": "Kelly Satterwhite is an estate planning and business attorney licensed in Virginia and Maryland. A 20-year U.S. Army veteran and former principal horn of the U.S. Army Band, he brings discipline, precision, and dedication to every client matter.",
    "url": `${CANONICAL_URL}/#about`,
    "worksFor": { "@id": `${CANONICAL_URL}/#organization` },
    "alumniOf": {
      "@type": "CollegeOrUniversity",
      "name": "Louisiana State University"
    },
    "memberOf": [
      { "@type": "Organization", "name": "Virginia State Bar" },
      { "@type": "Organization", "name": "Maryland State Bar Association" }
    ],
    "knowsAbout": [
      "Estate Planning",
      "Trust Administration",
      "Wills",
      "Powers of Attorney",
      "Business Succession Planning",
      "1031 Exchange",
      "LLC Formation",
      "Business Transactions"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${CANONICAL_URL}/#website`,
    "url": CANONICAL_URL,
    "name": "The Satterwhite Law Firm, PLLC",
    "description": "Estate planning, trust administration, and business legal services in Virginia and Maryland.",
    "publisher": { "@id": `${CANONICAL_URL}/#organization` },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${CANONICAL_URL}/?s={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }
];

export default function Home() {
  useEffect(() => {
    // Inject Schema.org JSON-LD (array of schemas)
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaMarkup);
    document.head.appendChild(script);

    // Canonical link tag
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link") as HTMLLinkElement;
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", CANONICAL_URL + "/");

    // Page title — keyword-rich, local SEO optimized
    document.title = "Estate Planning Attorney Alexandria VA | Trusts, Wills & Business Law | The Satterwhite Law Firm, PLLC";

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content",
        "The Satterwhite Law Firm, PLLC — Estate planning attorney in Alexandria, VA serving Virginia & Maryland. Wills, revocable trusts, powers of attorney, business succession, LLC formation & 1031 exchange qualified intermediary. Free consultation. (703) 855-7380."
      );
    }

    // Open Graph tags — updated with canonical domain
    const ogTags = [
      { property: "og:title", content: "Estate Planning Attorney Alexandria VA | The Satterwhite Law Firm, PLLC" },
      { property: "og:description", content: "Personalized estate planning, trust administration, wills, powers of attorney, business succession, and 1031 exchange services for Virginia and Maryland families. Free initial consultation. (703) 855-7380." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL_URL + "/" },
      { property: "og:site_name", content: "The Satterwhite Law Firm, PLLC" },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg" },
      { property: "og:image:alt", content: "The Satterwhite Law Firm, PLLC — Estate Planning Attorney Alexandria VA" },
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

    // Twitter Card tags
    const twitterTags = [
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Estate Planning Attorney Alexandria VA | The Satterwhite Law Firm, PLLC" },
      { name: "twitter:description", content: "Wills, trusts, powers of attorney, business succession & 1031 exchange services in Virginia and Maryland. Free consultation." },
      { name: "twitter:image", content: "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg" },
    ];
    twitterTags.forEach(({ name, content }) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });

    return () => {
      try { document.head.removeChild(script); } catch {}
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
        <SchedulingSection />
        <ResourcesSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  );
}
