function PriceRangeSlider({ min, max, valueMin, valueMax, onChange }) {
  const range = max - min || 1;
  const pctMin = ((valueMin - min) / range) * 100;
  const pctMax = ((valueMax - min) / range) * 100;

  const handleMinChange = (e) => {
    const v = Math.min(Number(e.target.value), valueMax - 1);
    onChange(v, valueMax);
  };
  const handleMaxChange = (e) => {
    const v = Math.max(Number(e.target.value), valueMin + 1);
    onChange(valueMin, v);
  };

  return (
    <div>
      <div className="flex justify-between text-sm text-espresso font-medium mb-4">
        <span>LE {valueMin.toFixed(0)}</span>
        <span>LE {valueMax.toFixed(0)}</span>
      </div>
      <div className="relative h-1.5">
        <div className="absolute inset-0 rounded-full bg-nudepink-200" />
        <div
          className="absolute h-full rounded-full bg-espresso"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valueMin}
          onChange={handleMinChange}
          className="range-thumb absolute w-full top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valueMax}
          onChange={handleMaxChange}
          className="range-thumb absolute w-full top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none"
        />
      </div>
    </div>
  );
}

export default PriceRangeSlider;