import { supabase } from "../config/supabase.js";

export const loadIdols = async () => {
  try {
    const { data, error } = await supabase
      .from("idols")
      .select("*")
      .order("order", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn("[idols] Could not read idols from Supabase:", e.message);
    return [];
  }
};

export const saveIdol = async (idolData) => {
  try {
    const { data, error } = await supabase
      .from("idols")
      .insert([idolData])
      .select();
    if (error) throw error;
    return data[0];
  } catch (e) {
    console.error("[idols] Could not insert idol:", e.message);
    return null;
  }
};

export const updateIdol = async (id, patch) => {
  try {
    const { data, error } = await supabase
      .from("idols")
      .update(patch)
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  } catch (e) {
    console.error("[idols] Could not update idol:", e.message);
    return null;
  }
};

export const deleteIdol = async (id) => {
  try {
    const { error } = await supabase
      .from("idols")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("[idols] Could not delete idol:", e.message);
    return false;
  }
};
