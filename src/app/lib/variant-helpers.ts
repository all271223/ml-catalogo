// 🔧 FUNCIONES AUXILIARES PARA SISTEMA DE VARIANTES

import { supabasePublic } from "../lib/supabasePublic";

// Tipos
export type VariantAttributes = {
  talla?: string;
  color?: string;
  diseño?: string;
  [key: string]: string | undefined;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string | null;
  barcode: string | null;
  attributes: Record<string, string>;
  stock: number;
  price?: number | null; // ✅ NUEVA LÍNEA
  is_available: boolean;
  variant_images: string[] | null;
  created_at?: string;
  updated_at?: string;
};

// ✅ Generar SKU automático para variante
export function generateVariantSKU(
  productSKU: string,
  attributes: VariantAttributes
): string {
  const parts = [productSKU];
  
  // Agregar atributos en orden: color, talla, diseño
  if (attributes.color) parts.push(attributes.color.toUpperCase());
  if (attributes.talla) parts.push(attributes.talla.toUpperCase());
  if (attributes.diseño) parts.push(attributes.diseño.toUpperCase());
  
  return parts.join("-");
}

// ✅ Formatear atributos para mostrar al usuario
export function formatVariantAttributes(attributes: VariantAttributes): string {
  const parts: string[] = [];
  
  // Mostrar en orden: color, talla, diseño
  if (attributes.color) parts.push(attributes.color);
  if (attributes.talla) parts.push(attributes.talla);
  if (attributes.diseño) parts.push(attributes.diseño);
  
  return parts.join(" / ");
}

// ✅ Buscar producto por barcode (puede ser producto normal o variante)
export async function findByBarcode(barcode: string) {
  // 1. Buscar primero en productos
  const { data: product, error: productError } = await supabasePublic
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .single();

  if (product && !productError) {
    return { type: "product" as const, data: product };
  }

  // 2. Si no existe, buscar en variantes
  const { data: variant, error: variantError } = await supabasePublic
    .from("product_variants")
    .select(`
      *,
      product:products(*)
    `)
    .eq("barcode", barcode)
    .single();

  if (variant && !variantError) {
    return { type: "variant" as const, data: variant };
  }

  return null;
}

// ✅ Obtener todas las variantes de un producto
export async function getProductVariants(
  productId: string
): Promise<ProductVariant[]> {
  const { data, error } = await supabasePublic
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching variants:", error);
    return [];
  }

  return data || [];
}

// ✅ Validar que no existan variantes duplicadas
export function hasDuplicateVariants(
  variants: Array<{ attributes: VariantAttributes }>
): boolean {
  const seen = new Set<string>();
  
  for (const variant of variants) {
    const key = JSON.stringify(
      Object.entries(variant.attributes)
        .sort(([a], [b]) => a.localeCompare(b))
        .filter(([, value]) => value) // Solo atributos con valor
    );
    
    if (seen.has(key)) return true;
    seen.add(key);
  }
  
  return false;
}

// ✅ Extraer atributos únicos de un conjunto de variantes
export function extractUniqueAttributes(
  variants: ProductVariant[]
): {
  colors: string[];
  tallas: string[];
  diseños: string[];
  ediciones: string[]; // ✅ NUEVO
} {
  const colors = new Set<string>();
  const tallas = new Set<string>();
  const diseños = new Set<string>();
  const ediciones = new Set<string>(); // ✅ NUEVO

  variants.forEach((v) => {
    if (v.attributes.color) colors.add(v.attributes.color);
    if (v.attributes.talla) tallas.add(v.attributes.talla);
    if (v.attributes.diseño) diseños.add(v.attributes.diseño);
    if (v.attributes.edicion) ediciones.add(v.attributes.edicion); // ✅ NUEVO
  });

  return {
    colors: Array.from(colors).sort(),
    tallas: Array.from(tallas).sort((a, b) => {
      // Intentar ordenar numéricamente si son números
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    }),
    diseños: Array.from(diseños).sort(),
    ediciones: Array.from(ediciones).sort(), // ✅ NUEVO
  };
}

// ✅ Calcular stock total de todas las variantes
export function calculateTotalStock(variants: ProductVariant[]): number {
  return variants.reduce((sum, v) => sum + (v.stock || 0), 0);
}

// ✅ Verificar si una combinación de atributos está disponible
export function findVariantByAttributes(
  variants: ProductVariant[],
  selectedAttributes: VariantAttributes
): ProductVariant | null {
  return (
    variants.find((v) => {
      // Comparar todos los atributos relevantes
      const keys = Object.keys(selectedAttributes).filter(
        (k) => selectedAttributes[k]
      );
      return keys.every((key) => v.attributes[key] === selectedAttributes[key]);
    }) || null
  );
}