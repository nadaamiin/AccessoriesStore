import { useState, useEffect, useRef } from "react";
import { getApprovedReviews } from "../api/reviews";

function Stars({ rating }) {
  return (
    <div className="flex gap-1 justify-center text-rose-500">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill={i < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewsSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const startX = useRef(null);

  useEffect(() => {
    getApprovedReviews(productId).then((res) => setReviews(res.data)).catch(() => {});
  }, [productId]);

  const total = reviews.length;

  const goTo = (i) => setIndex(((i % total) + total) % total);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  useEffect(() => {
    if (total <= 1) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, [index, total]);

  const handlePointerDown = (e) => {
    startX.current = e.clientX ?? e.touches?.[0]?.clientX;
  };
  const handlePointerUp = (e) => {
    if (startX.current == null) return;
    const endX = e.clientX ?? e.changedTouches?.[0]?.clientX;
    const diff = endX - startX.current;
    if (diff > 50) prev();
    else if (diff < -50) next();
    startX.current = null;
  };

  if (total === 0) return null; // nothing approved yet

  const review = reviews[index];
  // Prefer the photo the customer uploaded with their review; fall back to the product's main image
  const image = review.imageUrl || review.productImageUrl;

  return (
    <section className="px-6 py-20 max-w-2xl mx-auto text-center">
      <h2 className="font-display text-3xl text-espresso mb-2">Let Customers Speak For Us</h2>
      <p className="text-muted text-sm mb-10">from our happy customers</p>

      <div
        className="relative select-none"
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
      >
        {image && (
          <img
            src={`https://localhost:7113${image}`}
            alt={review.productName}
            className="w-24 h-24 object-cover rounded-full mx-auto mb-2"
          />
        )}
        <Stars rating={review.rating} />

        <p className="font-body text-md font-extrabold tracking-[0.15em] uppercase text-espresso mt-5">{review.productName}</p>

        <p className="text-muted mt-2 max-w-lg mx-auto">{review.comment}</p>
        <p className="text-espresso text-sm font-medium mt-5">{review.customerName}</p>
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-10 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-espresso hover:bg-blush-100 transition"
              aria-label="Previous review"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-10 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-espresso hover:bg-blush-100 transition"
              aria-label="Next review"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition ${i === index ? "bg-rose-500" : "bg-nudepink-300"}`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ReviewsSection;