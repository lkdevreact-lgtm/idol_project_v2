import { supabase } from "../config/supabase.js";

export const loadVideos = async () => {
  try {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("order", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn("[videos] Could not read videos from Supabase:", e.message);
    return [];
  }
};

export const saveVideo = async (videoData) => {
  try {
    const { data, error } = await supabase
      .from("videos")
      .insert([videoData])
      .select();
    if (error) throw error;
    return data[0];
  } catch (e) {
    console.error("[videos] Could not insert video:", e.message);
    return null;
  }
};

export const updateVideo = async (id, patch) => {
  try {
    const { data, error } = await supabase
      .from("videos")
      .update(patch)
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  } catch (e) {
    console.error("[videos] Could not update video:", e.message);
    return null;
  }
};

export const deleteVideo = async (id) => {
  try {
    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("[videos] Could not delete video:", e.message);
    return false;
  }
};
