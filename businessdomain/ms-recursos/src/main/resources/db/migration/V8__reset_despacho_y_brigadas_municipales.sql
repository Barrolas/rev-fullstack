-- Libera despachos, vacía incidentes en MS-INCIDENTES (V8) y deja 2 brigadas municipales listas.

DELETE FROM asignacion_brigadistas;
DELETE FROM asignacion_herramientas;
DELETE FROM asignaciones;

UPDATE herramientas SET cantidad_disponible = cantidad_total WHERE estado = 'ACTIVA';

INSERT INTO vehiculos (patente, tipo, marca, modelo, anio, capacidad_pasajeros, capacidad_carga, estado)
SELECT 'REV-3003', 'CAMIONETA', 'Toyota', 'Hilux', 2022, 5, 800, 'DISPONIBLE'
WHERE NOT EXISTS (SELECT 1 FROM vehiculos WHERE patente = 'REV-3003');

INSERT INTO vehiculos (patente, tipo, marca, modelo, anio, capacidad_pasajeros, capacidad_carga, estado)
SELECT 'REV-3004', 'CAMIONETA', 'Ford', 'Ranger', 2021, 5, 900, 'DISPONIBLE'
WHERE NOT EXISTS (SELECT 1 FROM vehiculos WHERE patente = 'REV-3004');

INSERT INTO vehiculos (patente, tipo, marca, modelo, anio, capacidad_pasajeros, capacidad_carga, estado)
SELECT 'REV-3005', 'CISTERNA', 'Mercedes', 'Atego', 2020, 3, 12000, 'DISPONIBLE'
WHERE NOT EXISTS (SELECT 1 FROM vehiculos WHERE patente = 'REV-3005');

INSERT INTO herramientas (nombre, marca, cantidad_total, cantidad_disponible, estado)
SELECT 'Equipo de extinción portátil', 'REV', 30, 30, 'ACTIVA'
WHERE NOT EXISTS (SELECT 1 FROM herramientas WHERE nombre = 'Equipo de extinción portátil');

INSERT INTO herramientas (nombre, marca, cantidad_total, cantidad_disponible, estado)
SELECT 'Radio VHF', 'Motorola', 20, 20, 'ACTIVA'
WHERE NOT EXISTS (SELECT 1 FROM herramientas WHERE nombre = 'Radio VHF');

INSERT INTO herramientas (nombre, marca, cantidad_total, cantidad_disponible, estado)
SELECT 'Kit primeros auxilios', 'REV', 25, 25, 'ACTIVA'
WHERE NOT EXISTS (SELECT 1 FROM herramientas WHERE nombre = 'Kit primeros auxilios');

INSERT INTO brigadistas (nombre, apellido, rut, especialidad, estado)
SELECT v.nombre, v.apellido, v.rut, v.especialidad, 'DISPONIBLE'
FROM (VALUES
    ('Carlos', 'Méndez', '55.555.555-5', 'Jefe de brigada'),
    ('Valentina', 'Torres', '66.666.666-6', 'Combate forestal'),
    ('Diego', 'Fuentes', '77.777.777-7', 'Conductor'),
    ('Camila', 'Vega', '88.888.888-8', 'Rescate'),
    ('Jorge', 'Silva', '99.999.999-9', 'Combate forestal'),
    ('Paula', 'Ramírez', '10.101.010-1', 'Apoyo logístico'),
    ('Andrés', 'Castro', '20.202.020-2', 'Conductor'),
    ('Francisca', 'Lagos', '30.303.030-3', 'Combate forestal'),
    ('Miguel', 'Paredes', '40.404.040-4', 'Rescate'),
    ('Sofía', 'Herrera', '50.505.050-5', 'Combate forestal'),
    ('Tomás', 'Navarro', '60.606.060-6', 'Conductor'),
    ('Isabel', 'Campos', '70.707.070-7', 'Apoyo')
) AS v(nombre, apellido, rut, especialidad)
WHERE NOT EXISTS (SELECT 1 FROM brigadistas b WHERE b.rut = v.rut);

UPDATE vehiculos SET estado = 'DISPONIBLE', capacidad_pasajeros = 5, capacidad_carga = 800, marca = 'Nissan', modelo = 'Navara'
WHERE patente = 'REV-1001';
UPDATE vehiculos SET estado = 'DISPONIBLE', capacidad_pasajeros = 2, capacidad_carga = 12000, marca = 'Iveco', modelo = 'Eurocargo'
WHERE patente = 'REV-2002';
UPDATE vehiculos SET estado = 'DISPONIBLE'
WHERE patente IN ('REV-3003', 'REV-3004', 'REV-3005');

UPDATE brigadas SET
    nombre = 'Brigada Municipal Rápida',
    codigo = 'MUN-RAPIDA',
    capacidad = 4,
    estado = 'DISPONIBLE',
    id_compania = (SELECT id FROM companias WHERE codigo = 'GUARDIA-PA' LIMIT 1),
    id_jefe_brigadista = NULL
WHERE id = 1;

UPDATE brigadas SET
    nombre = 'Brigada Municipal Refuerzo',
    codigo = 'MUN-REFUERZO',
    capacidad = 12,
    estado = 'DISPONIBLE',
    id_compania = (SELECT id FROM companias WHERE codigo = 'GUARDIA-PA' LIMIT 1),
    id_jefe_brigadista = NULL
WHERE id = 2;

UPDATE brigadistas SET id_brigada = NULL, id_rol_brigadista = NULL, estado = 'DISPONIBLE';
DELETE FROM brigada_vehiculos WHERE id_brigada IN (1, 2);
DELETE FROM brigada_herramientas WHERE brigada_id IN (1, 2);

-- === Brigada Municipal Rápida ===
UPDATE brigadistas b SET id_brigada = 1, id_rol_brigadista = r.id
FROM brigadista_roles r
WHERE r.codigo = 'JEFE' AND b.id = 1;

UPDATE brigadistas b SET id_brigada = 1, id_rol_brigadista = r.id
FROM brigadista_roles r
WHERE r.codigo = 'CONDUCTOR' AND b.id = 2;

UPDATE brigadistas b SET id_brigada = 1, id_rol_brigadista = r.id
FROM brigadista_roles r
WHERE r.codigo = 'COMBATIENTE' AND b.id IN (3, 4);

UPDATE brigadas SET id_jefe_brigadista = 1 WHERE id = 1;

INSERT INTO brigada_vehiculos (id_brigada, id_vehiculo, principal, activa, f_desde)
SELECT 1, id, TRUE, TRUE, NOW() FROM vehiculos WHERE patente = 'REV-1001';

INSERT INTO brigada_herramientas (brigada_id, herramienta_id, cantidad) VALUES
    (1, 1, 2),
    (1, 2, 1),
    (1, (SELECT id FROM herramientas WHERE nombre = 'Equipo de extinción portátil' LIMIT 1), 2),
    (1, (SELECT id FROM herramientas WHERE nombre = 'Kit primeros auxilios' LIMIT 1), 1);

-- === Brigada Municipal Refuerzo ===
UPDATE brigadistas b SET id_brigada = 2, id_rol_brigadista = r.id
FROM brigadista_roles r
WHERE r.codigo = 'JEFE' AND b.rut = '55.555.555-5';

UPDATE brigadistas b SET id_brigada = 2, id_rol_brigadista = r.id
FROM brigadista_roles r
WHERE r.codigo = 'CONDUCTOR' AND b.rut IN ('66.666.666-6', '77.777.777-7', '60.606.060-6');

UPDATE brigadistas b SET id_brigada = 2, id_rol_brigadista = r.id
FROM brigadista_roles r
WHERE r.codigo = 'COMBATIENTE'
  AND b.rut IN ('88.888.888-8', '99.999.999-9', '10.101.010-1', '20.202.020-2',
                '30.303.030-3', '40.404.040-4', '50.505.050-5', '70.707.070-7');

UPDATE brigadas SET id_jefe_brigadista = (SELECT id FROM brigadistas WHERE rut = '55.555.555-5' LIMIT 1)
WHERE id = 2;

INSERT INTO brigada_vehiculos (id_brigada, id_vehiculo, principal, activa, f_desde)
SELECT 2, id, TRUE, TRUE, NOW() FROM vehiculos WHERE patente = 'REV-2002';

INSERT INTO brigada_vehiculos (id_brigada, id_vehiculo, principal, activa, f_desde)
SELECT 2, id, FALSE, TRUE, NOW() FROM vehiculos WHERE patente = 'REV-3003';

INSERT INTO brigada_vehiculos (id_brigada, id_vehiculo, principal, activa, f_desde)
SELECT 2, id, FALSE, TRUE, NOW() FROM vehiculos WHERE patente = 'REV-3005';

INSERT INTO brigada_herramientas (brigada_id, herramienta_id, cantidad) VALUES
    (2, 1, 6),
    (2, 2, 2),
    (2, (SELECT id FROM herramientas WHERE nombre = 'Equipo de extinción portátil' LIMIT 1), 4),
    (2, (SELECT id FROM herramientas WHERE nombre = 'Radio VHF' LIMIT 1), 3),
    (2, (SELECT id FROM herramientas WHERE nombre = 'Kit primeros auxilios' LIMIT 1), 2);
