-- Enums
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('ESTUDIANTE', 'DOCENTE', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_espacio AS ENUM ('SALA', 'LABORATORIO', 'AUDITORIO', 'SALA_ESTUDIO');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_reserva AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Tablas
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    username VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'ESTUDIANTE',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS edificios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    ubicacion VARCHAR(200),
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS espacios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo tipo_espacio NOT NULL,
    edificio_id INT NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
    capacidad INT NOT NULL CHECK (capacidad > 0),
    ubicacion VARCHAR(150),
    descripcion TEXT,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipamiento (
    id SERIAL PRIMARY KEY,
    espacio_id INT NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0)
);

CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    espacio_id INT NOT NULL REFERENCES espacios(id),
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    estado estado_reserva NOT NULL DEFAULT 'PENDIENTE',
    motivo TEXT,
    motivo_rechazo TEXT,
    aprobada_por INT REFERENCES usuarios(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_fechas_validas CHECK (fecha_fin > fecha_inicio)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_reservas_conflicto 
  ON reservas (espacio_id, fecha_inicio, fecha_fin) 
  WHERE estado IN ('PENDIENTE', 'APROBADA');

CREATE INDEX IF NOT EXISTS idx_espacios_edificio ON espacios (edificio_id);