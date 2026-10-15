import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { fetchMyReviews } from "../../services/reviewService";

export default function MyReviews() {
  const { token } = useCustomerAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const response = await fetchMyReviews(token);
        if (!cancelled) setReviews(response.reviews || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load reviews.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (token) load();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <main className="min-h-[70vh] bg-cream px-5 py-12">
      <div className="mx-auto max-w-4xl">
        <Link to="/account" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-900"><ArrowLeft size={17} />Back to Account</Link>
        <h1 className="mt-6 text-3xl font-semibold text-brand-900">My Reviews</h1>
        <p className="mt-2 text-sm text-brand-700">Your verified reviews of delivered FlexiSole styles.</p>
        {loading && <p className="mt-8 flex items-center gap-2 text-sm text-brand-700"><Loader2 className="animate-spin" size={19} />Loading reviews...</p>}
        {error && <p className="mt-8 flex items-center gap-2 text-sm text-red-700"><AlertCircle size={19} />{error}</p>}
        {!loading && !error && reviews.length === 0 && (
          <div className="mt-8 rounded-3xl border border-brand-200 bg-white p-8">
            <p className="text-sm text-brand-700">You haven't reviewed any delivered products yet.</p>
            <Link to="/account/orders" className="mt-4 inline-block text-sm font-semibold text-brand-900 underline">View My Orders</Link>
          </div>
        )}
        <div className="mt-7 space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-brand-200 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-brand-900">{review.product?.name || "Previously purchased product"}</h2>
                  <p className="mt-1 text-xs text-brand-700">{review.status === "Published" ? "Published verified review" : "Review hidden"}</p>
                </div>
                <span className="flex items-center gap-1 font-semibold text-brand-900"><Star size={17} fill="#E5A54B" color="#E5A54B" />{review.rating}/5</span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-brand-900">{review.title}</h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-brand-700">{review.comment}</p>
              {review.product?.slug && <Link to={`/product/${review.product.slug}#reviews`} className="mt-4 inline-block text-sm font-semibold text-brand-900 underline">View product and edit review</Link>}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
