// src/app/admin/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabasePublic } from "../../lib/supabasePublic";
import { imagePublicUrl } from "../../lib/images";

type Product = {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  stock: number;
  image_path: string | string[] | null;
  is_visible: boolean;
  created_at: string;
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [checking, setChecking] = useState(true);
  const [showOnlyInStock, setShowOnlyInStock] = useState(true); // ✅ NUEVO: Por defecto activado

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabasePublic.auth.getUser();
    if (!user) {
      router.push("/admin/login");
    } else {
      setChecking(false);
      fetchProducts();
    }
  }

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabasePublic
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      alert("Error al cargar productos");
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  async function handleDelete(productId: string, productName: string) {
    const confirmed = confirm(
      `⚠️ ¿Estás seguro de eliminar "${productName}"?\n\nEsta acción NO se puede deshacer.`
    );

    if (!confirmed) return;

    const { error } = await supabasePublic
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Error deleting product:", error);
      alert("Error al eliminar producto");
    } else {
      alert("Producto eliminado exitosamente");
      fetchProducts(); // Recargar lista
    }
  }

  // ✅ MODIFICADO: Filtrar por búsqueda Y stock
  const filteredProducts = products.filter((p) => {
    // Filtro de búsqueda
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtro de stock
    const matchesStock = showOnlyInStock ? p.stock > 0 : true;

    return matchesSearch && matchesStock;
  });

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Mis Productos ({filteredProducts.length})
            </h1>
            <button
              onClick={() => router.push("/admin")}
              className="bg-[#2A9D8F] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#238276] transition"
            >
              + Crear producto
            </button>
          </div>

          {/* Búsqueda */}
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          />

          {/* ✅ NUEVO: Toggle "Solo productos con stock" */}
          <label className="flex items-center gap-3 cursor-pointer bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <input
              type="checkbox"
              checked={showOnlyInStock}
              onChange={(e) => setShowOnlyInStock(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-800">
                Mostrar solo productos con stock
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                {showOnlyInStock
                  ? "Ocultando productos sin stock"
                  : "Mostrando todos los productos"}
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600">
              {showOnlyInStock ? "✓ Activado" : "Desactivado"}
            </span>
          </label>
        </div>

        {/* Lista de productos */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? "No se encontraron productos"
                : showOnlyInStock
                ? "No hay productos con stock disponible"
                : "No tienes productos creados"}
            </p>
            {showOnlyInStock && !searchTerm && (
              <button
                onClick={() => setShowOnlyInStock(false)}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todos los productos (incluidos sin stock)
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex gap-6">
                  {/* Imagen */}
                  <div className="w-24 h-24 flex-shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={imagePublicUrl(product.image_path)}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        {product.brand && (
                          <p className="text-sm text-gray-500">
                            Marca: {product.brand}
                          </p>
                        )}
                      </div>

                      {/* Badge visible/oculto */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.is_visible
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.is_visible ? "Visible" : "Oculto"}
                      </span>
                    </div>

                    {/* Precios */}
                    <div className="flex items-center gap-4 mb-3">
                      {product.original_price && product.discount_percent ? (
                        <>
                          <span className="text-sm text-gray-500 line-through">
                            ${product.original_price.toLocaleString("es-CL")}
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price.toLocaleString("es-CL")}
                          </span>
                          <span className="text-xs font-semibold text-[#2A9D8F] bg-green-50 px-2 py-1 rounded">
                            -{product.discount_percent}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          ${product.price.toLocaleString("es-CL")}
                        </span>
                      )}
                    </div>

                    {/* Stock */}
                    <p className="text-sm text-gray-600 mb-4">
                      Stock:{" "}
                      <span
                        className={`font-semibold ${
                          product.stock === 0
                            ? "text-red-600"
                            : product.stock <= 3
                            ? "text-orange-600"
                            : "text-gray-900"
                        }`}
                      >
                        {product.stock} unidades
                      </span>
                    </p>

                    {/* Botones */}
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          router.push(`/admin/products/edit/${product.id}`)
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}