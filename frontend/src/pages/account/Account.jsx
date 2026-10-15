import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LogOut, Package, ShieldCheck, Star, UserRound } from "lucide-react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";

export default function Account() {
  const navigate = useNavigate();
  const { customer, logout } = useCustomerAuth();
  const firstName = customer?.name?.trim().split(/\s+/)[0] || "Customer";
  function handleLogout() { logout(); navigate("/login", { replace: true }); }
  return (
    <section className="min-h-[70vh] bg-cream px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-600">FLEXISOLE ACCOUNT</p>
        <h1 className="mt-3 text-3xl font-semibold text-brand-900 sm:text-4xl">Welcome back, {firstName}!</h1>
        <p className="mt-2 text-sm text-brand-700">Your personal shopping space.</p>
        <div className="mt-8 overflow-hidden rounded-3xl border border-brand-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-4 border-b border-brand-200 p-6 sm:p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-900"><UserRound size={30}/></div>
            <div className="min-w-0"><h2 className="break-words text-xl font-semibold text-brand-900">{customer?.name}</h2>
            <p className="break-all text-sm text-brand-700">{customer?.email}</p>
            <p className="mt-2 flex items-center gap-2 text-xs text-brand-700"><ShieldCheck size={14}/> Customer account</p></div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            <Link to="/account/orders" className="rounded-2xl border border-brand-200 bg-brand-50 p-5 transition hover:border-brand-600">
              <Package size={27} className="text-brand-700"/><h3 className="mt-4 text-lg font-semibold text-brand-900">My Orders</h3>
              <p className="mt-2 text-sm leading-6 text-brand-700">Track order status and view your purchases.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-900">View Orders <ArrowRight size={16}/></span>
            </Link>
            <Link to="/account/reviews" className="rounded-2xl border border-brand-200 bg-brand-50 p-5 transition hover:border-brand-600">
              <Star size={27} className="text-brand-700"/><h3 className="mt-4 text-lg font-semibold text-brand-900">My Reviews</h3>
              <p className="mt-2 text-sm leading-6 text-brand-700">Read and edit your verified reviews for delivered products.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-900">View Reviews <ArrowRight size={16}/></span>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-brand-200 p-6 sm:px-8">
            <Link to="/shop" className="text-sm font-semibold text-brand-900 hover:text-brand-600">Continue shopping</Link>
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-5 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-50"><LogOut size={17}/> Sign Out</button>
          </div>
        </div>
      </div>
    </section>
  );
}
