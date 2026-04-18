import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Shield, Lock } from "lucide-react";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default function Pay() {
  const createCheckout = trpc.payment.createCheckout.useMutation();

  const [customAmount, setCustomAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [memo, setMemo] = useState("");
  const [matterNumber, setMatterNumber] = useState("");

  const parsedAmount = parseFloat(customAmount.replace(/[^0-9.]/g, "") || "0");
  const amountCents = isNaN(parsedAmount) ? 0 : Math.round(parsedAmount * 100);

  const handlePay = async () => {
    if (!customerName.trim()) {
      toast.error("Name required", { description: "Please enter your full name." });
      return;
    }
    if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      toast.error("Valid email required", { description: "Please enter a valid email address." });
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount < 0.5) {
      toast.error("Invalid amount", { description: "Minimum payment is $0.50." });
      return;
    }

    try {
      const result = await createCheckout.mutateAsync({
        customAmountCents: amountCents,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        memo: memo.trim() || undefined,
        matterNumber: matterNumber.trim() || undefined,
        origin: window.location.origin,
      });

      if (result.checkoutUrl) {
        toast.success("Redirecting to secure checkout…", {
          description: "You will be redirected to Stripe's secure payment page.",
        });
        window.open(result.checkoutUrl, "_blank");
      }
    } catch (err: any) {
      toast.error("Payment error", {
        description: err?.message || "Unable to start checkout. Please try again or call (703) 855-7380.",
      });
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#faf8f4" }}>
      {/* Header */}
      <div style={{ background: "#1a2744", color: "white", padding: "48px 0 36px" }}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg"
              alt="The Satterwhite Law Firm"
              style={{ height: 56, borderRadius: 4 }}
            />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, marginBottom: 8 }}>
            Secure Online Payment
          </h1>
          <p style={{ color: "#a0b4cc", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
            Pay your retainer, legal service invoice, or any balance securely online.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#90cdf4" }}>
              <Lock size={14} /> SSL Encrypted
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#90cdf4" }}>
              <Shield size={14} /> Powered by Stripe
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#90cdf4" }}>
              <CreditCard size={14} /> All major cards accepted
            </span>
          </div>
        </div>
      </div>

      {/* Payment card */}
      <div className="max-w-lg mx-auto px-4 py-12">
        <div style={{ background: "white", borderRadius: 10, border: "1px solid #e2ddd6", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
          {/* Card header */}
          <div style={{ background: "#1a2744", padding: "20px 28px" }}>
            <div style={{ color: "white", fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600 }}>
              Payment Details
            </div>
            <div style={{ color: "#a0b4cc", fontSize: 13, marginTop: 2 }}>
              The Satterwhite Law Firm, PLLC
            </div>
          </div>

          <div style={{ padding: "28px" }}>
            {/* Amount field */}
            <div style={{ marginBottom: 20 }}>
              <Label htmlFor="customAmount" style={{ fontSize: 13, fontWeight: 700, color: "#1a2744", marginBottom: 6, display: "block", letterSpacing: "0.02em" }}>
                Payment Amount (USD) *
              </Label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#555", fontWeight: 700, fontSize: 16 }}>$</span>
                <Input
                  id="customAmount"
                  type="number"
                  min="0.50"
                  step="0.01"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  style={{ paddingLeft: 32, fontSize: 18, fontWeight: 600, height: 52, color: "#1a2744" }}
                />
              </div>
              {amountCents >= 50 && (
                <div style={{ marginTop: 6, fontSize: 13, color: "#555", fontWeight: 600 }}>
                  Total: {formatCents(amountCents)}
                </div>
              )}
            </div>

            <Separator style={{ marginBottom: 20 }} />

            {/* Contact info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              <div>
                <Label htmlFor="payName" style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4, display: "block" }}>
                  Full Name *
                </Label>
                <Input
                  id="payName"
                  placeholder="Your full legal name"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="payEmail" style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4, display: "block" }}>
                  Email Address *
                </Label>
                <Input
                  id="payEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="payMemo" style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4, display: "block" }}>
                  Memo / Note <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span>
                </Label>
                <Input
                  id="payMemo"
                  placeholder="e.g. 50% deposit — Johnson Estate Trust"
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  maxLength={200}
                />
                <div style={{ fontSize: 11, color: "#aaa", marginTop: 3 }}>Appears on your receipt and in our records</div>
              </div>
              <div>
                <Label htmlFor="payMatter" style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4, display: "block" }}>
                  Matter / File # <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span>
                </Label>
                <Input
                  id="payMatter"
                  placeholder="e.g. SLF-2026-042"
                  value={matterNumber}
                  onChange={e => setMatterNumber(e.target.value)}
                  maxLength={50}
                />
                <div style={{ fontSize: 11, color: "#aaa", marginTop: 3 }}>Links this payment to an open client matter</div>
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handlePay}
              disabled={createCheckout.isPending || amountCents < 50}
              style={{
                width: "100%",
                background: "#1a2744",
                color: "white",
                fontWeight: 600,
                fontSize: 15,
                padding: "12px 0",
                borderRadius: 6,
                border: "none",
                cursor: amountCents >= 50 ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {createCheckout.isPending ? (
                "Preparing checkout…"
              ) : (
                <>
                  <CreditCard size={16} />
                  Proceed to Secure Checkout
                </>
              )}
            </Button>

            {/* Trust badges */}
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, color: "#888", fontSize: 11 }}>
                <Lock size={11} />
                Secured by Stripe · 256-bit SSL
              </div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 8 }}>
                {["VISA", "MC", "AMEX", "DISC"].map(card => (
                  <Badge key={card} variant="outline" style={{ fontSize: 9, padding: "2px 6px", color: "#777", borderColor: "#ddd" }}>
                    {card}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Help text */}
        <div style={{ textAlign: "center", marginTop: 24, color: "#888", fontSize: 13 }}>
          Questions about your invoice?{" "}
          <a href="tel:+17038557380" style={{ color: "#1a2744", fontWeight: 600, textDecoration: "none" }}>
            (703) 855-7380
          </a>{" "}
          or{" "}
          <a href="mailto:kelly@thesatterwhitelawfirm.com" style={{ color: "#1a2744", fontWeight: 600, textDecoration: "none" }}>
            kelly@thesatterwhitelawfirm.com
          </a>
        </div>
      </div>
    </div>
  );
}
