
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import { createCustomerOrder } from "../../services/orderService";

const initialCustomer = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  notes: "",
};

function formatPrice(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(amount) || 0);
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  autoComplete,
  maxLength = 150,
}) {
  return (
    <div>
      <label
        htmlFor={`checkout-${name}`}
        className="mb-2 block text-sm font-semibold text-brand-900"
      >
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>

      <input
        id={`checkout-${name}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3.5 text-sm text-brand-900 outline-none transition focus:border-brand-600"
      />
    </div>
  );
}

export default function Checkout() {
  const { items, itemCount, subtotal, clearCart } = useCart();

  const [customer, setCustomer] = useState(initialCustomer);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setCustomer((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting || completedOrder || items.length === 0) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await createCustomerOrder(
        customer,
        items
      );

      if (!response.success || !response.order?.orderNumber) {
        throw new Error("The server did not confirm your order.");
      }

      setCompletedOrder(response.order);
      clearCart();
    } catch (err) {
      setError(
        err.message ||
          "Unable to submit your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // SUCCESS SCREEN
  if (completedOrder) {
    return (
      <main className="min-h-[75vh] bg-cream px-5 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-brand-200 bg-white p-7 text-center shadow-sm sm:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100">
            <CheckCircle2
              size={42}
              className="text-brand-700"
            />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            Order Received
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-brand-900">
            Thank you for your order!
          </h1>

          <p className="mt-4 text-sm leading-7 text-brand-700">
            Your FlexiSole order has been submitted.
            Please save your order reference for future inquiries.
          </p>

          <div className="mt-8 rounded-2xl bg-brand-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Order Reference
            </p>

            <p className="mt-2 break-all text-2xl font-bold tracking-wide text-brand-900">
              {completedOrder.orderNumber}
            </p>

            <div className="mt-5 space-y-2 text-sm text-brand-700">
              <p>
                Status:{" "}
                <strong>{completedOrder.status}</strong>
              </p>

              <p>
                Payment: Cash on Delivery
              </p>

              <p>
                Subtotal:{" "}
                <strong>
                  {formatPrice(completedOrder.subtotal)}
                </strong>
              </p>

              <p>Shipping fee: To be confirmed</p>
            </div>
          </div>

          <p className="mt-6 text-xs leading-6 text-brand-700">
            This is an order submission confirmation, not a
            payment receipt. The final total depends on
            delivery charges.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand-900 px-8 py-4 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    );
  }

  // EMPTY CART
  if (items.length === 0) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-cream px-5 text-center">
        <ShoppingBag size={45} className="text-brand-600" />

        <h1 className="mt-5 text-3xl font-semibold text-brand-900">
          Your cart is empty
        </h1>

        <p className="mt-3 max-w-md text-sm leading-7 text-brand-700">
          Add a pair of FlexiSole sandals before checking out.
        </p>

        <Link
          to="/shop"
          className="mt-7 rounded-full bg-brand-900 px-7 py-3.5 text-sm font-semibold text-white"
        >
          Browse Products
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900"
        >
          <ArrowLeft size={17} />
          Back to Cart
        </Link>

        <div className="mb-10 mt-7">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            SECURE CHECKOUT
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-brand-900 sm:text-5xl">
            Checkout
          </h1>

          <p className="mt-3 text-sm text-brand-700">
            Complete your delivery details to submit your order.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
        >
          {/* CUSTOMER INFORMATION */}
          <div className="space-y-7">
            <section className="rounded-3xl border border-brand-200 bg-white p-6 sm:p-8">
              <h2 className="mb-6 flex items-center gap-3 text-xl font-semibold text-brand-900">
                <MapPin size={22} className="text-brand-600" />
                Delivery Information
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field
                    label="Full Name"
                    name="fullName"
                    value={customer.fullName}
                    onChange={handleChange}
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder="Enter your full name"
                  />
                </div>

                <Field
                  label="Mobile Number"
                  name="phone"
                  type="tel"
                  value={customer.phone}
                  onChange={handleChange}
                  required
                  maxLength={30}
                  autoComplete="tel"
                  placeholder="09XXXXXXXXX"
                />

                <Field
                  label="Email Address (optional)"
                  name="email"
                  type="email"
                  value={customer.email}
                  onChange={handleChange}
                  autoComplete="email"
                  placeholder="you@example.com"
                />

                <div className="sm:col-span-2">
                  <Field
                    label="House No., Street, Barangay"
                    name="address"
                    value={customer.address}
                    onChange={handleChange}
                    required
                    maxLength={250}
                    autoComplete="street-address"
                    placeholder="Complete street and barangay"
                  />
                </div>

                <Field
                  label="City / Municipality"
                  name="city"
                  value={customer.city}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  autoComplete="address-level2"
                />

                <Field
                  label="Province"
                  name="province"
                  value={customer.province}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  autoComplete="address-level1"
                />

                <Field
                  label="Postal Code (optional)"
                  name="postalCode"
                  value={customer.postalCode}
                  onChange={handleChange}
                  maxLength={20}
                  autoComplete="postal-code"
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor="checkout-notes"
                  className="mb-2 block text-sm font-semibold text-brand-900"
                >
                  Order Notes (optional)
                </label>

                <textarea
                  id="checkout-notes"
                  name="notes"
                  rows={4}
                  maxLength={500}
                  value={customer.notes}
                  onChange={handleChange}
                  placeholder="Landmark or delivery instructions..."
                  className="w-full resize-y rounded-xl border border-brand-200 px-4 py-3.5 text-sm outline-none focus:border-brand-600"
                />
              </div>
            </section>

            {/* PAYMENT METHOD */}
            <section className="rounded-3xl border border-brand-200 bg-white p-6 sm:p-8">
              <h2 className="mb-5 text-xl font-semibold text-brand-900">
                Payment Method
              </h2>

              <div className="flex items-start gap-4 rounded-2xl border-2 border-brand-600 bg-brand-50 p-5">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-brand-900">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-900" />
                </span>

                <div>
                  <p className="font-semibold text-brand-900">
                    Cash on Delivery (COD)
                  </p>

                  <p className="mt-2 text-sm leading-6 text-brand-700">
                    Pay upon delivery. Shipping charges will
                    be confirmed separately before fulfillment.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ORDER SUMMARY */}
          <aside className="rounded-3xl border border-brand-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <h2 className="text-xl font-semibold text-brand-900">
              Your Order
            </h2>

            <p className="mt-2 text-sm text-brand-700">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>

            <div className="mt-6 max-h-80 space-y-5 overflow-y-auto border-b border-brand-100 pb-6">
              {items.map((item) => (
                <div key={item.key} className="flex gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F7F1EA]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package size={25} className="text-brand-500" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-brand-900">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-brand-700">
                      {item.color} · Size {item.size}
                    </p>

                    <p className="mt-1 text-xs text-brand-700">
                      Qty: {item.quantity}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-brand-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-brand-700">
                  Estimated subtotal
                </span>
                <span className="font-semibold text-brand-900">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-brand-700">
                  Shipping
                </span>
                <span className="font-medium text-brand-900">
                  To be confirmed
                </span>
              </div>
            </div>

            <div className="my-6 border-t border-brand-200" />

            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-brand-900">
                Estimated subtotal
              </span>
              <span className="text-xl font-semibold text-brand-900">
                {formatPrice(subtotal)}
              </span>
            </div>

            <p className="mt-3 text-xs leading-6 text-brand-700">
              Final pricing and inventory are checked by
              our server. Shipping is not included above.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-brand-900 px-6 py-4 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Place COD Order
                  <ArrowRight size={19} />
                </>
              )}
            </button>

            <div className="mt-5 flex items-start gap-3 text-xs leading-6 text-brand-700">
              <ShieldCheck
                size={20}
                className="shrink-0 text-brand-600"
              />
              <p>
                By submitting, you request an order with
                the selected items. Delivery fees and
                availability will be confirmed before fulfillment.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
