
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(email.trim(), password);
      const destination = location.state?.from;
      navigate(
        typeof destination === "string" &&
          destination.startsWith("/admin") &&
          !destination.startsWith("/admin/login")
          ? destination
          : "/admin",
        { replace: true }
      );
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-900 text-white shadow-lg">
            <ShieldCheck size={30} />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            FlexiSole Management
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-brand-900">
            Admin Sign In
          </h1>

          <p className="mt-3 text-sm text-brand-700">
            Sign in to manage your FlexiSole store.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-brand-200 bg-white p-7 shadow-xl shadow-brand-900/5 sm:p-9"
        >
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="mb-5">
            <label
              htmlFor="admin-email"
              className="mb-2 block text-sm font-semibold text-brand-900"
            >
              Email address
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-brand-200 px-4 focus-within:border-brand-600">
              <Mail size={19} className="text-brand-600" />
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-transparent py-3.5 text-sm text-brand-900 outline-none"
              />
            </div>
          </div>

          <div className="mb-7">
            <label
              htmlFor="admin-password"
              className="mb-2 block text-sm font-semibold text-brand-900"
            >
              Password
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-brand-200 px-4 focus-within:border-brand-600">
              <LockKeyhole size={19} className="text-brand-600" />

              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-w-0 w-full bg-transparent py-3.5 text-sm text-brand-900 outline-none"
              />

              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="text-brand-600 hover:text-brand-900"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-full bg-brand-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In to Dashboard"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-brand-700">
          Authorized administrators only.
        </p>
      </div>
    </main>
  );
}
