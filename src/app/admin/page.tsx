"use client";

import { useState, useEffect } from "react";
import { supabasePublic } from "../lib/supabasePublic";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    original_price: "",
    discount_percent: "",
    stock: "",
    barcode: "",
    sku: "",
    store: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    // Calcular precio de venta automáticamente
    const original = parseFloat(formData.original_price);
    const discount = parseFloat(formData.discount_percent);
    
    if (original > 0 && discount >= 0 && discount <= 100) {
      const salePrice = original - (original * (discount / 100));
      setCalculatedPrice(Math.round(salePrice));
    } else if (original > 0 && !discount) {
      setCalculatedPrice(original);
    } else {
      setCalculatedPrice(0);
    }
  }, [formData.original_price, formData.discount_percent]);

  const checkUser = async () => {
    const { data: { user } } = await supabasePublic.auth.getUser();
    if (!user) {
      router.push("/admin/login");
    } else {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await supabasePublic.auth.signOut();
    router.push("/admin/login");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 6) {
      setMessage("Máximo 6 imágenes por producto");
      return;
    }
    setImageFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const imagePaths: string[] = [];

      // Subir todas las imágenes
      for (const file of imageFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabasePublic.storage
          .from("product-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        imagePaths.push(fileName);
      }

      const discountValue = formData.discount_percent ? parseFloat(formData.discount_percent) : null;

      const { error: insertError } = await supabasePublic.from("products").insert({
        name: formData.name,
        brand: formData.brand || null,
        description: formData.description || null,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        price: calculatedPrice,
        discount_percent: discountValue,
        stock: parseInt(formData.stock),
        barcode: formData.barcode || null,
        sku: formData.sku || null,
        store: formData.store || null,
        image_path: imagePaths.length > 0 ? imagePaths : null,
        is_visible: true,
      });

      if (insertError) throw insertError;

      setMessage("Producto creado exitosamente");
      setFormData({
        name: "",
        brand: "",
        description: "",
        original_price: "",
        discount_percent: "",
        stock: "",
        barcode: "",
        sku: "",
        store: "",
      });
      setImageFiles([]);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: unknown) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Verificando sesión...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-gray-600">Crear nuevo producto</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Cerrar sesión
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del producto *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Mochila Ergonómica Neko Slings"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: NEKO SLINGS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe el producto: características, materiales, usos, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio original *
              </label>
              <input
                type="number"
                required
                value={formData.original_price}
                onChange={(e) =>
                  setFormData({ ...formData, original_price: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="168000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descuento (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount_percent}
                onChange={(e) =>
                  setFormData({ ...formData, discount_percent: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
              />
              <p className="text-xs text-gray-500 mt-1">Opcional - dejar vacío si no hay descuento</p>
            </div>
          </div>

          {calculatedPrice > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Precio de venta:</span>{" "}
                <span className="text-2xl font-bold text-blue-600">
                  ${Intl.NumberFormat("es-CL").format(calculatedPrice)}
                </span>
              </p>
              {formData.discount_percent && parseFloat(formData.discount_percent) > 0 && (
                <p className="text-xs text-green-600 mt-1 font-medium">
                  ✓ Ahorro: ${Intl.NumberFormat("es-CL").format(
                    parseFloat(formData.original_price) - calculatedPrice
                  )} ({formData.discount_percent}% OFF)
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock inicial *
            </label>
            <input
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de barras
            </label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="7804876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="NEKO-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tienda</label>
            <input
              type="text"
              value={formData.store}
              onChange={(e) => setFormData({ ...formData, store: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tienda Principal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Imágenes del producto (máximo 6)
            </label>
            
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {imageFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-3">
                  {imageFiles.length} imagen(es) seleccionada(s)
                </p>
                
                <div className="grid grid-cols-6 gap-2">
                  {imageFiles.map((file, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-blue-500 bg-blue-50">
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                        <div className="text-2xl mb-1">✓</div>
                        <div className="text-[9px] text-gray-600 text-center truncate w-full px-1">
                          {idx === 0 ? 'Principal' : `Img ${idx + 1}`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = imageFiles.filter((_, i) => i !== idx);
                          setImageFiles(newFiles);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 z-10"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.includes("exitosamente")
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? "Creando producto..." : "Crear Producto"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}