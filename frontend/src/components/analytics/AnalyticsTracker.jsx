
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "/api")
).replace(/\/$/, "");

const SESSION_KEY = "flexisole_session";
const LEGACY_CONSENT_KEY = "flexisole_analytics_consent";
const LEGACY_VISITOR_KEY = "flexisole_visitor_id";

const SESSION_TIMEOUT = 30 * 60 * 1000;

function isCustomerPath(path) {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("/admin") &&
    !path.startsWith("/api")
  );
}

function getSession() {
  const now = Date.now();

  let session = null;

  try {
    const saved = sessionStorage.getItem(SESSION_KEY);

    if (saved) {
      session = JSON.parse(saved);
    }
  } catch {
    session = null;
  }

  const isValid =
    session &&
    typeof session.id === "string" &&
    typeof session.visitorId === "string" &&
    Number.isFinite(session.lastActivity) &&
    now - session.lastActivity < SESSION_TIMEOUT &&
    now >= session.lastActivity;

  if (!isValid) {
    session = {
      id: crypto.randomUUID(),
      visitorId: crypto.randomUUID(),
      lastActivity: now,
    };
  } else {
    session.lastActivity = now;
  }

  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );

  return session;
}

export default function AnalyticsTracker() {
  const { pathname } = useLocation();

  const lastTrackedRef = useRef("");

  useEffect(() => {
    if (!isCustomerPath(pathname)) {
      return;
    }

    try {
      // Respect visitors who previously declined
      // analytics under the older consent banner.
      const previousChoice = localStorage.getItem(
        LEGACY_CONSENT_KEY
      );

      if (previousChoice === "denied") {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(LEGACY_VISITOR_KEY);
        return;
      }

      // Remove the old persistent visitor identifier.
      // The new tracker uses sessionStorage only.
      localStorage.removeItem(LEGACY_VISITOR_KEY);

      const session = getSession();

      const trackingKey =
        `${session.id}:${pathname}`;

      // Prevent duplicate tracking caused by rerenders.
      if (lastTrackedRef.current === trackingKey) {
        return;
      }

      lastTrackedRef.current = trackingKey;

      const eventId = crypto.randomUUID();

      fetch(`${API_URL}/analytics/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorId: session.visitorId,
          sessionId: session.id,
          eventId,
          path: pathname,
        }),
        keepalive: true,
      }).catch((error) => {
        // Analytics should never interrupt shopping.
        console.warn(
          "Analytics tracking unavailable:",
          error.message
        );
      });
    } catch (error) {
      // Blocked storage or tracking should not
      // prevent the customer website from working.
      console.warn(
        "Analytics initialization unavailable:",
        error.message
      );
    }
  }, [pathname]);

  // Analytics runs without a visible popup.
  return null;
}
