import { useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle2, Calendar, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaySuccess() {
  useEffect(() => {
    document.title = "Payment Confirmed | The Satterwhite Law Firm, PLLC";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#faf8f4" }}>
      {/* Header */}
      <div style={{ background: "#1a2744", padding: "32px 0 28px" }}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg"
            alt="The Satterwhite Law Firm"
            style={{ height: 48, borderRadius: 4, marginBottom: 0 }}
          />
        </div>
      </div>

      {/* Success content */}
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "#d1fae5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <CheckCircle2 size={36} color="#059669" />
        </div>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 34,
          fontWeight: 600,
          color: "#1a2744",
          marginBottom: 12,
        }}>
          Payment Confirmed
        </h1>

        <p style={{ color: "#555", fontSize: 15, lineHeight: 1.7, marginBottom: 32, maxWidth: 420, margin: "0 auto 32px" }}>
          Thank you — your payment has been received. A receipt will be sent to your email address. Our office will be in touch within one business day.
        </p>

        {/* Next steps */}
        <div style={{
          background: "white",
          border: "1px solid #e2ddd6",
          borderRadius: 8,
          padding: "28px 32px",
          marginBottom: 32,
          textAlign: "left",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#b8913f", textTransform: "uppercase", marginBottom: 16 }}>
            Next Steps
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <Calendar size={18} color="#1a2744" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: "#1a2744", fontSize: 14, marginBottom: 2 }}>Schedule Your Consultation</div>
                <div style={{ fontSize: 13, color: "#666" }}>Book your appointment online at your convenience.</div>
                <a
                  href="https://calendly.com/thesatterwhitelawfirm/consultation"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, color: "#1a2744", fontWeight: 600, textDecoration: "underline", marginTop: 4, display: "inline-block" }}
                >
                  Book on Calendly →
                </a>
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <Phone size={18} color="#1a2744" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: "#1a2744", fontSize: 14, marginBottom: 2 }}>Call the Office</div>
                <a href="tel:+17038557380" style={{ fontSize: 13, color: "#1a2744", fontWeight: 600 }}>(703) 855-7380</a>
                <span style={{ fontSize: 13, color: "#666" }}> — Mon–Fri, 9 AM–5 PM ET</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <Mail size={18} color="#1a2744" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: "#1a2744", fontSize: 14, marginBottom: 2 }}>Email Us</div>
                <a href="mailto:kelly@thesatterwhitelawfirm.com" style={{ fontSize: 13, color: "#1a2744", fontWeight: 600 }}>
                  kelly@thesatterwhitelawfirm.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="https://calendly.com/thesatterwhitelawfirm/consultation"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button style={{ background: "#1a2744", color: "white", fontWeight: 600 }}>
              📅 Book Consultation
            </Button>
          </a>
          <Link href="/">
            <Button variant="outline" style={{ fontWeight: 600, borderColor: "#1a2744", color: "#1a2744" }}>
              Return to Home
            </Button>
          </Link>
        </div>

        <div style={{ marginTop: 40, fontSize: 12, color: "#aaa" }}>
          The Satterwhite Law Firm, PLLC · 1605 Fort Hunt Ct, Alexandria, VA 22307
        </div>
      </div>
    </div>
  );
}
