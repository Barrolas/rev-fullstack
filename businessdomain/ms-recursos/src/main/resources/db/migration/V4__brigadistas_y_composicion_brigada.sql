-- Brigadistas y composición de brigada (vehículo, personal, herramientas)

CREATE TABLE brigadistas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rut VARCHAR(12),
    especialidad VARCHAR(80),
    estado VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE'
);

ALTER TABLE brigadas
    ADD COLUMN IF NOT EXISTS vehiculo_id BIGINT REFERENCES vehiculos(id);

CREATE TABLE brigada_brigadistas (
    brigada_id BIGINT NOT NULL REFERENCES brigadas(id) ON DELETE CASCADE,
    brigadista_id BIGINT NOT NULL REFERENCES brigadistas(id) ON DELETE CASCADE,
    PRIMARY KEY (brigada_id, brigadista_id)
);

CREATE TABLE brigada_herramientas (
    brigada_id BIGINT NOT NULL REFERENCES brigadas(id) ON DELETE CASCADE,
    herramienta_id BIGINT NOT NULL REFERENCES herramientas(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    PRIMARY KEY (brigada_id, herramienta_id)
);

CREATE TABLE asignacion_brigadistas (
    asignacion_id BIGINT NOT NULL REFERENCES asignaciones(id) ON DELETE CASCADE,
    brigadista_id BIGINT NOT NULL REFERENCES brigadistas(id),
    PRIMARY KEY (asignacion_id, brigadista_id)
);

CREATE TABLE asignacion_herramientas (
    asignacion_id BIGINT NOT NULL REFERENCES asignaciones(id) ON DELETE CASCADE,
    herramienta_id BIGINT NOT NULL REFERENCES herramientas(id),
    cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    PRIMARY KEY (asignacion_id, herramienta_id)
);

INSERT INTO brigadistas (nombre, apellido, rut, especialidad, estado) VALUES
    ('María', 'González', '11.111.111-1', 'Combate forestal', 'DISPONIBLE'),
    ('Pedro', 'Soto', '22.222.222-2', 'Conductor cisterna', 'DISPONIBLE'),
    ('Ana', 'Muñoz', '33.333.333-3', 'Rescate', 'DISPONIBLE'),
    ('Luis', 'Rojas', '44.444.444-4', 'Combate forestal', 'DISPONIBLE');

UPDATE brigadas SET vehiculo_id = 1 WHERE id = 1;
UPDATE brigadas SET vehiculo_id = 2 WHERE id = 2;

INSERT INTO brigada_brigadistas (brigada_id, brigadista_id) VALUES
    (1, 1), (1, 2),
    (2, 3), (2, 4);

INSERT INTO brigada_herramientas (brigada_id, herramienta_id, cantidad) VALUES
    (1, 1, 4), (1, 2, 1),
    (2, 1, 2), (2, 2, 1);
