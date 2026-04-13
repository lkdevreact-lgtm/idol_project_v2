import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { IMAGES, SOCKET_URL } from "../utils/constant";

// Colored numeric rank badge to be placed on TOP RIGHT of avatar
const RankOverlay = ({ rank }) => {
  const getRankStyle = (r) => {
    if (r === 1) return { bg: "bg-[#fbbf24]", text: "text-black", border: "border-[#fcd34d]" };
    if (r === 2) return { bg: "bg-[#cbd5e1]", text: "text-black", border: "border-white" };
    if (r === 3) return { bg: "bg-[#fb923c]", text: "text-black", border: "border-[#fdba74]" };
    return { bg: "bg-black/80", text: "text-white/70", border: "border-white/20" };
  };

  const style = getRankStyle(rank);

  return (
    <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 ${style.bg} ${style.border} rounded-full flex items-center justify-center border z-10 shadow-sm`}>
      <span className={`text-[6px] font-black ${style.text}`}>{rank}</span>
    </div>
  );
};

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const debounceRef = useRef(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const [logsRes, giftsRes] = await Promise.all([
        fetch(`${SOCKET_URL}/api/stats/leaderboard`),
        fetch(`${SOCKET_URL}/api/gifts`),
      ]);
      if (!logsRes.ok || !giftsRes.ok) return;
      const logs = await logsRes.json();
      const gifts = await giftsRes.json();
      const diamondMap = {};
      gifts.forEach((g) => { if (g.giftId && g.diamonds !== undefined) diamondMap[g.giftId] = g.diamonds; });
      const gifterStats = {};
      logs.forEach((log) => {
        if (!log.userId) return;
        if (!gifterStats[log.userId]) {
          gifterStats[log.userId] = {
            id: log.userId, nickname: log.nickname, profilePicture: log.profilePicture, totalDiamonds: 0,
          };
        }
        const diamonds = diamondMap[log.giftId] ?? log.diamonds ?? 0;
        const amount = log.amount || 1;
        gifterStats[log.userId].totalDiamonds += amount * diamonds;
      });
      const sorted = Object.values(gifterStats).sort((a, b) => b.totalDiamonds - a.totalDiamonds).slice(0, 5);
      setData(sorted);
      setLastUpdated(new Date());
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const debouncedFetch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchLeaderboard(), 500);
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    const socket = io(SOCKET_URL);
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("tiktok_gift", () => debouncedFetch());
    return () => { clearInterval(interval); socket.disconnect(); if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      {/* List */}
      <div className="flex-1 overflow-y-auto px-1 py-0.5 flex flex-col gap-1 custom-scrollbar">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-1 py-0.5 rounded hover:bg-white/[0.03] transition-colors group"
            >
              {/* Avatar with Numeric Rank Overlay */}
              <div className="relative shrink-0">
                <RankOverlay rank={index + 1} />
                <img
                  src={item.profilePicture || "/images/default_avatar.png"}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover opacity-90 group-hover:opacity-100 transition-opacity border border-white/5"
                  onError={(e) => { e.target.src = "/images/default_avatar.png"; }}
                />
              </div>

              {/* Info: Nickname & Points */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-[7.5px] font-bold text-white/90 truncate leading-tight max-w-[85px] lg:max-w-[180px]">
                  {item.nickname}
                </p>
                <p className="text-[7px] font-medium text-[#eab308] leading-tight tabular-nums mt-0.5">
                  {item.totalDiamonds.toLocaleString()} <span className="text-[5.5px] opacity-40 font-normal">pts</span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-3 text-center text-white/10 text-[7.5px]">
            {loading ? "..." : "No data"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
