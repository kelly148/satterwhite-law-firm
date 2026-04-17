/**
 * PaymentHistory — Admin page showing all completed Stripe payments
 * Accessible only to admin users.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, CreditCard, DollarSign, Users, TrendingUp } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function PaymentHistory() {
  const { user, loading, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");

  const { data: paymentList, isLoading } = trpc.payment.listPayments.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f5f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#2c5282", fontSize: 16 }}>Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f5f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <p style={{ color: "#2c5282", fontSize: 16 }}>Please log in to access this page.</p>
        <a href={getLoginUrl()} style={{ background: "#2c5282", color: "white", padding: "10px 24px", borderRadius: 4, fontWeight: 600, textDecoration: "none" }}>
          Log In
        </a>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f5f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <p style={{ color: "#c53030", fontSize: 16, fontWeight: 600 }}>Access Denied</p>
        <p style={{ color: "#555", fontSize: 14 }}>This page is restricted to firm administrators.</p>
        <a href="/" style={{ color: "#2c5282", textDecoration: "underline", fontSize: 14 }}>← Return to Home</a>
      </div>
    );
  }

  // ── Filter payments ───────────────────────────────────────────────────────
  const filtered = (paymentList ?? []).filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.customerName?.toLowerCase().includes(q) ||
      p.customerEmail?.toLowerCase().includes(q) ||
      p.serviceName?.toLowerCase().includes(q) ||
      p.stripePaymentIntentId?.toLowerCase().includes(q)
    );
  });

  // ── Summary stats ─────────────────────────────────────────────────────────
  const totalRevenue = (paymentList ?? []).reduce((sum, p) => sum + p.amountCents, 0);
  const uniqueClients = new Set((paymentList ?? []).map((p) => p.customerEmail).filter(Boolean)).size;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f5f0" }}>
      {/* Header */}
      <div style={{ background: "#2c5282", padding: "16px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={LOGO_URL} alt="Satterwhite Law" style={{ height: 40, borderRadius: 4 }} />
            <div>
              <div style={{ color: "white", fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600 }}>
                Payment History
              </div>
              <div style={{ color: "#90cdf4", fontSize: 12 }}>Admin Dashboard</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <a href="/admin/intake" style={{ color: "#90cdf4", fontSize: 13, textDecoration: "none" }}>
              📋 Intake Submissions
            </a>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 6, color: "#90cdf4", fontSize: 13, textDecoration: "none" }}>
              <ArrowLeft size={14} /> Back to Site
            </a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          <SummaryCard
            icon={<DollarSign size={20} color="#b8913f" />}
            label="Total Revenue"
            value={formatCents(totalRevenue)}
          />
          <SummaryCard
            icon={<CreditCard size={20} color="#b8913f" />}
            label="Total Payments"
            value={String(paymentList?.length ?? 0)}
          />
          <SummaryCard
            icon={<Users size={20} color="#b8913f" />}
            label="Unique Clients"
            value={String(uniqueClients)}
          />
          <SummaryCard
            icon={<TrendingUp size={20} color="#b8913f" />}
            label="Avg. Payment"
            value={paymentList?.length ? formatCents(totalRevenue / paymentList.length) : "—"}
          />
        </div>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
            <Input
              placeholder="Search by name, email, or service…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
          {search && (
            <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
              Clear
            </Button>
          )}
          <span style={{ fontSize: 13, color: "#888", marginLeft: "auto" }}>
            {filtered.length} {filtered.length === 1 ? "payment" : "payments"}
          </span>
        </div>

        {/* Table */}
        <div style={{ background: "white", borderRadius: 8, border: "1px solid #e2ddd6", overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ padding: "60px 24px", textAlign: "center", color: "#888" }}>Loading payments…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center", color: "#888" }}>
              {search ? "No payments match your search." : "No payments recorded yet. Completed Stripe payments will appear here automatically."}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f7f5f0", borderBottom: "2px solid #e2ddd6" }}>
                  {["Date", "Client", "Service / Memo", "Amount", "Status", "Payment ID"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#2c5282",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? "1px solid #f0ece6" : "none",
                      background: i % 2 === 0 ? "white" : "#fdfcfb",
                    }}
                  >
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#444", whiteSpace: "nowrap" }}>
                      {formatDate(p.paidAt)}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1a2744" }}>
                        {p.customerName || <span style={{ color: "#aaa", fontStyle: "italic" }}>Unknown</span>}
                      </div>
                      {p.customerEmail && (
                        <div style={{ fontSize: 12, color: "#777" }}>{p.customerEmail}</div>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#444" }}>
                      <div>{p.serviceName || <span style={{ color: "#aaa", fontStyle: "italic" }}>Custom amount</span>}</div>
                      {(p as any).memo && <div style={{ fontSize: 11, color: "#888", marginTop: 2, fontStyle: "italic" }}>{(p as any).memo}</div>}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "#1a2744", whiteSpace: "nowrap" }}>
                      {formatCents(p.amountCents)}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Badge
                        style={{
                          background: "#e6f4ea",
                          color: "#2d6a4f",
                          border: "none",
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <code style={{ fontSize: 11, color: "#888", background: "#f5f5f5", padding: "2px 6px", borderRadius: 3 }}>
                        {p.stripePaymentIntentId.slice(0, 24)}…
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p style={{ fontSize: 12, color: "#aaa", marginTop: 16, textAlign: "center" }}>
          Payments are recorded automatically when clients complete Stripe Checkout.
          For full transaction details, visit your{" "}
          <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer" style={{ color: "#2c5282" }}>
            Stripe Dashboard
          </a>.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ background: "white", borderRadius: 8, border: "1px solid #e2ddd6", padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        {icon}
        <span style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#1a2744", fontFamily: "'Cormorant Garamond', serif" }}>{value}</div>
    </div>
  );
}
