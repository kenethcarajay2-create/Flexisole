
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  Package,
  ImageOff,
} from "lucide-react";

import { useCart } from "../../context/CartContext";

function formatPrice(price) {
  if (typeof price !== "number" || !Number.isFinite(price)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(price);
}

export default function Cart() {
  const {
    items,
    itemCount,
    subtotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  return (
    <section className="min-h-[70vh] bg-cream px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              YOUR SHOPPING BAG
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-brand-900 sm:text-5xl">
              Shopping Cart
            </h1>

            {itemCount > 0 && (
              <p className="mt-3 text-sm text-brand-700">
                {itemCount} {itemCount === 1 ? "item" : "items"} in your bag
              </p>
            )}
          </div>

          {items.length > 0 && (
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-800 hover:text-brand-600"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-brand-900/10 bg-white px-6 py-20 text-center">
            <div className="mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-brand-100">
              <ShoppingBag
                size={40}
                strokeWidth={1.4}
                className="text-brand-900"
              />
            </div>

            <h2 className="text-2xl font-semibold text-brand-900 sm:text-3xl">
              Your cart is empty
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-brand-700 sm:text-base">
              Explore our FlexiSole collection and find your perfect pair.
            </p>

            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-brand-900 px-8 py-4 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* CART ITEMS */}
            <div className="overflow-hidden rounded-3xl border border-brand-200 bg-white">
              <div className="flex items-center justify-between border-b border-brand-100 px-5 py-5 sm:px-7">
                <h2 className="text-lg font-semibold text-brand-900">
                  Your Items
                </h2>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Remove all items from your cart?")) {
                      clearCart();
                    }
                  }}
                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-brand-100">
                {items.map((item) => {
                  const stockLimit = Math.max(
                    1,
                    Number(item.availableStock) || 1
                  );

                  const quantityLimit = Math.min(10, stockLimit);

                  return (
                    <article
                      key={item.key}
                      className="flex flex-col gap-5 p-5 sm:flex-row sm:p-7"
                    >
                      <Link
                        to={`/product/${item.slug}?color=${encodeURIComponent(item.variantId)}`}
                        className="flex h-44 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F7F1EA] sm:h-36 sm:w-36"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={`${item.name} in ${item.color}`}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageOff
                            size={32}
                            className="text-brand-600"
                          />
                        )}
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-5">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                to={`/product/${item.slug}?color=${encodeURIComponent(item.variantId)}`}
                                className="text-base font-semibold text-brand-900 hover:text-brand-600 sm:text-lg"
                              >
                                {item.name}
                              </Link>

                              <p className="mt-2 text-sm text-brand-700">
                                Color: {item.color}
                              </p>

                              <p className="mt-1 text-sm text-brand-700">
                                Size: {item.size}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.key)}
                              aria-label={`Remove ${item.name}`}
                              className="rounded-full p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={19} />
                            </button>
                          </div>

                          <p className="mt-4 text-sm font-semibold text-brand-900">
                            {formatPrice(item.price)} each
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="inline-flex items-center overflow-hidden rounded-xl border border-brand-200 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.key,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                              aria-label={`Decrease quantity for ${item.name}`}
                              className="flex h-10 w-10 items-center justify-center text-brand-900 hover:bg-brand-100 disabled:opacity-40"
                            >
                              <Minus size={16} />
                            </button>

                            <span
                              aria-live="polite"
                              className="w-10 text-center text-sm font-semibold text-brand-900"
                            >
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.key,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.quantity >= quantityLimit}
                              aria-label={`Increase quantity for ${item.name}`}
                              className="flex h-10 w-10 items-center justify-center text-brand-900 hover:bg-brand-100 disabled:opacity-40"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <p className="text-base font-semibold text-brand-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>

                        <p className="text-xs text-brand-700/75">
                          Up to {quantityLimit} per selection, based on
                          the last recorded stock.
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <aside className="rounded-3xl border border-brand-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
              <h2 className="text-xl font-semibold text-brand-900">
                Order Summary
              </h2>

              <div className="mt-7 space-y-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-brand-700">
                    Subtotal ({itemCount} items)
                  </span>

                  <span className="font-semibold text-brand-900">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-brand-700">
                    Shipping
                  </span>

                  <span className="text-brand-700">
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

              <Link
                to="/checkout"
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-brand-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </Link>

              <p className="mt-4 text-center text-xs leading-6 text-brand-700">
                Cash on Delivery. Shipping charges will be confirmed
                separately.
              </p>

              <div className="mt-7 space-y-4 border-t border-brand-100 pt-6">
                <div className="flex items-center gap-3 text-xs text-brand-700">
                  <ShieldCheck size={19} className="text-brand-600" />
                  Prices and stock verified by the server at checkout
                </div>

                <div className="flex items-center gap-3 text-xs text-brand-700">
                  <Package size={19} className="text-brand-600" />
                  Delivery details collected before order submission
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
