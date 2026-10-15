
import { useEffect, useRef, useState } from "react";
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
const LOCATION_CHOICE_KEY = "flexisole_location_choice";

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

function canTrack() {
  try {
    return (
      localStorage.getItem(LEGACY_CONSENT_KEY) !==
      "denied"
    );
  } catch {
    return false;
  }
}

export default function AnalyticsTracker() {
  const { pathname } = useLocation();

  const lastTrackedRef = useRef("");

  const [showLocationPrompt, setShowLocationPrompt] =
    useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  useEffect(() => {
    if (!isCustomerPath(pathname)) {
      setShowLocationPrompt(false);
      return;
    }

    if (!canTrack()) {
      try {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(LEGACY_VISITOR_KEY);
      } catch {
        // Ignore unavailable browser storage.
      }

      setShowLocationPrompt(false);
      return;
    }

    try {
      localStorage.removeItem(LEGACY_VISITOR_KEY);

      const session = getSession();

      const trackingKey =
        `${session.id}:${pathname}`;

      if (lastTrackedRef.current !== trackingKey) {
        lastTrackedRef.current = trackingKey;

        fetch(`${API_URL}/analytics/track`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            visitorId: session.visitorId,
            sessionId: session.id,
            eventId: crypto.randomUUID(),
            path: pathname,
          }),
          keepalive: true,
        }).catch((error) => {
          console.warn(
            "Analytics tracking unavailable:",
            error.message
          );
        });
      }

      const previousLocationChoice =
        localStorage.getItem(LOCATION_CHOICE_KEY);

      setShowLocationPrompt(
        previousLocationChoice !== "shared" &&
        previousLocationChoice !== "declined"
      );
    } catch (error) {
      console.warn(
        "Analytics initialization unavailable:",
        error.message
      );
    }
  }, [pathname]);

  function declineLocation() {
    try {
      localStorage.setItem(
        LOCATION_CHOICE_KEY,
        "declined"
      );
    } catch {
      // Dismiss even if storage is blocked.
    }

    setShowLocationPrompt(false);
  }

  async function sendApproximateLocation(position) {
    const latitude =
      position.coords.latitude;

    const longitude =
      position.coords.longitude;

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      throw new Error("Invalid location coordinates.");
    }

    // Round locally to approximately 11 km
    // of latitude resolution. Exact GPS
    // coordinates are not sent to the backend.
    const lat =
      Math.round(latitude * 10) / 10;

    const lng =
      Math.round(longitude * 10) / 10;

    const session = getSession();

    const response = await fetch(
      `${API_URL}/analytics/track`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorId: session.visitorId,
          sessionId: session.id,
          locationOnly: true,
          location: {
            lat,
            lng,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Unable to save approximate location."
      );
    }

    return response.json();
  }

  function shareLocation() {
    if (!navigator.geolocation) {
      setLocationError(
        "Your browser does not support location sharing."
      );
      return;
    }

    if (!canTrack()) {
      setShowLocationPrompt(false);
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await sendApproximateLocation(position);

          localStorage.setItem(
            LOCATION_CHOICE_KEY,
            "shared"
          );

          setShowLocationPrompt(false);
        } catch (error) {
          setLocationError(
            error.message ||
              "Unable to save location."
          );
        } finally {
          setLocationLoading(false);
        }
      },

      (error) => {
        setLocationLoading(false);

        if (error.code === 1) {
          setLocationError(
            "Location permission was denied."
          );
        } else if (error.code === 2) {
          setLocationError(
            "Your location is currently unavailable."
          );
        } else {
          setLocationError(
            "Location request timed out. Try again."
          );
        }
      },

      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  }

  if (
    !isCustomerPath(pathname) ||
    !showLocationPrompt
  ) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-xl"
      role="region"
      aria-label="Optional location sharing"
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="text-xl"
          aria-hidden="true"
        >
          📍
        </span>

        <h3 className="text-base font-semibold text-gray-900">
          Share your location?
        </h3>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-gray-600">
        Help us see which areas our visitors
        come from. We only save an approximate
        location for our visitor map, not your
        exact GPS coordinates.
      </p>

      {locationError && (
        <p
          className="mb-3 text-sm text-red-600"
          role="alert"
        >
          {locationError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={declineLocation}
          disabled={locationLoading}
          className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
        >
          No thanks
        </button>

        <button
          type="button"
          onClick={shareLocation}
          disabled={locationLoading}
          className="flex-1 rounded-xl bg-gray-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          {locationLoading
            ? "Locating..."
            : "Share location"}
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-gray-500">
        Optional. Shopping works without
        sharing your location.
      </p>
    </div>
  );
}
