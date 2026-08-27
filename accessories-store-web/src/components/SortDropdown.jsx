import { useState, useRef, useEffect } from "react";

const options = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A–Z" },
];

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
    <button
      onClick={() => setOpen((v) => !v)}
      className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold tracking-wide uppercase text-espresso hover:bg-blush-100 active:bg-blush-200 transition-colors"
    >
      <span>Sort</span>

      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M12 5v14M5 12l7 7 7-7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>

      {open && (
        <div className="absolute left-0 right-0 mt-2 bg-white shadow-lg py-2 z-30">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-5 py-2.5 text-sm transition ${
                value === opt.value ? "text-espresso font-medium bg-blush-100" : "text-muted hover:bg-blush-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SortDropdown;