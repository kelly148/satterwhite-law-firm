import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import type { ComponentType } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import { getLoginUrl } from "./const";
import Home from "./pages/Home";
import IntakeForm from "./pages/IntakeForm";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LLCIntakeForm from "./pages/LLCIntakeForm";
import Pay from "./pages/Pay";
import PaySuccess from "./pages/PaySuccess";
import PaymentHistory from "./pages/PaymentHistory";
import IntakeAdmin from "./pages/IntakeAdmin";
import ConsultationsAdmin from "./pages/ConsultationsAdmin";

/**
 * Gate admin pages behind an authenticated admin session. The server already
 * enforces this on every admin API call; this guard simply gives a clean UX
 * (redirect to login / clear "access denied") instead of rendering a broken
 * page full of errors for non-admins.
 */
function RequireAdmin({ component: Component }: { component: ComponentType }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") window.location.href = getLoginUrl();
    return null;
  }

  if (user.role !== "admin") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#666", textAlign: "center", padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#1a2744" }}>Access denied</h1>
        <p>You don’t have permission to view this page.</p>
        <a href="/" style={{ color: "#1a2744", textDecoration: "underline" }}>Return home</a>
      </div>
    );
  }

  return <Component />;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/intake"} component={IntakeForm} />
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/llc-intake"} component={LLCIntakeForm} />
      <Route path={"/pay"} component={Pay} />
      <Route path={"/pay/success"} component={PaySuccess} />
      <Route path={"/admin/payments"}>
        <RequireAdmin component={PaymentHistory} />
      </Route>
      <Route path={"/admin/intake"}>
        <RequireAdmin component={IntakeAdmin} />
      </Route>
      <Route path={"/admin/consultations"}>
        <RequireAdmin component={ConsultationsAdmin} />
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
