function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative max-w-sm">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-nude-50 border border-nude-200 rounded-md pl-9 pr-3 py-2 text-sm text-espresso placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-nude-400 focus:border-nude-400 transition"
      />
    </div>
  );
}

export default SearchBar;