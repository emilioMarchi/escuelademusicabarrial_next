# 🗺️ Hoja de Ruta: Próximas Implementaciones

Este documento detalla el plan de acción para las versiones v1.3.x, enfocado en la integridad de datos y la optimización de recursos.

---

## 📅 Fase 1: Adaptación de Datos (SSOT)
**Objetivo:** Migrar las vistas de clases para que consuman datos de la colección `grupos` en lugar de campos estáticos en `clases`.

### 1.1. Modificación de `ClassDetailPage` (`/clases/[slug]`)
- **Investigación:** Actualmente, la página busca `teachers` y `group` directamente en el documento de la clase.
- **Cambio:** 
  1. Obtener el ID de la clase.
  2. Consultar la colección `grupos` filtrando por `class_id == id_clase`.
  3. Derivar docentes únicos y horarios consolidados desde los grupos encontrados.
- **Beneficio:** Si se cambia un docente en un grupo, se refleja automáticamente en la página de la clase sin editar la clase misma.

### 1.2. Modificación de Listado de Clases (`/clases`)
- **Cambio:** En las "Cards" de clases, mostrar un resumen dinámico (ej: "3 comisiones disponibles", "Docentes: [Lista derivada]").

---

## ⚡ Fase 2: Estrategia de Cache
**Objetivo:** Reducir las lecturas de Firestore para ahorrar cuota y mejorar la velocidad de carga.

### 2.1. Caché en el Frontend (Público)
- **Implementación:** Utilizar `unstable_cache` de Next.js en los servicios de `admin-services.ts` y `content.ts`.
- **Claves de Revalidación:** 
  - Usar tags de caché (ej: `['clases']`, `['novedades']`).
  - Aprovechar que ya existe `revalidatePath` en `upsertItemAdmin` para agregar `revalidateTag`.
- **Duración:** Cache de larga duración (TTL: 1 hora) con revalidación bajo demanda (On-demand Revalidation) al editar desde el admin.

### 2.2. Caché en el Dashboard (Admin)
- **Desafío:** El admin necesita datos frescos para evitar conflictos de edición.
- **Propuesta:** 
  - **Request Memoization:** Asegurar que múltiples componentes en una misma ruta no disparen la misma consulta.
  - **SWR o React Query (Opcional):** Si se requiere una experiencia más fluida, implementar una capa de estado local con revalidación en segundo plano (stale-while-revalidate).

---

## 🛠️ Sugerencias Técnicas para la Cache

Para manejar la caché de forma eficiente en este proyecto, sugiero:

1.  **Wrapper de Servicio:** Crear un archivo `src/lib/cache.ts` que centralice las llamadas a `unstable_cache`.
2.  **Etiquetas Dinámicas:** Cada vez que se use `upsertItemAdmin`, disparar una revalidación por tag:
    ```typescript
    // Ejemplo conceptual
    revalidateTag(collectionName); 
    ```
3.  **Normalización:** Asegurarse de que los datos serializados (`serializeData`) sean compatibles con el motor de caché de Next.js (no pasar objetos complejos de Firebase).

---

## ✅ Próximos Pasos (Checklist)
- [x] Crear `ROADMAP.md` (Este documento).
- [x] Refactorizar `getCollectionPublic` para usar `unstable_cache`.
- [x] Modificar `ClassDetailPage` para buscar grupos vinculados.
- [x] Implementar estrategia de `revalidateTag` en servicios de Admin.
- [x] Adaptar `SectionRenderer` y `CardItem` para derivar datos dinámicos.
- [ ] Implementar Request Memoization en el Dashboard (Opcional si se detectan cuellos de botella).

