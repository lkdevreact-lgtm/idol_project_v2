import React, { useMemo } from "react";
import { useVideoStore } from "../hooks/useVideoStore";

const rankStyles = {
  1: {
    label: "TOP 1",
    size: "w-[52px] h-[52px] sm:w-[58px] sm:h-[58px]",
    ring: "ring-2 ring-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.3)]",
    labelClass: "text-[#fbbf24] drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]",
    scoreClass: "text-[#fbbf24] drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]",
    badgeBg: "bg-gradient-to-r from-[#fbbf24]/40 to-[#f59e0b]/40 border border-[#fbbf24]/60",
  },
  2: {
    label: "TOP 2",
    size: "w-[42px] h-[42px] sm:w-[46px] sm:h-[46px]",
    ring: "ring-2 ring-[#06b6d4] shadow-[0_0_10px_rgba(6,182,212,0.3)]",
    labelClass: "text-[#06b6d4] drop-shadow-[0_0_4px_rgba(6,182,212,0.8)]",
    scoreClass: "text-[#06b6d4] drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]",
    badgeBg: "bg-gradient-to-r from-[#06b6d4]/40 to-[#0ea5e9]/40 border border-[#06b6d4]/60",
  },
  3: {
    label: "TOP 3",
    size: "w-[42px] h-[42px] sm:w-[46px] sm:h-[46px]",
    ring: "ring-2 ring-[#d946ef] shadow-[0_0_10px_rgba(217,70,239,0.3)]",
    labelClass: "text-[#d946ef] drop-shadow-[0_0_4px_rgba(217,70,239,0.8)]",
    scoreClass: "text-[#d946ef] drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]",
    badgeBg: "bg-gradient-to-r from-[#d946ef]/40 to-[#a855f7]/40 border border-[#d946ef]/60",
  },
};

function PodiumCell({ rank, data }) {
  const st = rankStyles[rank];
  return (
    <div className={`w-full max-w-[80px] sm:max-w-[100px] flex flex-col items-center justify-end relative ${rank === 1 ? 'z-20' : 'z-10'}`}>

      {/* Avatar Container */}
      <div className="relative flex flex-col items-center justify-center mb-0.5">
        <div
          className={`relative rounded-full overflow-hidden ${st.size} ${st.ring} bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 transition-transform hover:scale-105 duration-300 border border-white/20 shadow-xl`}
        >
          {data?.avatar ? (
            <img
              src={data?.avatar}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40 text-[10px] bg-white/5 font-black uppercase">
              N/A
            </div>
          )}
        </div>

        {/* Rank Badge */}
        <div className={`absolute -bottom-2 px-2 py-0.5 rounded-full ${st.badgeBg} backdrop-blur-xl z-10 shadow-lg flex items-center justify-center`}>
          <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] text-center whitespace-nowrap ${st.labelClass} leading-none mb-[0.5px]`}>
            {st.label}
          </span>
        </div>
      </div>

      {/* Info Container */}
      <div className="flex flex-col items-center justify-center w-full px-1 pt-3 pb-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl mt-0.5 shadow-2xl">
        <p className="text-[8px] sm:text-[9px] font-black text-white truncate max-w-full px-1 text-center w-full drop-shadow-md tracking-tight">
          {data?.name || "—"}
        </p>
        <p className={`text-[13px] sm:text-[15px] font-black tabular-nums leading-none mt-1 ${st.scoreClass}`}>
          {data?.score ?? "0"}
        </p>
        <p className="text-[6px] text-white/40 uppercase tracking-[0.2em] mt-1 font-black">Points</p>
      </div>

    </div>
  );
}


const VideoGiftPodium = () => {
  const videos = useVideoStore((state) => state.videos);
  const videoGiftScores = useVideoStore((state) => state.videoGiftScores);

  const { first, second, third } = useMemo(() => {
    const ranked = Object.entries(videoGiftScores)
      .filter(([, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([path, score]) => {
        const v = videos.find((x) => x.video === path);
        return {
          path,
          score,
          name: v?.name ?? path.split("/").pop() ?? "—",
          avatar: v?.avatar ?? "",
        };
      });
    return {
      first: ranked[0] ?? null,
      second: ranked[1] ?? null,
      third: ranked[2] ?? null,
    };
  }, [videoGiftScores, videos]);

  return (
    <div className="absolute top-2 sm:top-4 left-0 right-0 z-[100] pointer-events-none px-2 pt-1">
      <div className="mx-auto max-w-[300px]">
        <div className="flex flex-row items-end justify-center gap-1 sm:gap-2 px-1 pb-1">
          <div className="flex-1 flex justify-center translate-y-2 sm:translate-y-3">
            <PodiumCell rank={2} data={second} />
          </div>
          <div className="flex-1 flex justify-center -translate-y-1 sm:-translate-y-2 scale-105 origin-bottom">
            <PodiumCell rank={1} data={first} />
          </div>
          <div className="flex-1 flex justify-center translate-y-2 sm:translate-y-3">
            <PodiumCell rank={3} data={third} />
          </div>
        </div>
      </div>
    </div>
  );
};


export default VideoGiftPodium;
