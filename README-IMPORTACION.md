# 📦 IMPORTACIÓN MASIVA DE PRODUCTOS

## 🎯 QUÉ HACE ESTE SCRIPT

Importa los **2,307 productos** del Excel a Supabase automáticamente con:
- ✅ Stock inicial: 0
- ✅ Descuento: 40% para todos
- ✅ Precio de venta calculado automáticamente
- ✅ Todos visibles en el catálogo

---

## 📋 INSTRUCCIONES PASO A PASO

### 1️⃣ Descargar archivos

Descarga estos 2 archivos y guárdalos en la raíz de tu proyecto `ml-catalogo`:

- `import-products.js` (el script)
- `products_to_import.json` (los productos procesados)

### 2️⃣ Verificar que tienes las dependencias

Tu proyecto ya tiene `@supabase/supabase-js`, así que no necesitas instalar nada nuevo.

### 3️⃣ Ejecutar el script

Abre la terminal en la raíz de tu proyecto y ejecuta:

```bash
node import-products.js
```

### 4️⃣ Esperar

El script tarda **2-3 minutos** en importar los 2,307 productos.

Verás algo como:

```
📦 Importando 2307 productos...
⏳ Esto puede tomar 2-3 minutos...

✅ Lote 1: 100 productos importados (Total: 100/2307)
✅ Lote 2: 100 productos importados (Total: 200/2307)
✅ Lote 3: 100 productos importados (Total: 300/2307)
...
```

### 5️⃣ Verificar

Cuando termine, ve a:
- **Admin:** https://ml-catalogo.vercel.app/admin/products
- **Catálogo público:** https://ml-catalogo.vercel.app/

---

## 📊 RESUMEN DE DATOS IMPORTADOS

```
Total productos: 2,307
- Con código de barras: 1,930
- Sin código de barras: 377 (usan SKU)
- Con marca: 2,085
- Sin marca: 222

Stock inicial: 0 (para todos)
Descuento: 40% (para todos)
Visibles: Sí (todos)
Imágenes: No (las agregas después manualmente)
```

---

## 🛠️ DESPUÉS DE IMPORTAR

### ✅ Puedes:
1. **Ajustar stock** con el escáner (`/scan`)
2. **Editar productos** individuales (`/admin/products` → Editar)
3. **Cambiar descuentos** (algunos al 10%, otros al 20%, etc.)
4. **Agregar imágenes** manualmente
5. **Agregar códigos de barras** a los 377 que no tienen

### 📱 Usar el escáner:
- Ve a `/scan`
- Escanea código de barras
- Ajusta stock automáticamente

---

## ⚠️ IMPORTANTE

- El script importa en **lotes de 100** para no saturar Supabase
- Si hay algún error, lo muestra pero continúa con los demás
- Al final te muestra un resumen de cuántos se importaron exitosamente

---

## 🆘 SI ALGO SALE MAL

Si ves errores, revisa:
1. Que el archivo `.env.local` tenga las variables de Supabase
2. Que `products_to_import.json` esté en la raíz del proyecto
3. Que tengas conexión a internet

---

¡Listo! 🎉
