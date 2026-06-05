-- Organización despacho, territorial Cordillera (CASEN 2024), brigada-vehículos N:M

CREATE TABLE provincias (
    codigo_casen INT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    f_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    f_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE comunas (
    codigo_casen INT PRIMARY KEY,
    codigo_provincia_casen INT NOT NULL REFERENCES provincias(codigo_casen),
    nombre VARCHAR(120) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    f_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    f_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO provincias (codigo_casen, nombre, estado) VALUES (132, 'Cordillera', 'ACTIVA');
INSERT INTO comunas (codigo_casen, codigo_provincia_casen, nombre, estado) VALUES
    (13201, 132, 'Puente Alto', 'ACTIVA'),
    (13202, 132, 'Pirque', 'ACTIVA'),
    (13203, 132, 'San José de Maipo', 'ACTIVA');

CREATE TABLE instituciones (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(120) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    f_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    f_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE companias (
    id BIGSERIAL PRIMARY KEY,
    id_institucion BIGINT NOT NULL REFERENCES instituciones(id),
    id_comuna INT NOT NULL REFERENCES comunas(codigo_casen),
    codigo VARCHAR(30) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    f_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    f_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_institucion, codigo)
);

CREATE TABLE brigadista_roles (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(80) NOT NULL,
    jerarquia INT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    f_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    f_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO brigadista_roles (codigo, nombre, jerarquia, estado) VALUES
    ('JEFE', 'Jefe de brigada', 1, 'ACTIVA'),
    ('CONDUCTOR', 'Conductor', 2, 'ACTIVA'),
    ('COMBATIENTE', 'Combatiente', 3, 'ACTIVA'),
    ('APOYO', 'Apoyo', 4, 'ACTIVA');

ALTER TABLE vehiculos
    ADD COLUMN marca VARCHAR(80),
    ADD COLUMN modelo VARCHAR(80),
    ADD COLUMN anio SMALLINT,
    ADD COLUMN capacidad_pasajeros INT NOT NULL DEFAULT 0,
    ADD COLUMN capacidad_carga INT NOT NULL DEFAULT 0,
    ADD COLUMN f_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    ADD COLUMN f_actualizacion TIMESTAMP NOT NULL DEFAULT NOW();

UPDATE vehiculos SET capacidad_pasajeros = 5, capacidad_carga = 800 WHERE tipo = 'CAMIONETA';
UPDATE vehiculos SET capacidad_pasajeros = 2, capacidad_carga = 12000 WHERE tipo = 'CISTERNA';

ALTER TABLE herramientas
    ADD COLUMN marca VARCHAR(80),
    ADD COLUMN modelo VARCHAR(80),
    ADD COLUMN sku VARCHAR(40),
    ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    ADD COLUMN f_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    ADD COLUMN f_actualizacion TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE brigadas
    ADD COLUMN codigo VARCHAR(30),
    ADD COLUMN id_compania BIGINT REFERENCES companias(id),
    ADD COLUMN id_jefe_brigadista BIGINT,
    ADD COLUMN f_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    ADD COLUMN f_actualizacion TIMESTAMP NOT NULL DEFAULT NOW();

CREATE TABLE brigada_vehiculos (
    id BIGSERIAL PRIMARY KEY,
    id_brigada BIGINT NOT NULL REFERENCES brigadas(id) ON DELETE CASCADE,
    id_vehiculo BIGINT NOT NULL REFERENCES vehiculos(id),
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    f_desde TIMESTAMP NOT NULL DEFAULT NOW(),
    f_hasta TIMESTAMP,
    f_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    f_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_brigada, id_vehiculo)
);

CREATE UNIQUE INDEX uq_brigada_vehiculo_activo ON brigada_vehiculos (id_vehiculo) WHERE activa = TRUE;
CREATE UNIQUE INDEX uq_brigada_vehiculo_principal ON brigada_vehiculos (id_brigada) WHERE activa = TRUE AND principal = TRUE;

INSERT INTO brigada_vehiculos (id_brigada, id_vehiculo, principal, activa)
SELECT id, vehiculo_id, TRUE, TRUE FROM brigadas WHERE vehiculo_id IS NOT NULL;

ALTER TABLE brigadas DROP COLUMN IF EXISTS vehiculo_id;

ALTER TABLE brigadistas
    ADD COLUMN id_brigada BIGINT REFERENCES brigadas(id),
    ADD COLUMN id_rol_brigadista BIGINT REFERENCES brigadista_roles(id),
    ADD COLUMN f_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    ADD COLUMN f_actualizacion TIMESTAMP NOT NULL DEFAULT NOW();

UPDATE brigadistas b SET id_brigada = bb.brigada_id
FROM brigada_brigadistas bb WHERE bb.brigadista_id = b.id;

UPDATE brigadistas b SET id_rol_brigadista = (SELECT id FROM brigadista_roles WHERE codigo = 'COMBATIENTE')
WHERE b.id_rol_brigadista IS NULL AND b.id_brigada IS NOT NULL;

DROP TABLE brigada_brigadistas;

ALTER TABLE asignaciones
    ADD COLUMN despachado_por VARCHAR(100),
    ADD COLUMN estado_despacho VARCHAR(30) NOT NULL DEFAULT 'ASIGNADA',
    ADD COLUMN f_actualizacion TIMESTAMP NOT NULL DEFAULT NOW();

UPDATE asignaciones SET f_actualizacion = created_at WHERE f_actualizacion IS NULL;

INSERT INTO instituciones (codigo, nombre, estado) VALUES ('MUNICIPAL', 'Municipalidad Valle del Sol', 'ACTIVA');

INSERT INTO companias (id_institucion, id_comuna, codigo, nombre, estado)
SELECT i.id, 13201, 'GUARDIA-PA', 'Guardia Municipal Puente Alto', 'ACTIVA'
FROM instituciones i WHERE i.codigo = 'MUNICIPAL';

UPDATE brigadas SET codigo = 'ALPHA', id_compania = (SELECT id FROM companias WHERE codigo = 'GUARDIA-PA' LIMIT 1) WHERE nombre = 'Brigada Alpha';
UPDATE brigadas SET codigo = 'BETA', id_compania = (SELECT id FROM companias WHERE codigo = 'GUARDIA-PA' LIMIT 1) WHERE nombre = 'Brigada Beta';

UPDATE brigadistas SET id_rol_brigadista = (SELECT id FROM brigadista_roles WHERE codigo = 'JEFE')
WHERE id IN (SELECT id FROM brigadistas WHERE id_brigada = 1 ORDER BY id LIMIT 1);

UPDATE brigadas SET id_jefe_brigadista = (SELECT id FROM brigadistas WHERE id_brigada = brigadas.id AND id_rol_brigadista = (SELECT id FROM brigadista_roles WHERE codigo = 'JEFE') LIMIT 1)
WHERE id IN (SELECT id FROM brigadas);
