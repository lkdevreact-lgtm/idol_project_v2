import React, { useMemo } from "react";
import { useVideoStore } from "../hooks/useVideoStore";
import { useIdolStore } from "../hooks/useIdolStore";

const rankStyles = {
  1: {
    label: "TOP 1",
    color: "text-[#fbbf24]",
    glow: "shadow-[0_0_15px_rgba(251,191,36,0.3)]",
    crown: "👑",
  },
  2: {
    label: "TOP 2",
    color: "text-[#cbd5e1]",
    glow: "shadow-[0_0_10px_rgba(203,213,225,0.2)]",
    crown: "🥈",
  },
  3: {
    label: "TOP 3",
    color: "text-[#fb923c]",
    glow: "shadow-[0_0_10px_rgba(249,146,60,0.2)]",
    crown: "🥉",
  },
};

function PodiumCell({ rank, data }) {
  const st = rankStyles[rank];
  const isTop1 = rank === 1;

  return (
    <div className={`flex flex-col items-center justify-end relative ${isTop1 ? 'z-20 scale-110' : 'z-10 scale-95 opacity-90'}`}>
      {/* Avatar with rank icon */}
      <div className="relative group">
        <div className={`relative rounded-full overflow-hidden ${isTop1 ? 'w-14 h-14' : 'w-11 h-11'} bg-black/40 backdrop-blur-md border border-white/10 ${st.glow} transition-transform duration-300`}>
          {data?.avatar ? (
            <img src={data.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] text-white/20 font-bold bg-white/[0.02]">N/A</div>
          )}
        </div>
        {/* Floating Rank Icon */}
        <div className="absolute -top-1 -right-1 text-base drop-shadow-lg">
          {st.crown}
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-1.5 px-3 py-1 bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[1.2rem] flex flex-col items-center min-w-[70px] shadow-2xl">
        <span className="text-[10px] font-semibold text-white/90 truncate max-w-[80px] leading-tight">
          {data?.name || "—"}
        </span>
        
        <div className="flex items-center gap-1 mt-0.5">
          <span className={`text-[10px] font-black tabular-nums ${st.color}`}>
            {data?.score?.toLocaleString() ?? "0"}
          </span>
          <span className="text-[7px] font-bold text-white/30 lowercase">xu</span>
        </div>

        {/* Gift History Row */}
        {data?.history && data.history.length > 0 && (
          <div className="flex items-center justify-center gap-0.5 mt-1 border-t border-white/5 pt-1 w-full max-w-[60px] overflow-hidden">
            {data.history.slice(0, 4).map((img, i) => (
              <img 
                key={i} 
                src={img} 
                className="w-3 h-3 object-contain opacity-80" 
                alt="" 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const VideoGiftPodium = () => {
  const idols = useIdolStore((state) => state.idols);
  const idolGiftScores = useVideoStore((state) => state.idolGiftScores);
  const idolGiftHistory = useVideoStore((state) => state.idolGiftHistory);

  const { first, second, third } = useMemo(() => {
    const ranked = idols
      .map(idol => ({
        id: idol.id,
        name: idol.name,
        avatar: idol.avatar,
        score: idolGiftScores[idol.id] || 0,
        history: idolGiftHistory[idol.id] || [],
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return {
      first: ranked[0] ?? null,
      second: ranked[1] ?? null,
      third: ranked[2] ?? null,
    };
  }, [idols, idolGiftScores, idolGiftHistory]);

  return (
    <div className="absolute top-4 left-0 right-0 z-[100] pointer-events-none px-2 sm:px-4">
      <div className="flex flex-row items-end justify-center gap-3 sm:gap-6">
        <PodiumCell rank={2} data={second} />
        <PodiumCell rank={1} data={first} />
        <PodiumCell rank={3} data={third} />
      </div>
    </div>
  );
};

export default VideoGiftPodium;
