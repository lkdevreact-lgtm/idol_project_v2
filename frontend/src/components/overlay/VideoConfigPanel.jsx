import React from "react";
import PositionGrid from "./PositionGrid";
import RangeSlider from "./RangeSlider";

const VideoConfigPanel = ({ config, onChange }) => {
  const safeConfig = {
    position: config.position ?? "center",
    scale: config.scale ?? 100,
    loop: config.loop ?? false,
    ...config,
  };

  const update = (key, val) => onChange({ ...safeConfig, [key]: val });

  return (
    <div className="flex flex-col gap-6 p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
      <PositionGrid
        value={safeConfig.position}
        onChange={(v) => update("position", v)}
      />

      <div className="border-t border-white/5 pt-4">
        <RangeSlider
          label="Thu phóng (Scale)"
          min={10} max={200} step={1}
          unit="%"
          value={safeConfig.scale}
          onChange={(v) => update("scale", v)}
        />
      </div>

      <div className="border-t border-white/5 pt-4 flex items-center justify-between">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-white">Lặp lại video (Loop)</label>
          <span className="text-[10px] text-gray-500">Video sẽ phát liên tục, không tự mất</span>
        </div>
        <button
          onClick={() => update("loop", !safeConfig.loop)}
          className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
            safeConfig.loop ? "bg-[#d946ef]" : "bg-white/10"
          }`}
        >
          <div
            className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${
              safeConfig.loop ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default VideoConfigPanel;
