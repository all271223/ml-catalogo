// src/app/lib/images.ts
import { supabasePublic } from "./supabasePublic";

export function imagePublicUrl(path?: string | null) {
  if (!path) return "/next.svg"; // fallback que existe en /public
  // Usamos la API de Supabase para construir la URL pública correcta del bucket
  const { data } = supabasePublic.storage
    .from("product-images")
    .getPublicUrl(path);
  return data.publicUrl;
}
