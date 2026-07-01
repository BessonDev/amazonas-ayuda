# Especificación Funcional y Técnica

# Plataforma de Gestión Logística para Donaciones Humanitarias

## 1. Objetivo General

Desarrollar una plataforma web moderna para administrar campañas humanitarias, controlar inventarios distribuidos, organizar envíos y verificar la entrega de donaciones, manteniendo trazabilidad completa de cada movimiento y ofreciendo un portal público con estadísticas transparentes.

El sistema estará dirigido a organizaciones, iglesias, fundaciones y grupos de voluntarios que coordinan ayuda humanitaria.

El diseño debe priorizar la facilidad de uso para personas con poca experiencia tecnológica, permitiendo que cualquier voluntario pueda aprender a utilizar la plataforma en pocos minutos.

---

# 2. Objetivos del Sistema

La plataforma deberá permitir:

* Administrar múltiples campañas humanitarias.
* Registrar donaciones desde diferentes centros de acopio.
* Gestionar inventario unificado mediante movimientos de inventario.
* Organizar viajes y envíos.
* Confirmar la recepción de los productos en destino.
* Mantener trazabilidad completa desde el ingreso hasta la entrega final.
* Gestionar solicitudes de insumos desde los destinos.
* Mostrar estadísticas públicas en tiempo real.
* Generar reportes administrativos.
* Mantener auditoría completa de todas las operaciones.

---

# 3. Tecnologías Recomendadas

## Frontend

* Next.js
* React
* TypeScript
* TailwindCSS
* shadcn/ui
* React Hook Form
* TanStack Query
* Recharts

Debe funcionar como Progressive Web App (PWA) y ser completamente responsive.

---

## Backend

* NestJS
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT Authentication
* Swagger/OpenAPI

---

## Infraestructura

La infraestructura existente será utilizada.

* VPS
* PostgreSQL
* MinIO S3 para almacenamiento de fotografías y documentos

Se recomienda desplegar todos los servicios mediante Docker Compose.

---

# 4. Arquitectura General

El sistema estará dividido en dos grandes componentes.

## Portal Administrativo

Acceso mediante autenticación.

Contendrá todos los módulos operativos.

---

## Portal Público

No requiere autenticación.

Mostrará:

* estadísticas
* campañas
* necesidades
* progreso de donaciones
* viajes realizados
* transparencia de la ayuda

Nunca mostrará información sensible.

---

# 5. Gestión de Campañas

Todo el sistema deberá funcionar por campañas.

Ejemplos:

* Terremoto Venezuela 2026
* Inundaciones
* Ayuda médica
* Campaña navideña

Cada campaña tendrá:

* nombre
* descripción
* fecha de inicio
* fecha de finalización (opcional)
* estado
* imagen principal
* objetivo
* estadísticas independientes

Todas las operaciones estarán asociadas a una campaña.

---

# 6. Gestión de Ubicaciones

No se utilizará únicamente el concepto de "Centro de Acopio".

Se implementará una entidad genérica llamada "Ubicación".

Tipos de ubicación:

* Centro de acopio
* Bodega
* Iglesia
* Hospital
* Refugio
* Vehículo (almacén temporal)
* Punto de entrega
* Otro

Toda transferencia de productos será entre ubicaciones.

---

# 7. Gestión de Usuarios

Roles sugeridos:

## Administrador

Acceso completo.

---

## Coordinador Logístico

Gestiona campañas, viajes y distribución.

---

## Operador de Inventario

Registra donaciones y movimientos.

---

## Responsable de Destino

Confirma recepciones y crea solicitudes.

---

## Usuario Público

Solo consulta información pública.

---

# 8. Modelo de Inventario

El sistema NO deberá manejar únicamente cantidades de productos.

Debe implementar un inventario basado en movimientos.

Cada ingreso genera un lote independiente.

Ejemplo:

Lote A001

Producto:

Agua

Cantidad:

300

Ubicación:

Centro Caracas

Fecha:

15/07/2026

Estado:

Disponible

Otro ingreso generará otro lote distinto.

Nunca se mezclarán los lotes.

---

# 9. Movimientos de Inventario

Todo cambio deberá registrarse como un movimiento.

Tipos de movimiento:

* Entrada
* Reserva
* Transferencia
* Envío
* Recepción
* Ajuste
* Distribución
* Consumo

El inventario disponible siempre será calculado a partir de estos movimientos.

Nunca deberá editarse manualmente.

---

# 10. Estados del Inventario

Cada lote seguirá este flujo:

Registrado

↓

Disponible

↓

Reservado

↓

En tránsito

↓

Entregado

↓

Verificado

↓

Distribuido (opcional)

Nunca se eliminarán registros históricos.

---

# 11. Registro de Donaciones

Cada ingreso deberá permitir registrar:

* campaña
* ubicación
* categoría
* producto
* lote
* cantidad
* unidad
* donante (opcional)
* responsable
* fecha
* observaciones
* fotografías

Cada registro generará automáticamente un movimiento de entrada.

---

# 12. Donantes

Registrar información opcional:

* Persona
* Empresa
* Iglesia
* Fundación
* Anónimo

Esto permitirá generar reportes posteriores.

---

# 13. Viajes

El Coordinador Logístico podrá crear viajes.

Datos:

* código automático
* campaña
* origen
* destino
* responsable
* vehículo
* conductor
* fecha de salida
* fecha estimada
* observaciones

Posteriormente seleccionará los lotes que viajarán.

No se seleccionarán solamente cantidades.

Cada lote quedará asociado al viaje.

---

# 14. Estados del Viaje

Planificado

↓

Preparando carga

↓

En tránsito

↓

Llegó

↓

Recepción parcial

↓

Completado

↓

Cancelado

---

# 15. Recepción

El responsable del destino visualizará los lotes enviados.

Para cada lote registrará:

* cantidad recibida
* cantidad faltante
* cantidad dañada
* fotografías
* observaciones

Al confirmar:

* se registrará un movimiento de recepción
* el estado cambiará automáticamente
* se actualizarán estadísticas
* se registrará auditoría

---

# 16. Solicitudes de Insumos

Los destinos podrán crear necesidades.

Ejemplo:

Agua

Meta:

1000 botellas

Prioridad:

Alta

Descripción:

Agua potable para refugios.

Estado:

Abierta

Las necesidades aparecerán automáticamente en el portal público.

Cuando lleguen productos, la meta deberá actualizarse automáticamente.

---

# 17. Dashboard Administrativo

Indicadores principales:

* campañas activas
* donaciones registradas
* inventario disponible
* productos enviados
* productos entregados
* viajes activos
* viajes completados
* solicitudes abiertas
* productos más solicitados
* productos más donados

Gráficos por:

* fecha
* campaña
* ubicación
* categoría
* destino

---

# 18. Portal Público

Debe mostrar:

## Inicio

Información de la campaña.

Objetivo.

Estado de la emergencia.

---

## Estadísticas

* Total de donaciones
* Productos entregados
* Viajes realizados
* Centros activos
* Personas beneficiadas (opcional)

---

## Necesidades

Cada necesidad mostrará una barra de progreso.

Ejemplo:

Medicinas

320 / 1000

32 %

Agua

850 / 1000

85 %

Cobijas

120 / 500

24 %

---

## Viajes

Mostrar únicamente:

* origen
* destino
* fecha
* estado
* cantidad enviada

Sin mostrar información privada.

---

# 19. Fotografías

Permitir fotografías en:

* registro de donaciones
* preparación del envío
* carga del vehículo
* recepción
* evidencias finales

Las imágenes serán almacenadas en MinIO.

---

# 20. Códigos QR

Cada lote deberá generar automáticamente un código QR.

El QR permitirá:

* identificar el lote
* consultar historial
* registrar salida
* registrar recepción

---

# 21. Auditoría

Toda acción deberá registrar:

* usuario
* acción
* fecha
* hora
* IP
* dispositivo (si es posible)
* registro afectado
* valor anterior
* valor nuevo

No deberá existir eliminación física de registros.

---

# 22. Reportes

Exportación en:

* Excel
* PDF

Reportes sugeridos:

* Inventario
* Donaciones
* Viajes
* Recepciones
* Solicitudes
* Auditoría
* Estadísticas

---

# 23. Seguridad

Implementar:

* JWT
* Refresh Tokens
* Roles
* Permisos
* bcrypt
* Validaciones de servidor
* Rate Limiting
* Logs
* HTTPS
* Protección contra ataques comunes

---

# 24. Base de Datos (Modelo Inicial)

Tablas sugeridas:

* campañas
* usuarios
* roles
* permisos
* ubicaciones
* tipos_ubicacion
* categorias
* productos
* lotes
* movimientos_inventario
* donantes
* viajes
* detalle_viajes
* recepciones
* detalle_recepciones
* solicitudes
* detalle_solicitudes
* archivos
* auditoria
* configuracion

El inventario deberá calcularse mediante los movimientos y no almacenarse como cantidades editables.

---

# 25. Escalabilidad

La arquitectura deberá permitir:

* múltiples campañas simultáneas
* múltiples organizaciones
* múltiples centros de acopio
* múltiples países
* múltiples destinos
* integración mediante API REST documentada

---

# 26. Experiencia de Usuario (UX)

El diseño debe priorizar:

* simplicidad
* rapidez
* pocos clics
* botones grandes
* formularios cortos
* iconografía clara
* excelente rendimiento
* accesibilidad
* funcionamiento óptimo en dispositivos móviles

---

# 27. Objetivo Final

El sistema debe convertirse en una plataforma profesional de logística humanitaria que permita registrar, controlar, transportar y verificar cada donación desde su ingreso hasta su distribución final, ofreciendo transparencia, trazabilidad y estadísticas en tiempo real para administradores, voluntarios, donantes y beneficiarios.

Toda la información deberá poder auditarse, consultarse y mantenerse históricamente sin pérdida de datos, garantizando la integridad del proceso logístico y facilitando la toma de decisiones durante cualquier operación humanitaria.
