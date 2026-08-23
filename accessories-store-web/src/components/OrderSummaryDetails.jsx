function OrderSummaryDetails({
  items, itemCount, subtotal, discountAmount,
  shippingFee, originalShippingFee, freeShippingApplied,
  total, totalSavings,
  promoInput, setPromoInput, onApplyPromo, promoLoading, promoMessage, promoSuccess,
}) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={item.productId} className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={`https://localhost:7113${item.imageUrl}`}
              alt={item.name}
              className="w-14 h-14 object-cover rounded-lg bg-white"
            />
            <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-espresso text-white text-[10px] flex items-center justify-center">
              {i + 1}
            </span>
          </div>
          <p className="flex-1 text-sm font-medium text-espresso uppercase">{item.name}</p>
          {item.isOnSale ? (
            <div className="text-right">
              <p className="text-muted text-xs line-through">LE {(item.originalPrice * item.quantity).toFixed(2)}</p>
              <p className="text-sm text-espresso font-semibold">LE {(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ) : (
            <p className="text-sm text-espresso font-semibold">LE {(item.price * item.quantity).toFixed(2)}</p>
          )}
        </div>
      ))}

      <div className="flex gap-2 pt-1">
        <input
          value={promoInput}
          onChange={(e) => setPromoInput(e.target.value)}
          placeholder="Discount code or gift card"
          className="flex-1 bg-white border border-line rounded-full px-4 py-2.5 text-sm text-espresso placeholder:text-muted/60 focus:outline-none focus:border-espresso transition"
        />
        <button
          type="button"
          onClick={onApplyPromo}
          disabled={promoLoading || !promoInput}
          className="px-5 py-2.5 rounded-full bg-espresso text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {promoLoading ? "..." : "Apply"}
        </button>
      </div>
      {promoMessage && (
        <p className={`text-xs ${promoSuccess ? "text-sage" : "text-brick"}`}>{promoMessage}</p>
      )}

      <div className="border-t border-line pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-espresso">Subtotal · {itemCount} item{itemCount !== 1 ? "s" : ""}</span>
          <span className="text-espresso">LE {subtotal.toFixed(2)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-espresso">Discount</span>
            <span className="text-sage">− LE {discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm items-center">
          <span className="text-espresso">Shipping</span>
          <span className="flex items-center gap-2">
            {freeShippingApplied && originalShippingFee > 0 && (
              <span className="text-muted line-through text-xs">LE {originalShippingFee.toFixed(2)}</span>
            )}
            {freeShippingApplied ? (
              <span className="text-espresso font-medium">FREE</span>
            ) : (
              <span className="text-espresso">LE {shippingFee.toFixed(2)}</span>
            )}
          </span>
        </div>
        {freeShippingApplied && (
          <p className="text-xs text-muted flex items-center gap-1">🏷 Free delivery</p>
        )}
      </div>

      <div className="border-t border-line pt-4 flex justify-between items-baseline">
        <span className="font-body font-bold text-lg text-espresso">Total</span>
        <span className="font-body font-bold text-xl text-espresso">LE {total.toFixed(2)}</span>
      </div>

      {totalSavings > 0 && (
        <p className="text-xs text-muted flex items-center gap-1">🏷 Total savings LE {totalSavings.toFixed(2)}</p>
      )}
    </div>
  );
}

export default OrderSummaryDetails;