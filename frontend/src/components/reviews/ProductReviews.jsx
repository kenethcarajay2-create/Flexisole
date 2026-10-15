import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, BadgeCheck, Loader2, AlertCircle } from "lucide-react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import {
  fetchProductReviews,
  fetchReviewEligibility,
  saveProductReview,
} from "../../services/reviewService";

function Stars({ rating, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) =>
        interactive ? (
          <button
            key={value}
            type="button"
            aria-label={`Rate ${value} stars`}
            onClick={() => onChange(value)}
            className="rounded p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          >
            <Star size={24} fill={value <= rating ? "#E5A54B" : "none"} color="#E5A54B" />
          </button>
        ) : (
          <Star key={value} size={16} fill={value <= rating ? "#E5A54B" : "none"} color="#E5A54B" />
        )
      )}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="rounded-2xl border border-brand-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-brand-900">{review.displayName}</p>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700">
          <BadgeCheck size={15} /> Verified purchase
        </span>
      </div>
      <div className="mt-3"><Stars rating={review.rating} /></div>
      <h4 className="mt-3 font-semibold text-brand-900">{review.title}</h4>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-brand-700">{review.comment}</p>
      <p className="mt-4 text-xs text-brand-600">
        {new Date(review.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
        {review.purchasedQuantity > 1 ? ` · ${review.purchasedQuantity} units purchased` : ""}
      </p>
    </article>
  );
}

export default function ProductReviews({ slug }) {
  const { token, isAuthenticated, checkingSession } = useCustomerAuth();
  const [data, setData] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showFive, setShowFive] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [reviews, permission] = await Promise.all([
        fetchProductReviews(slug),
        token && isAuthenticated ? fetchReviewEligibility(slug, token) : Promise.resolve(null),
      ]);
      setData(reviews);
      setEligibility(permission);
      if (permission?.existingReview) {
        setRating(permission.existingReview.rating);
        setTitle(permission.existingReview.title);
        setComment(permission.existingReview.comment);
      }
    } catch (err) {
      setError(err.message || "Unable to load product reviews.");
    }
  }, [slug, token, isAuthenticated]);

  useEffect(() => { load(); }, [load]);

  async function submit(event) {
    event.preventDefault();
    if (!token || saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await saveProductReview(slug, token, { rating, title, comment });
      setMessage("Your verified review has been saved.");
      await load();
    } catch (err) {
      setError(err.message || "Unable to save review.");
    } finally {
      setSaving(false);
    }
  }

  const featured = data?.featured || [];
  const displayFeatured = featured.slice(0, showFive ? 5 : 3);
  const nonFeatured = (data?.reviews || []).filter(
    (review) => !featured.some((selected) => selected.id === review.id)
  );

  return (
    <section className="mt-20 border-t border-brand-200 pt-14" id="reviews">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">CUSTOMER FEEDBACK</p>
      <h2 className="text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">Verified Product Reviews</h2>
      <p className="mt-3 text-sm leading-7 text-brand-700">
        Reviews cover this product style across all colors and sizes. Only customers with delivered orders can post.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Stars rating={Math.round(data?.summary.average || 0)} />
        <span className="font-semibold text-brand-900">{data?.summary.count ? `${data.summary.average}/5` : "No ratings yet"}</span>
        <span className="text-sm text-brand-700">({data?.summary.count || 0} verified reviews)</span>
      </div>

      {error && <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} />{error}</div>}
      {message && <div role="status" className="mt-5 rounded-xl bg-brand-100 p-4 text-sm text-brand-900">{message}</div>}

      {featured.length > 0 ? (
        <>
          <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-brand-900">Featured verified reviews</h3>
              <p className="mt-1 text-xs text-brand-700">Selected for purchase quantity and review detail, regardless of star rating.</p>
            </div>
            {featured.length > 3 && (
              <button type="button" onClick={() => setShowFive((v) => !v)} className="text-sm font-semibold text-brand-900 underline">
                {showFive ? "Show top 3" : `Show ${featured.length} featured reviews`}
              </button>
            )}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayFeatured.map((review) => <ReviewCard key={review.id} review={review} />)}
          </div>
          {nonFeatured.length > 0 && (
            <div className="mt-6">
              <button type="button" onClick={() => setShowAll((v) => !v)} className="text-sm font-semibold text-brand-900 underline">
                {showAll ? "Hide other reviews" : `See ${nonFeatured.length} more reviews`}
              </button>
              {showAll && <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{nonFeatured.map((review) => <ReviewCard key={review.id} review={review} />)}</div>}
            </div>
          )}
        </>
      ) : (
        <p className="mt-8 rounded-2xl border border-brand-200 bg-white p-6 text-sm text-brand-700">No verified customer reviews yet. Once a delivered customer reviews this style, it will appear here.</p>
      )}

      <div className="mt-10 rounded-3xl border border-brand-200 bg-white p-6 sm:p-8">
        <h3 className="text-xl font-semibold text-brand-900">Write a review</h3>
        {checkingSession ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-brand-700"><Loader2 className="animate-spin" size={18} />Checking account...</div>
        ) : !isAuthenticated ? (
          <p className="mt-3 text-sm text-brand-700">Please <Link className="font-semibold underline" to="/login" state={{ from: `/product/${slug}` }}>sign in</Link> to check your purchase eligibility.</p>
        ) : !eligibility?.canReview ? (
          <p className="mt-3 text-sm leading-7 text-brand-700">You can review this style after an order containing it is marked <strong>Delivered</strong>. <Link className="font-semibold underline" to="/account/orders">View My Orders</Link>.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 max-w-xl space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-brand-900">Your rating</label>
              <Stars rating={rating} interactive onChange={setRating} />
            </div>
            <div>
              <label htmlFor="review-title" className="mb-2 block text-sm font-semibold text-brand-900">Review title</label>
              <input id="review-title" required minLength={3} maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm outline-none focus:border-brand-600" placeholder="How was your FlexiSole experience?" />
            </div>
            <div>
              <label htmlFor="review-comment" className="mb-2 block text-sm font-semibold text-brand-900">Your experience</label>
              <textarea id="review-comment" required minLength={10} maxLength={1000} rows={5} value={comment} onChange={(e) => setComment(e.target.value)} className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm outline-none focus:border-brand-600" placeholder="Tell other customers about comfort, fit, and quality." />
            </div>
            <button type="submit" disabled={saving} className="rounded-full bg-brand-900 px-7 py-3 text-sm font-semibold text-white disabled:opacity-50">
              {saving ? "Saving..." : eligibility.existingReview ? "Update Review" : "Post Verified Review"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
