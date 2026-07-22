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
| | Formularios adaptados por rol (RESPONSABLE_DESTINO ve versión simplificada) |

| 📦 | **Gestión de Donaciones** |
|:--:|:---------------------------|
| | Registro de donantes (personas, empresas, iglesias) |
| | Creación de lotes con códigos QR |
| | Asignación de productos y cantidades |

| 🚚 | **Logística & Transporte** |
|:--:|:---------------------------|
| | Planificación de viajes con rutas, responsables y lotes consolidados por producto |
| | Recepción y verificación en destino con foto |
| | Per-lote state selector: Completo / Parcial / No recibido con inputs de cantidad |
| | Transiciones de estado automáticas: Planificado → Preparando Carga → En Tránsito → Llegó → Completado / Recepción Parcial |
| | Manejo de faltantes y dañados en recepción parcial (lotes split) |
| | Inventario automático: movimientos ENTRADA/ENVIO/RECEPCION/AJUSTE al crear lote, despachar viaje y recepcionar |

| 📍 | **Inventario & Ubicaciones** |
|:--:|:------------------------------|
| | Múltiples tipos de ubicación: centros de acopio, hospitales, refugios, iglesias |
| | Control de inventario basado en movimientos |
| | Alertas de stock bajo |

| 🖼️ | **Archivos & Fotos** |
|:--:|:---------------------------|
| | Upload de archivos multipart con metadatos por entidad |
| | Componente FileUpload reutilizable con drag & drop y preview |
| | Subida de fotos desde formularios de recepción y viaje |
| | Carrusel de fotos en portal público |

| 🔔 | **UX & Feedback** |
|:--:|:-------------------|
| | Toast notifications vía Sonner en cada operación CRUD (crear, editar, eliminar, transferir, recibir, cambiar estado) |
| | ConfirmDialog estético (AlertDialog shadcn) reemplazando browser confirm() para acciones destructivas |
| | Feedback visual inmediato con richColors y closeButton |

| 📊 | **Reportes & Exportación** |
|:--:|:---------------------------|
| | Generación de reportes en PDF y Excel |
| | Panel administrativo con métricas en tiempo real |

---

## 👥 Matriz de Roles

### Sidebar — Recursos visibles por rol

| Recurso | `ADMINISTRADOR` | `COORDINADOR_LOGISTICO` | `OPERADOR_INVENTARIO` | `RESPONSABLE_DESTINO` |
|:--------|:---------------:|:------------------------:|:---------------------:|:---------------------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Campañas | ✅ | ✅ | ❌ | ❌ |
| Ubicaciones | ✅ | ✅ | ✅ | ❌ |
| Categorías | ✅ | ✅ | ✅ | ❌ |
| Productos | ✅ | ✅ | ✅ | ✅ |
| Donantes | ✅ | ✅ | ✅ | ❌ |
| Inventario | ✅ | ✅ | ✅ | ❌ |
| Movimientos | ✅ | ✅ | ✅ | ❌ |
| Viajes | ✅ | ✅ | ✅ | ✅ |
| Solicitudes | ✅ | ✅ | ✅ | ✅ |
| Usuarios | ✅ | ❌ | ❌ | ❌ |
| Imágenes | ✅ | ✅ | ❌ | ❌ |

### Permisos CRUD por recurso

| Recurso | Acción | `ADMIN` | `COORD_LOG` | `OP_INV` | `RESP_DESTINO` |
|:--------|--------|:-------:|:-----------:|:--------:|:--------------:|
| Campañas | CRUD completo | ✅ | ✅ | ❌ | ❌ |
| Ubicaciones | CRUD completo | ✅ | ✅ | ✅ (solo listar) | ❌ |
| Categorías | CRUD completo | ✅ | ✅ | ✅ (solo listar) | ❌ |
| Productos | CRUD completo | ✅ | ✅ | ✅ (solo listar) | ✅ (listar + crear rápido desde solicitud) |
| Donantes | CRUD completo | ✅ | ✅ | ✅ (solo listar) | ❌ |
| Inventario | CRUD completo | ✅ | ✅ | ✅ | ❌ |
| Movimientos | CRUD completo | ✅ | ✅ | ✅ | ❌ |
| Viajes | CRUD + cambio estado | ✅ | ✅ | ✅ | ✅ (solo recibir) |
| Solicitudes | CRUD + cambio estado | ✅ | ✅ | ✅ | ✅ + crear con form simplificado |
| Usuarios | CRUD completo | ✅ | ❌ | ❌ | ❌ |
| Imágenes | Upload/descarga | ✅ | ✅ | ❌ | ❌ |
| Configuración | CRUD completo | ✅ | ❌ | ❌ | ❌ |
| Reportes | Generación + descarga PDF/Excel | ✅ | ✅ | ❌ | ❌ |
| Auditoría | Consulta con filtros | ✅ | ❌ | ❌ | ❌ |

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
│   │   │   ├── publico/     # Portal público (stats, progreso, viajes)
│   │   │   ├── archivos/    # Adjuntos multifacéticos
│   │   │   ├── configuracion/ # Configuración clave-valor
│   │   │   ├── reportes/    # Exportación PDF/Excel (esqueleto)
│   │   │   └── auditoria/   # Registro de auditoría (esqueleto)
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
| [MinIO](https://min.io/) | — | Almacenamiento S3-compatible (imágenes y archivos) |

### Frontend

| Tecnología | Versión | Propósito |
|:-----------|:--------|:----------|
| [Next.js](https://nextjs.org/) | 16 | Framework React App Router |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Estilos utilitarios |
| [shadcn/ui](https://ui.shadcn.com/) | — | Componentes base-nova (incluye AlertDialog) |
| [Sonner](https://sonner.emilkowal.ski/) | — | Toast notifications |
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
MINIO_REGION="us-east-1"
```

```bash
# Ejecutar migraciones y seed
pnpm --filter @donaciones/backend prisma:migrate
pnpm --filter @donaciones/backend prisma:seed

# Seed con datos demo (solicitudes, viajes, lotes con progreso)
npx tsx packages/backend/prisma/seed-demo.ts
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

### 🌐 Probar desde LAN (móvil / otro PC)

No necesitas configuración adicional. Solo obtené tu IP local y accedé:

```bash
# Windows — obtener IP
ipconfig | findstr IPv4

# Linux / macOS
hostname -I
```

Luego desde cualquier dispositivo en la misma red entrá a `http://192.168.x.x:3000`.

> ⚡ El frontend (puerto 3000) hace de proxy al backend (puerto 4000) mediante el rewrite de Next.js, así que **no necesitás abrir el puerto 4000 ni configurar CORS**. Todo pasa por el mismo puerto 3000.

---

## 📦 Módulos

### Backend — CRUD completo (16 módulos)

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
| 🚚 **Viajes** | ✅ | Viajes con detalle, consolidación FIFO de lotes, estados con transiciones automáticas + auto-movimiento ENVIO/AJUSTE + `POST /:id/recibir` para recepción en destino |
| 📋 **Recepciones** | ✅ | Crea inventario automáticamente + actualiza lote + subida de foto con FileUpload |
| 📝 **Solicitudes** | ✅ | Pedidos con prioridad y estados |
| 🌐 **Público** | ✅ | Stats, solicitudes con progreso (recibido/meta), viajes activos y rastreo de lotes |
| 📎 **Archivos** | ✅ | Upload multipart con metadatos + vista previa y descarga |
| ⚙️ **Configuración** | ✅ | Pares clave-valor |
| 📊 **Reportes** | ✅ | PDF (pdfkit) y Excel (exceljs): inventario, donaciones, viajes |
| 📋 **Auditoría** | ✅ | Auto-logging de acciones + consulta con filtros |

### Backend — Tests

```bash
# Unit tests con Jest
pnpm --filter @donaciones/backend test

# Coverage
pnpm --filter @donaciones/backend test:coverage
```

### Frontend — Admin panel (16 páginas, todos con form dialog) + Portal público

| Página | Descripción |
|:-------|:------------|
| 📊 **Dashboard** | Resumen con cards por entidad |
| 📢 **Campañas** | CRUD + form dialog con estados y Badge |
| 📍 **Ubicaciones** | CRUD + form dialog con tipo y campaña |
| 🏷️ **Categorías** | CRUD + form dialog |
| 📦 **Productos** | CRUD + form dialog con categoría y unidad |
| 🤝 **Donantes** | CRUD + form dialog con tipo enum |
| 🏷️ **Inventario** | CRUD + QR modal + form dialog con Combobox de producto + transferencia múltiple entre ubicaciones |
| 📊 **Movimientos** | Listado con saldos y tipo badge |
| 🚚 **Viajes** | CRUD + form con lotes consolidados por producto (FIFO), detalle con cards + cambio de estado inline, transiciones guiadas, botón Recibir + `RecibirDialog` con selector por lote (Completo/Parcial/No recibido), inputs de cantidad y foto, para ADMIN/COORD_LOG/RESP |
| 📋 **Recepciones** | CRUD + form con detalle anidado + subida de foto con preview + "Viajes en camino" con Receptionar |
| 📝 **Solicitudes** | CRUD + form dialog + versión simplificada para RECEPTOR |
| 👥 **Usuarios** | CRUD + form dialog con asignación de rol |
| 📎 **Imágenes** | Listado con upload dialog + FileUpload drag & drop + preview + descarga directa + campo "Referencia a entrega" para galería pública |
| 📊 **Reportes** | Página dedicada con 3 cards (Inventario, Donaciones, Viajes) + descarga PDF/Excel con loading state y toast |
| 📋 **Auditoría** | Registro de acciones con filtros |
| ⚙️ **Configuración** | Listado clave-valor |
| 🌐 **Portal público** | Página visual con stats, solicitudes con barras de progreso (GoFundMe-style), viajes activos, rastreo de lotes y timeline |

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
- [x] Formularios de creación para todos los módulos
- [x] "Viajes en camino" en Recepciones con botón Receptionar
- [x] Formulario de Solicitud simplificado para rol RECEPTOR
- [x] Portal público con stats y rastreo de lotes por código
- [x] CRUD de usuarios del sistema

### Fase 4 — Reportes & Auditoría 📊
- [x] Exportación PDF (inventario, donaciones, viajes)
- [x] Exportación Excel (inventario, donaciones, viajes)
- [x] Auditoría (auto-logging login/logout + consulta con filtros)
- [x] Tests unitarios (Jest + ts-jest, 8 tests)
- [ ] Pruebas E2E

### Fase 5 — Producción 🚀
- [ ] Despliegue (Docker Compose full)

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

## 📋 Changelog

### 2026-07-22

- **feat(backend+frontend):** Sistema multi-ciudad — filtrado de inventario, lotes, viajes y ubicaciones por ciudad
  - **Schema:** `Ubicacion.ciudad` y `Ubicacion.estado` cambiados de opcional a requerido (`String`), con índice compuesto `@@index([ciudad,estado])` y unique `@@unique([ciudad,estado,pais])`
  - **Auth:** JWT strategies y `AuthService` ahora incluyen `ciudad`, `estado`, `pais` en la respuesta de login/refresh (extraídos de la ubicación del usuario)
  - **CiudadFilterGuard:** guard reutilizable que para ADMIN/COORD retorna `null` (ve todo), para OPERADOR retorna `{ciudad,estado,pais}` del JWT. Aplicado a: inventario, lotes, viajes, movimientos-inventario, ubicaciones
  - **Services:** `listar()` en inventario, lotes, viajes, movimientos-inventario y ubicaciones ahora acepta `ciudadFilter` y filtra por `ubicacion.ciudad/estado/pais`
  - **Lotes:** `crear()` valida que ubicacionId pertenezca a la ciudad del operador; `transferir()` restringe a ADMIN/COORD (OPERADOR no puede transferir)
  - **Viajes:** `crear()` valida que origen pertenezca a la ciudad del usuario
  - **MovimientosInventario:** `crear()` valida ubicacion para operadores
  - **DTOs:** `CreateUbicacionDto` ahora requiere `ciudad` y `estado` (antes opcionales)
  - **Seed:** datos demo actualizados con `estado: 'Amazonas'` y `pais: 'Venezuela'`
  - **Frontend:** `UsuarioSesion` y `LoginResponse` incluyen `ciudad`, `estado`, `pais`; admin shell muestra ciudad actual en el header
  - **Progreso de solicitudes:** filtro de estados en `actualizarSolicitudConLote` ahora incluye `APROBADA` (fix: progreso no se actualizaba)
  - Lección: el guard se aplica a nivel de endpoint, no de controller — cada endpoint que necesita filtrado por ciudad debe tener `@UseGuards(CiudadFilterGuard)` y `@CiudadFilter()`

### 2026-07-09

- **fix(backend):** Conexión a MinIO S3 API — diagnosticados y resueltos 5 errores consecutivos
  - `ECONNREFUSED` → backend y MinIO en redes Docker distintas (solución: usar URL pública del S3 API)
  - `InvalidEndpointError` → el endpoint incluía `https://` (solución: solo hostname, el protocolo lo controla `useSSL`)
  - `SignatureDoesNotMatch` (primero) → faltaba `region` en el cliente minio.js (solución: agregar `region: 'us-east-1'`)
  - `AccessDenied` en `bucketExists` → el bucket ya existe creado manualmente y las credenciales no tienen `s3:HeadBucket` (solución: eliminar `ensureBucket()` de `upload()` y `getStream()`)
  - `SignatureDoesNotMatch` (persistente) → `MINIO_PORT` se leía como string desde env var, el cliente minio.js v8 espera número (solución: `Number()` explícito)
  - Agregada env `MINIO_REGION` (default `us-east-1`) para control desde Dokploy
  - Lección: `ConfigService.get<number>()` de NestJS no parsea — siempre usar `Number()` en envs numéricas

### 2026-07-07

- **feat(backend+frontend):** Implementado flujo completo de aprobación de solicitudes
  - Agregado estado `APROBADA` al `EstadoSolicitud` enum (entre ABIERTA y EN_PROCESO)
  - Migración PostgreSQL: `ALTER TYPE "EstadoSolicitud" ADD VALUE 'APROBADA'`
  - Endpoint `PATCH /solicitudes/:id/aprobar` para ADMINISTRADOR y COORDINADOR_LOGISTICO
  - Endpoint público `/publico/solicitudes` ahora filtra solo `APROBADA`, `EN_PROCESO` y `COMPLETADA` (oculta ABIERTA)
  - Interfaz de solicitudes: botón de confirmación con ícono CheckCircle2 para aprobar solicitudes ABIERTA
  - Toast de éxito: "Solicitud aprobada" al completar la acción
  - Hero estadística pública: "Unidades donadas" → "Solicitudes aprobadas" (cuenta solo donde estado = 'APROBADA')
  - Botón "Nuevo movimiento" oculto para rol OPERADOR_INVENTARIO (solo ADMIN y COORD_LOGISTICO pueden crear movimientos)
  - Login: tema visual amazonía (gradiente verde selva, glassmorphism, logo blanco con filtros)
  - Login: manejo de errores amigable (mensajes para redes caídas, 401, 500 en lugar de "Failed to fetch")
  - Login: spinner de carga al autenticar + ojo para mostrar/ocultar contraseña
  - Detalle de solicitud: ocultados inputs de actualización de progreso para OPERADOR_INVENTARIO y COORDINADOR_LOGISTICO (solo ADMIN puede editar cantidades recibidas)
  - Dashboard: KPI "Solicitudes urgentes" → "Solicitudes por aceptar" (cuenta de solicitudes en estado ABIERTA)
  - Todos los cambios probados y compilados exitosamente

### 2026-07-04

- **fix(backend):** RESPONSABLE_DESTINO puede crear productos desde el formulario de solicitud
  - Agregado `RESPONSABLE_DESTINO` al endpoint `POST /productos` (antes solo ADMIN/COORD_LOG)
  - Actualizada matriz de permisos: Productos → RESPONSABLE_DESTINO ahora puede listar + crear rápido desde solicitud

- **feat(frontend):** `RecibirDialog` con selector de estado por lote (Completo/Parcial/No recibido)
  - Cada lote tiene 3 botones de selección que auto-configuran las cantidades
  - Modo Parcial habilita inputs de cantidad en buen estado, dañado y faltante calculado
  - Resumen dinámico en header y footer indica si el viaje irá a COMPLETADO o RECEPCION_PARCIAL
  - Upload opcional de foto de recepción (FileUpload) que se envía como `fotoRecepcionUrl`
  - La mutación sube la foto primero (multipart a /archivos/upload), luego envía el POST a /viajes/:id/recibir

- **feat(backend+frontend):** RESPONSABLE_DESTINO ahora tiene ubicación asignable por Admin
  - `usuarios`: nuevo campo `ubicacionId` en CRUD; select de Ubicación solo visible para rol RESPONSABLE_DESTINO
  - `viajes`: filtrado automático por `destinoId` = `user.ubicacionId` para RESPONSABLE_DESTINO; validación en `recibir` para evitar que reciba viajes de otro destino
  - `solicitudes`: prioridad y campaña siempre obligatorias; ubicación auto-completa si tiene asignada
  - `productos`: modal "crear rápido" (+) desde el formulario de solicitud
  - `inventario`: se oculta "Resumen" para RESPONSABLE_DESTINO

- **fix(backend+frontend):** RESPONSABLE_DESTINO puede ver campañas, categorías y ubicaciones
  - `campanias`: rol `RESPONSABLE_DESTINO` en `listar` + filtro `?estado=ACTIVA` para formularios
  - `categorias`: rol `RESPONSABLE_DESTINO` en `listar` y `obtener`
  - `ubicaciones`: rol `RESPONSABLE_DESTINO` en `listar` y `obtener` (para auto-completar en solicitudes)
  - `solicitudes`: usa `/campanias?estado=ACTIVA` para mostrar solo campañas activas
  - `productos` (crear rápido): ahora carga categorías correctamente

- **fix(frontend):** Fechas de viaje se mostraban incorrectas por zona horaria
  - Portal público y detalle de viaje ahora usan `{ timeZone: 'UTC' }` al mostrar fechas

- **fix(backend+frontend):** Foto de recepción se guarda como imagen de viaje (no pública)
  - Upload con `entidadTipo: 'Viaje'` en lugar de `'Recepcion'`
  - Eliminado `fotoArchivoId` del DTO, controller y service
  - Admin/Coordinador puede re-subirla manualmente si quiere que sea pública

- **feat(publico):** Icono de categoría visible junto al nombre del producto en solicitudes
  - Backend incluye `categoria.icono` en la query de productos
  - Frontend renderiza el emoji al lado del nombre

- **fix(backend):** Viajes `RECEPCION_PARCIAL` ocultos del portal público
  - Filtro cambiado de `['PLANIFICADO', 'EN_TRANSITO', 'RECEPCION_PARCIAL']` a `['PLANIFICADO', 'EN_TRANSITO']`

- **feat(frontend):** Texto "+X más" en columna de lotes ahora es clickeable
  - Inventario: el texto expande la lista de lotes, igual que el chevrón

- **fix(backend):** Corregido bug de `loteId` en envío parcial de viaje
  - `DetalleViaje` ahora apunta al nuevo lote ENV (el que viaja), no al original
  - El lote original queda intacto con su cantidad reducida y `DISPONIBLE`

- **fix(backend):** Registro contable de faltantes en recepción parcial
  - Al crear lote FALTANTE se genera un movimiento `AJUSTE` que descuenta del inventario de origen
  - El faltante queda reflejado en el ledger, permitiendo cerrar el viaje a `COMPLETADO` limpiamente

- **fix(backend):** Movimiento AJUSTE ahora actualiza `lote.cantidad` realmente
  - Al crear un AJUSTE desde el formulario de movimientos, descuenta `lote.cantidad`
  - Si el lote llega a 0, se oculta automáticamente del inventario (sin borrarse)
  - Permite registrar pérdidas/daños con observación y que el stock se refleje correctamente

### 2026-07-03

- **fix(backend):** restore `return` in `ArchivosService.eliminar()` y `MovimientosInventarioService.eliminar()` — los métodos no devolvían el resultado, causando que el frontend reciba body vacío, el `onSuccess` de la mutación nunca se disparara y no se mostrara el toast ni se invalidara la query.
