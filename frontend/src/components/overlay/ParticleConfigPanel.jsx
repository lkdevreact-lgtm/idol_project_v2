import React from "react";
import RangeSlider from "./RangeSlider";

const ParticleConfigPanel = ({ config, onChange }) => {
  const [activeTab, setActiveTab] = React.useState("basic");

  // Ensure config has default values if missing
  const safeConfig = {
    quantity: config.quantity ?? 30,
    speed: config.speed ?? { min: 2, max: 5 },
    size: config.size ?? { min: 15, max: 35 },
    opacity: config.opacity ?? { min: 0.6, max: 0.9 },
    direction: config.direction ?? "bottom",
    wobble: config.wobble ?? true,
    wobbleSpeed: config.wobbleSpeed ?? 3,
    rotation: config.rotation ?? true,
    rotationSpeed: config.rotationSpeed ?? 8,
    fadeOut: config.fadeOut ?? true,
    lifespan: config.lifespan ?? 5,
    ...config,
  };

  const update = (key, val) => onChange({ ...safeConfig, [key]: val });

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex bg-white/[0.03] p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("basic")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === "basic" ? "bg-[#d946ef] text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Cơ bản
        </button>
        <button
          onClick={() => setActiveTab("advanced")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === "advanced" ? "bg-[#d946ef] text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Vật lý (Nâng cao)
        </button>
      </div>

      <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex flex-col gap-5">
        {activeTab === "basic" ? (
          <>
            <RangeSlider
              label="Số lượng hạt (Mật độ)"
              min={1} max={200}
              value={safeConfig.quantity}
              onChange={(v) => update("quantity", v)}
            />
            <RangeSlider
              label="Tốc độ rơi"
              min={0.5} max={30} step={0.5}
              isRange
              value={safeConfig.speed}
              onChange={(v) => update("speed", v)}
            />
            <RangeSlider
              label="Kích thước hạt (px)"
              min={5} max={100}
              isRange
              value={safeConfig.size}
              onChange={(v) => update("size", v)}
            />
            <RangeSlider
              label="Độ trong suốt (Opacity)"
              min={0.1} max={1} step={0.1}
              isRange
              value={safeConfig.opacity}
              onChange={(v) => update("opacity", v)}
            />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-white/40">Hướng phát</label>
              <select
                value={safeConfig.direction}
                onChange={(e) => update("direction", e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#d946ef]/60"
              >
                <option value="bottom">Rơi từ trên xuống</option>
                <option value="top">Bắn từ dưới lên</option>
                <option value="none">Nổ từ trung tâm (Explosion)</option>
                <option value="left">Từ phải qua trái</option>
                <option value="right">Từ trái qua phải</option>
              </select>
            </div>

            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold text-white/40">Lắc lư (Wobble)</label>
                <input
                  type="checkbox"
                  checked={safeConfig.wobble}
                  onChange={(e) => update("wobble", e.target.checked)}
                  className="accent-[#d946ef] w-4 h-4 rounded"
                />
              </div>
              {safeConfig.wobble && (
                <RangeSlider
                  label="Tốc độ lắc lư"
                  min={1} max={10}
                  value={safeConfig.wobbleSpeed}
                  onChange={(v) => update("wobbleSpeed", v)}
                />
              )}
            </div>

            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold text-white/40">Xoay (Rotation)</label>
                <input
                  type="checkbox"
                  checked={safeConfig.rotation}
                  onChange={(e) => update("rotation", e.target.checked)}
                  className="accent-[#d946ef] w-4 h-4 rounded"
                />
              </div>
              {safeConfig.rotation && (
                <RangeSlider
                  label="Tốc độ xoay"
                  min={1} max={30}
                  value={safeConfig.rotationSpeed}
                  onChange={(v) => update("rotationSpeed", v)}
                />
              )}
            </div>

            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold text-white/40">Mờ dần khi biến mất (Fade Out)</label>
                <input
                  type="checkbox"
                  checked={safeConfig.fadeOut}
                  onChange={(e) => update("fadeOut", e.target.checked)}
                  className="accent-[#d946ef] w-4 h-4 rounded"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ParticleConfigPanel;
