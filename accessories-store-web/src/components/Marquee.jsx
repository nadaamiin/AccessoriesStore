const phrases = [
  "Handmade with Love",
  "Unique, One-of-a-Kind Pieces",
  "Crafted With Care in Egypt",
];

function Marquee() {
  const items = [...phrases, ...phrases]; // duplicated for seamless loop

  return (
    <div className="bg-nudepink-300/40 py-4 overflow-hidden border-y border-blush-200/60">
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