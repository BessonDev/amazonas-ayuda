<p align="center">
  <img src="https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=for-the-badge" alt="Estado">
  <img src="https://img.shields.io/badge/Node.js-24.14.1-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/PostgreSQL-18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
</p>

<h1 align="center">
  🌴 Amazonas Ayuda
</h1>

<p align="center">
  <strong>Plataforma de gestión logística para donaciones humanitarias</strong><br>
  Estado Amazonas — Venezuela
</p>

<p align="center">
  <em>Conectando donantes con comunidades que más lo necesitan, a través de tecnología transparente y trazable.</em>
</p>

---

## 📋 Tabla de Contenidos

- [🎯 Visión General](#-visión-general)
- [✨ Características](#-características)
- [🏗️ Arquitectura](#️-arquitectura)
- [⚙️ Stack Tecnológico](#️-stack-tecnológico)
- [🚀 Comenzando](#-comenzando)
  - [Prerrequisitos](#prerrequisitos)
  - [Instalación](#instalación)
  - [Base de Datos](#base-de-datos)
  - [Desarrollo](#desarrollo)
- [📦 Módulos](#-módulos)
- [🛣️ Roadmap](#️-roadmap)
- [🤝 Contribuir](#-contribuir)
- [📄 Licencia](#-licencia)

---

## 🎯 Visión General

**Amazonas Ayuda** es una plataforma web diseñada para gestionar el ciclo completo de donaciones humanitarias en el Estado Amazonas, Venezuela. Desde el registro de donantes y la recepción de alimentos/insumos, hasta la distribución en comunidades indígenas y centros de salud.

### ¿Por qué?

El Estado Amazonas enfrenta desafíos logísticos únicos: comunidades dispersas en la selva, acceso mayormente fluvial o aéreo, y una necesidad crítica de transparencia en la gestión de ayuda humanitaria. Esta plataforma nace para resolver esos problemas con tecnología.

> 💡 **Misión:** Garantizar que cada donación llegue a quien realmente la necesita, con trazabilidad completa y en tiempo récord.

---

## ✨ Características

| 🔐 | **Autenticación & Roles** |  
|:--:|:---------------------------|
| | Login seguro con JWT + Refresh Tokens en cookies HttpOnly |
| | 4 roles con permisos granular: Administrador, Coordinador Logístico, Operador de Inventario, Responsable de Destino |

| 📦 | **Gestión de Donaciones** |
|:--:|:---------------------------|
| | Registro de donantes (personas, empresas, iglesias) |
| | Creación de lotes con códigos QR |
| | Asignación de productos y cantidades |

| 🚚 | **Logística & Transporte** |
|:--:|:---------------------------|
| | Planificación de viajes con rutas y responsables |
| | Recepción y verificación en destino |
| | Estados trazables: Registrado → En Tránsito → Entregado → Verificado |

| 📍 | **Inventario & Ubicaciones** |
|:--:|:------------------------------|
| | Múltiples tipos de ubicación: centros de acopio, hospitales, refugios, iglesias |
| | Control de inventario basado en movimientos |
| | Alertas de stock bajo |

| 📊 | **Reportes & Exportación** |
|:--:|:---------------------------|
| | Generación de reportes en PDF y Excel |
| | Panel administrativo con métricas en tiempo real |

---

## 🏗️ Arquitectura

```
amazonas-ayuda/
├── 📁 packages/
│   ├── 📁 backend/          # API REST — NestJS + Prisma
│   │   ├── src/
│   │   │   ├── auth/        # Autenticación y autorización
│   │   │   ├── usuarios/    # Gestión de usuarios
│   │   │   ├── campanias/   # Gestión de campañas
│   │   │   ├── ubicaciones/ # Puntos de acopio y destino
│   │   │   ├── categorias/  # Categorías de productos
│   │   │   ├── productos/   # Catálogo de productos
│   │   │   ├── donantes/    # Registro de donantes
│   │   │   ├── lotes/       # Lotes con códigos QR
│   │   │   ├── movimientos-inventario/ # Control de inventario
│   │   │   ├── viajes/      # Planificación de transporte
│   │   │   ├── recepciones/ # Recepción en destino
│   │   │   ├── solicitudes/ # Pedidos desde destino
│   │   │   ├── archivos/    # Adjuntos multifacéticos
│   │   │   ├── configuracion/ # Configuración clave-valor
│   │   │   └── reportes/    # Exportación PDF/Excel
│   │   └── prisma/          # Schema y migraciones
│   │
│   ├── 📁 frontend/         # UI — Next.js 16 + Tailwind v4
│   │   └── src/
│   │       ├── app/         # Páginas y layouts
│   │       │   └── admin/   # Panel admin con 14 páginas
│   │       ├── components/  # Componentes shadcn/ui
│   │       ├── lib/         # Utilidades y API client
│   │       └── contexts/    # Auth, Query, etc.
│   │
│   └── 📁 shared/           # Tipos y enums compartidos
│       └── src/
```

### 🔁 Flujo de Datos

```
Donante ──> Lote (QR) ──> Centro de Acopio ──> Viaje ──> Destino
                              │                      │
                              └── Movimiento ─────────┘
                                    │
                              Inventario (trazable)
```

---

## ⚙️ Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|:-----------|:--------|:----------|
| [NestJS](https://nestjs.com/) | 11 | Framework backend modular |
| [Prisma](https://www.prisma.io/) | 6 | ORM con type-safety |
| [PostgreSQL](https://www.postgresql.org/) | 18 | Base de datos relacional |
| [JWT](https://jwt.io/) + Passport | — | Autenticación segura (HttpOnly cookies) |
| [Swagger](https://swagger.io/) | — | Documentación de API |
| [Multer](https://github.com/expressjs/multer) | — | Upload de archivos |

### Frontend

| Tecnología | Versión | Propósito |
|:-----------|:--------|:----------|
| [Next.js](https://nextjs.org/) | 16 | Framework React App Router |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Estilos utilitarios |
| [shadcn/ui](https://ui.shadcn.com/) | — | Componentes base-nova |
| [TanStack Query](https://tanstack.com/query) | 5 | Manejo de estado asíncrono |
| [React Hook Form](https://react-hook-form.com/) | 7 | Formularios performantes |
| [Zod](https://zod.dev/) | 3 | Validación de esquemas |
| [Recharts](https://recharts.org/) | — | Visualización de datos |

### Infraestructura

| Herramienta | Propósito |
|:------------|:----------|
| [Turborepo](https://turbo.build/) | Monorepo orchestrator |
| [pnpm](https://pnpm.io/) | Package manager |
| [Node.js](https://nodejs.org/) | Entorno de ejecución |

---

## 🚀 Comenzando

### Prerrequisitos

- Node.js **24.14.1** (o superior)
- pnpm **11.8.0** (o superior)
- PostgreSQL **18** corriendo localmente
- Docker (opcional, para MinIO)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/BessonDev/amazonas-ayuda.git
cd amazonas-ayuda

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp packages/backend/.env.example packages/backend/.env
```

### Base de Datos

```bash
# Crear la base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE amazonas_ayuda;"

# Configurar usuario y contraseña
psql -U postgres -c "CREATE USER amazonas WITH PASSWORD 'tu_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE amazonas_ayuda TO amazonas;"
```

Configurar en `packages/backend/.env`:

```env
DATABASE_URL="postgresql://amazonas:tu_password@localhost:5432/amazonas_ayuda"
JWT_SECRET="tu_secreto_super_seguro"
JWT_REFRESH_SECRET="otro_secreto_para_refresh"
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
```

```bash
# Ejecutar migraciones y seed
pnpm --filter @donaciones/backend prisma:migrate
pnpm --filter @donaciones/backend prisma:seed
```

### Desarrollo

```bash
# Iniciar backend (http://localhost:4000)
pnpm --filter @donaciones/backend dev

# Iniciar frontend (http://localhost:3000)
pnpm --filter @donaciones/frontend dev

# O todo a la vez con Turborepo
pnpm dev
```

> 🌐 **Swagger UI:** Disponible en `http://localhost:4000/api/docs`

---

## 📦 Módulos

### Backend — CRUD completo (14 módulos)

| Módulo | Estado | Descripción |
|:-------|:------:|:------------|
| 🔐 **Auth** | ✅ | JWT HttpOnly + refresh tokens |
| 👥 **Usuarios** | ✅ | CRUD con roles y guards |
| 📢 **Campañas** | ✅ | Campañas de recolección |
| 📍 **Ubicaciones** | ✅ | Centros de acopio, hospitales, refugios |
| 🏷️ **Categorías** | ✅ | Clasificación de productos |
| 📦 **Productos** | ✅ | Catálogo de productos donables |
| 🤝 **Donantes** | ✅ | Registro de personas, empresas, orgs |
| 🏷️ **Lotes** | ✅ | Código único + QR generado |
| 📊 **Mov. Inventario** | ✅ | Saldos automáticos por lote+ubicación |
| 🚚 **Viajes** | ✅ | Viajes con detalle y estados |
| 📋 **Recepciones** | ✅ | Crea inventario automáticamente |
| 📝 **Solicitudes** | ✅ | Pedidos con prioridad y estados |
| 📎 **Archivos** | ✅ | Upload multipart con metadatos |
| ⚙️ **Configuración** | ✅ | Pares clave-valor |

### Frontend — Admin panel (14 páginas)

| Página | Descripción |
|:-------|:------------|
| 📊 **Dashboard** | Resumen con cards por entidad |
| 📢 **Campañas** | Listado, búsqueda, eliminación |
| 📍 **Ubicaciones** | Listado con tipo de ubicación |
| 🏷️ **Categorías** | Listado básico |
| 📦 **Productos** | Listado con categoría |
| 🤝 **Donantes** | Listado con tipo y contacto |
| 🏷️ **Lotes** | Listado + QR modal + estados |
| 📊 **Movimientos** | Listado con saldos y tipo badge |
| 🚚 **Viajes** | Listado con origen/destino |
| 📋 **Recepciones** | Listado por viaje |
| 📝 **Solicitudes** | Listado con prioridad color-coded |
| 📎 **Archivos** | Listado con descarga directa |
| ⚙️ **Configuración** | Listado clave-valor |

**Leyenda:** ✅ Completado · 🔧 En progreso · ⏳ Pendiente

---

## 🛣️ Roadmap

### Fase 1 — Base 🏗️
- [x] Monorepo con Turborepo
- [x] Schema de base de datos (Prisma, 21+ modelos)
- [x] Autenticación JWT HttpOnly + refresh tokens
- [x] CRUD de usuarios con roles y guards

### Fase 2 — Backend CRUD 📦
- [x] Catálogo: Campañas, Ubicaciones, Categorías, Productos, Donantes
- [x] Lotes con código único y QR (data URL)
- [x] Movimientos de inventario con saldos automáticos
- [x] Viajes con detalle anidado
- [x] Recepciones (crea inventario automáticamente en transacción)
- [x] Solicitudes con prioridad y estados
- [x] Archivos (upload multipart + descarga)
- [x] Configuración clave-valor

### Fase 3 — Frontend Admin 🖥️
- [x] Login funcional con sidebar colapsable
- [x] Dashboard con stats por entidad
- [x] Páginas de listado para todos los módulos
- [ ] Formularios de creación/edición
- [ ] Página pública de consulta

### Fase 4 — Reportes 📊
- [ ] Exportación PDF (pdfkit instalado)
- [ ] Exportación Excel (exceljs instalado)

### Fase 5 — Producción 🚀
- [ ] Despliegue
- [ ] Auditoría y registros
- [ ] Pruebas E2E

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crear tu rama de feature (`git checkout -b feature/feature-genial`)
3. Commit tus cambios (`git commit -m 'feat: agregar feature genial'`)
4. Push a la rama (`git push origin feature/feature-genial`)
5. Abrir un Pull Request

### Convenciones

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/)
- **Código:** TypeScript con tipos estrictos
- **Nombres:** Español para identificadores del dominio
- **PRs:** Mantener cambios pequeños y enfocados

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.

---

<p align="center">
  Hecho con ❤️ para el Estado Amazonas, Venezuela
</p>
<p align="center">
  <sub>¿Preguntas? harold@besson.dev</sub>
</p>
