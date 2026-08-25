import { useEffect, useState } from "react";
import { useLocation } from "wouter";

import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Owner login. Posts the password to /api/admin/login, which sets the session
 * cookie on success. There is no self-service signup: the single admin account
 * is provisioned by the ADMIN_PASSWORD_HASH environment variable.
 */
export default function AdminLogin() {
  const [, navigate] = useLocation();
  const { user, loading, refresh } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Don't make them log in again.
  useEffect(() => {
    if (!loading && user) navigate("/admin/intake");
  }, [loading, user, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        setError(detail?.error ?? "Login failed. Please try again.");
        setPassword("");
        return;
      }

      await refresh();
      navigate("/admin/intake");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f8fa",
        padding: 24,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#fff",
          borderRadius: 10,
          padding: 32,
          boxShadow: "0 2px 16px rgba(26, 39, 68, 0.10)",
          border: "1px solid #e6e8ee",
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#1a2744",
            marginBottom: 6,
            textAlign: "center",
          }}
        >
          The Satterwhite Law Firm
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#6b7280",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Staff sign-in
        </p>

        <label
          htmlFor="admin-password"
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#374151",
            marginBottom: 6,
          }}
        >
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={event => setPassword(event.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 14,
            border: "1px solid #d1d5db",
            borderRadius: 6,
            marginBottom: 16,
          }}
        />

        {error && (
          <p
            role="alert"
            style={{
              color: "#b91c1c",
              fontSize: 13,
              marginBottom: 14,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || password.length === 0}
          style={{
            width: "100%",
            padding: "11px 12px",
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            background: submitting ? "#5b6a8a" : "#1a2744",
            border: "none",
            borderRadius: 6,
            cursor: submitting ? "default" : "pointer",
          }}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        <p style={{ marginTop: 18, textAlign: "center" }}>
          <a href="/" style={{ color: "#6b7280", fontSize: 12 }}>
            Return to the website
          </a>
        </p>
      </form>
    </div>
  );
}
