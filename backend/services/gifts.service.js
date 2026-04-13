import { supabase } from "../config/supabase.js";

// Lấy danh sách toàn bộ gifts từ Supabase (ordered theo id để ổn định)
export const loadGifts = async () => {
  try {
    const { data, error } = await supabase
      .from("gifts")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error("[gifts] Could not read gifts from Supabase:", e.message);
    return [];
  }
};

// Đăng ký/Cập nhật gift khi nhận được từ TikTok Live
export const registerGift = async (giftData) => {
  const giftId = Number(giftData.giftId);
  const newRepeatCount = giftData.repeatCount || 1;

  try {
    // Kiểm tra xem gift đã tồn tại chưa
    const { data: existingGifts, error: fetchError } = await supabase
      .from("gifts")
      .select("*")
      .eq("giftId", giftId)
      .limit(1);

    if (fetchError) throw fetchError;

    if (existingGifts && existingGifts.length > 0) {
      // Gift đã tồn tại -> Cập nhật nếu cần
      const gift = existingGifts[0];
      const updates = {};
      let needsUpdate = false;

      if (!gift.image && giftData.giftPictureUrl) {
        updates.image = giftData.giftPictureUrl;
        needsUpdate = true;
      }
      if ((gift.diamonds === undefined || gift.diamonds === null) && giftData.diamondCount !== undefined) {
        updates.diamonds = giftData.diamondCount;
        needsUpdate = true;
      }
      if (!gift.maxRepeatCount || newRepeatCount > gift.maxRepeatCount) {
        updates.maxRepeatCount = newRepeatCount;
        needsUpdate = true;
        console.log(`[gifts] 🏆 New record for "${giftData.giftName}": ${newRepeatCount}`);
      }

      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from("gifts")
          .update(updates)
          .eq("giftId", giftId);
          
        if (updateError) throw updateError;
      }
      return { saved: false };
    } else {
      // Bổ sung Gift mới vào Database
      const newGift = {
        giftId: giftId,
        giftName: giftData.giftName,
        image: giftData.giftPictureUrl,
        diamonds: giftData.diamondCount || 0,
        active: true,
        maxRepeatCount: newRepeatCount,
      };

      const { data: insertedGift, error: insertError } = await supabase
        .from("gifts")
        .insert([newGift])
        .select();

      if (insertError) throw insertError;
      
      console.log(`[gifts] 💾 Đã lưu gift mới: "${giftData.giftName}" (id=${giftId}) | 💎 ${giftData.diamondCount}`);
      return { saved: true, data: insertedGift[0] };
    }
  } catch (err) {
    console.error("[gifts] Error in registerGift:", err.message);
    return { saved: false };
  }
};
