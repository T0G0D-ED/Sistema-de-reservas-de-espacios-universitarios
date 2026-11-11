# Contexto Técnico — Hito 3: Sistema de Reserva de Espacios Universitarios UNAB

## 🎯 Objetivo
Evolucionar un prototipo React (Taller 2) a una plataforma Full Stack con backend propio, API REST, PostgreSQL, MongoDB, Swagger y Docker.

## 🛠️ Stack Tecnológico
- **Frontend:** React + Vite + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **ORM SQL:** Prisma → PostgreSQL
- **ORM NoSQL:** Mongoose → MongoDB
- **Validación:** Zod
- **Auth:** JWT (jsonwebtoken + bcrypt)
- **Docs API:** swagger-ui-express + swagger-jsdoc
- **Correos:** Resend (ya integrado)
- **API pública:** Feriados Chile (ya integrado)
- **Contenedores:** Docker + Docker Compose

## 📁 Estructura del Backend (monorepo)


backend/
├── src/
│ ├── config/ # db.ts, env.ts, swagger.ts
│ ├── controllers/ # auth, edificios, espacios, reservas, dashboard
│ ├── services/ # lógica de negocio (una por recurso)
│ ├── routes/ # express.Router por recurso
│ ├── middlewares/ # auth, errorHandler, validator
│ ├── models/ # schemas Mongoose (solo para MongoDB)
│ ├── dtos/ # esquemas Zod de validación
│ ├── utils/ # feriados, resend, jwt helpers
│ ├── types/ # tipos TS compartidos
│ └── app.ts # entry point Express
├── prisma/
│ ├── schema.prisma
│ ├── migrations/
│ └── seed.ts
├── Dockerfile
└── package.json



## 🗄️ Modelo SQL (PostgreSQL vía Prisma)

### Entidades
1. **Usuario** (id, nombre, email UQ, passwordHash, rol[ESTUDIANTE|DOCENTE|ADMIN], activo, timestamps)
2. **Edificio** (id, nombre, codigo UQ, ubicacion, descripcion, activo)
3. **Espacio** (id, nombre, tipo[SALA|LABORATORIO|AUDITORIO|SALA_ESTUDIO], capacidad, ubicacion, descripcion, disponible, edificioId→Edificio)
4. **Equipamiento** (id, espacioId→Espacio, nombre, tipo, cantidad)
5. **Reserva** (id, usuarioId→Usuario, espacioId→Espacio, fechaInicio, fechaFin, estado[PENDIENTE|APROBADA|RECHAZADA|CANCELADA], motivo, motivoRechazo, aprobadaPor→Usuario nullable, timestamps)

### Relaciones clave
- Edificio 1──N Espacio
- Espacio 1──N Equipamiento
- Espacio 1──N Reserva
- Usuario 1──N Reserva (como solicitante)
- Usuario 1──N Reserva (como aprobador, nullable)

### Índices críticos
- `reservas(espacioId, fechaInicio, fechaFin)` → validar conflictos
- `reservas(usuarioId)`, `reservas(estado)`
- `espacios(edificioId)`, `espacios(tipo)`, `espacios(disponible)`

### Constraints CHECK (agregar en migration SQL manual)
- `fecha_fin > fecha_inicio`
- `capacidad > 0`
- `cantidad > 0`

## 📄 Modelo NoSQL (MongoDB vía Mongoose)

### Colección: `eventos_reserva` (auditoría)
```json
{
  "reservaId": Number,        // FK lógica a SQL
  "tipo": "CREADA|APROBADA|RECHAZADA|CANCELADA|MODIFICADA",
  "usuarioId": Number,
  "actorNombre": String,
  "timestamp": Date,
  "metadata": {
    "userAgent": String,
    "ip": String,
    "espacioId": Number,
    "espacioNombre": String
  },
  "cambios": {
    "antes": { "estado": String },
    "despues": { "estado": String }
  },
  "comentario": String
}



Colección: actividad_usuario (dashboard)
{
  "usuarioId": Number,
  "fecha": Date,
  "acciones": [{ "tipo": String, "espacioId": Number, "timestamp": Date }]
}

Justificación NoSQL: SQL guarda el estado actual de la reserva; MongoDB guarda el historial inmutable de eventos (trazabilidad). No duplicar datos.


🔌 Endpoints REST
Auth
POST /api/auth/register → registrar
POST /api/auth/login → login (retorna JWT)
Edificios
GET /api/edificios → listar
POST /api/edificios → crear (admin)
Espacios
GET /api/espacios → listar con filtros (edificio, tipo, capacidad, fecha)
GET /api/espacios/:id → detalle + equipamiento
POST /api/espacios → crear (admin)
PUT /api/espacios/:id → editar (admin)
DELETE /api/espacios/:id → eliminar (admin)
Reservas
GET /api/reservas → mis reservas (estudiante) o todas (admin)
GET /api/reservas/:id → detalle
POST /api/reservas → crear (valida conflicto)
PATCH /api/reservas/:id/aprobar → aprobar (admin)
PATCH /api/reservas/:id/rechazar → rechazar (admin)
PATCH /api/reservas/:id/cancelar → cancelar (propietario/admin)
Dashboard
GET /api/dashboard/utilizacion → uso por espacio/edificio
GET /api/dashboard/actividad → historial desde MongoDB
⚙️ Reglas de Negocio Críticas
1. Crear reserva (POST /api/reservas)
Validar que el espacio exista y disponible = true
Validar que fechaFin > fechaInicio
Validar día hábil (API feriados Chile)
Validar conflicto de horario: no debe existir otra reserva con estado IN (PENDIENTE, APROBADA) que se solape en el rango [fechaInicio, fechaFin] para el mismo espacioId
Persistir en PostgreSQL
Registrar evento en MongoDB (tipo: CREADA)
Enviar correo de confirmación (Resend)
Retornar 201
2. Máquina de estados de Reserva
PENDIENTE → APROBADA (solo ADMIN)
PENDIENTE → RECHAZADA (solo ADMIN, requiere motivoRechazo)
PENDIENTE → CANCELADA (propietario o ADMIN)
APROBADA → CANCELADA (propietario o ADMIN)
RECHAZADA y CANCELADA son estados terminales
3. Cada cambio de estado genera evento en MongoDB
🎨 Estados obligatorios en React (frontend)
Todo consumo de API debe manejar:
loading → spinner/skeleton
error → banner con mensaje
empty → mensaje "sin resultados"
success → datos + toasts de confirmación
🐳 Docker Compose
Servicios: postgres (5432), mongo (27017), backend (3000), frontend (5173/80)
Variables en .env (nunca commitear), entregar .env.example.
📘 Swagger
Disponible en http://localhost:3000/api-docs. Cada endpoint debe tener JSDoc @openapi con summary, tags, requestBody, responses.
🚫 Errores a evitar
NO guardar mismos datos en SQL y MongoDB sin justificación
NO dejar espacios.json como fuente principal
NO exponer .env con secretos reales
NO ignorar estados de carga/error en React
NO mantener Swagger desactualizado