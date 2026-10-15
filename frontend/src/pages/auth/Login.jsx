
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  Star,
  UserRound,
} from "lucide-react";
import {
  GoogleLogin,
  GoogleOAuthProvider,
} from "@react-oauth/google";

import { useCustomerAuth } from "../../context/CustomerAuthContext";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function LoginContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isAuthenticated,
    checkingSession,
    signingIn,
    loginWithGoogle,
  } = useCustomerAuth();

  const [error, setError] = useState("");

  const destination =
    typeof location.state?.from === "string" &&
    location.state.from.startsWith("/") &&
    !location.state.from.startsWith("//")
      ? location.state.from
      : "/account";

  async function handleGoogleSuccess(response) {
    setError("");

    if (!response.credential) {
      setError("Google did not return a sign-in credential.");
      return;
    }

    try {
      await loginWithGoogle(response.credential);

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.message || "Unable to sign in. Please try again."
      );
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-cream">
        <Loader2
          size={30}
          className="animate-spin text-brand-700"
        />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  return (
    <section className="flex min-h-[75vh] items-center justify-center bg-cream px-4 py-14 sm:px-6 sm:py-20">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-brand-900/10 bg-white shadow-xl shadow-brand-900/5">
        <div className="p-7 text-center sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
            <UserRound
              size={30}
              className="text-brand-900"
            />
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            YOUR FLEXISOLE ACCOUNT
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
            Welcome to FlexiSole
          </h1>

          <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-gray-500">
            Sign in or create your account for a more
            convenient shopping experience.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: "Track Orders", icon: ShoppingBag },
              { label: "Write Reviews", icon: Star },
              { label: "Secure Login", icon: ShieldCheck },
            ].map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Icon size={19} />
                </div>

                <span className="text-xs text-brand-700">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="my-8 border-t border-brand-900/10" />

          <h2 className="text-base font-semibold text-brand-900">
            Continue with Google
          </h2>

          <p className="mt-2 text-xs leading-6 text-gray-500">
            New here? Your customer account will be
            created automatically.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-left text-xs leading-5 text-red-700"
            >
              <AlertCircle
                size={17}
                className="shrink-0"
              />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 flex min-h-12 justify-center">
            {signingIn ? (
              <div className="flex items-center gap-3 text-sm text-brand-700">
                <Loader2 size={20} className="animate-spin" />
                Signing you in...
              </div>
            ) : !GOOGLE_CLIENT_ID ? (
              <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                Google Sign-In is not configured.
                Check your VITE_GOOGLE_CLIENT_ID.
              </p>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() =>
                  setError(
                    "Google Sign-In failed. Please try again."
                  )
                }
                theme="outline"
                size="large"
                shape="pill"
                text="continue_with"
                width="300"
              />
            )}
          </div>

          <p className="mt-7 text-xs leading-6 text-gray-500">
            Google Sign-In securely verifies your identity.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-flex text-sm font-semibold text-brand-900 hover:text-brand-600"
          >
            Continue shopping without signing in
          </Link>
        </div>

        <div className="border-t border-brand-900/10 bg-brand-50 px-6 py-4 text-center">
          <p className="text-xs text-brand-700">
            Returning customer? Sign in with the same
            Google account.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Login() {
  if (!GOOGLE_CLIENT_ID) {
    return <LoginContent />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
}
