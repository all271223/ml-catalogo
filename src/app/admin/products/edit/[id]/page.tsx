// src/app/admin/products/edit/[id]/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabasePublic } from "../../../../lib/supabasePublic";
import { imagePublicUrl } from "../../../../lib/images";

type Product = {
  id: string;
  name: string;
  brand: string | null;
  description: string | null;
  original_price: number | null;
  price: number;
  discount_percent: number | null;
  stock: number;
  barcode: string | null;
  sku: string | null;
  store: string | null;
  image_path: string | string[] | null;
  is_visible: boolean;
};

function arrayMove<T>(arr: T[], from: number, to: number) {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [product, setProduct] = useState<Product | null>(null);

  // Imágenes actuales (paths en Supabase Storage)
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  // Imágenes marcadas para eliminar
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // Nuevas imágenes a subir
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  // Previews de nuevas imágenes (mismo orden que newImageFiles)
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Highlight visual en drop
  const [droppedKey, setDroppedKey] = useState<string | null>(null);
  const dropTimerRef = useRef<number | null>(null);

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
    is_visible: true,
  });

  const [calculatedPrice, setCalculatedPrice] = useState(0);

  // Verificar sesión
  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar producto
  useEffect(() => {
    if (!checking) loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking]);

  // Calcular precio
  useEffect(() => {
    const original = parseFloat(formData.original_price);
    const discount = parseFloat(formData.discount_percent);

    if (original > 0 && discount >= 0 && discount <= 100) {
      const salePrice = original - original * (discount / 100);
      setCalculatedPrice(Math.round(salePrice));
    } else if (original > 0 && !discount) {
      setCalculatedPrice(original);
    } else {
      setCalculatedPrice(0);
    }
  }, [formData.original_price, formData.discount_percent]);

  function flashDrop(key: string) {
    setDroppedKey(key);
    if (dropTimerRef.current) window.clearTimeout(dropTimerRef.current);
    dropTimerRef.current = window.setTimeout(() => {
      setDroppedKey(null);
      dropTimerRef.current = null;
    }, 350);
  }

  async function checkUser() {
    const {
      data: { user },
    } = await supabasePublic.auth.getUser();

    if (!user) router.push("/admin/login");
    else setChecking(false);
  }

  async function loadProduct() {
    setLoading(true);

    const { data, error } = await supabasePublic
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error loading product:", error);
      alert("Error al cargar producto");
      router.push("/admin/products");
      return;
    }

    if (data) {
      setProduct(data);
      setFormData({
        name: data.name || "",
        brand: data.brand || "",
        description: data.description || "",
        original_price: data.original_price?.toString() || "",
        discount_percent: data.discount_percent?.toString() || "",
        stock: data.stock?.toString() || "",
        barcode: data.barcode || "",
        sku: data.sku || "",
        store: data.store || "",
        is_visible: data.is_visible ?? true,
      });

      if (data.image_path) {
        const images = Array.isArray(data.image_path)
          ? data.image_path
          : [data.image_path];
        setCurrentImages(images);
      }
    }

    setLoading(false);
  }

  function handleRemoveCurrentImage(imagePath: string) {
    setImagesToDelete((prev) => [...prev, imagePath]);
    setCurrentImages((prev) => prev.filter((img) => img !== imagePath));
  }

  function handleNewImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);

    const total = currentImages.length + newImageFiles.length + files.length;
    if (total > 10) {
      setMessage("Máximo 10 imágenes por producto");
      return;
    }

    const updatedFiles = [...newImageFiles, ...files];
    setNewImageFiles(updatedFiles);

    // previews en el MISMO orden
    const nextPreviews = [...newImagePreviews];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        nextPreviews.push(reader.result as string);

        // cuando ya se agregaron todos los nuevos previews
        if (nextPreviews.length === updatedFiles.length) {
          setNewImagePreviews(nextPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    setMessage("");
  }

  function handleRemoveNewImage(index: number) {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  // Drag & drop: CURRENT IMAGES
  function onDragStartCurrent(e: React.DragEvent, idx: number) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/x-dnd",
      JSON.stringify({ type: "current", idx })
    );
  }

  function onDropCurrent(e: React.DragEvent, dropIdx: number) {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/x-dnd");
    if (!raw) return;

    const payload = JSON.parse(raw) as { type: "current" | "new"; idx: number };
    if (payload.type !== "current") return;
    if (payload.idx === dropIdx) return;

    setCurrentImages((prev) => arrayMove(prev, payload.idx, dropIdx));
    flashDrop(`current-${dropIdx}`);
  }

  // Drag & drop: NEW IMAGES (previews + files juntos)
  function onDragStartNew(e: React.DragEvent, idx: number) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/x-dnd",
      JSON.stringify({ type: "new", idx })
    );
  }

  function onDropNew(e: React.DragEvent, dropIdx: number) {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/x-dnd");
    if (!raw) return;

    const payload = JSON.parse(raw) as { type: "current" | "new"; idx: number };
    if (payload.type !== "new") return;
    if (payload.idx === dropIdx) return;

    setNewImageFiles((prev) => arrayMove(prev, payload.idx, dropIdx));
    setNewImagePreviews((prev) => arrayMove(prev, payload.idx, dropIdx));
    flashDrop(`new-${dropIdx}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      // 1) Eliminar imágenes marcadas del Storage
      for (const imagePath of imagesToDelete) {
        await supabasePublic.storage.from("product-images").remove([imagePath]);
      }

      // 2) Subir nuevas imágenes (en el orden de newImageFiles)
      const newImagePaths: string[] = [];
      for (const file of newImageFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabasePublic.storage
          .from("product-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        newImagePaths.push(fileName);
      }

      // 3) Final: current (ordenado) + new (ordenado)
      const finalImages = [...currentImages, ...newImagePaths];

      // 4) Update producto
      const discountValue = formData.discount_percent
        ? parseFloat(formData.discount_percent)
        : null;

      const { error } = await supabasePublic
        .from("products")
        .update({
          name: formData.name,
          brand: formData.brand || null,
          description: formData.description || null,
          original_price: formData.original_price
            ? parseFloat(formData.original_price)
            : null,
          price: calculatedPrice,
          discount_percent: discountValue,
          stock: parseInt(formData.stock),
          barcode: formData.barcode || null,
          sku: formData.sku || null,
          store: formData.store || null,
          image_path: finalImages.length > 0 ? finalImages : null,
          is_visible: formData.is_visible,
        })
        .eq("id", productId);

      if (error) throw error;

      setMessage("Producto actualizado exitosamente");
      setTimeout(() => router.push("/admin/products"), 1500);
    } catch (error: unknown) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    } finally {
      setSaving(false);
    }
  }

  if (checking || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {checking ? "Verificando sesión..." : "Cargando producto..."}
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Producto no encontrado</p>
          <button
            onClick={() => router.push("/admin/products")}
            className="text-blue-600 hover:text-blue-800"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const totalImages = currentImages.length + newImageFiles.length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Editar Producto</h1>
            <p className="text-gray-600">{product.name}</p>
          </div>
          <button
            onClick={() => router.push("/admin/products")}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Volver
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del producto *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Precios */}
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
              />
            </div>
          </div>

          {/* Preview precio */}
          {calculatedPrice > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Precio de venta:</span>{" "}
                <span className="text-2xl font-bold text-blue-600">
                  ${Intl.NumberFormat("es-CL").format(calculatedPrice)}
                </span>
              </p>
              {formData.discount_percent &&
                parseFloat(formData.discount_percent) > 0 && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    ✓ Ahorro: $
                    {Intl.NumberFormat("es-CL").format(
                      parseFloat(formData.original_price) - calculatedPrice
                    )}{" "}
                    ({formData.discount_percent}% OFF)
                  </p>
                )}
            </div>
          )}

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock *
            </label>
            <input
              type="number"
              required
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de barras
            </label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) =>
                setFormData({ ...formData, barcode: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tienda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tienda
            </label>
            <input
              type="text"
              value={formData.store}
              onChange={(e) =>
                setFormData({ ...formData, store: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* SISTEMA DE IMÁGENES - MÁXIMO 10 - DRAG & DROP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Imágenes del producto ({totalImages}/10)
            </label>

            {/* Current images */}
            {currentImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Imágenes actuales:
                  <span className="ml-2 text-xs text-blue-600">
                    💡 Arrastra para reordenar
                  </span>
                </p>

                <div className="grid grid-cols-5 gap-2">
                  {currentImages.map((imagePath, idx) => (
                    <div
                      key={imagePath}
                      draggable
                      onDragStart={(e) => onDragStartCurrent(e, idx)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => onDropCurrent(e, idx)}
                      className={[
                        "relative aspect-square rounded-lg overflow-hidden border-2 cursor-move transition",
                        droppedKey === `current-${idx}`
                          ? "border-blue-500 ring-4 ring-blue-200"
                          : "border-gray-300 hover:border-blue-500 hover:shadow-lg",
                      ].join(" ")}
                    >
                      <img
                        src={imagePublicUrl(imagePath)}
                        alt={`Imagen ${idx + 1}`}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5 pointer-events-none">
                        {idx === 0 ? "📌 Principal" : `Img ${idx + 1}`}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCurrentImage(imagePath)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 z-10"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New images */}
            {newImagePreviews.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Nuevas imágenes ({newImagePreviews.length}):
                  <span className="ml-2 text-xs text-green-600">
                    💡 También puedes arrastrar para ordenar
                  </span>
                </p>

                <div className="grid grid-cols-5 gap-2">
                  {newImagePreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => onDragStartNew(e, idx)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => onDropNew(e, idx)}
                      className={[
                        "relative aspect-square rounded-lg overflow-hidden border-2 cursor-move transition",
                        droppedKey === `new-${idx}`
                          ? "border-green-600 ring-4 ring-green-200"
                          : "border-green-500 hover:shadow-lg",
                      ].join(" ")}
                    >
                      <img
                        src={preview}
                        alt={`Nueva ${idx + 1}`}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5 pointer-events-none">
                        Nueva {idx + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 z-10"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            {totalImages < 10 && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Puedes agregar {10 - totalImages} imagen(es) más
                </p>
              </div>
            )}

            {totalImages >= 10 && (
              <p className="text-sm text-gray-500">
                Máximo de imágenes alcanzado (10/10)
              </p>
            )}
          </div>

          {/* Visible */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_visible"
              checked={formData.is_visible}
              onChange={(e) =>
                setFormData({ ...formData, is_visible: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="is_visible"
              className="text-sm font-medium text-gray-700"
            >
              Visible en catálogo público
            </label>
          </div>

          {/* Mensaje */}
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

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
