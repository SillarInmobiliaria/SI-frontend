# 🦁 Sillar Inmobiliaria CRM - Frontend App

![Next JS](https://img.shields.io/badge/Next-black?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

**Sillar Inmobiliaria Frontend** es una aplicación web moderna, responsiva y de alto rendimiento construida con **Next.js 14 (App Router)**. Sirve como la interfaz principal para la administración de propiedades, gestión de clientes y visualización de métricas en tiempo real.

---

## ✨ Características Principales

- **🎨 Interfaz Moderna y Responsiva:**
  - Diseño construido con **Tailwind CSS** para una experiencia fluida en móviles, tablets y escritorio.
  - Componentes reutilizables y arquitectura modular.

- **🔐 Seguridad y Autenticación:**
  - Sistema de Login protegido.
  - **AuthGuard:** Protección de rutas privadas (Dashboard, CRM) mediante verificación de Token.
  - Manejo de sesiones con Context API.

- **📊 Dashboard Interactivo:**
  - Visualización de gráficas estadísticas.
  - Tarjetas de métricas clave (KPIs) conectadas al Backend.

- **🛠️ Herramientas de Gestión (CRM):**
  - CRUD completo de Propiedades, Clientes y Propietarios.
  - Subida de imágenes y manejo de archivos.
  - Generación de reportes.

- **🚧 Modo Mantenimiento (Kill Switch):**
  - Sistema de bloqueo global activable mediante variables de entorno para realizar actualizaciones seguras sin afectar la experiencia del usuario.

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 | App Router & Server Components |
| **Librería UI** | React 18 | Construcción de interfaces |
| **Estilos** | Tailwind CSS | Diseño utilitario y responsivo |
| **Lenguaje** | TypeScript | Tipado estático y seguridad |
| **Conexión API** | Axios | Peticiones HTTP al Backend |
| **Iconos** | React Icons | Iconografía vectorial |

---

## 🚀 Instalación y Despliegue

Sigue estos pasos para levantar el proyecto en tu entorno local:

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/si-frontend.git
cd si-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configuración de Entorno (.env.local)

Crea un archivo `.env.local` en la raíz del proyecto (puedes basarte en `.env.example`).

Variables requeridas:

```env
# URL de conexión con tu Backend (SI-backend)
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Interruptor de Mantenimiento (true = Sitio bloqueado / false = Sitio activo)
NEXT_PUBLIC_MODO_MANTENIMIENTO=false
```

### 4. Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

---

## 📂 Estructura del Proyecto

El proyecto sigue la arquitectura de App Router de Next.js:

```
src/
├── app/             # 🚦 Rutas y Páginas (App Router)
│   ├── (auth)/      # Rutas públicas (Login)
│   ├── (admin)/     # Rutas protegidas (Dashboard, Propiedades)
│   └── layout.tsx   # Layout principal y configuración global
├── components/      # 🧩 Componentes reutilizables (Navbar, Cards, Modals)
├── context/         # 🧠 Estado global (AuthContext)
├── services/        # 🔌 Funciones de conexión a la API (Axios)
├── store/           # 📦 Manejo de estado complejo (si aplica)
└── types/           # 📝 Definiciones de interfaces TypeScript
```

---

## 🚀 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Compila la aplicación para producción.
- `npm start`: Inicia el servidor de producción (requiere build previo).
- `npm run lint`: Ejecuta el linter para encontrar errores de código.

---

Developed with ❤️ by **Mijael Juy** 🤝 **Sillar Inmobiliaria**
