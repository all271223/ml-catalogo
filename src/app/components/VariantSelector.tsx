"use client";

import { useState, useEffect } from "react";
import { ProductVariant, extractUniqueAttributes, findVariantByAttributes } from "../lib/variant-helpers";

type Props = {
  variants: ProductVariant[];
  onVariantSelect: (variant: ProductVariant | null) => void;
};

export default function VariantSelector({ variants, onVariantSelect }: Props) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);
  const [selectedDiseño, setSelectedDiseño] = useState<string | null>(null);
  const [selectedEdicion, setSelectedEdicion] = useState<string | null>(null); // ✅ NUEVO

  // Extraer atributos únicosediciones
  const { colors, tallas, diseños, ediciones } = extractUniqueAttributes(variants); // ✅ ediciones
  

  // Buscar variante seleccionada
  useEffect(() => {
    const attributes: Record<string, string> = {};
    if (selectedColor) attributes.color = selectedColor;
    if (selectedTalla) attributes.talla = selectedTalla;
    if (selectedDiseño) attributes.diseño = selectedDiseño;
    if (selectedEdicion) attributes.edicion = selectedEdicion; // ✅ NUEVO

    // Solo buscar si hay al menos un atributo seleccionado
    if (Object.keys(attributes).length > 0) {
      const variant = findVariantByAttributes(variants, attributes);
      onVariantSelect(variant);
    } else {
      onVariantSelect(null);
    }
  }, [selectedColor, selectedTalla, selectedDiseño, selectedEdicion, variants, onVariantSelect]); // ✅ selectedEdicion

  // Verificar si una combinación está disponible
  const isVariantAvailable = (attr: Record<string, string>) => {
    const variant = findVariantByAttributes(variants, attr);
    return variant && variant.stock > 0;
  };

  return (
    <div className="space-y-4">
      {/* COLOR */}
      {colors.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color:
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const testAttr: Record<string, string> = { color };
              if (selectedTalla) testAttr.talla = selectedTalla;
              if (selectedDiseño) testAttr.diseño = selectedDiseño;
              if (selectedEdicion) testAttr.edicion = selectedEdicion;
              
              const available = isVariantAvailable(testAttr);
              const isSelected = selectedColor === color;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(isSelected ? null : color)}
                  disabled={!available}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : available
                      ? "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                      : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TALLA */}
      {tallas.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Talla:
          </label>
          <div className="flex flex-wrap gap-2">
            {tallas.map((talla) => {
              const testAttr: Record<string, string> = { talla };
              if (selectedColor) testAttr.color = selectedColor;
              if (selectedDiseño) testAttr.diseño = selectedDiseño;
              if (selectedEdicion) testAttr.edicion = selectedEdicion;
              
              const available = isVariantAvailable(testAttr);
              const isSelected = selectedTalla === talla;

              return (
                <button
                  key={talla}
                  type="button"
                  onClick={() => setSelectedTalla(isSelected ? null : talla)}
                  disabled={!available}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : available
                      ? "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                      : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                  }`}
                >
                  {talla}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DISEÑO */}
      {diseños.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diseño:
          </label>
          <div className="flex flex-wrap gap-2">
            {diseños.map((diseño) => {
              const testAttr: Record<string, string> = { diseño };
              if (selectedColor) testAttr.color = selectedColor;
              if (selectedTalla) testAttr.talla = selectedTalla;
              if (selectedEdicion) testAttr.edicion = selectedEdicion;
              
              const available = isVariantAvailable(testAttr);
              const isSelected = selectedDiseño === diseño;

              return (
                <button
                  key={diseño}
                  type="button"
                  onClick={() => setSelectedDiseño(isSelected ? null : diseño)}
                  disabled={!available}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : available
                      ? "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                      : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                  }`}
                >
                  {diseño}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ✅ EDICIÓN (NUEVO) */}
      {ediciones.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Edición:
          </label>
          <div className="flex flex-wrap gap-2">
            {ediciones.map((edicion) => {
              const testAttr: Record<string, string> = { edicion };
              if (selectedColor) testAttr.color = selectedColor;
              if (selectedTalla) testAttr.talla = selectedTalla;
              if (selectedDiseño) testAttr.diseño = selectedDiseño;
              
              const available = isVariantAvailable(testAttr);
              const isSelected = selectedEdicion === edicion;

              return (
                <button
                  key={edicion}
                  type="button"
                  onClick={() => setSelectedEdicion(isSelected ? null : edicion)}
                  disabled={!available}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition ${
                    isSelected
                      ? "border-purple-600 bg-purple-600 text-white"
                      : available
                      ? "border-gray-300 bg-white text-gray-700 hover:border-purple-400"
                      : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                  }`}
                >
                  {edicion}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}