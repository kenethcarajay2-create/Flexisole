
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Package,
  ShoppingBag,
  Palette,
  ShieldCheck,
  Users,
  Eye,
  CalendarDays,
  Activity,
  RefreshCw,
  Loader2,
  AlertCircle,
  MousePointerClick,
  MapPinned,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getAnalyticsOverview } from "../../services/analyticsService";
import VisitorMapModal from "../../components/admin/VisitorMapModal";

const sections = [
  {
    title: "Products",
    description:
      "Create sandal styles, update details, and control which products appear in the shop.",
    icon: Package,
    path: "/admin/products",
  },
  {
    title: "Colors & Variants",
    description:
      "Manage product colors, Cloudinary images, available sizes, and inventory.",
    icon: Palette,
    path: "/admin/products",
  },
  {
    title: "Customer Orders",
    description:
      "View incoming orders and manage their fulfillment status.",
    icon: ShoppingBag,
    path: "/admin/orders",
  },
];

const metrics = [
  {
    label: "Unique Visitors",
    field: "uniqueVisitors",
    icon: Users,
    description: "Estimated distinct browsers",
    clickable: true,
  },
  {
    label: "Total Visits",
    field: "totalVisits",
    icon: MousePointerClick,
    description: "Browsing sessions",
    clickable: true,
  },
  {
    label: "Page Views",
    field: "totalPageViews",
    icon: Eye,
    description: "Customer pages opened",
    clickable: false,
  },
  {
    label: "Visits Today",
    field: "visitsToday",
    icon: CalendarDays,
    description: "Today, Philippine time",
    clickable: true,
  },
  {
    label: "Active Visitors",
    field: "activeVisitors",
    icon: Activity,
    description: "Active within 5 minutes",
    clickable: false,
  },
];

const numberFormat = new Intl.NumberFormat("en-PH");

export default function Dashboard() {
  const { admin, token } = useAuth();

  const [overview, setOverview] = useState(null);
  const [dailyViews, setDailyViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapOpen, setMapOpen] = useState(false);

  const loadAnalytics = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getAnalyticsOverview(token);
      setOverview(data.overview || null);
      setDailyViews(data.last7Days || []);
    } catch (err) {
      setError(
        err.message || "Unable to load website analytics."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const maxViews = Math.max(
    1,
    ...dailyViews.map((item) => item.views)
  );

  return (
    <div className="min-w-0 pb-12">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
          ADMIN DASHBOARD
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
          Welcome, {admin?.name || "Administrator"}
        </h1>

        <p className="mt-3 text-sm leading-7 text-brand-700">
          Manage your FlexiSole store and view website traffic.
        </p>
      </div>

      <section className="mb-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-brand-900 sm:text-2xl">
              Website Analytics
            </h2>

            <p className="mt-1 text-xs text-brand-700">
              Anonymous, consent-based customer traffic
            </p>
          </div>

          <button
            type="button"
            onClick={loadAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-900 hover:bg-brand-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle
              size={18}
              className="shrink-0"
            />
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const value = overview?.[metric.field];

            const cardContent = (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <Icon size={21} />
                  </div>

                  {metric.clickable && (
                    <MapPinned
                      size={19}
                      className="text-brand-600"
                    />
                  )}
                </div>

                <p className="mt-5 text-3xl font-semibold tracking-tight text-brand-900">
                  {loading ? (
                    <Loader2
                      size={25}
                      className="animate-spin text-brand-600"
                    />
                  ) : value == null ? (
                    "—"
                  ) : (
                    numberFormat.format(value)
                  )}
                </p>

                <h3 className="mt-2 text-sm font-semibold text-brand-900">
                  {metric.label}
                </h3>

                <p className="mt-1 text-xs text-brand-700">
                  {metric.description}
                </p>

                {metric.clickable && (
                  <p className="mt-3 text-xs font-semibold text-brand-600">
                    View Philippines map →
                  </p>
                )}
              </>
            );

            if (metric.clickable) {
              return (
                <button
                  key={metric.field}
                  type="button"
                  onClick={() => setMapOpen(true)}
                  className="rounded-2xl border border-brand-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-600 hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand-700"
                >
                  {cardContent}
                </button>
              );
            }

            return (
              <div
                key={metric.field}
                className="rounded-2xl border border-brand-200 bg-white p-5 shadow-sm"
              >
                {cardContent}
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-3xl border border-brand-200 bg-white p-5 shadow-sm sm:p-7">
          <h3 className="text-lg font-semibold text-brand-900">
            Page Views — Last 7 Days
          </h3>

          <p className="mt-2 text-xs text-brand-700">
            Daily page views, Philippine time
          </p>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2
                size={27}
                className="animate-spin text-brand-600"
              />
            </div>
          ) : dailyViews.length > 0 ? (
            <div className="mt-8 grid h-52 grid-cols-7 items-end gap-2 sm:gap-4">
              {dailyViews.map((day) => {
                const height = Math.max(
                  3,
                  (day.views / maxViews) * 100
                );

                return (
                  <div
                    key={day.date}
                    className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
                  >
                    <span className="text-xs font-semibold text-brand-900">
                      {day.views}
                    </span>

                    <div className="flex h-36 w-full items-end justify-center">
                      <div
                        style={{ height: `${height}%` }}
                        className="w-full max-w-12 rounded-t-lg bg-brand-600"
                      />
                    </div>

                    <span className="text-center text-[10px] text-brand-700 sm:text-xs">
                      {new Date(
                        `${day.date}T12:00:00`
                      ).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-8 text-sm text-brand-700">
              No traffic recorded yet.
            </p>
          )}
        </div>
      </section>

      <div className="mb-8 flex items-start gap-3 rounded-2xl border border-brand-200 bg-white p-5">
        <ShieldCheck
          size={23}
          className="mt-0.5 shrink-0 text-brand-700"
        />

        <div>
          <h2 className="font-semibold text-brand-900">
            Admin access enabled
          </h2>

          <p className="mt-1 text-sm leading-6 text-brand-700">
            Your product management, order management,
            and website analytics tools are available.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sections.map(
          ({ title, description, icon: Icon, path }) => (
            <div
              key={title}
              className="rounded-3xl border border-brand-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                <Icon size={26} />
              </div>

              <h2 className="text-lg font-semibold text-brand-900">
                {title}
              </h2>

              <p className="mt-3 min-h-20 text-sm leading-7 text-brand-700">
                {description}
              </p>

              <Link
                to={path}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-900 hover:text-brand-600"
              >
                Open section
                <ArrowUpRight size={18} />
              </Link>
            </div>
          )
        )}
      </div>

      <VisitorMapModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
      />
    </div>
  );
}
