# Escuela de Música Barrial - Aplicación Completa

Este proyecto es una plataforma integral para la **Escuela de Música Barrial**, que incluye tanto el sitio web público como un panel de administración avanzado.

## 🚀 Versión Actual: **v1.2.9**

### 📋 Descripción del Proyecto
La aplicación permite la gestión total de la oferta educativa, inscripciones, novedades y donaciones. Está construida con **Next.js 16** y utiliza **Firebase** como motor de base de datos y autenticación.

---

## 🏗️ Arquitectura del Sistema

### 1. 🌐 Sitio Público (`src/app/(public)`)
Diseñado para la comunidad, con alto enfoque en UX y SEO:
- **Inicio Dinámico:** Secciones configurables desde el admin.
- **Catálogo de Clases:** Listado de talleres y páginas individuales.
- **Novedades:** Blog institucional con soporte para video.
- **Donaciones:** Integración con **Mercado Pago** (Pagos únicos y suscripciones).
- **Galería:** Visualizador de fotos y actividades de la escuela.
- **Formularios:** Consultas e inscripciones directas.

### 2. 🔐 Panel de Administración (`src/app/(admin)`)
Centro de control protegido para la gestión operativa:
- **Gestión de Colecciones:** Tablas maestras para Clases, Grupos (Comisiones), Alumnos y Novedades.
- **Sincronización Inteligente:** Basada en la "Fuente Única de Verdad" (Grupos).
- **Control de Balances:** Visualización de ingresos vía Mercado Pago.
- **Configuración Web:** Editor de secciones para la página de inicio.

---

## 🛠️ Stack Tecnológico
- **Framework:** Next.js 16 (App Router + Turbopack)
- **Base de Datos:** Firebase Firestore
- **Autenticación:** Firebase Auth + Firebase Admin SDK
- **Almacenamiento:** Firebase Storage
- **Pasarela de Pagos:** Mercado Pago SDK / API
- **Correos:** Resend API
- **Estilos:** Tailwind CSS 4 + Framer Motion
- **Iconografía:** Lucide React

---

## ⚙️ Configuración e Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd escuelademusica-website
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de Entorno
Crea un archivo `.env.local` basado en el archivo `.env.example` provisto:
```bash
cp .env.example .env.local
```
Completa las variables con tus credenciales de Firebase, Mercado Pago y Resend.

### 4. Configuración de Firebase
- Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
- Habilita **Firestore**, **Authentication** (Email/Password) y **Storage**.
- Genera una **Clave Privada de Service Account** en `Configuración del Proyecto > Cuentas de Servicio` para las variables de Admin.

### 5. Iniciar Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

---

## 📂 Estructura de Carpetas Clave
- `src/app/(public)`: Rutas y componentes del sitio para usuarios finales.
- `src/app/(admin)`: Rutas y componentes del panel de gestión.
- `src/components`: Componentes compartidos y secciones dinámicas.
- `src/services`: Capa de servicios (Server Actions) para interacción con APIs y DB.
- `src/lib`: Configuraciones de librerías (Firebase, Mercado Pago, Resend).
- `src/types`: Definiciones de TypeScript para todo el proyecto.

---

## ✨ Características de v1.2.9
- **Buscador Maestro:** Filtros inteligentes con normalización de tildes.
- **Tablas de Gestión Densa:** Manejo eficiente de grandes volúmenes de datos.
- **Limpieza en Cascada:** Al eliminar un grupo, se limpian las referencias en el sistema.
- **YouTube Auto-Embed:** Soporte automático para videos en descripciones de novedades.
