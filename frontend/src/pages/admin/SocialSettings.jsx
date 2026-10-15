
import { useCallback, useEffect, useState } from "react";
import {
  Facebook,
  Instagram,
  Music2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "/api")
).replace(/\/$/, "");

const initialLinks = {
  facebook: "",
  instagram: "",
  tiktok: "",
};

const fields = [
  {
    name: "facebook",
    label: "Facebook",
    icon: Facebook,
    placeholder: "https://www.facebook.com/yourpage",
  },
  {
    name: "instagram",
    label: "Instagram",
    icon: Instagram,
    placeholder: "https://www.instagram.com/yourprofile",
  },
  {
    name: "tiktok",
    label: "TikTok",
    icon: Music2,
    placeholder: "https://www.tiktok.com/@yourprofile",
  },
];

export default function SocialSettings() {
  const { token } = useAuth();

  const [links, setLinks] = useState(initialLinks);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Administrator session is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/admin/settings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load settings."
        );
      }

      setLinks({
        facebook: data.socialLinks?.facebook || "",
        instagram: data.socialLinks?.instagram || "",
        tiktok: data.socialLinks?.tiktok || "",
      });
    } catch (err) {
      setError(
        err.message || "Unable to load social media settings."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  function handleChange(event) {
    const { name, value } = event.target;

    setLinks((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!token || saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/admin/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            socialLinks: links,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save settings."
        );
      }

      setLinks({
        facebook: data.socialLinks?.facebook || "",
        instagram: data.socialLinks?.instagram || "",
        tiktok: data.socialLinks?.tiktok || "",
      });

      setSuccess("Social media links saved successfully.");
    } catch (err) {
      setError(
        err.message || "Unable to save social media settings."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-12">
      {/* HEADER */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
          ADMIN SETTINGS
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
          Social Media Settings
        </h1>

        <p className="mt-3 text-sm leading-7 text-brand-700">
          Manage your FlexiSole social media links.
          Changes are saved to the database and appear
          in the customer website footer.
        </p>
      </div>

      {/* SETTINGS FORM */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-3xl border border-brand-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <h2 className="text-xl font-semibold text-brand-900">
          Social Accounts
        </h2>

        <p className="mt-2 text-sm text-brand-700">
          Paste the full HTTPS profile or page URL.
          Leave a field empty to hide that icon.
        </p>

        <div className="mt-8 space-y-7">
          {fields.map(
            ({ name, label, icon: Icon, placeholder }) => (
              <div key={name}>
                <label
                  htmlFor={`social-${name}`}
                  className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-900"
                >
                  <Icon
                    size={19}
                    className="text-brand-600"
                  />
                  {label}
                </label>

                <div className="flex items-center gap-2">
                  <input
                    id={`social-${name}`}
                    type="url"
                    name={name}
                    placeholder={placeholder}
                    value={links[name]}
                    onChange={handleChange}
                    maxLength={500}
                    disabled={loading || saving}
                    className="min-w-0 flex-1 rounded-xl border border-brand-200 bg-white px-4 py-3.5 text-sm text-brand-900 outline-none transition focus:border-brand-600 disabled:opacity-60"
                  />

                  {links[name] && (
                    <a
                      href={links[name]}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Preview ${label} link`}
                      aria-label={`Open ${label} link`}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-200 text-brand-700 hover:bg-brand-50"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-7 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle
              size={19}
              className="shrink-0"
            />
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-7 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        <div className="mt-9 flex flex-wrap items-center gap-4 border-t border-brand-200 pt-7">
          <button
            type="submit"
            disabled={loading || saving || !token}
            className="inline-flex items-center gap-3 rounded-full bg-brand-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Save size={18} />
            )}

            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={loadSettings}
            disabled={loading || saving}
            className="rounded-full border border-brand-200 px-6 py-3.5 text-sm font-semibold text-brand-900 hover:bg-brand-50 disabled:opacity-50"
          >
            Reload Settings
          </button>
        </div>
      </form>
    </div>
  );
}
