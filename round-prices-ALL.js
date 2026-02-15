// Script para REDONDEAR PRECIOS al millar más cercano - SIN LÍMITE
// Ejecutar: node round-prices-ALL.js

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para redondear al millar más cercano
function roundToThousand(price) {
  if (!price || price === 0) return price;
  return Math.round(price / 1000) * 1000;
}

async function roundAllPrices() {
  console.log('🔄 Iniciando redondeo de precios (TODOS los productos)...\n');

  let allProducts = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;

  // 1. Obtener TODOS los productos en lotes
  console.log('📥 Obteniendo productos de Supabase...');
  
  while (hasMore) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, original_price')
      .range(from, from + batchSize - 1);

    if (error) {
      console.error('❌ Error al obtener productos:', error.message);
      process.exit(1);
    }

    if (data && data.length > 0) {
      allProducts = allProducts.concat(data);
      console.log(`   Obtenidos ${allProducts.length} productos...`);
      from += batchSize;
      
      // Si obtuvimos menos de batchSize, no hay más
      if (data.length < batchSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`✅ ${allProducts.length} productos encontrados en total\n`);

  // 2. Procesar y actualizar
  let updated = 0;
  let unchanged = 0;
  const changes = [];

  for (const product of allProducts) {
    const oldPrice = product.price;
    const newPrice = roundToThousand(oldPrice);

    // Solo actualizar si cambió
    if (oldPrice !== newPrice) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ price: newPrice })
        .eq('id', product.id);

      if (updateError) {
        console.error(`❌ Error actualizando ${product.name}:`, updateError.message);
      } else {
        updated++;
        changes.push({
          name: product.name.substring(0, 40),
          old: oldPrice,
          new: newPrice,
          diff: newPrice - oldPrice
        });
      }
    } else {
      unchanged++;
    }

    // Progress cada 100 productos
    if ((updated + unchanged) % 100 === 0) {
      console.log(`📊 Progreso: ${updated + unchanged}/${allProducts.length}`);
    }
  }

  // 3. Mostrar resultados
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN DE REDONDEO');
  console.log('='.repeat(70));
  console.log(`✅ Precios actualizados: ${updated}`);
  console.log(`⏭️  Sin cambios: ${unchanged}`);
  console.log(`📦 Total procesados: ${allProducts.length}`);
  console.log('='.repeat(70));

  // 4. Mostrar primeros 20 cambios
  if (changes.length > 0) {
    console.log('\n📝 PRIMEROS 20 CAMBIOS:');
    console.log('-'.repeat(70));
    changes.slice(0, 20).forEach((c, i) => {
      const sign = c.diff >= 0 ? '+' : '';
      console.log(`${i + 1}. ${c.name}`);
      console.log(`   $${c.old.toLocaleString('es-CL')} → $${c.new.toLocaleString('es-CL')} (${sign}$${c.diff.toLocaleString('es-CL')})`);
    });

    if (changes.length > 20) {
      console.log(`\n... y ${changes.length - 20} cambios más`);
    }
  }

  console.log('\n🎉 ¡Redondeo completado!');
}

// Ejecutar
roundAllPrices()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });
