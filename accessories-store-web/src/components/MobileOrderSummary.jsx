import { useState } from "react";
import OrderSummaryDetails from "./OrderSummaryDetails";

function MobileOrderSummary(props) {
  const [open, setOpen] = useState(false);
  const { total, totalBeforeSavings, totalSavings } = props;

  return (
    <div className="lg:hidden bg-white rounded-2xl mb-6 border border-line">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <span className="flex items-center gap-1.5 text-sm font-medium text-espresso">
          Order summary
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="flex items-center gap-2">
          {totalSavings > 0 && (
            <span className="text-muted text-xs line-through">LE {totalBeforeSavings.toFixed(2)}</span>
          )}
          <span className="font-body font-bold text-espresso">LE {total.toFixed(2)}</span>
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-line pt-4">
          <OrderSummaryDetails {...props} />
        </div>
      )}
    </div>
  );
}

export default MobileOrderSummary;