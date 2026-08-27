import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/orders";
import { getShipping } from "../api/shipping";
import { validatePromoCode } from "../api/promoCodes";
import CheckoutHeader from "../components/CheckoutHeader";
import MobileOrderSummary from "../components/MobileOrderSummary";
import MobilePromoAndTotals from "../components/MobilePromoAndTotals";
import OrderSummaryPanel from "../components/OrderSummaryPanel";
import CartDrawer from "../components/CartDrawer";

const GOVERNORATES = [
  "Cairo", "Giza"
];

const SAVED_INFO_KEY = "checkoutInfo";

const REQUIRED_MESSAGES = {
  email: "Enter an email",
  firstName: "Enter a first name",
  lastName: "Enter a last name",
  address: "Enter an address",
  city: "Enter a city",
  phone: "Enter a phone number",
};

function parseErrorMessage(rawError) {
  if (typeof rawError !== "string") {
    return "Something went wrong placing your order. Please try again.";
  }

  const stockMatch = rawError.match(/Insufficient stock for '(.+?)'\. Available: (\d+)\./);
  if (stockMatch) {
    const [, productName, available] = stockMatch;
    return available === "0"
      ? `Sorry, '${productName}' just sold out — please remove it from your bag.`
      : `Only ${available} of '${productName}' left — please update the quantity in your bag.`;
  }

  return rawError;
}

function Field({ label, name, value, onChange, type = "text", error, ...props }) {
  return (
    <div>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={label}
        className={`w-full bg-white border rounded-lg px-4 py-3 text-espresso placeholder:text-muted/60 focus:outline-none transition ${
        error ? "border-brick" : "border-line focus:border-espresso"
      }`}
        {...props}
      />
      {error && <p className="text-brick text-xs mt-1.5">{error}</p>}
    </div>
  );
}

function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "", firstName: "", lastName: "", address: "",
    city: "", governorate: "Cairo", postalCode: "", phone: "", saveInfo: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState("");

  const [shipping, setShipping] = useState({ shippingFee: 0, freeShippingThreshold: 0 });
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCode, setAppliedCode] = useState(null);

  useEffect(() => {
    getShipping().then((res) => setShipping(res.data)).catch(() => {});
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_INFO_KEY));
      if (saved) setForm((prev) => ({ ...prev, ...saved, saveInfo: true }));
    } catch {}
  }, []);

  const subtotal = totalPrice;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const itemsOriginalTotal = items.reduce((sum, i) => sum + (i.originalPrice ?? i.price) * i.quantity, 0);
  const freeShippingApplied = shipping.freeShippingThreshold > 0 && subtotal >= shipping.freeShippingThreshold;
  const originalShippingFee = shipping.shippingFee;
  const shippingFee = freeShippingApplied ? 0 : shipping.shippingFee;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  const totalBeforeSavings = itemsOriginalTotal + originalShippingFee;
  const totalSavings = Math.max(0, totalBeforeSavings - total);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleApplyPromo = async () => {
    if (!promoInput) return;
    setPromoLoading(true);
    setPromoMessage("");
    try {
      const res = await validatePromoCode(promoInput, subtotal);
      if (res.data.valid) {
        setDiscountAmount(res.data.discountAmount);
        setAppliedCode(promoInput.trim().toUpperCase());
        setPromoSuccess(true);
        setPromoMessage(res.data.message);
      } else {
        setDiscountAmount(0);  
        setAppliedCode(null);  
        setPromoSuccess(false);  
        setPromoMessage("Enter a valid discount code"); 
      }
    } catch {
      setPromoSuccess(false);
      setPromoMessage("Couldn't validate that code. Try again.");
    } finally {
      setPromoLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    for (const field of ["email", "firstName", "lastName", "address", "city", "phone"]) {
      if (!form[field].trim()) errs[field] = REQUIRED_MESSAGES[field];
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = "Enter a valid email";
    }
    return errs;
  };

  const errors = attempted ? validate() : {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    const errs = validate();
    if (Object.keys(errs).length > 0) return;
    if (items.length === 0) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await createOrder({
        customerName: `${form.firstName} ${form.lastName}`.trim(),
        customerEmail: form.email,
        customerPhone: form.phone,
        shippingAddress: `${form.address}, ${form.city}${form.postalCode ? `, ${form.postalCode}` : ""}, ${form.governorate}, Egypt`,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        promoCode: appliedCode,
      });

      if (form.saveInfo) {
        localStorage.setItem(SAVED_INFO_KEY, JSON.stringify({
          email: form.email, firstName: form.firstName, lastName: form.lastName,
          address: form.address, city: form.city, governorate: form.governorate,
          postalCode: form.postalCode, phone: form.phone,
        }));
      } else {
        localStorage.removeItem(SAVED_INFO_KEY);
      }

      clearCart();
      sessionStorage.setItem("justOrdered", "1");
      navigate("/", { replace: true });
      navigate("/order-confirmation", { state: { order: res.data } });
    } catch (err) {
      setError(parseErrorMessage(err.response?.data));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {  
  return (  
    <div className="min-h-screen bg-blush-50">  
      <CheckoutHeader />  
      <CartDrawer />  
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">  
        <p className="text-muted">Your bag is empty — add something before checking out.</p>  
      </div>  
    </div>  
  );  
  }  
  
  const summaryProps = {  
  items, itemCount, subtotal, discountAmount,  
  shippingFee, originalShippingFee, freeShippingApplied,  
  total, totalSavings, totalBeforeSavings,  
  promoInput, setPromoInput, onApplyPromo: handleApplyPromo,  
  promoLoading, promoMessage, promoSuccess,  
  setPromoMessage, setPromoSuccess,  
  };  
  
  return (  
    <div className="min-h-screen bg-blush-50">  
      <CheckoutHeader />  
      <CartDrawer />  
  
      {/* Mobile order summary stays stacked on top */}  
      <div className="lg:hidden max-w-6xl mx-auto px-6 py-8">  
        <MobileOrderSummary {...summaryProps} />  
      </div>  
  
      {/* Desktop split — each half fills its side of the screen */}  
      <div className="lg:grid lg:grid-cols-2 lg:min-h-screen">  
        {/* Left half: form on page background */}  
        <div className="bg-blush-50 lg:flex lg:justify-end">  
          <div className="w-full lg:max-w-xl px-6 py-8 lg:pr-12">  
            <form onSubmit={handleSubmit} noValidate>  
              <h2 className="font-body text-lg font-bold text-espresso mb-3">Contact</h2>  
              <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />  
  
              <h2 className="font-body text-lg font-bold text-espresso mt-8 mb-3">Delivery</h2>  
              <div className="space-y-3">  
                <div className="bg-blush-100 rounded-lg px-4 py-3">  
                  <p className="text-xs text-muted">Country/Region</p>  
                  <p className="text-espresso">Egypt</p>  
                </div>  
  
                <div className="grid grid-cols-2 gap-3">  
                  <Field label="First name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} />  
                  <Field label="Last name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} />  
                </div>  
  
                <Field label="Address" name="address" value={form.address} onChange={handleChange} error={errors.address} />  
  
                <div className="grid grid-cols-2 gap-3">  
                  <Field label="City" name="city" value={form.city} onChange={handleChange} error={errors.city} />  
                  <Field label="Postal code (optional)" name="postalCode" value={form.postalCode} onChange={handleChange} />  
                </div>  
  
                <div>  
                  <label className="block text-xs font-medium tracking-wide uppercase text-muted mb-1.5">Governorate</label>  
                  <select  
                    name="governorate"  
                    value={form.governorate}  
                    onChange={handleChange}  
                    className="w-full bg-white border border-line rounded-lg px-4 py-3 text-espresso focus:outline-none focus:border-rose-300 transition"  
                  >  
                    {GOVERNORATES.map((g) => (  
                      <option key={g} value={g}>{g}</option>  
                    ))}  
                  </select>  
                </div>  
  
                <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} />  
  
                <label className="flex items-center gap-2 text-sm text-espresso pt-1">  
                  <input type="checkbox" name="saveInfo" checked={form.saveInfo} onChange={handleChange} />  
                  Save this information for next time  
                </label>  
              </div>  
  
              <h2 className="font-body text-lg font-bold text-espresso mt-8 mb-3">Shipping</h2>  
              <div className="bg-blush-100 border border-line rounded-lg px-4 py-4 flex items-center justify-between">  
                <span className="text-sm font-medium text-espresso">Standard Delivery</span>  
                {freeShippingApplied ? (  
                  <span className="text-sage text-sm font-semibold">FREE</span>  
                ) : (  
                  <span className="text-espresso text-sm font-semibold">LE {shippingFee.toFixed(2)}</span>  
                )}  
              </div>  
  
              <h2 className="font-body text-lg font-bold text-espresso mt-8 mb-3">Payment</h2>  
              <p className="text-xs text-muted mb-3">All orders are fulfilled with cash on delivery.</p>  
              <div className="bg-blush-100 border border-line rounded-lg px-4 py-4 flex items-center gap-3">  
                <span className="w-4 h-4 rounded-full border-2 border-espresso flex items-center justify-center shrink-0">  
                  <span className="w-2 h-2 rounded-full bg-espresso" />  
                </span>  
                <span className="text-sm font-medium text-espresso">Cash on Delivery (COD)</span>  
              </div>  
  
              <MobilePromoAndTotals {...summaryProps} />  
  
              {error && (
                <div className="flex items-start gap-2.5 mt-4 px-4 py-3 rounded-lg bg-brick/10 border border-brick/20">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brick shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-brick text-sm leading-snug">{error}</p>
                </div>
              )}  
  
              <button  
                type="submit"  
                disabled={submitting}  
                className="w-full mt-4 py-4 rounded-full bg-espresso text-white text-sm font-semibold tracking-wide uppercase hover:opacity-90 transition disabled:opacity-50"  
              >  
                {submitting ? "Placing Order..." : "Place Order"}  
              </button>  
            </form>  
          </div>  
        </div>  
  
        {/* Right half: order summary on distinct background, bleeds to edge */}  
        <div className="hidden lg:block bg-blush-100 border-l border-line">  
          <div className="w-full lg:max-w-xl px-6 py-8 lg:pl-12 sticky top-8">  
            <OrderSummaryPanel {...summaryProps} />  
          </div>  
        </div>  
      </div>  
    </div>  
  );
}

export default Checkout;