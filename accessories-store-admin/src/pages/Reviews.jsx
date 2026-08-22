import { useState, useEffect } from "react";
import { getAllReviews, approveReview, deleteReview } from "../api/reviews";
import AppShell from "../components/AppShell";
import SearchBar from "../components/SearchBar";
import ConfirmDialog from "../components/ConfirmDialog";

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

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await getAllReviews();
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveReview(id);
      loadReviews();
    } catch (err) {
      alert("Failed to approve review.");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteReview(deleteTarget.id);
      setDeleteTarget(null);
      loadReviews();
    } catch (err) {
      alert("Failed to delete review.");
    }
  };

  const filtered = reviews.filter((r) => {
    const q = query.toLowerCase();
    return (
      r.customerName.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q)
    );
  });

  const pending = filtered.filter((r) => !r.isApproved);
  const approved = filtered.filter((r) => r.isApproved);

  const ReviewRow = ({ r }) => (
    <div className="bg-white border border-nude-200 rounded-lg p-4 flex gap-4">
      {r.imageUrl && (
        <img
          src={`https://localhost:7113${r.imageUrl}`}
          alt=""
          className="w-16 h-16 object-cover rounded-md border border-nude-200 shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-espresso font-medium">{r.customerName}</p>
            <p className="text-xs text-muted">{r.customerEmail}</p>
          </div>
          <Stars rating={r.rating} />
        </div>
        <p className="text-sm text-espresso mt-2">{r.comment}</p>
        <p className="text-xs text-muted mt-2">On: {r.productName} · {new Date(r.createdAt).toLocaleDateString()}</p>
        <div className="flex gap-3 mt-3">
          {!r.isApproved && (
            <button onClick={() => handleApprove(r.id)} className="text-sage hover:underline text-sm font-medium transition">
              Approve
            </button>
          )}
          <button onClick={() => setDeleteTarget(r)} className="text-brick/80 hover:text-brick text-sm font-medium transition">
            {r.isApproved ? "Remove" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );

  const content = loading ? (
    <div className="p-10 text-muted">Loading…</div>
  ) : (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <p className="text-xs tracking-[0.3em] uppercase text-muted mb-1">Storefront</p>
        <h1 className="font-display text-3xl text-espresso">Reviews</h1>
      </div>

      <h2 className="text-sm font-medium tracking-wide uppercase text-muted mb-3">
        Pending Approval ({pending.length})
      </h2>
      <div className="space-y-3 mb-10">
        {pending.map((r) => <ReviewRow key={r.id} r={r} />)}
        {pending.length === 0 && (
          <div className="bg-white border border-nude-200 rounded-lg p-8 text-center text-muted">
            Nothing pending.
          </div>
        )}
      </div>

      <h2 className="text-sm font-medium tracking-wide uppercase text-muted mb-3">
        Approved ({approved.length})
      </h2>
      <div className="space-y-3">
        {approved.map((r) => <ReviewRow key={r.id} r={r} />)}
        {approved.length === 0 && (
          <div className="bg-white border border-nude-200 rounded-lg p-8 text-center text-muted">
            No approved reviews yet.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppShell search={<SearchBar value={query} onChange={setQuery} placeholder="Search reviews…" />}>
      {content}
      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.isApproved ? "Remove review?" : "Reject review?"}
        message={deleteTarget ? `This will permanently delete the review from "${deleteTarget.customerName}".` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  );
}

export default Reviews;