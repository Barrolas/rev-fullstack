CREATE TABLE brigadas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    capacidad INTEGER NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE'
);

CREATE TABLE vehiculos (
    id BIGSERIAL PRIMARY KEY,
    patente VARCHAR(10) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE'
);

CREATE TABLE herramientas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cantidad_total INTEGER NOT NULL,
    cantidad_disponible INTEGER NOT NULL
);

CREATE TABLE asignaciones (
    id BIGSERIAL PRIMARY KEY,
    incidente_id UUID NOT NULL,
    brigada_id BIGINT NOT NULL REFERENCES brigadas(id),
    vehiculo_id BIGINT REFERENCES vehiculos(id),
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO brigadas (nombre, capacidad, estado) VALUES
    ('Brigada Alpha', 12, 'DISPONIBLE'),
    ('Brigada Beta', 8, 'DISPONIBLE');

INSERT INTO vehiculos (patente, tipo, estado) VALUES
    ('REV-1001', 'CAMIONETA', 'DISPONIBLE'),
    ('REV-2002', 'CISTERNA', 'DISPONIBLE');

INSERT INTO herramientas (nombre, cantidad_total, cantidad_disponible) VALUES
    ('Manguera forestal', 20, 20),
    ('Motosierra', 6, 6);
