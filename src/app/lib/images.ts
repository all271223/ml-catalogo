import { supabasePublic } from "./supabasePublic";

export function imagePublicUrl(path: string | string[] | null | undefined): string {
  // Si no hay path, retornar imagen placeholder
  if (!path) {
    return "https://placehold.co/400x400?text=Sin+Imagen";
  }

  // Si es un array, tomar la primera imagen
  const imagePath = Array.isArray(path) ? path[0] : path;

  // Si después de todo sigue siendo null/undefined
  if (!imagePath) {
    return "https://placehold.co/400x400?text=Sin+Imagen";
  }

  const { data } = supabasePublic.storage
    .from("product-images")
    .getPublicUrl(imagePath);
  
  return data.publicUrl;
}

// Nueva función para obtener TODAS las imágenes
export function imagePublicUrls(path: string | string[] | null | undefined): string[] {
  if (!path) {
    return ["https://placehold.co/400x400?text=Sin+Imagen"];
  }

  const paths = Array.isArray(path) ? path : [path];
  
  return paths.map(p => {
    const { data } = supabasePublic.storage
      .from("product-images")
      .getPublicUrl(p);
    return data.publicUrl;
  });
}