
import { useEffect, useRef, useState } from "react";
import {
  X,
  MapPin,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

import L from "leaflet";
import "leaflet.markercluster";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import { useAuth } from "../../context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "/api")
).replace(/\/$/, "");

const GEOJSON_URL = "/geo/philippines-provinces.geojson";

const PH_BOUNDS = L.latLngBounds(
  [4.3, 116],
  [21.5, 127.5]
);

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "all", label: "All Time" },
];

const MAP_COLORS = {
  background: "#f5f5f5",
  land: "#d8d8d8",
  landHover: "#c7c7c7",
  border: "#ffffff",
  marker: "#454545",
  cluster: "#555555",
};

const numberFormat = new Intl.NumberFormat("en-PH");

function createDotIcon(visits) {
  const label =
    visits > 999 ? "999+" : String(visits);

  return L.divIcon({
    className: "flexisole-visitor-dot",
    html: `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:34px;
        height:34px;
        border-radius:50%;
        background:${MAP_COLORS.marker};
        border:3px solid white;
        color:white;
        font-size:11px;
        font-weight:700;
        box-shadow:0 3px 10px rgba(0,0,0,.2);
      ">
        ${label}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function createClusterIcon(cluster) {
  const totalVisits = cluster
    .getAllChildMarkers()
    .reduce(
      (total, marker) =>
        total + (marker.options.visitCount || 0),
      0
    );

  const size =
    totalVisits >= 100 ? 58 :
    totalVisits >= 20 ? 52 : 46;

  const label =
    totalVisits > 9999
      ? "9.9k+"
      : numberFormat.format(totalVisits);

  return L.divIcon({
    className: "flexisole-visitor-cluster",
    html: `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:${MAP_COLORS.cluster};
        border:4px solid white;
        box-shadow:0 3px 14px rgba(0,0,0,.23);
        color:white;
        font-weight:700;
        font-size:13px;
      ">
        ${label}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function getProvinceName(feature) {
  const properties = feature?.properties || {};

  return (
    properties.name ||
    properties.NAME_2 ||
    properties.ADM2_EN ||
    properties.province ||
    properties.PROVINCE ||
    "Philippines"
  );
}

export default function VisitorMapModal({
  open,
  onClose,
}) {
  const { token } = useAuth();

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const clustersRef = useRef(null);
  const provincesRef = useRef(null);

  const [period, setPeriod] = useState("7d");
  const [locations, setLocations] = useState([]);
  const [mappedVisits, setMappedVisits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapError, setMapError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // CLOSE MODAL WITH ESCAPE AND LOCK BODY SCROLL
  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, onClose]);

  // INITIALIZE PHILIPPINES-ONLY MAP
  useEffect(() => {
    if (!open || !mapContainerRef.current) {
      return;
    }

    let cancelled = false;
    const geoController = new AbortController();

    setMapLoading(true);
    setMapError("");

    const map = L.map(mapContainerRef.current, {
      center: [12.7, 122.5],
      zoom: 6,
      minZoom: 5,
      maxZoom: 15,
      maxBounds: PH_BOUNDS,
      maxBoundsViscosity: 1,
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      attributionControl: false,
      preferCanvas: true,
    });

    mapRef.current = map;

    // No OpenStreetMap tile layer:
    // Only Philippine boundaries will be drawn.

    L.control.zoom({
      position: "bottomright",
    }).addTo(map);

    // CLUSTER LAYER
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: false,
      disableClusteringAtZoom: 13,
      maxClusterRadius: 55,
      animate: true,
      iconCreateFunction: createClusterIcon,
    });

    clusterGroup.addTo(map);
    clustersRef.current = clusterGroup;

    // PHILIPPINES PROVINCE BOUNDARIES
    async function loadPhilippines() {
      try {
        const response = await fetch(
          GEOJSON_URL,
          { signal: geoController.signal }
        );

        if (!response.ok) {
          throw new Error(
            `Boundary file not found (HTTP ${response.status}).`
          );
        }

        const geojson = await response.json();

        if (
          !geojson ||
          !["FeatureCollection", "Feature"].includes(
            geojson.type
          )
        ) {
          throw new Error(
            "The Philippines boundary file is invalid."
          );
        }

        if (cancelled) return;

        const provinceLayer = L.geoJSON(geojson, {
          style: {
            fillColor: MAP_COLORS.land,
            fillOpacity: 1,
            color: MAP_COLORS.border,
            weight: 1,
            opacity: 1,
          },

          onEachFeature(feature, layer) {
            const provinceName =
              getProvinceName(feature);

            layer.bindTooltip(provinceName, {
              sticky: true,
              direction: "top",
              opacity: 0.95,
            });

            layer.on({
              mouseover(event) {
                event.target.setStyle({
                  fillColor: MAP_COLORS.landHover,
                  weight: 1.5,
                  color: "#888888",
                });
              },

              mouseout(event) {
                provinceLayer.resetStyle(
                  event.target
                );
              },
            });
          },
        });

        provinceLayer.addTo(map);
        provinceLayer.bringToBack();

        provincesRef.current = provinceLayer;

        const bounds = provinceLayer.getBounds();

        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [28, 28],
            maxZoom: 7,
            animate: false,
          });
        }

        clusterGroup.bringToFront();
      } catch (err) {
        if (
          !cancelled &&
          err.name !== "AbortError"
        ) {
          setMapError(
            "Unable to load the Philippines boundaries. " +
            err.message
          );
        }
      } finally {
        if (!cancelled) {
          setMapLoading(false);
        }
      }
    }

    loadPhilippines();

    const frame = requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => {
      cancelled = true;
      geoController.abort();

      cancelAnimationFrame(frame);

      clusterGroup.clearLayers();
      map.remove();

      mapRef.current = null;
      clustersRef.current = null;
      provincesRef.current = null;
    };
  }, [open]);

  // LOAD VISITOR DATA
  useEffect(() => {
    if (!open || !token) return;

    const controller = new AbortController();

    async function loadLocations() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/admin/analytics/locations?period=${period}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
            "Failed to load visitor locations."
          );
        }

        if (controller.signal.aborted) return;

        setLocations(
          Array.isArray(data.locations)
            ? data.locations
            : []
        );

        setMappedVisits(
          Number(data.totalMappedVisits) || 0
        );
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err.message ||
            "Unable to retrieve visitor locations."
          );

          setLocations([]);
          setMappedVisits(0);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadLocations();

    return () => controller.abort();
  }, [open, token, period, refreshKey]);

  // DRAW VISITOR MARKERS ON TOP OF PROVINCES
  useEffect(() => {
    if (!open || !clustersRef.current) return;

    const clusterGroup = clustersRef.current;

    clusterGroup.clearLayers();

    for (const location of locations) {
      const lat = Number(location.lat);
      const lng = Number(location.lng);
      const visits = Number(location.visits) || 0;

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        visits <= 0 ||
        !PH_BOUNDS.contains([lat, lng])
      ) {
        continue;
      }

      const marker = L.marker(
        [lat, lng],
        {
          icon: createDotIcon(visits),
          visitCount: visits,
          keyboard: true,
        }
      );

      const city =
        location.city || "Unknown city";

      const region =
        location.region || "Philippines";

      const visitors =
        Number(location.visitors) || 0;

      // DOM-based popup avoids inserting
      // untrusted city names as HTML.
      const popup = document.createElement("div");

      const title = document.createElement("strong");
      title.textContent = city;

      const subtitle = document.createElement("p");
      subtitle.textContent = region;

      const counts = document.createElement("p");
      counts.textContent =
        `${numberFormat.format(visits)} visits · ` +
        `${numberFormat.format(visitors)} visitors`;

      subtitle.style.margin = "5px 0";
      counts.style.margin = "5px 0 0";

      popup.append(
        title,
        subtitle,
        counts
      );

      marker.bindPopup(popup, {
        maxWidth: 250,
      });

      clusterGroup.addLayer(marker);
    }
  }, [open, locations]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-2 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="visitor-map-title"
        className="flex h-[93vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-[89vh] sm:rounded-3xl"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.17em] text-gray-500">
              FLEXISOLE ANALYTICS
            </p>

            <h2
              id="visitor-map-title"
              className="flex items-center gap-2 text-xl font-semibold text-gray-900 sm:text-2xl"
            >
              <MapPin size={22} />
              Visitor Map
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Philippines · Approximate locations
            </p>
          </div>

          <button
            type="button"
            aria-label="Close visitor map"
            onClick={onClose}
            className="rounded-full p-2 text-gray-700 transition hover:bg-gray-100"
          >
            <X size={23} />
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-7">
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setPeriod(item.value)}
                aria-pressed={period === item.value}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  period === item.value
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setRefreshKey((value) => value + 1)
            }
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-40"
          >
            <RefreshCw
              size={16}
              className={
                loading ? "animate-spin" : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* MAP */}
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[#f5f5f5]">
          <div
            ref={mapContainerRef}
            className="h-full w-full bg-[#f5f5f5]"
            aria-label="Gray interactive map of the Philippines with visitor clusters"
          />

          {(loading || mapLoading) && (
            <div className="pointer-events-none absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-700 shadow-sm">
              <Loader2
                size={16}
                className="animate-spin"
              />

              {mapLoading
                ? "Loading Philippines map..."
                : "Loading visitor locations..."}
            </div>
          )}

          {mapError && (
            <div
              role="alert"
              className="absolute bottom-4 left-4 right-4 z-[500] rounded-xl border border-red-200 bg-white p-4 text-xs text-red-700 shadow-md"
            >
              <div className="flex items-start gap-2">
                <AlertCircle
                  size={18}
                  className="shrink-0"
                />
                <span>{mapError}</span>
              </div>
            </div>
          )}

          {error && !mapError && (
            <div
              role="alert"
              className="absolute bottom-4 left-4 right-4 z-[500] rounded-xl border border-red-200 bg-white p-4 text-xs text-red-700 shadow-md"
            >
              <div className="flex items-start gap-2">
                <AlertCircle
                  size={18}
                  className="shrink-0"
                />
                <span>{error}</span>
              </div>
            </div>
          )}

          {!loading &&
            !error &&
            !mapError &&
            locations.length === 0 && (
              <div className="pointer-events-none absolute bottom-5 left-4 right-4 z-[500] mx-auto max-w-md rounded-xl border border-gray-200 bg-white/95 px-4 py-3 text-center shadow-sm">
                <p className="text-xs font-semibold text-gray-800">
                  No mapped visitors yet
                </p>

                <p className="mt-1 text-[11px] leading-5 text-gray-500">
                  Philippine locations will appear here
                  when eligible visits are recorded.
                </p>
              </div>
            )}
        </div>

        {/* FOOTER */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {numberFormat.format(mappedVisits)}
              <span className="ml-2 text-xs font-normal text-gray-500">
                Mapped Visits
              </span>
            </p>

            <p className="mt-1 text-[11px] text-gray-500">
              Philippines only · City-level estimates
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-medium text-gray-700">
              Zoom in to explore locations
            </p>

            <p className="mt-1 text-[11px] text-gray-500">
              Numbered circles represent visits
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
