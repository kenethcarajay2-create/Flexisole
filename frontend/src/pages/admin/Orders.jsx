
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Loader2,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "../../services/orderService";

const statuses = [
  "All",
  "Pending",
  "Accepted",
  "Preparing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const nextStatuses = {
  Pending: ["Accepted", "Cancelled"],
  Accepted: ["Preparing", "Cancelled"],
  Preparing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

const statusClasses = {
  Pending: "bg-amber-50 text-amber-800 border-amber-200",
  Accepted: "bg-blue-50 text-blue-800 border-blue-200",
  Preparing: "bg-violet-50 text-violet-800 border-violet-200",
  Shipped: "bg-indigo-50 text-indigo-800 border-indigo-200",
  Delivered: "bg-green-50 text-green-800 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

function formatPrice(price) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(price) || 0);
}

function formatDate(date) {
  if (!date) return "—";

  const value = new Date(date);

  return Number.isNaN(value.getTime())
    ? "—"
    : value.toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${
        statusClasses[status] ||
        "border-brand-200 bg-brand-50 text-brand-800"
      }`}
    >
      {status}
    </span>
  );
}

function OrderDetails({
  order,
  onClose,
  onUpdate,
  updating,
}) {
  const availableActions = nextStatuses[order.status] || [];
  const customer = order.customer || {};

  function handleStatusChange(newStatus) {
    const message =
      newStatus === "Cancelled"
        ? "Cancel this order? Its reserved stock will be restored."
        : `Change order status to ${newStatus}?`;

    if (window.confirm(message)) {
      onUpdate(order._id, newStatus);
    }
  }

  return (
    <div className="rounded-3xl border border-brand-200 bg-white p-5 shadow-sm sm:p-7">
      <button
        type="button"
        onClick={onClose}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900"
      >
        <ArrowLeft size={17} />
        Back to Orders
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-100 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
            ORDER DETAILS
          </p>

          <h2 className="mt-2 break-all text-xl font-semibold text-brand-900 sm:text-2xl">
            {order.orderNumber}
          </h2>

          <p className="mt-2 text-xs text-brand-700">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>

        <StatusBadge status={order.status} />
      </div>

      <div className="mt-7 grid gap-7 xl:grid-cols-2">
        {/* CUSTOMER DETAILS */}
        <section>
          <h3 className="text-base font-semibold text-brand-900">
            Customer Information
          </h3>

          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-brand-600">Full Name</dt>
              <dd className="mt-1 font-medium text-brand-900">
                {customer.fullName || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-brand-600">Phone</dt>
              <dd className="mt-1 text-brand-900">
                {customer.phone || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-brand-600">Email</dt>
              <dd className="mt-1 break-all text-brand-900">
                {customer.email || "Not provided"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-brand-600">
                Delivery Address
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-brand-900">
                {[
                  customer.address,
                  customer.city,
                  customer.province,
                  customer.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </dd>
            </div>

            {customer.notes && (
              <div>
                <dt className="text-xs text-brand-600">
                  Delivery Notes
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-brand-900">
                  {customer.notes}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* PAYMENT DETAILS */}
        <section>
          <h3 className="text-base font-semibold text-brand-900">
            Payment & Summary
          </h3>

          <div className="mt-4 space-y-4 rounded-2xl bg-brand-50 p-5 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-brand-700">Payment Method</span>
              <span className="font-semibold text-brand-900">
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : order.paymentMethod}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-brand-700">Payment Status</span>
              <span className="font-semibold text-brand-900">
                {order.paymentStatus}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-brand-700">Subtotal</span>
              <span className="font-semibold text-brand-900">
                {formatPrice(order.subtotal)}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-brand-700">Shipping</span>
              <span className="font-medium text-brand-900">
                {order.shippingFee == null
                  ? "To be confirmed"
                  : formatPrice(order.shippingFee)}
              </span>
            </div>

            {order.shippingFee != null && (
              <div className="flex justify-between gap-3 border-t border-brand-200 pt-4">
                <span className="font-semibold text-brand-900">
                  Total
                </span>
                <span className="text-lg font-semibold text-brand-900">
                  {formatPrice(
                    order.subtotal + order.shippingFee
                  )}
                </span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ORDERED PRODUCTS */}
      <section className="mt-8 border-t border-brand-100 pt-7">
        <h3 className="text-base font-semibold text-brand-900">
          Ordered Products
        </h3>

        <div className="mt-4 divide-y divide-brand-100 rounded-2xl border border-brand-100">
          {(order.items || []).map((item, index) => (
            <div
              key={`${item.variantId}-${item.size}-${index}`}
              className="flex flex-wrap items-center gap-4 p-4"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F7F1EA]">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package size={25} className="text-brand-600" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-900">
                  {item.name}
                </p>

                <p className="mt-1 text-xs text-brand-700">
                  {item.color} · Size {item.size}
                </p>

                <p className="mt-1 text-xs text-brand-700">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>

              <p className="font-semibold text-brand-900">
                {formatPrice(item.subtotal)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* STATUS MANAGEMENT */}
      <section className="mt-8 border-t border-brand-100 pt-7">
        <h3 className="text-base font-semibold text-brand-900">
          Manage Order
        </h3>

        <p className="mt-2 text-sm leading-6 text-brand-700">
          Current status: <strong>{order.status}</strong>
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {availableActions.map((status) => {
            const isCancel = status === "Cancelled";

            return (
              <button
                key={status}
                type="button"
                disabled={updating}
                onClick={() => handleStatusChange(status)}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isCancel
                    ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "bg-brand-900 text-white hover:bg-brand-800"
                }`}
              >
                {updating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isCancel ? (
                  <X size={16} />
                ) : (
                  <Check size={16} />
                )}

                {isCancel ? "Cancel Order" : `Mark as ${status}`}
              </button>
            );
          })}
        </div>

        {availableActions.length === 0 && (
          <p className="mt-4 text-sm text-brand-700">
            This order has reached a final status.
          </p>
        )}

        {order.status === "Shipped" && (
          <p className="mt-4 text-xs text-brand-700">
            Shipped orders cannot be cancelled using this workflow.
          </p>
        )}
      </section>
    </div>
  );
}

export default function Orders() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeStatus, setActiveStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadOrders = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const data = await getAdminOrders(token);
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const selectedOrder = orders.find(
    (order) => order._id === selectedId
  );

  const filteredOrders = useMemo(() => {
    if (activeStatus === "All") return orders;

    return orders.filter(
      (order) => order.status === activeStatus
    );
  }, [orders, activeStatus]);

  const pendingCount = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const completedCount = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  async function handleUpdate(id, status) {
    if (!token || updating) return;

    setUpdating(true);
    setError("");
    setMessage("");

    try {
      const data = await updateAdminOrderStatus(
        id,
        status,
        token
      );

      setOrders((previous) =>
        previous.map((order) =>
          order._id === id ? data.order : order
        )
      );

      setMessage(
        data.message || "Order status updated successfully."
      );
    } catch (err) {
      setError(err.message || "Unable to update order.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="min-w-0">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            FLEXISOLE ADMIN
          </p>

          <h1 className="text-3xl font-semibold text-brand-900">
            Customer Orders
          </h1>

          <p className="mt-3 text-sm text-brand-700">
            Review purchases and manage fulfillment.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loading || updating}
          className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* OVERVIEW */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-200 bg-white p-5">
          <ShoppingBag size={22} className="text-brand-600" />
          <p className="mt-4 text-3xl font-semibold text-brand-900">
            {orders.length}
          </p>
          <p className="mt-1 text-xs text-brand-700">
            Recent Orders
          </p>
        </div>

        <div className="rounded-2xl border border-brand-200 bg-white p-5">
          <Clock3 size={22} className="text-amber-600" />
          <p className="mt-4 text-3xl font-semibold text-brand-900">
            {pendingCount}
          </p>
          <p className="mt-1 text-xs text-brand-700">
            Pending Orders
          </p>
        </div>

        <div className="rounded-2xl border border-brand-200 bg-white p-5">
          <Truck size={22} className="text-brand-600" />
          <p className="mt-4 text-3xl font-semibold text-brand-900">
            {completedCount}
          </p>
          <p className="mt-1 text-xs text-brand-700">
            Delivered Orders
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="shrink-0" />
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900"
        >
          <Check size={19} className="shrink-0 text-brand-600" />
          {message}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="mt-8 flex min-h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-brand-200 bg-white">
          <Loader2
            size={32}
            className="animate-spin text-brand-600"
          />
          <p className="text-sm text-brand-700">
            Loading customer orders...
          </p>
        </div>
      ) : selectedOrder ? (
        <div className="mt-8">
          <OrderDetails
            order={selectedOrder}
            onClose={() => setSelectedId(null)}
            onUpdate={handleUpdate}
            updating={updating}
          />
        </div>
      ) : (
        <>
          {/* FILTERS */}
          <div className="mt-8 flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setActiveStatus(status)}
                aria-pressed={activeStatus === status}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  activeStatus === status
                    ? "border-brand-900 bg-brand-900 text-white"
                    : "border-brand-200 bg-white text-brand-900 hover:bg-brand-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* ORDERS TABLE */}
          <div className="mt-6 overflow-hidden rounded-3xl border border-brand-200 bg-white">
            {filteredOrders.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <ShoppingBag
                  size={38}
                  className="mx-auto text-brand-600"
                />

                <h2 className="mt-5 text-xl font-semibold text-brand-900">
                  No orders found
                </h2>

                <p className="mt-3 text-sm text-brand-700">
                  {activeStatus === "All"
                    ? "Customer orders will appear here after checkout."
                    : `There are no ${activeStatus.toLowerCase()} orders.`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-brand-50">
                    <tr className="text-xs uppercase tracking-wider text-brand-700">
                      <th className="px-5 py-4 font-semibold">
                        Order
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Customer
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Date
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Subtotal
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Status
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Details
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-brand-100">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-brand-50/60"
                      >
                        <td className="px-5 py-5">
                          <p className="max-w-[180px] break-all font-semibold text-brand-900">
                            {order.orderNumber}
                          </p>

                          <p className="mt-1 text-xs text-brand-600">
                            {order.items?.length || 0} line items
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-medium text-brand-900">
                            {order.customer?.fullName || "Unknown"}
                          </p>
                          <p className="mt-1 text-xs text-brand-700">
                            {order.customer?.city || ""}
                          </p>
                        </td>

                        <td className="px-5 py-5 text-xs text-brand-700">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="px-5 py-5 font-semibold text-brand-900">
                          {formatPrice(order.subtotal)}
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge status={order.status} />
                        </td>

                        <td className="px-5 py-5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(order._id);
                              setMessage("");
                              setError("");
                            }}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-900 hover:text-brand-600"
                          >
                            View
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="mt-4 text-xs text-brand-700/75">
            Displaying the latest 100 orders. Refresh to retrieve
            recent changes.
          </p>
        </>
      )}
    </div>
  );
}
