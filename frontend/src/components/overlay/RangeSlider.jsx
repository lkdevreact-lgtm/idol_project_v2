import React from "react";

const RangeSlider = ({ label, min, max, value, onChange, isRange = false, step = 1, unit = "" }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-white/40">{label}</label>
        <span className="text-[10px] font-mono text-[#d946ef] bg-[#d946ef]/10 px-1.5 py-0.5 rounded">
          {isRange ? `${value.min}${unit} - ${value.max}${unit}` : `${value}${unit}`}
        </span>
      </div>
      
      {isRange ? (
        <div className="flex gap-4 items-center">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value.min}
            onChange={(e) => onChange({ ...value, min: Number(e.target.value) })}
            className="flex-1 w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#06b6d4]"
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value.max}
            onChange={(e) => onChange({ ...value, max: Number(e.target.value) })}
            className="flex-1 w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#d946ef]"
          />
        </div>
      ) : (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#d946ef]"
        />
      )}
    </div>
  );
};

export default RangeSlider;
