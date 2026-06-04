import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ONBOARDING_KEY } from "@/pages/Onboarding";

/**
 * Redirects first-time visitors to /onboarding once.
 * Only triggers from the root path so internal routes / deep links are untouched.
 */
const OnboardingGate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") return;
    let done = "1";
    try { done = localStorage.getItem(ONBOARDING_KEY) ?? ""; } catch { /* ignore */ }
    if (!done) navigate("/onboarding", { replace: true });
  }, [location.pathname, navigate]);

  return null;
};

export default OnboardingGate;
