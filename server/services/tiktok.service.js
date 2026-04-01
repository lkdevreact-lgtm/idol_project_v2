import { WebcastPushConnection } from "tiktok-live-connector";
import { registerGift } from "./gifts.service.js";

let tiktokLiveConnection = null;

/**
 * Kết nối tới TikTok Live của `username`.
 * @param {string} username
 * @param {import("socket.io").Server} io
 * @param {object[]} knownGifts  - Mảng shared để lưu gift (mutate in-place)
 * @param {import("express").Response} [res]
 */
export const connectToTikTok = (username, io, knownGifts, res) => {
  // Ngắt kết nối cũ nếu có
  if (tiktokLiveConnection) {
    try {
      tiktokLiveConnection.disconnect();
    } catch (e) {
      console.log("[tiktok] Disconnect error:", e.message);
    }
  }

  console.log(`[tiktok] Attempting to connect to @${username}...`);
  tiktokLiveConnection = new WebcastPushConnection(username);

  tiktokLiveConnection
    .connect()
    .then((state) => {
      console.info(`[tiktok] Connected to roomId ${state.roomId}`);
      io.emit("tiktok_connected", username);
      if (res) res.json({ success: true, message: `Connected to ${username}` });
    })
    .catch((err) => {
      console.error("[tiktok] Failed to connect:", err);
      if (res)
        res.status(500).json({ success: false, message: "Failed to connect" });
    });

  // ── Sự kiện Gift ──────────────────────────────────────────────
  tiktokLiveConnection.on("gift", (data) => {
    if (data.giftType === 1 && !data.repeatEnd) {
      console.log(
        `[gifts] ⏭ Skipping streak gift: ${data.giftName} (repeatEnd=false)`
      );
      return;
    }

    console.log(
      `[gifts] 🎁 Nhận gift: "${data.giftName}" | giftId=${data.giftId} | từ @${data.uniqueId} | qty=${data.repeatCount}`
    );

    registerGift(data, knownGifts);

    const isRose =
      data.giftName.toLowerCase().includes("rose") ||
      data.giftName.toLowerCase().includes("hoa hồng") ||
      data.giftId === 5655;

    if (isRose) {
      console.log("[tiktok] Rose received! Emitting tiktok_gift...");
      io.emit("tiktok_gift", {
        user: data.uniqueId,
        giftName: data.giftName,
        giftId: data.giftId,
        nickname: data.nickname,
        profilePicture: data.profilePictureUrl,
        amount: data.repeatCount || 1,
        type: "rose",
      });
    } else {
      io.emit("tiktok_gift_other", {
        user: data.uniqueId,
        giftName: data.giftName,
        nickname: data.nickname,
        amount: data.repeatCount || 1,
        profilePicture: data.profilePictureUrl,
      });
    }
  });

  // ── Sự kiện Chat ──────────────────────────────────────────────
  tiktokLiveConnection.on("chat", (data) => {
    io.emit("tiktok_chat", {
      user: data.uniqueId,
      nickname: data.nickname,
      comment: data.comment,
      profilePicture: data.profilePictureUrl,
    });
  });

  // ── Sự kiện Disconnect ────────────────────────────────────────
  tiktokLiveConnection.on("disconnected", () => {
    console.log("[tiktok] Disconnected from TikTok");
    io.emit("tiktok_disconnected");
  });
};
