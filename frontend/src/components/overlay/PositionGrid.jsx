import React from "react";

const POSITIONS = [
  "top-left", "top-center", "top-right",
  "center-left", "center", "center-right",
  "bottom-left", "bottom-center", "bottom-right"
];

const PositionGrid = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-white/40 mb-1">Vị trí hiển thị (Grid 3x3)</label>
      <div className="grid grid-cols-3 gap-2 w-full max-w-[200px] aspect-square mx-auto bg-white/[0.02] p-3 rounded-2xl border border-white/5">
        {POSITIONS.map((pos) => {
          const isActive = value === pos;
          return (
            <div
              key={pos}
              onClick={() => onChange(pos)}
              className={`w-full h-full rounded-xl border flex items-center justify-center cursor-pointer transition-all
                ${isActive 
                  ? "bg-[#d946ef]/20 border-[#d946ef] shadow-[0_0_15px_rgba(217,70,239,0.3)]" 
                  : "bg-white/[0.05] border-transparent hover:border-white/20"}
              `}
            >
              {isActive && <div className="w-2 h-2 rounded-full bg-[#d946ef] shadow-[0_0_10px_#d946ef]"></div>}
            </div>
          );
        })}
      </div>
      <p className="text-center text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{value.replace("-", " ")}</p>
    </div>
  );
};

export default PositionGrid;
