// Script de importación INTELIGENTE - Compara por CÓDIGO DE BARRAS
// Si el producto existe (mismo barcode), actualiza el SKU real
// Si es nuevo, lo agrega
// Ejecutar: node import-NEW-products-FIXED.js

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Leer productos del JSON
const allProducts = JSON.parse(fs.readFileSync('products_NEW_batch.json', 'utf-8'));

// Filtrar solo los que tienen código de barras (requerido para comparar)
const productsWithBarcode = allProducts.filter(p => p.barcode && p.barcode.trim());

console.log(`📦 Total productos en archivo: ${allProducts.length}`);
console.log(`📊 Con código de barras: ${productsWithBarcode.length}`);
console.log(`⚠️  Sin código de barras: ${allProducts.length - productsWithBarcode.length} (se ignorarán)`);
console.log('⏳ Comparando con base de datos...\n');

async function importIntelligent() {
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  // 1. Obtener TODOS los códigos de barras existentes
  console.log('🔍 Obteniendo códigos de barras existentes...');
  
  let existingBarcodes = new Map(); // barcode -> product_id
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('products')
      .select('id, barcode')
      .range(from, from + batchSize - 1);

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    if (data && data.length > 0) {
      data.forEach(p => {
        if (p.barcode) {
          existingBarcodes.set(p.barcode, p.id);
        }
      });
      from += batchSize;
      if (data.length < batchSize) hasMore = false;
    } else {
      hasMore = false;
    }
  }

  console.log(`✅ Productos con barcode en DB: ${existingBarcodes.size}\n`);

  // 2. Separar en: NUEVOS vs EXISTENTES (para actualizar SKU)
  const newProducts = [];
  const toUpdateSKU = [];

  for (const product of productsWithBarcode) {
    if (existingBarcodes.has(product.barcode)) {
      // Ya existe → actualizar SKU real
      toUpdateSKU.push({
        id: existingBarcodes.get(product.barcode),
        sku: product.sku,
        name: product.name
      });
    } else {
      // Es nuevo → agregar
      newProducts.push(product);
    }
  }

  console.log(`📊 ANÁLISIS:`);
  console.log(`   Total con barcode: ${productsWithBarcode.length}`);
  console.log(`   Ya existen (actualizarán SKU): ${toUpdateSKU.length}`);
  console.log(`   ✨ Nuevos a importar: ${newProducts.length}\n`);

  // 3. Actualizar SKUs de productos existentes
  if (toUpdateSKU.length > 0) {
    console.log('🔄 Actualizando SKUs reales...\n');
    
    for (const item of toUpdateSKU) {
      const { error } = await supabase
        .from('products')
        .update({ sku: item.sku })
        .eq('id', item.id);

      if (error) {
        console.error(`❌ Error actualizando ${item.name}:`, error.message);
      } else {
        updated++;
        if (updated % 100 === 0) {
          console.log(`   Actualizados: ${updated}/${toUpdateSKU.length}`);
        }
      }
    }
    
    console.log(`✅ SKUs actualizados: ${updated}\n`);
  }

  // 4. Importar productos NUEVOS
  if (newProducts.length === 0) {
    console.log('✅ No hay productos nuevos para importar.');
  } else {
    console.log('🚀 Importando productos nuevos...\n');
    
    const importBatchSize = 100;
    for (let i = 0; i < newProducts.length; i += importBatchSize) {
      const batch = newProducts.slice(i, i + importBatchSize);
      
      const batchToInsert = batch.map(p => ({
        name: p.name,
        brand: p.brand,
        description: p.description,
        original_price: p.original_price,
        price: p.price,
        discount_percent: p.discount_percent,
        stock: p.stock,
        barcode: p.barcode,
        sku: p.sku,
        store: p.store,
        image_path: null,
        is_visible: p.is_visible
      }));

      try {
        const { error } = await supabase
          .from('products')
          .insert(batchToInsert);

        if (error) {
          console.error(`❌ Error en lote ${Math.floor(i / importBatchSize) + 1}:`, error.message);
          errors += batch.length;
        } else {
          imported += batch.length;
          console.log(`✅ Lote ${Math.floor(i / importBatchSize) + 1}: ${batch.length} productos (Total: ${imported}/${newProducts.length})`);
        }
      } catch (err) {
        console.error(`❌ Error inesperado:`, err.message);
        errors += batch.length;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // 5. Resumen
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN DE IMPORTACIÓN');
  console.log('='.repeat(70));
  console.log(`✅ Productos nuevos importados: ${imported}`);
  console.log(`🔄 SKUs actualizados (ya existían): ${updated}`);
  console.log(`⏭️  Ignorados (sin barcode): ${allProducts.length - productsWithBarcode.length}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📦 Total en archivo: ${allProducts.length}`);
  console.log(`📦 Total en DB ahora: ~${existingBarcodes.size + imported}`);
  console.log('='.repeat(70));

  if (imported > 0 || updated > 0) {
    console.log('\n🎉 ¡Proceso completado!');
    console.log('👉 Verifica en: https://ml-catalogo.vercel.app/admin/products');
    console.log('\n💡 NOTA: Los productos existentes ahora tienen su SKU real.');
  }
}

// Ejecutar
importIntelligent()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });
