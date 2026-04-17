import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ColorOptions from "./pages/ColorOptions";
import IntakeForm from "./pages/IntakeForm";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LLCIntakeForm from "./pages/LLCIntakeForm";
import Pay from "./pages/Pay";
import PaySuccess from "./pages/PaySuccess";
import PaymentHistory from "./pages/PaymentHistory";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/color-options"} component={ColorOptions} />
      <Route path={"/intake"} component={IntakeForm} />
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/llc-intake"} component={LLCIntakeForm} />
      <Route path={"/pay"} component={Pay} />
      <Route path={"/pay/success"} component={PaySuccess} />
      <Route path={"/admin/payments"} component={PaymentHistory} />
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
