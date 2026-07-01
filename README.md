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
│   │   │   ├── campanias/   # Gestión de campañas
│   │   │   ├── ubicaciones/ # Puntos de acopio y destino
│   │   │   ├── categorias/  # Categorías de productos
│   │   │   ├── productos/   # Catálogo de productos
│   │   │   ├── donantes/    # Registro de donantes
│   │   │   ├── lotes/       # Lotes de donaciones con QR
│   │   │   ├── movimientos/ # Control de inventario
│   │   │   └── reportes/    # Exportación PDF/Excel
│   │   └── prisma/          # Schema y migraciones
│   │
│   ├── 📁 frontend/         # UI — Next.js 16 + Tailwind v4
│   │   └── src/
│   │       ├── app/         # Páginas y layouts
│   │       ├── components/  # Componentes shadcn/ui
│   │       ├── lib/         # Utilidades y API client
│   │       └── contexts/    # Auth, Query, etc.
│   │
│   └── 📁 shared/           # Tipos y enums compartidos
│       └── src/
│           ├── enums.ts     # Enums del dominio
│           └── types.ts     # Interfaces compartidas
│
├── 📦 minio/                # Almacenamiento de archivos
└── ⚙️ infra/                # Configuración de infraestructura
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
| [JWT](https://jwt.io/) + Passport | — | Autenticación segura |
| [MinIO](https://min.io/) | — | Almacenamiento S3-compatible |
| [Swagger](https://swagger.io/) | — | Documentación de API |

### Frontend

| Tecnología | Versión | Propósito |
|:-----------|:--------|:----------|
| [Next.js](https://nextjs.org/) | 16 | Framework React App Router |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Estilos utilitarios |
| [shadcn/ui](https://ui.shadcn.com/) | — | Componentes accesibles |
| [TanStack Query](https://tanstack.com/query) | 5 | Manejo de estado asíncrono |
| [Recharts](https://recharts.org/) | — | Visualización de datos |

### Infraestructura

| Herramienta | Propósito |
|:------------|:----------|
| [Turborepo](https://turbo.build/) | Monorepo orchestrator |
| [pnpm](https://pnpm.io/) | Package manager |
| [Docker](https://www.docker.com/) | Contenedores (MinIO) |
| [VPS](https://www.digitalocean.com/) | Servidor de producción |

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

| Módulo | Estado | Descripción |
|:-------|:------:|:------------|
| 🔐 **Auth** | ✅ | Login, registro, refresh tokens, roles |
| 👥 **Usuarios** | ✅ | CRUD de usuarios con asignación de roles |
| 📢 **Campañas** | ✅ | Creación y gestión de campañas de recolección |
| 📍 **Ubicaciones** | ✅ | Centros de acopio, hospitales, refugios |
| 🏷️ **Categorías** | ✅ | Clasificación de productos |
| 📦 **Productos** | ✅ | Catálogo de productos donables |
| 🤝 **Donantes** | ⏳ | Registro y gestión de donantes |
| 🏷️ **Lotes** | ⏳ | Lotes con códigos QR |
| 📊 **Inventario** | ⏳ | Control de movimientos y stock |
| 🚚 **Viajes** | ⏳ | Planificación de transporte |
| 📋 **Solicitudes** | ⏳ | Pedidos desde destino |
| 📄 **Reportes** | ⏳ | Exportación PDF y Excel |

**Leyenda:** ✅ Completado · ⏳ Pendiente · 🔧 En progreso

---

## 🛣️ Roadmap

### Fase 1 — Base 🏗️
- [x] Monorepo con Turborepo
- [x] Schema de base de datos (Prisma)
- [x] Autenticación JWT con roles
- [x] CRUD de usuarios
- [x] Login funcional + Dashboard básico

### Fase 2 — Catálogo 📋
- [x] CRUD de campañas
- [x] CRUD de ubicaciones
- [x] CRUD de categorías y productos
- [ ] CRUD de donantes
- [ ] CRUD de lotes con QR

### Fase 3 — Logística 🚚
- [ ] Movimientos de inventario
- [ ] Viajes y transporte
- [ ] Recepción en destino
- [ ] Alertas de stock

### Fase 4 — Reportes 📊
- [ ] Exportación PDF
- [ ] Exportación Excel
- [ ] Dashboard administrativo
- [ ] Métricas en tiempo real

### Fase 5 — Producción 🚀
- [ ] Despliegue VPS
- [ ] CI/CD
- [ ] Documentación de usuario
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
