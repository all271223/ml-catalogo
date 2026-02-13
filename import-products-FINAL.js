// Script de importación masiva de productos a Supabase (SIN DUPLICADOS + FILTRADO)
// Ejecutar: node import-products-FINAL.js

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// CONFIGURACIÓN - USA TUS VARIABLES DE ENTORNO
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no encontradas');
  console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Leer productos del JSON
const allProducts = JSON.parse(fs.readFileSync('products_to_import.json', 'utf-8'));

console.log(`📦 Procesando ${allProducts.length} productos...\n`);

// FILTRAR productos inválidos
const validProducts = allProducts.filter(p => {
  // Debe tener SKU válido
  if (!p.sku || p.sku === 'nan' || p.sku === 'None' || p.sku.trim() === '') {
    return false;
  }
  // Debe tener nombre
  if (!p.name || p.name === 'Sin nombre') {
    return false;
  }
  return true;
});

const invalidCount = allProducts.length - validProducts.length;

console.log(`✅ Productos válidos: ${validProducts.length}`);
console.log(`❌ Productos inválidos (sin SKU o sin nombre): ${invalidCount}`);
console.log('⏳ Importando solo los válidos (sin duplicar)...\n');

async function importProductsIntelligent() {
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  // Primero, obtener todos los SKUs que ya existen
  console.log('🔍 Verificando productos existentes...');
  const { data: existingProducts, error: fetchError } = await supabase
    .from('products')
    .select('sku');

  if (fetchError) {
    console.error('❌ Error al obtener productos existentes:', fetchError.message);
    process.exit(1);
  }

  const existingSKUs = new Set(existingProducts.map(p => p.sku));
  console.log(`📊 Productos ya en la base de datos: ${existingSKUs.size}\n`);

  // Filtrar solo los productos nuevos
  const newProducts = validProducts.filter(p => !existingSKUs.has(p.sku));
  console.log(`✨ Productos nuevos a importar: ${newProducts.length}`);
  console.log(`⏭️  Productos que ya existen (se saltarán): ${validProducts.length - newProducts.length}\n`);

  if (newProducts.length === 0) {
    console.log('✅ Todos los productos válidos ya están importados. No hay nada que hacer.');
    return;
  }

  // Importar en lotes
  const batchSize = 100;
  for (let i = 0; i < newProducts.length; i += batchSize) {
    const batch = newProducts.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(batch);

      if (error) {
        console.error(`❌ Error en lote ${Math.floor(i / batchSize) + 1}:`, error.message);
        errors += batch.length;
      } else {
        imported += batch.length;
        console.log(`✅ Lote ${Math.floor(i / batchSize) + 1}: ${batch.length} productos importados (Total: ${imported}/${newProducts.length})`);
      }
    } catch (err) {
      console.error(`❌ Error inesperado en lote ${Math.floor(i / batchSize) + 1}:`, err.message);
      errors += batch.length;
    }

    // Pequeña pausa entre lotes
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  skipped = validProducts.length - newProducts.length;

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE IMPORTACIÓN');
  console.log('='.repeat(60));
  console.log(`✅ Importados exitosamente: ${imported}`);
  console.log(`⏭️  Ya existían (saltados): ${skipped}`);
  console.log(`❌ Productos inválidos (ignorados): ${invalidCount}`);
  console.log(`❌ Errores durante importación: ${errors}`);
  console.log(`📦 Total en Excel: ${allProducts.length}`);
  console.log(`📦 Total en base de datos ahora: ${existingSKUs.size + imported}`);
  console.log('='.repeat(60));
  
  if (imported > 0) {
    console.log('\n🎉 ¡Importación completada!');
    console.log('👉 Verifica tus productos en: https://ml-catalogo.vercel.app/admin/products');
  }
}

// Ejecutar
importProductsIntelligent()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });
