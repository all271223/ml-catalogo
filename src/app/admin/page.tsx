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
    price: "",
    stock: "",
    barcode: "",
    sku: "",
    store: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let imagePath = null;
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabasePublic.storage.from("product-images").upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        imagePath = filePath;
      }
      const { error: insertError } = await supabasePublic.from("products").insert({
        name: formData.name,
        brand: formData.brand || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        barcode: formData.barcode || null,
        sku: formData.sku || null,
        store: formData.store || null,
        image_path: imagePath,
        is_visible: true,
      });
      if (insertError) throw insertError;
      setMessage("Producto creado exitosamente");
      setFormData({ name: "", brand: "", price: "", stock: "", barcode: "", sku: "", store: "" });
      setImageFile(null);
    } catch (error: unknown) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
          <button onClick={handleLogout} className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium">
            Cerrar sesión
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del producto *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ej: Mochila Ergonómica Neko Slings" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
            <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ej: NEKO SLINGS" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Precio *</label>
            <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="168000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock inicial *</label>
            <input type="number" required value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="10" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Código de barras</label>
            <input type="text" value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="7804876543210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
            <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="NEKO-001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tienda</label>
            <input type="text" value={formData.store} onChange={(e) => setFormData({ ...formData, store: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Tienda Principal" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del producto</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            {imageFile && <p className="mt-2 text-sm text-gray-600">Archivo seleccionado: {imageFile.name}</p>}
          </div>
          {message && <div className={`p-4 rounded-lg ${message.includes("exitosamente") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{message}</div>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition">{loading ? "Creando producto..." : "Crear Producto"}</button>
        </form>
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">Volver al catálogo</Link>
        </div>
      </div>
    </div>
  );
}