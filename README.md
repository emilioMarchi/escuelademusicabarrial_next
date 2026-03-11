# Escuela de Música Barrial - Sistema de Gestión (EMB Admin)

Este es el sistema central de gestión para la **Escuela de Música Barrial**, diseñado para administrar clases, comisiones, alumnos, docentes y novedades.

## 🚀 Versión Actual: **v1.2.9**

### 📋 Contexto del Proyecto
La aplicación es una plataforma integral construida con **Next.js 16** que permite a los administradores llevar un control total de la oferta educativa y la base de datos de la escuela. El sistema utiliza una arquitectura de **"Fuente Única de Verdad"** centrada en los **Grupos (Comisiones)** para evitar desincronización de datos.

---

## 🛠️ Stack Tecnológico
- **Framework:** Next.js 16 (App Router + Turbopack)
- **Base de Datos:** Firebase Firestore
- **Autenticación:** Firebase Auth (vía Cookies de sesión seguras)
- **Almacenamiento:** Firebase Storage
- **Estilos:** Tailwind CSS 4
- **Animaciones:** Framer Motion
- **Iconografía:** Lucide React

---

## 🏗️ Arquitectura de Datos
El sistema se organiza en cuatro pilares fundamentales:

1.  **Clases (Talleres):** Contenedores generales (ej: Guitarra, Piano). No guardan datos técnicos, solo descriptivos y estéticos.
2.  **Grupos (Comisiones):** El núcleo del sistema. Guardan el `class_id`, el `teacher_names`, los `instruments`, el `schedule` y la lista de `students` (IDs).
3.  **Alumnos/as:** Base de datos centralizada con perfiles individuales. Su relación con las clases es dinámica a través de los grupos.
4.  **Novedades/Noticias:** Blog institucional con soporte para videos de YouTube embebidos.

---

## ✨ Características Principales (Implementadas en v1.2.9)
- **Buscador Maestro:** Filtros inteligentes que normalizan tildes y buscan por múltiples campos (nombre, docente, instrumento e incluso alumnos dentro de una clase).
- **Tablas de Gestión:** Vistas de datos densas para manejar grandes volúmenes de información (30+ registros por pantalla).
- **Sincronización Bidireccional:** El sistema limpia automáticamente referencias a objetos eliminados.
- **Seguridad Admin:** El panel `/dashboard` está protegido y configurado para no ser indexado por buscadores (Robots: `noindex, nofollow`).
- **YouTube Auto-Embed:** Detección automática de links de YouTube en descripciones para montar reproductores de video.

---

## 🛠️ Comandos de Desarrollo
```bash
npm run dev      # Iniciar servidor local
npm run build    # Generar build de producción
npm run lint     # Correr linter
```


---

## 📂 Estructura de Archivos Clave
- `src/app/(admin)/dashboard/page.tsx`: Corazón del panel central.
- `src/app/(admin)/components/CollectionManager.tsx`: Gestor universal de tablas y formularios.
- `src/services/admin-services.ts`: Acciones de servidor (Server Actions) para Firebase.
- `src/types/index.ts`: Definición de interfaces y contratos de datos.
