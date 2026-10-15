
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Package,
  Feather,
  Info,
  Loader2,
  AlertCircle,
  ImageOff,
} from "lucide-react";

import {
  getPublishedProducts,
  getPublishedProductBySlug,
  mapProductToGroup,
} from "../../services/productService";

import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/product/ProductCard";
import ProductReviews from "../../components/reviews/ProductReviews";

function formatPrice(price) {
  if (typeof price !== "number" || !Number.isFinite(price)) {
    return "Price coming soon";
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(price);
}

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [group, setGroup] = useState(null);
  const [relatedGroups, setRelatedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [size, setSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setGroup(null);
      setRelatedGroups([]);

      try {
        const product = await getPublishedProductBySlug(slug);

        if (cancelled) return;

        setGroup(mapProductToGroup(product));
        setLoading(false);

        try {
          const products = await getPublishedProducts();

          if (!cancelled) {
            setRelatedGroups(
              products
                .filter((item) => item.slug !== slug)
                .map(mapProductToGroup)
                .filter(
                  (item) =>
                    item && item.variants.length > 0
                )
                .slice(0, 3)
            );
          }
        } catch (relatedError) {
          console.warn(
            "Related products unavailable:",
            relatedError
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load product.");
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug, reloadKey]);

  const selectedId = searchParams.get("color");

  const selectedProduct =
    group?.variants.find(
      (variant) => variant.id === selectedId
    ) ?? group?.variants[0];

  useEffect(() => {
    setSize(null);
    setQuantity(1);
    setSelectedImage("");
    setCartMessage("");
    setCartError("");
  }, [slug, selectedProduct?.id]);

  const inventory = selectedProduct?.stock || [];

  const availableSizes = [...inventory].sort(
    (a, b) => a.size - b.size
  );

  const selectedSizeStock =
    availableSizes.find(
      (item) => item.size === size
    )?.stock ?? 0;

  const totalStock = inventory.reduce(
    (total, item) => total + item.stock,
    0
  );

  const maxQuantity = Math.min(10, selectedSizeStock);

  const canAddToCart =
    selectedProduct?.price != null &&
    Number.isFinite(selectedProduct.price) &&
    size !== null &&
    selectedSizeStock > 0;

  const galleryImages = selectedProduct?.images || [];

  const mainImage =
    selectedImage ||
    selectedProduct?.detailImage ||
    galleryImages[0] ||
    "";

  function selectColor(variant) {
    setSearchParams({ color: variant.id });
  }

  function selectSize(item) {
    if (item.stock <= 0) return;

    setSize(item.size);
    setQuantity(1);
    setCartMessage("");
    setCartError("");
  }

  function handleAddToCart() {
    setCartMessage("");
    setCartError("");

    if (!canAddToCart) {
      setCartError(
        "Please choose an available size and a product with a valid price."
      );
      return;
    }

    try {
      addToCart({
        productId: group.id,
        variantId: selectedProduct.id,
        name: group.name,
        color: selectedProduct.color,
        size,
        price: selectedProduct.price,
        image: selectedProduct.image,
        slug: group.slug,
        quantity,
        availableStock: selectedSizeStock,
      });

      setCartMessage(
        `${quantity} item(s) added to your shopping cart.`
      );
    } catch (err) {
      setCartError(
        err.message || "Unable to add this item to your cart."
      );
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[65vh] flex-col items-center justify-center gap-4 bg-cream px-6">
        <Loader2
          size={36}
          className="animate-spin text-brand-600"
        />
        <p className="text-sm text-brand-700">
          Loading product details...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[65vh] flex-col items-center justify-center bg-cream px-6 text-center">
        <AlertCircle
          size={42}
          className="text-brand-600"
        />

        <h1 className="mt-5 text-3xl font-semibold text-brand-900">
          Unable to load product
        </h1>

        <p className="mt-4 max-w-md text-sm leading-7 text-brand-700">
          {error}
        </p>

        <button
          type="button"
          onClick={() => setReloadKey((value) => value + 1)}
          className="mt-7 rounded-full bg-brand-900 px-7 py-3 text-sm font-semibold text-white"
        >
          Try Again
        </button>

        <Link
          to="/shop"
          className="mt-5 text-sm font-semibold text-brand-700 underline"
        >
          Back to Shop
        </Link>
      </main>
    );
  }

  if (!group || !selectedProduct) {
    return (
      <main className="flex min-h-[65vh] flex-col items-center justify-center bg-cream px-6 text-center">
        <h1 className="text-4xl font-semibold text-brand-900">
          Product not found
        </h1>

        <p className="mt-4 text-brand-700">
          This product may no longer be available.
        </p>

        <Link
          to="/shop"
          className="mt-8 rounded-full bg-brand-900 px-7 py-3 text-sm font-semibold text-white"
        >
          Back to Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="page-container pb-20 pt-7 lg:pb-28">
        {/* BREADCRUMBS */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-xs text-brand-700 sm:text-sm"
        >
          <Link to="/" className="hover:text-brand-900">
            Home
          </Link>

          <ChevronRight size={14} />

          <Link to="/shop" className="hover:text-brand-900">
            Shop
          </Link>

          <ChevronRight size={14} />

          <span className="font-medium text-brand-900">
            {group.name}
          </span>
        </nav>

        {/* PRODUCT LAYOUT */}
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          {/* PRODUCT IMAGES */}
          <div className="min-w-0">
            <div className="group relative aspect-square overflow-hidden rounded-3xl border border-brand-900/5 bg-[#F7F1EA]">
              {mainImage ? (
                <img
                  key={mainImage}
                  src={mainImage}
                  alt={`${group.name} in ${selectedProduct.color}`}
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-brand-600">
                  <ImageOff size={45} />
                  <span className="text-sm">
                    Image coming soon
                  </span>
                </div>
              )}

              <span className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-brand-900 shadow-sm">
                {selectedProduct.color}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {group.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => selectColor(variant)}
                  aria-label={`View ${variant.color}`}
                  aria-pressed={
                    selectedProduct.id === variant.id
                  }
                  className={`overflow-hidden rounded-2xl border-2 transition-all ${
                    selectedProduct.id === variant.id
                      ? "border-brand-700"
                      : "border-transparent hover:border-brand-300"
                  }`}
                >
                  {variant.image ? (
                    <img
                      src={variant.image}
                      alt={variant.color}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-brand-100">
                      <ImageOff
                        size={25}
                        className="text-brand-600"
                      />
                    </div>
                  )}

                  <div className="bg-white px-3 py-3 text-center text-xs font-medium text-brand-900">
                    {variant.color}
                  </div>
                </button>
              ))}
            </div>

            {galleryImages.length > 1 && (
              <div className="mt-5 flex flex-wrap gap-3">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View product photo ${index + 1}`}
                    className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${
                      mainImage === image
                        ? "border-brand-900"
                        : "border-brand-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT INFORMATION */}
          <div className="min-w-0 lg:sticky lg:top-28">
            <Link
              to="/shop"
              className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-brand-700 hover:text-brand-900"
            >
              <ArrowLeft size={16} />
              BACK TO COLLECTION
            </Link>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              {group.category} Collection
            </p>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-brand-900 sm:text-5xl">
              {group.name}
            </h1>

            <p className="mt-3 text-base text-brand-700">
              {group.subtitle}
            </p>

            <div className="mt-7 border-b border-brand-200 pb-7">
              <p className="text-2xl font-semibold text-brand-900">
                {formatPrice(selectedProduct.price)}
              </p>

              <p className="mt-3 text-sm leading-7 text-brand-700/80">
                {group.description ||
                  "Discover your next everyday pair."}
              </p>

              <p
                className={`mt-3 text-sm font-medium ${
                  totalStock > 0
                    ? "text-brand-700"
                    : "text-red-600"
                }`}
              >
                {totalStock > 0
                  ? `${totalStock} units available in this color`
                  : "Currently out of stock"}
              </p>
            </div>

            {/* COLOR SELECTOR */}
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-brand-900">
                  Select Color
                </h2>

                <span className="text-sm text-brand-700">
                  {selectedProduct.color}
                </span>
              </div>

              <div
                className="flex flex-wrap gap-4"
                role="group"
                aria-label="Available colors"
              >
                {group.variants.map((variant) => {
                  const isSelected =
                    selectedProduct.id === variant.id;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      aria-label={variant.color}
                      aria-pressed={isSelected}
                      title={variant.color}
                      onClick={() => selectColor(variant)}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 p-1 transition ${
                        isSelected
                          ? "border-brand-900"
                          : "border-brand-200 hover:border-brand-500"
                      }`}
                    >
                      <span
                        className="flex h-full w-full items-center justify-center rounded-full border border-black/10"
                        style={{
                          backgroundColor: variant.colorCode,
                        }}
                      >
                        {isSelected && (
                          <Check
                            size={17}
                            className="text-brand-900"
                            strokeWidth={2.5}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SIZE SELECTOR */}
            <div className="mt-9">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-brand-900">
                  Select Size
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setShowSizeGuide((previous) => !previous)
                  }
                  aria-expanded={showSizeGuide}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 underline underline-offset-4 hover:text-brand-900"
                >
                  <Info size={15} />
                  Size Information
                </button>
              </div>

              <div
                role="group"
                aria-label="Available sizes"
                className="grid grid-cols-4 gap-2 sm:grid-cols-7"
              >
                {availableSizes.map((item) => {
                  const isOutOfStock = item.stock <= 0;
                  const isSelected = size === item.size;

                  return (
                    <button
                      key={item.size}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => selectSize(item)}
                      aria-pressed={isSelected}
                      title={
                        isOutOfStock
                          ? "Out of stock"
                          : `${item.stock} available`
                      }
                      className={`flex h-12 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                        isOutOfStock
                          ? "cursor-not-allowed border-brand-100 bg-brand-100/60 text-brand-400 line-through"
                          : isSelected
                            ? "border-brand-900 bg-brand-900 text-white"
                            : "border-brand-200 bg-white text-brand-900 hover:border-brand-500"
                      }`}
                    >
                      {item.size}
                    </button>
                  );
                })}
              </div>

              {availableSizes.length === 0 && (
                <p className="mt-3 text-sm text-brand-700">
                  Sizes are not available yet.
                </p>
              )}

              {showSizeGuide && (
                <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm leading-7 text-brand-800">
                  Sizes are based on the current product inventory.
                  Official measurements will be added after confirmation.
                </div>
              )}

              {size !== null && (
                <p className="mt-3 text-xs text-brand-700">
                  Size {size} — {selectedSizeStock} available
                </p>
              )}
            </div>

            {/* QUANTITY */}
            <div className="mt-9">
              <h2 className="mb-4 text-sm font-semibold text-brand-900">
                Quantity
              </h2>

              <div className="inline-flex items-center overflow-hidden rounded-xl border border-brand-200 bg-white">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((previous) =>
                      Math.max(1, previous - 1)
                    )
                  }
                  disabled={quantity <= 1 || size === null}
                  aria-label="Decrease quantity"
                  className="flex h-12 w-12 items-center justify-center text-brand-900 hover:bg-brand-100 disabled:opacity-40"
                >
                  <Minus size={17} />
                </button>

                <span
                  aria-live="polite"
                  className="w-12 text-center text-sm font-semibold text-brand-900"
                >
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((previous) =>
                      Math.min(maxQuantity, previous + 1)
                    )
                  }
                  disabled={
                    size === null || quantity >= maxQuantity
                  }
                  aria-label="Increase quantity"
                  className="flex h-12 w-12 items-center justify-center text-brand-900 hover:bg-brand-100 disabled:opacity-40"
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>

            {/* ADD TO CART */}
            <div className="mt-9">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-brand-900 px-8 py-4 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag size={19} />
                Add to Cart
              </button>

              {cartMessage && (
                <div
                  role="status"
                  className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900"
                >
                  <div className="flex items-center gap-2">
                    <Check size={19} className="text-brand-600" />
                    {cartMessage}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/cart")}
                    className="mt-3 inline-flex items-center gap-2 font-semibold underline underline-offset-4"
                  >
                    View Cart
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {cartError && (
                <div
                  role="alert"
                  className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {cartError}
                </div>
              )}

              {!cartMessage && !cartError && (
                <p className="mt-3 text-center text-xs leading-6 text-brand-700/70">
                  {selectedProduct.price == null
                    ? "Price is not available yet."
                    : totalStock <= 0
                      ? "This color is currently out of stock."
                      : size === null
                        ? "Select an available size to add this item."
                        : "Your selection is ready to add to cart."}
                </p>
              )}
            </div>

            {/* PRODUCT FEATURES */}
            <div className="mt-10 rounded-2xl border border-brand-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-brand-900">
                Product Details
              </h2>

              <p className="mt-4 text-sm leading-7 text-brand-800">
                {group.description ||
                  "Explore our collection of everyday slipper styles."}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-brand-100 pt-6">
                <div className="flex items-center gap-2 text-xs text-brand-700">
                  <Feather size={18} />
                  Everyday Wear
                </div>

                <div className="flex items-center gap-2 text-xs text-brand-700">
                  <Package size={18} />
                  FlexiSole Collection
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProductReviews slug={group.slug} />

        {/* RELATED STYLES */}
        {relatedGroups.length > 0 && (
          <section className="mt-20 border-t border-brand-200 pt-14">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                  DISCOVER MORE
                </p>

                <h2 className="text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
                  Other Styles You Might Like
                </h2>

                <p className="mt-3 text-sm text-brand-700/75">
                  Explore more FlexiSole styles and find your perfect fit.
                </p>
              </div>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-900 hover:text-brand-600"
              >
                Shop All Styles
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {relatedGroups.map((relatedGroup) => (
                <ProductCard
                  key={relatedGroup.id}
                  group={relatedGroup}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
