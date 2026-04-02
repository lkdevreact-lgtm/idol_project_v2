import fs from "fs";
import { GIFTS_FILE } from "../config/paths.js";

export const loadGifts = () => {
  try {
    if (!fs.existsSync(GIFTS_FILE)) return [];
    const raw = fs.readFileSync(GIFTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[gifts] Could not read gifts.json:", e.message);
    return [];
  }
};

export const saveGifts = (gifts) => {
  try {
    fs.writeFileSync(GIFTS_FILE, JSON.stringify(gifts, null, 2), "utf-8");
  } catch (e) {
    console.error("[gifts] Could not write gifts.json:", e.message);
  }
};


export const registerGift = (giftData, knownGifts) => {
  const giftId = Number(giftData.giftId);
  const giftIndex = knownGifts.findIndex((g) => Number(g.giftId) === giftId);

  if (giftIndex !== -1) {
    // If gift exists but lacks info or has a new maxRepeatCount record
    const gift = knownGifts[giftIndex];
    let updated = false;

    if (!gift.image && giftData.giftPictureUrl) {
      gift.image = giftData.giftPictureUrl;
      updated = true;
    }
    if ((gift.diamonds === undefined || gift.diamonds === null) && giftData.diamondCount !== undefined) {
      gift.diamonds = giftData.diamondCount;
      updated = true;
    }

    // New: Track maxRepeatCount record
    const newRepeatCount = giftData.repeatCount || 1;
    if (!gift.maxRepeatCount || newRepeatCount > gift.maxRepeatCount) {
      gift.maxRepeatCount = newRepeatCount;
      updated = true;
      console.log(`[gifts] 🏆 New record for "${giftData.giftName}": ${newRepeatCount}`);
    }

    // Ensure active field exists for old records
    if (gift.active === undefined) {
      gift.active = true;
      updated = true;
    }
    
    if (updated) {
      saveGifts(knownGifts);
    }
    return { saved: false, total: knownGifts.length };
  }

  const newGift = {
    giftId: giftId,
    giftName: giftData.giftName,
    image: giftData.giftPictureUrl,
    diamonds: giftData.diamondCount,
    active: true, // Default to active
    maxRepeatCount: giftData.repeatCount || 1, // Record first streak
  };

  knownGifts.push(newGift);
  saveGifts(knownGifts);
  console.log(
    `[gifts] 💾 Đã lưu gift mới: "${giftData.giftName}" (id=${giftId}) | 💎 ${giftData.diamondCount} → tổng ${knownGifts.length} gift(s)`
  );
  return { saved: true, total: knownGifts.length };
};
