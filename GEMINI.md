# Mandatos y Contexto de Sesión (EMB Admin)

Este archivo contiene las directrices fundamentales para el desarrollo del proyecto **Escuela de Música Barrial**, asegurando la integridad técnica y estética en futuras intervenciones.

## 📌 Reglas de Oro
1.  **Fuente Única de Verdad (Single Source of Truth):** 
    - Las relaciones se gestionan EXCLUSIVAMENTE a través de la colección `grupos`.
    - Las `clases` y `alumnos` NUNCA deben guardar arrays de IDs ajenos. Se deben derivar los vínculos en tiempo real filtrando la lista de grupos.
2.  **Integridad de Datos:** Al eliminar un objeto (especialmente Grupos), se debe asegurar la limpieza de sus referencias en las funciones de servidor correspondientes (`deleteItemAdmin`).
3.  **Estética Emerald:** El Dashboard utiliza una paleta de verdes esmeralda suaves (`#f4fcf7`, `bg-emerald-100/80`) con textos en alto contraste (`slate-900` / `emerald-950`). Se debe mantener esta claridad visual.
4.  **Normalización de Búsqueda:** Todo buscador implementado debe normalizar tildes y diacríticos para garantizar el éxito del filtrado (vía `.normalize("NFD").replace(/[\u0300-\u036f]/g, "")`).

## 🚀 Versión Actual: v1.2.9
- **Hitos:** Implementación de tablas maestras, base de alumnos centralizada, y sistema de comisiones dinámico.

## 🛠️ Tecnologías Críticas
- **Next.js 16 (Turbopack):** Usar siempre App Router.
- **Firebase Admin SDK:** Para operaciones de limpieza en cascada y transacciones batch.
- **Framer Motion:** Para transiciones de modales y estados de carga.

## 🌐 Alcance de la Aplicación
El proyecto no es solo un panel administrativo; es una plataforma de dos caras:
1.  **Sitio Público:** `/` (Home), `/clases`, `/novedades`, `/galeria`, `/donaciones`. Gestionado dinámicamente mediante secciones en Firestore.
2.  **Panel Admin:** `/dashboard`. Protegido por Firebase Auth y Middleware de sesión.

Todas las configuraciones de API (Mercado Pago, Resend, Firebase) deben mantenerse sincronizadas entre ambos entornos.
