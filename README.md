# Atelier

Tienda en línea de ropa con catálogo, variantes (color/talla), carrito, pedidos por WhatsApp e inventario, más un panel de administración.

## Stack

- **Web:** React + Vite + TypeScript + Tailwind + Zustand
- **API:** Node.js + Express + TypeScript + Zod
- **DB:** SQLite + Prisma (archivo local, sin Docker)
- **Auth admin:** JWT en cookie HTTP-only (Argon2)

## Arranque (sin Docker)

Necesitas solo **Node.js 20+** y npm.

```bash
npm install
npm run setup
npm run dev
```

O en un solo paso después de `npm install`:

```bash
npm run dev
```

(`dev` genera Prisma, crea la DB, siembra datos y levanta API + web.)

| Servicio | URL |
|----------|-----|
| Tienda | http://localhost:5173 |
| Admin | http://localhost:5173/admin/login |
| API | http://localhost:4000/api/health |

### Credenciales de desarrollo

```
Email:    admin@atelier.mx
Password: AtelierAdmin123!
```

Cámbialas en producción (`ADMIN_EMAIL` / `ADMIN_PASSWORD` + `JWT_SECRET` en `apps/api/.env`).

## Scripts útiles

```bash
npm run setup      # install + DB + seed
npm run dev        # API + web juntos
npm run dev:api    # solo API (puerto 4000)
npm run dev:web    # solo web (puerto 5173)
npm run db:seed    # volver a cargar datos de ejemplo
```

Vite proxya `/api` y `/uploads` al backend.

## Flujo que debe funcionar

**Admin:** login → categorías → colores/tallas → producto con variantes → generar combinaciones → stock → publicar → ver pedidos y cambiar estado.

**Cliente:** catálogo → color/talla → carrito → checkout → pedido guardado + ticket WhatsApp (con color, talla y SKU).

## Estructura

```
apps/api   Backend Express + Prisma + seed (SQLite en prisma/dev.db)
apps/web   Tienda pública + panel /admin
```

## Notas importantes

- Precios e inventario se recalculan en el servidor (no se confía en el frontend).
- Montos en **céntimos** enteros (bolívares venezolanos, Bs).
- Productos desactivados/eliminados no salen en la tienda; agotados se pueden mostrar sin compra.
- Cancelar un pedido restaura stock una sola vez.
- Imágenes en `uploads/` (capa preparada para S3/Cloudinary).
