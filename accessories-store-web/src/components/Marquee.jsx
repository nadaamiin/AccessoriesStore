const phrases = [
  "Handmade with Love",
  "Fast & Easy Ordering",
  "Unique, One-of-a-Kind Pieces",
  "Crafted With Care in Egypt",
];

function Marquee() {
  // Repeat the set several times so the track is always wider than the viewport,
  // then duplicate that whole block once for a seamless -50% loop.
  const block = Array(4).fill(phrases).flat();
  const items = [...block, ...block];

  return (
    <div className="bg-nav py-2 overflow-hidden border-y border-blush-200/60">
      <div className="flex w-max animate-marquee">
        {items.map((text, i) => (
          <span key={i} className="flex items-center gap-8 px-8 whitespace-nowrap">
            <span className="font-display text-espresso text-sm md:text-base">{text}</span>
            <span className="text-rose-500 text-lg">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default Marquee;