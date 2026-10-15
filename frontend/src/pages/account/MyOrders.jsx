import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Package, RefreshCw } from "lucide-react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { fetchMyOrders } from "../../services/customerOrderService";

const money = (amount) => new Intl.NumberFormat("en-PH", {
  style: "currency", currency: "PHP",
}).format(Number(amount) || 0);

export default function MyOrders() {
  const { token } = useCustomerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError("");
    fetchMyOrders(token)
      .then((data) => { if (current) setOrders(data.orders || []); })
      .catch((err) => { if (current) setError(err.message); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [token, refreshKey]);

  return (
    <main className="min-h-[70vh] bg-cream px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/account" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900">
          <ArrowLeft size={17} /> My Account
        </Link>
        <div className="mt-7 mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">FLEXISOLE ACCOUNT</p>
            <h1 className="mt-2 text-3xl font-semibold text-brand-900">My Orders</h1>
            <p className="mt-2 text-sm text-brand-700">See the latest status of your purchases.</p>
          </div>
          <button onClick={() => setRefreshKey((n) => n + 1)} disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-900 disabled:opacity-50">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {loading ? <p className="rounded-2xl bg-white p-7 text-brand-700">Loading your orders...</p> :
          orders.length === 0 ? (
            <div className="rounded-3xl border border-brand-200 bg-white p-10 text-center">
              <Package className="mx-auto text-brand-600" size={40} />
              <h2 className="mt-4 text-xl font-semibold text-brand-900">No orders yet</h2>
              <p className="mt-2 text-sm text-brand-700">Your new orders will appear here after checkout.</p>
              <Link to="/shop" className="mt-6 inline-block rounded-full bg-brand-900 px-6 py-3 text-sm font-semibold text-white">Shop Now</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article key={order._id} className="rounded-3xl border border-brand-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Order Reference</p>
                      <p className="mt-1 break-all font-semibold text-brand-900">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-brand-700">{new Date(order.createdAt).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" })}</p>
                    </div>
                    <span className="rounded-full bg-brand-100 px-4 py-2 text-xs font-semibold text-brand-900">{order.status}</span>
                  </div>
                  <div className="mt-5 space-y-3 border-y border-brand-100 py-4">
                    {order.items.map((item, i) => (
                      <div key={`${item.productId}-${item.variantId}-${item.size}-${i}`} className="flex items-center gap-4">
                        {item.image ? <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <Package size={22} className="text-brand-500" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-brand-900">{item.name}</p>
                          <p className="text-xs text-brand-700">{item.color} · Size {item.size} · Qty {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-brand-900">{money(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
                    <span className="text-brand-700">Subtotal (shipping not included)</span>
                    <strong className="text-brand-900">{money(order.subtotal)}</strong>
                  </div>
                  <p className="mt-2 text-xs text-brand-700">Payment: {order.paymentMethod} · {order.paymentStatus}</p>
                </article>
              ))}
            </div>
          )}
      </div>
    </main>
  );
}
