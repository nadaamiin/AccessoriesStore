import { useState } from "react";
import OrderSummaryDetails from "./OrderSummaryDetails";

function MobilePromoAndTotals(props) {
  const [open, setOpen] = useState(false);
  const { items, itemCount, total, totalSavings } = props;
  const thumb = items[0];

  return (
    <div className="lg:hidden my-8 space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-line text-xs font-medium text-espresso hover:bg-blush-100 transition"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.6 12 12 20.6 3.4 12l1-8.6L13 2.4z" strokeLinejoin="round" />
          <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
        </svg>
        Add discount
      </button>

      <div className="bg-blush-100 rounded-2xl">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-3 px-5 py-4"
        >
          {thumb && (
            <img
              src={`${import.meta.env.VITE_API_URL}${thumb.imageUrl}`}
              alt=""
              className="w-11 h-11 object-cover rounded-lg bg-white shrink-0"
            />
          )}
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-espresso">Total</p>
            <p className="text-xs text-muted">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
          </div>
          <span className="font-body font-bold text-espresso mr-1">LE {total.toFixed(2)}</span>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-espresso transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {totalSavings > 0 && (
          <p className="text-xs text-muted px-5 -mt-2 pb-3">Total savings LE {totalSavings.toFixed(2)}</p>
        )}

        {open && (
          <div className="px-5 pb-5 border-t border-line pt-4">
            <OrderSummaryDetails {...props} />
          </div>
        )}
      </div>
    </div>
  );
}

export default MobilePromoAndTotals;