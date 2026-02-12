// src/app/scan/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabasePublic } from "../lib/supabasePublic";

type Product = {
  id: string;
  name: string;
  stock: number;
  barcode: string | null;
  brand: string | null;
  price: number;
};

type Movement = {
  id: string;
  productName: string;
  oldStock: number;
  newStock: number;
  timestamp: number;
};

export default function ScanPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [barcode, setBarcode] = useState("");
  const [message, setMessage] = useState("");
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabasePublic.auth.getUser();
    if (!user) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', '/scan');
      }
      router.push("/admin/login");
    } else {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    // Auto-focus en el input para que el escáner funcione
    if (inputRef.current && !checking) {
      inputRef.current.focus();
    }
  }, [checking, currentProduct]);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!barcode.trim()) return;

    setMessage("");

    // Buscar producto por código de barras
    const { data: product, error } = await supabasePublic
      .from("products")
      .select("*")
      .eq("barcode", barcode.trim())
      .single();

    if (error || !product) {
      setMessage("❌ Producto no encontrado");
      setBarcode("");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setCurrentProduct(product as Product);

    // Si es modo automático, registrar +1 inmediatamente
    if (isAutoMode) {
      await updateStock(product as Product, 1);
    }

    // Limpiar input solo en modo automático
    if (isAutoMode) {
      setBarcode("");
    }
  }

  async function updateStock(product: Product, change: number) {
    const newStock = product.stock + change;

    if (newStock < 0) {
      setMessage("❌ Stock no puede ser negativo");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const { error } = await supabasePublic
      .from("products")
      .update({ stock: newStock })
      .eq("id", product.id);

    if (error) {
      setMessage("❌ Error al actualizar stock");
      console.error(error);
      return;
    }

    // Agregar al historial
    const movement: Movement = {
      id: Date.now().toString(),
      productName: product.name,
      oldStock: product.stock,
      newStock: newStock,
      timestamp: Date.now(),
    };

    setMovements([movement, ...movements.slice(0, 9)]); // Máximo 10

    // Actualizar producto actual
    setCurrentProduct({ ...product, stock: newStock });

    // Mensaje de éxito
    setMessage(`✅ Stock actualizado: ${product.stock} → ${newStock}`);

    // Limpiar en modo manual
    if (!isAutoMode) {
      setBarcode("");
      setCurrentProduct(null);
    }

    // Limpiar mensaje después de 2 segundos
    setTimeout(() => setMessage(""), 2000);
  }

  function handleUndo() {
    if (movements.length === 0) return;

    const lastMovement = movements[0];
    
    // Revertir en la base de datos
    supabasePublic
      .from("products")
      .update({ stock: lastMovement.oldStock })
      .eq("id", currentProduct?.id || "");

    // Quitar del historial
    setMovements(movements.slice(1));
    
    setMessage(`↶ Deshecho: ${lastMovement.productName}`);
    setTimeout(() => setMessage(""), 2000);
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Verificando sesión...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Escáner de Stock</h1>
            <button
              onClick={() => router.push("/admin/products")}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Volver
            </button>
          </div>

          {/* Selector de modo */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setIsAutoMode(true);
                setCurrentProduct(null);
                setBarcode("");
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                isAutoMode
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ⚡ Automático (+1)
            </button>
            <button
              onClick={() => {
                setIsAutoMode(false);
                setCurrentProduct(null);
                setBarcode("");
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                !isAutoMode
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🔧 Manual
            </button>
          </div>

          <p className="text-sm text-gray-600">
            {isAutoMode
              ? "Escanea para agregar +1 automáticamente"
              : "Escanea y elige la cantidad manualmente"}
          </p>
        </div>

        {/* Formulario de escaneo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleScan}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de barras
            </label>
            <input
              ref={inputRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Escanea o ingresa el código"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              autoFocus
            />
          </form>

          {/* Mensaje */}
          {message && (
            <div
              className={`mt-4 p-4 rounded-lg font-semibold ${
                message.includes("✅")
                  ? "bg-green-50 text-green-700"
                  : message.includes("↶")
                  ? "bg-blue-50 text-blue-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Producto actual (solo en modo manual) */}
        {!isAutoMode && currentProduct && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {currentProduct.name}
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-sm text-gray-600">
                Stock actual: <span className="text-2xl font-bold text-gray-900">{currentProduct.stock}</span>
              </div>
            </div>

            {/* Botones de cantidad */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                onClick={() => updateStock(currentProduct, 10)}
                className="bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                +10
              </button>
              <button
                onClick={() => updateStock(currentProduct, 5)}
                className="bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                +5
              </button>
              <button
                onClick={() => updateStock(currentProduct, 1)}
                className="bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                +1
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateStock(currentProduct, -10)}
                className="bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                -10
              </button>
              <button
                onClick={() => updateStock(currentProduct, -5)}
                className="bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                -5
              </button>
              <button
                onClick={() => updateStock(currentProduct, -1)}
                className="bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                -1
              </button>
            </div>

            {/* Botón editar completo */}
            <button
              onClick={() => router.push(`/admin/products/edit/${currentProduct.id}`)}
              className="w-full mt-4 bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-black transition"
            >
              ✏️ Editar producto completo
            </button>
          </div>
        )}

        {/* Historial */}
        {movements.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Últimos movimientos
              </h3>
              {movements.length > 0 && (
                <button
                  onClick={handleUndo}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                >
                  ↶ Deshacer último
                </button>
              )}
            </div>

            <div className="space-y-2">
              {movements.map((mov) => (
                <div
                  key={mov.id}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{mov.productName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(mov.timestamp).toLocaleTimeString("es-CL")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">
                      <span className="text-gray-500">{mov.oldStock}</span>
                      <span className="mx-2">→</span>
                      <span className="text-green-600 font-bold">{mov.newStock}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}