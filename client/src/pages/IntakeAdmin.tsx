/**
 * IntakeAdmin — Admin page showing all trust and LLC intake form submissions
 * Accessible only to admin users.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Search, FileText, Users, Building2, ExternalLink } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg";

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

function parseFormData(json: string): Record<string, any> {
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function FormDataViewer({ formDataJson, formType }: { formDataJson: string; formType: string }) {
  const data = parseFormData(formDataJson);
  const subsections: any[] = Array.isArray(data.subsections) ? data.subsections : [];

  const fieldStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    gap: "4px 12px",
    padding: "6px 0",
    borderBottom: "1px solid #f0ece6",
    fontSize: 13,
  };

  const labelStyle: React.CSSProperties = {
    color: "#888",
    fontWeight: 600,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    paddingTop: 1,
  };

  const valueStyle: React.CSSProperties = {
    color: "#1a2744",
    wordBreak: "break-word",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 20,
    background: "#fdfcfb",
    borderRadius: 6,
    border: "1px solid #e8e4de",
    overflow: "hidden",
  };

  const sectionHeaderStyle: React.CSSProperties = {
    background: "#f0ece6",
    padding: "8px 14px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#2c5282",
  };

  const sectionBodyStyle: React.CSSProperties = {
    padding: "8px 14px",
  };

  // Render named fields (non-subsection data)
  const namedFields = Object.entries(data).filter(
    ([k]) => k !== "subsections" && !k.startsWith("_")
  );

  return (
    <div>
      {namedFields.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>Form Fields</div>
          <div style={sectionBodyStyle}>
            {namedFields.map(([key, value]) => (
              <div key={key} style={fieldStyle}>
                <span style={labelStyle}>{key.replace(/^[a-z0-9]+-/, "").replace(/-/g, " ")}</span>
                <span style={valueStyle}>{String(value ?? "—")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {subsections.map((section: any, i: number) => (
        <div key={i} style={sectionStyle}>
          <div style={sectionHeaderStyle}>{section.title || `Section ${i + 1}`}</div>
          <div style={sectionBodyStyle}>
            {Array.isArray(section.fields) && section.fields.length > 0 ? (
              section.fields.map((field: any, j: number) => (
                <div key={j} style={fieldStyle}>
                  <span style={labelStyle}>{field.label || field.name || `Field ${j + 1}`}</span>
                  <span style={valueStyle}>{field.value || "—"}</span>
                </div>
              ))
            ) : (
              <div style={{ color: "#aaa", fontSize: 12, padding: "4px 0" }}>No fields captured</div>
            )}

            {Array.isArray(section.subsections) &&
              section.subsections.map((sub: any, k: number) => (
                <div key={k} style={{ marginTop: 10, paddingLeft: 12, borderLeft: "3px solid #e2ddd6" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#b8913f", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {sub.title || `Entry ${k + 1}`}
                  </div>
                  {Array.isArray(sub.fields) &&
                    sub.fields.map((f: any, m: number) => (
                      <div key={m} style={fieldStyle}>
                        <span style={labelStyle}>{f.label || f.name || `Field ${m + 1}`}</span>
                        <span style={valueStyle}>{f.value || "—"}</span>
                      </div>
                    ))}
                </div>
              ))}
          </div>
        </div>
      ))}

      {namedFields.length === 0 && subsections.length === 0 && (
        <div style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
          No structured form data available for this submission.
        </div>
      )}
    </div>
  );
}

export default function IntakeAdmin() {
  const { user, loading, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "trust" | "llc">("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: submissions, isLoading } = trpc.intake.listSubmissions.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: selectedSubmission, isLoading: detailLoading } = trpc.intake.getSubmission.useQuery(
    { id: selectedId! },
    { enabled: selectedId !== null && isAuthenticated && user?.role === "admin" }
  );

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

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = (submissions ?? []).filter((s) => {
    const matchesType = filterType === "all" || s.formType === filterType;
    if (!matchesType) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.clientName?.toLowerCase().includes(q) ||
      s.clientEmail?.toLowerCase().includes(q) ||
      s.clientPhone?.toLowerCase().includes(q)
    );
  });

  const trustCount = (submissions ?? []).filter(s => s.formType === "trust").length;
  const llcCount = (submissions ?? []).filter(s => s.formType === "llc").length;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f5f0" }}>
      {/* Header */}
      <div style={{ background: "#2c5282", padding: "16px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={LOGO_URL} alt="Satterwhite Law" style={{ height: 40, borderRadius: 4 }} />
            <div>
              <div style={{ color: "white", fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600 }}>
                Client Intake Submissions
              </div>
              <div style={{ color: "#90cdf4", fontSize: 12 }}>Admin Dashboard</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <a href="/admin/payments" style={{ color: "#90cdf4", fontSize: 13, textDecoration: "none" }}>
              💳 Payment History
            </a>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 6, color: "#90cdf4", fontSize: 13, textDecoration: "none" }}>
              <ArrowLeft size={14} /> Back to Site
            </a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
          <SummaryCard icon={<Users size={20} color="#b8913f" />} label="Total Submissions" value={String(submissions?.length ?? 0)} />
          <SummaryCard icon={<FileText size={20} color="#b8913f" />} label="Trust Intakes" value={String(trustCount)} />
          <SummaryCard icon={<Building2 size={20} color="#b8913f" />} label="LLC Intakes" value={String(llcCount)} />
        </div>

        {/* Search + filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
            <Input
              placeholder="Search by name, email, or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "trust", "llc"] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 4,
                  border: filterType === t ? "2px solid #2c5282" : "2px solid #e2ddd6",
                  background: filterType === t ? "#2c5282" : "white",
                  color: filterType === t ? "white" : "#555",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {t === "all" ? "All" : t === "trust" ? "Trust" : "LLC"}
              </button>
            ))}
          </div>
          {search && <Button variant="ghost" size="sm" onClick={() => setSearch("")}>Clear</Button>}
          <span style={{ fontSize: 13, color: "#888", marginLeft: "auto" }}>
            {filtered.length} {filtered.length === 1 ? "submission" : "submissions"}
          </span>
        </div>

        {/* Table */}
        <div style={{ background: "white", borderRadius: 8, border: "1px solid #e2ddd6", overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ padding: "60px 24px", textAlign: "center", color: "#888" }}>Loading submissions…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center", color: "#888" }}>
              {search || filterType !== "all" ? "No submissions match your search." : "No intake submissions yet. Completed forms will appear here automatically."}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f7f5f0", borderBottom: "2px solid #e2ddd6" }}>
                  {["Date", "Client", "Phone", "Type", "PDF", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2c5282" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? "1px solid #f0ece6" : "none",
                      background: i % 2 === 0 ? "white" : "#fdfcfb",
                    }}
                  >
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#444", whiteSpace: "nowrap" }}>
                      {formatDate(s.submittedAt)}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1a2744" }}>{s.clientName}</div>
                      <div style={{ fontSize: 12, color: "#777" }}>{s.clientEmail}</div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#444" }}>
                      {s.clientPhone || <span style={{ color: "#aaa" }}>—</span>}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Badge
                        style={{
                          background: s.formType === "trust" ? "#ebf4ff" : "#fef3c7",
                          color: s.formType === "trust" ? "#2c5282" : "#92400e",
                          border: "none",
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {s.formType === "trust" ? "Trust" : "LLC"}
                      </Badge>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {s.pdfUrl ? (
                        <a
                          href={s.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: 4, color: "#2c5282", fontSize: 12, textDecoration: "none", fontWeight: 600 }}
                        >
                          <ExternalLink size={13} /> Download PDF
                        </a>
                      ) : (
                        <span style={{ color: "#aaa", fontSize: 12 }}>No PDF</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedId(s.id)}
                        style={{ fontSize: 12 }}
                      >
                        View Form
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={selectedId !== null} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
        <DialogContent style={{ maxWidth: 720, maxHeight: "85vh", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#1a2744" }}>
              {selectedSubmission?.clientName ?? "Loading…"}
            </DialogTitle>
            <div style={{ fontSize: 13, color: "#777", marginTop: 4 }}>
              {selectedSubmission && (
                <>
                  {selectedSubmission.clientEmail} &nbsp;·&nbsp; {selectedSubmission.clientPhone || "No phone"} &nbsp;·&nbsp;
                  Submitted {formatDate(selectedSubmission.submittedAt)}
                  {selectedSubmission.pdfUrl && (
                    <> &nbsp;·&nbsp; <a href={selectedSubmission.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#2c5282" }}>Download PDF</a></>
                  )}
                </>
              )}
            </div>
          </DialogHeader>
          <div style={{ marginTop: 16 }}>
            {detailLoading ? (
              <div style={{ textAlign: "center", color: "#888", padding: "32px 0" }}>Loading form data…</div>
            ) : selectedSubmission ? (
              <FormDataViewer
                formDataJson={selectedSubmission.formDataJson}
                formType={selectedSubmission.formType ?? "trust"}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
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
