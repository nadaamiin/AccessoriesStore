import { useState } from "react";
import { submitReview } from "../api/reviews";

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill={n <= value ? "#A9855C" : "none"} stroke="#A9855C" strokeWidth="1.5">
            <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ productId, onSubmitted }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("ProductId", productId);
      formData.append("CustomerName", name);
      formData.append("CustomerEmail", email);
      formData.append("Rating", rating);
      formData.append("Comment", comment);
      if (image) formData.append("image", image);

      await submitReview(formData);
      setDone(true);
      onSubmitted?.();
    } catch (err) {
      setError("Something went wrong submitting your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bg-blush-100 rounded-xl p-6 text-center text-espresso">
        Thank you! Your review has been submitted and will appear once approved.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md text-left">
      <div>
        <label className="block text-xs font-medium tracking-wide uppercase text-muted mb-1.5">
          Your Rating
        </label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block text-xs font-medium tracking-wide uppercase text-muted mb-1.5">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-white border border-nudepink-200 rounded-md px-3.5 py-2.5 text-espresso focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium tracking-wide uppercase text-muted mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-white border border-nudepink-200 rounded-md px-3.5 py-2.5 text-espresso focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium tracking-wide uppercase text-muted mb-1.5">Your Review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          required
          className="w-full bg-white border border-nudepink-200 rounded-md px-3.5 py-2.5 text-espresso focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium tracking-wide uppercase text-muted mb-1.5">
          Photo (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0] || null)}
          className="text-sm text-muted"
        />
      </div>

      {error && <p className="text-brick text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2.5 rounded-full bg-rose-500 text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
     >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

export default ReviewForm;