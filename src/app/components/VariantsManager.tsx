"use client";

import { useState } from "react";
import { VariantAttributes } from "../lib/variant-helpers";

export type VariantFormData = {
  id?: string; // Para edición
  attributes: VariantAttributes;
  stock: number;
  barcode: string;
  sku: string;
  variant_images: File[];
};

type Props = {
  variants: VariantFormData[];
  productSKU: string;
  onAdd: (variant: VariantFormData) => void;
  onEdit: (index: number, variant: VariantFormData) => void;
  onDelete: (index: number) => void;
};

export default function VariantsManager({
  variants,
  productSKU,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<VariantFormData>({
    attributes: {},
    stock: 0,
    barcode: "",
    sku: "",
    variant_images: [],
  });

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      attributes: {},
      stock: 0,
      barcode: "",
      sku: "",
      variant_images: [],
    });
    setShowForm(false);
    setEditingIndex(null);
  };

  // Auto-generar SKU cuando cambian los atributos
  const handleAttributeChange = (key: string, value: string) => {
    const newAttributes = { ...formData.attributes, [key]: value };
    
    // Generar SKU automático
    const parts = [productSKU];
    if (newAttributes.color) parts.push(newAttributes.color.toUpperCase());
    if (newAttributes.talla) parts.push(newAttributes.talla.toUpperCase());
    if (newAttributes.diseño) parts.push(newAttributes.diseño.toUpperCase());
    
    setFormData({
      ...formData,
      attributes: newAttributes,
      sku: parts.join("-"),
    });
  };

  const handleSubmit = () => {
    // Validar que tenga al menos un atributo
    const hasAttributes = Object.values(formData.attributes).some((v) => v);
    if (!hasAttributes) {
      alert("Debes especificar al menos un atributo (talla, color o diseño)");
      return;
    }

    if (editingIndex !== null) {
      onEdit(editingIndex, formData);
    } else {
      onAdd(formData);
    }

    resetForm();
  };

  const handleEdit = (index: number) => {
    setFormData(variants[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Variantes del producto ({variants.length})
        </h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
        >
          {showForm ? "Cancelar" : "+ Agregar variante"}
        </button>
      </div>

      {/* FORMULARIO AGREGAR/EDITAR */}
      {showForm && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
          <h4 className="font-semibold text-gray-700">
            {editingIndex !== null ? "Editar variante" : "Nueva variante"}
          </h4>

          {/* ATRIBUTOS */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Color
              </label>
              <input
                type="text"
                value={formData.attributes.color || ""}
                onChange={(e) => handleAttributeChange("color", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Rojo"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Talla
              </label>
              <input
                type="text"
                value={formData.attributes.talla || ""}
                onChange={(e) => handleAttributeChange("talla", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: M, 40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Diseño
              </label>
              <input
                type="text"
                value={formData.attributes.diseño || ""}
                onChange={(e) => handleAttributeChange("diseño", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Calavera"
              />
            </div>
          </div>

          {/* STOCK Y BARCODE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Stock *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Código de barras
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) =>
                  setFormData({ ...formData, barcode: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="7804876543210"
              />
            </div>
          </div>

          {/* SKU AUTO-GENERADO */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              SKU (auto-generado)
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100"
              placeholder="Se genera automáticamente"
            />
          </div>

          {/* BOTONES */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              {editingIndex !== null ? "Guardar cambios" : "Agregar variante"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* LISTA DE VARIANTES */}
      {variants.length > 0 ? (
        <div className="space-y-2">
          {variants.map((variant, idx) => {
            const attrs = Object.entries(variant.attributes)
              .filter(([, value]) => value)
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ");

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{attrs || "Sin atributos"}</p>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>Stock: {variant.stock}</span>
                    {variant.barcode && <span>Barcode: {variant.barcode}</span>}
                    <span className="text-blue-600">SKU: {variant.sku}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(idx)}
                    className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("¿Eliminar esta variante?")) {
                        onDelete(idx);
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-500 text-sm">
            No No hay variantes agregadas. Haz clic en &quot;Agregar variante&quot; para comenzar.
          </p>
        </div>
      )}
    </div>
  );
}