import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Search, Calendar, Phone, Mail, Clock, ArrowLeft, Users, CheckCircle2, XCircle } from "lucide-react";

function formatDateTime(ts: Date | string | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}

export default function ConsultationsAdmin() {
  const { data: bookings, isLoading } = trpc.consultations.listBookings.useQuery();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "canceled">("all");

  const filtered = (bookings || []).filter(b => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      b.inviteeName?.toLowerCase().includes(q) ||
      b.inviteeEmail?.toLowerCase().includes(q) ||
      b.inviteePhone?.toLowerCase().includes(q) ||
      b.calendlyEventType?.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalActive = (bookings || []).filter(b => b.status === "active").length;
  const totalCanceled = (bookings || []).filter(b => b.status === "canceled").length;

  return (
    <div className="min-h-screen" style={{ background: "#faf8f4" }}>
      {/* Header */}
      <div style={{ background: "#1a2744", color: "white", padding: "32px 0 28px" }}>
        <div className="max-w-5xl mx-auto px-4">
          <Link href="/admin/payments" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#90cdf4", fontSize: 13, textDecoration: "none", marginBottom: 16 }}>
            <ArrowLeft size={14} /> Back to Payments
          </Link>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, marginBottom: 4 }}>
                Consultation Bookings
              </h1>
              <p style={{ color: "#a0b4cc", fontSize: 14 }}>
                All Calendly bookings — synced automatically via webhook
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Link href="/admin/intake" style={{ color: "#90cdf4", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                <Users size={14} /> Intake Forms
              </Link>
              <Link href="/admin/payments" style={{ color: "#90cdf4", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                💳 Payments
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Bookings", value: bookings?.length ?? 0, icon: <Calendar size={18} color="#b8913f" /> },
            { label: "Active", value: totalActive, icon: <CheckCircle2 size={18} color="#38a169" /> },
            { label: "Canceled", value: totalCanceled, icon: <XCircle size={18} color="#e53e3e" /> },
          ].map(card => (
            <div key={card.label} style={{ background: "white", borderRadius: 8, border: "1px solid #e2ddd6", padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ background: "#f5f0e8", borderRadius: 8, padding: 10 }}>{card.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1a2744" }}>{card.value}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
            <Input
              placeholder="Search by name, email, or phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "active", "canceled"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: "1px solid",
                  borderColor: statusFilter === s ? "#1a2744" : "#ddd",
                  background: statusFilter === s ? "#1a2744" : "white",
                  color: statusFilter === s ? "white" : "#555",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "white", borderRadius: 8, border: "1px solid #e2ddd6", overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "#aaa" }}>
              <Calendar size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
              <div>Loading bookings…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "#aaa" }}>
              <Calendar size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
              <div style={{ fontWeight: 600, marginBottom: 4 }}>No bookings found</div>
              <div style={{ fontSize: 13 }}>
                {bookings?.length === 0
                  ? "Bookings will appear here once clients schedule via Calendly."
                  : "Try adjusting your search or filter."}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f0e8", borderBottom: "1px solid #e2ddd6" }}>
                    {["Client", "Contact", "Date & Time", "Event Type", "Status", "Notes"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#b8913f", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, i) => (
                    <tr key={b.id} style={{ borderBottom: "1px solid #f0ebe3", background: i % 2 === 0 ? "white" : "#faf8f4" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#1a2744", fontSize: 14 }}>{b.inviteeName || "—"}</div>
                        <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>#{b.id}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {b.inviteeEmail && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#555", marginBottom: 3 }}>
                            <Mail size={11} />
                            <a href={`mailto:${b.inviteeEmail}`} style={{ color: "#1a2744", textDecoration: "none" }}>{b.inviteeEmail}</a>
                          </div>
                        )}
                        {b.inviteePhone && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#555" }}>
                            <Phone size={11} />
                            <a href={`tel:${b.inviteePhone}`} style={{ color: "#555", textDecoration: "none" }}>{b.inviteePhone}</a>
                          </div>
                        )}
                        {!b.inviteeEmail && !b.inviteePhone && <span style={{ color: "#ccc", fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#1a2744", fontWeight: 500 }}>
                          <Clock size={12} />
                          {formatDateTime(b.startTime)}
                        </div>
                        {b.endTime && (
                          <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
                            ends {formatDateTime(b.endTime)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: 13, color: "#555" }}>{b.calendlyEventType || "—"}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <Badge
                          style={{
                            background: b.status === "active" ? "#f0fff4" : "#fff5f5",
                            color: b.status === "active" ? "#276749" : "#c53030",
                            border: `1px solid ${b.status === "active" ? "#c6f6d5" : "#fed7d7"}`,
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        >
                          {b.status === "active" ? "Active" : "Canceled"}
                        </Badge>
                        {b.cancelReason && (
                          <div style={{ fontSize: 11, color: "#aaa", marginTop: 4, maxWidth: 140 }}>{b.cancelReason}</div>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: 12, color: "#666", maxWidth: 180, lineHeight: 1.4 }}>
                          {b.notes || <span style={{ color: "#ccc" }}>—</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12, color: "#aaa", textAlign: "right" }}>
            Showing {filtered.length} of {bookings?.length} booking{bookings?.length !== 1 ? "s" : ""}
          </div>
        )}

        {/* Calendly webhook setup reminder */}
        {bookings?.length === 0 && !isLoading && (
          <div style={{ marginTop: 20, background: "#fffbeb", border: "1px solid #f6e05e", borderRadius: 8, padding: "16px 20px" }}>
            <div style={{ fontWeight: 600, color: "#744210", marginBottom: 4, fontSize: 14 }}>Set up Calendly webhook to sync bookings</div>
            <div style={{ fontSize: 13, color: "#975a16" }}>
              Go to <strong>Calendly → Integrations → Webhooks</strong>, add the endpoint{" "}
              <code style={{ background: "#fef3c7", padding: "1px 6px", borderRadius: 3 }}>
                https://satterlaw-6bmn3gsb.manus.space/api/calendly/webhook
              </code>{" "}
              and subscribe to <strong>invitee.created</strong> and <strong>invitee.canceled</strong>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
