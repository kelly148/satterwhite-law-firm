import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Shield, Lock, CheckCircle2, ChevronRight } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  consultation: "Consultation",
  estate: "Estate Planning",
  business: "Business Services",
  custom: "Custom",
};

const CATEGORY_ORDER = ["consultation", "estate", "business"];

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default function Pay() {
  const { data: services, isLoading: servicesLoading } = trpc.payment.listServices.useQuery();
  const createCheckout = trpc.payment.createCheckout.useMutation();

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const selectedService = services?.find(s => s.id === selectedServiceId);

  const handleSelectService = (id: string) => {
    setSelectedServiceId(id);
    setIsCustom(false);
    setCustomAmount("");
  };

  const handleSelectCustom = () => {
    setSelectedServiceId(null);
    setIsCustom(true);
  };

  const handlePay = async () => {
    if (!customerName.trim()) {
      toast.error("Name required", { description: "Please enter your full name." });
      return;
    }
    if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      toast.error("Valid email required", { description: "Please enter a valid email address." });
      return;
    }

    let customAmountCents: number | undefined;
    if (isCustom) {
      const parsed = parseFloat(customAmount.replace(/[^0-9.]/g, ""));
      if (isNaN(parsed) || parsed < 0.5) {
        toast.error("Invalid amount", { description: "Minimum payment is $0.50." });
        return;
      }
      customAmountCents = Math.round(parsed * 100);
    } else if (!selectedServiceId) {
      toast.error("Select a service", { description: "Please select a service or enter a custom amount." });
      return;
    }

    try {
      const result = await createCheckout.mutateAsync({
        serviceId: selectedServiceId || undefined,
        customAmountCents,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        origin: window.location.origin,
      });

      if (result.checkoutUrl) {
        toast.success("Redirecting to secure checkout…", { description: "You will be redirected to Stripe's secure payment page." });
        window.open(result.checkoutUrl, "_blank");
      }
    } catch (err: any) {
      toast.error("Payment error", {
        description: err?.message || "Unable to start checkout. Please try again or call (703) 855-7380.",
      });
    }
  };

  const groupedServices = CATEGORY_ORDER.map(cat => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: (services || []).filter(s => s.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div className="min-h-screen" style={{ background: "#faf8f4" }}>
      {/* Header */}
      <div style={{ background: "#1a2744", color: "white", padding: "48px 0 36px" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
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
          <p style={{ color: "#a0b4cc", fontSize: 15, maxWidth: 520, margin: "0 auto" }}>
            Pay your consultation fee, retainer, or legal service invoice securely online.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20 }}>
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

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>

          {/* Left: Service selection */}
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "#1a2744", marginBottom: 20 }}>
              Select a Service
            </h2>

            {servicesLoading ? (
              <div style={{ color: "#888", padding: "40px 0", textAlign: "center" }}>Loading services…</div>
            ) : (
              <>
                {groupedServices.map(group => (
                  <div key={group.category} style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#b8913f", textTransform: "uppercase", marginBottom: 10 }}>
                      {group.label}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {group.items.map(service => {
                        const isSelected = selectedServiceId === service.id;
                        return (
                          <button
                            key={service.id}
                            onClick={() => handleSelectService(service.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "14px 18px",
                              border: isSelected ? "2px solid #1a2744" : "2px solid #e2ddd6",
                              borderRadius: 6,
                              background: isSelected ? "#f0f4f8" : "white",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.15s",
                            }}
                          >
                            <div style={{ flex: 1, marginRight: 16 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                                {isSelected && <CheckCircle2 size={15} color="#1a2744" />}
                                <span style={{ fontWeight: 600, fontSize: 14, color: "#1a2744" }}>{service.name}</span>
                              </div>
                              <span style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>{service.description}</span>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: "#1a2744", whiteSpace: "nowrap" }}>
                              {formatCents(service.amount)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Custom amount */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#b8913f", textTransform: "uppercase", marginBottom: 10 }}>
                    Custom Amount
                  </div>
                  <button
                    onClick={handleSelectCustom}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      border: isCustom ? "2px solid #1a2744" : "2px solid #e2ddd6",
                      borderRadius: 6,
                      background: isCustom ? "#f0f4f8" : "white",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      transition: "all 0.15s",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        {isCustom && <CheckCircle2 size={15} color="#1a2744" />}
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#1a2744" }}>Enter a Custom Amount</span>
                      </div>
                      <span style={{ fontSize: 12, color: "#666" }}>Pay a specific invoice amount or balance</span>
                    </div>
                    <ChevronRight size={16} color="#999" />
                  </button>

                  {isCustom && (
                    <div style={{ marginTop: 12, padding: "14px 18px", background: "#f0f4f8", borderRadius: 6, border: "1px solid #ddd" }}>
                      <Label htmlFor="customAmount" style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6, display: "block" }}>
                        Amount (USD)
                      </Label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#555", fontWeight: 600 }}>$</span>
                        <Input
                          id="customAmount"
                          type="number"
                          min="0.50"
                          step="0.01"
                          placeholder="0.00"
                          value={customAmount}
                          onChange={e => setCustomAmount(e.target.value)}
                          style={{ paddingLeft: 28 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right: Checkout summary */}
          <div style={{ position: "sticky", top: 24 }}>
            <Card style={{ border: "2px solid #1a2744", borderRadius: 8 }}>
              <CardHeader style={{ background: "#1a2744", borderRadius: "6px 6px 0 0", padding: "20px 24px" }}>
                <CardTitle style={{ color: "white", fontFamily: "'Cormorant Garamond', serif", fontSize: 20 }}>
                  Payment Summary
                </CardTitle>
                <CardDescription style={{ color: "#a0b4cc", fontSize: 13 }}>
                  The Satterwhite Law Firm, PLLC
                </CardDescription>
              </CardHeader>
              <CardContent style={{ padding: "24px" }}>
                {/* Selected service */}
                {selectedService ? (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Service</div>
                    <div style={{ fontWeight: 600, color: "#1a2744", marginBottom: 2 }}>{selectedService.name}</div>
                    <div style={{ fontSize: 12, color: "#777" }}>{selectedService.description}</div>
                    <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "#555" }}>Total</span>
                      <span style={{ fontSize: 22, fontWeight: 700, color: "#1a2744" }}>{formatCents(selectedService.amount)}</span>
                    </div>
                  </div>
                ) : isCustom && customAmount ? (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Service</div>
                    <div style={{ fontWeight: 600, color: "#1a2744", marginBottom: 2 }}>Legal Services Payment</div>
                    <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "#555" }}>Total</span>
                      <span style={{ fontSize: 22, fontWeight: 700, color: "#1a2744" }}>
                        {formatCents(Math.round(parseFloat(customAmount.replace(/[^0-9.]/g, "") || "0") * 100))}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: "#aaa", fontSize: 13, marginBottom: 20, textAlign: "center", padding: "16px 0" }}>
                    Select a service to see the total
                  </div>
                )}

                <Separator style={{ marginBottom: 20 }} />

                {/* Customer info */}
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
                </div>

                <Button
                  onClick={handlePay}
                  disabled={createCheckout.isPending || (!selectedServiceId && !isCustom)}
                  style={{
                    width: "100%",
                    background: "#1a2744",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 15,
                    padding: "12px 0",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
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

                <div style={{ marginTop: 14, textAlign: "center" }}>
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

                <Separator style={{ margin: "16px 0" }} />

                <div style={{ fontSize: 11, color: "#999", textAlign: "center", lineHeight: 1.5 }}>
                  Questions? Call{" "}
                  <a href="tel:+17038557380" style={{ color: "#1a2744", fontWeight: 600 }}>
                    (703) 855-7380
                  </a>{" "}
                  or email{" "}
                  <a href="mailto:kelly@thesatterwhitelawfirm.com" style={{ color: "#1a2744", fontWeight: 600 }}>
                    kelly@thesatterwhitelawfirm.com
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
