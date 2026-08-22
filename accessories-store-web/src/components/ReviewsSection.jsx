import { useState, useEffect, useRef } from "react";

const sampleReviews = [
  {
    name: "Mariam K.",
    title: "Absolutely stunning piece!",
    text: "The craftsmanship is beautiful and it looks even better in person. Wearing it every day now.",
    product: "Stone Necklace",
    image: "/uploads/products/23434ec7-0eda-4767-860c-e24cd8427b5d.png",
  },
  {
    name: "Yasmin A.",
    title: "Elegant and well made",
    text: "Exactly what I was looking for — simple, elegant, and great quality for the price.",
    product: "Extra Stone Necklace",
    image: null,
  },
  {
    name: "Nour E.",
    title: "Exceeded my expectations",
    text: "Such a lovely piece, packaging was beautiful too. Will definitely order again.",
    product: "Extra Diamonds Necklace",
    image: null,
  },
];

function Stars() {
  return (
    <div className="flex gap-1 justify-center text-rose-500">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewsSection() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const startX = useRef(null);

  const total = sampleReviews.length;

  const goTo = (i) => setIndex(((i % total) + total) % total);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 4500);
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [index]);

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

  const review = sampleReviews[index];

  return (
    <section className="px-6 py-20 max-w-3xl mx-auto text-center">
      <h2 className="font-display text-3xl text-espresso mb-2">Let Customers Speak For Us</h2>
      <p className="text-muted text-sm mb-10">from our happy customers</p>

      <div
        className="relative select-none"
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
      >
        {review.image && (
          <img
            src={`https://localhost:7113${review.image}`}
            alt={review.product}
            className="w-20 h-20 object-cover rounded-full mx-auto mb-5 border border-nudepink-200"
          />
        )}

        <Stars />

        <p className="font-display text-2xl text-espresso mt-5">{review.title}</p>
        <p className="text-muted mt-3 max-w-lg mx-auto">{review.text}</p>
        <p className="text-espresso text-sm font-medium mt-5">{review.name}</p>
        <p className="text-muted text-xs mt-1">{review.product}</p>

        {/* Arrows */}
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
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {sampleReviews.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full transition ${i === index ? "bg-rose-500" : "bg-nudepink-300"}`}
            aria-label={`Go to review ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default ReviewsSection;