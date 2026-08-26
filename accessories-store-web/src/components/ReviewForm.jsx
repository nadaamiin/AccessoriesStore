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
        Thank you! Your review has been submitted.
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
          className="w-full bg-white border border-nudepink-200 rounded-md px-3.5 py-2.5 text-espresso focus:outline-none focus:ring-1"
        />
      </div>

      <div>
        <label className="block text-xs font-medium tracking-wide uppercase text-muted mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-white border border-nudepink-200 rounded-md px-3.5 py-2.5 text-espresso focus:outline-none focus:ring-1"
        />
      </div>

      <div>
        <label className="block text-xs font-medium tracking-wide uppercase text-muted mb-1.5">Your Review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          required
          className="w-full bg-white border border-nudepink-200 rounded-md px-3.5 py-2.5 text-espresso focus:outline-none focus:ring-1"
        />
      </div>

      <div>
        <label className="block text-xs font-medium tracking-wide uppercase text-muted mb-2">
          Photo <span className="normal-case">(optional)</span>
        </label>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-3 w-full cursor-pointer rounded-lg bg-[#FDFBF9] px-4 py-3 transition hover:bg-[#F8F3EE]">
            
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2EDE5] text-[#A9855C]">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <circle cx="12" cy="13" r="3" />
                <path d="M8 5l1.5-2h5L16 5" />
              </svg>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-espresso truncate">
                {image ? image.name : "Add a photo"}
              </span>

              {!image && (
                <span className="text-xs text-muted">
                  Share your experience
                </span>
              )}
            </div>

            <span className="ml-auto shrink-0 text-xs text-[#A9855C]">
              Browse
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0] || null)}
              className="hidden"
            />
          </label>

          {image && (
            <button
              type="button"
              onClick={() => setImage(null)}
              aria-label="Remove photo"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F2EDE5] text-muted hover:bg-[#E8DDD4] hover:text-espresso transition"
            >
              ×
            </button>
          )}
        </div>
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