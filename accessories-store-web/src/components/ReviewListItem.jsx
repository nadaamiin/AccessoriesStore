function Stars({ rating }) {
  return (
    <div className="flex gap-0.5 text-rose-500">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewListItem({ review }) {
  return (
    <div className="py-5 border-b border-nudepink-200 last:border-0">
      <div className="flex items-center justify-between">
        <Stars rating={review.rating} />
        <span className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
      <p className="text-espresso text-sm font-medium mt-2">{review.customerName}</p>
      <p className="text-muted text-sm mt-1">{review.comment}</p>
      {review.imageUrl && (
        <img
          src={`${import.meta.env.VITE_SERVER_URL}${review.imageUrl}`}
          alt=""
          className="w-16 h-16 object-cover rounded-lg mt-3"
        />
      )}
    </div>
  );
}

export default ReviewListItem;