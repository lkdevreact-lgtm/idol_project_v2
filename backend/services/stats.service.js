import { supabase } from "../config/supabase.js";

/**
 * Log a gift transaction to Supabase gift_logs table
 */
export const logGift = async (giftData) => {
  try {
    const newLog = {
      giftId: Number(giftData.giftId),
      giftName: giftData.giftName,
      userId: giftData.userId || giftData.uniqueId,
      nickname: giftData.nickname,
      profilePicture: giftData.profilePictureUrl || giftData.profilePicture || "",
      amount: giftData.amount || giftData.repeatCount || 1,
      diamonds: giftData.diamonds || giftData.diamondCount || 0,
      timestamp: new Date().toISOString(),
    };

    const { error } = await supabase.from("gift_logs").insert([newLog]);
    if (error) throw error;

    console.log(
      `[stats] 📝 Logged gift: ${giftData.giftName} x${newLog.amount} from ${giftData.nickname}`
    );
  } catch (e) {
    console.error("[stats] Error logging gift to Supabase:", e.message);
  }
};

export const getLeaderboard = async () => {
  try {
    const { data, error } = await supabase
      .from("gift_logs")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error("[stats] Error reading gift logs from Supabase:", e.message);
    return [];
  }
};

/**
 * Clear the leaderboard (reset for a new live session)
 */
export const clearLeaderboard = async () => {
  try {
    // Delete all rows safely. In Supabase, you need a condition to delete all.
    // eq('id', id) or just delete with neq.
    // Using a dummy filter to delete all
    const { error } = await supabase
      .from("gift_logs")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // deletes all rows

    if (error) throw error;
    console.log("[stats] 🧹 Leaderboard reset for new live session.");
  } catch (e) {
    console.error("[stats] Error resetting leaderboard:", e.message);
  }
};
