-- Brigadas municipales listas para despacho: Rápida (4 integrantes, 1 vehículo) y Refuerzo (12 integrantes, 3 vehículos)



INSERT INTO vehiculos (patente, tipo, marca, modelo, anio, capacidad_pasajeros, capacidad_carga, estado)

SELECT 'REV-3003', 'CAMIONETA', 'Toyota', 'Hilux', 2022, 5, 800, 'DISPONIBLE'

WHERE NOT EXISTS (SELECT 1 FROM vehiculos WHERE patente = 'REV-3003');



INSERT INTO vehiculos (patente, tipo, marca, modelo, anio, capacidad_pasajeros, capacidad_carga, estado)

SELECT 'REV-3004', 'CAMIONETA', 'Ford', 'Ranger', 2021, 5, 900, 'DISPONIBLE'

WHERE NOT EXISTS (SELECT 1 FROM vehiculos WHERE patente = 'REV-3004');



INSERT INTO vehiculos (patente, tipo, modelo, marca, anio, capacidad_pasajeros, capacidad_carga, estado)

SELECT 'REV-3005', 'CISTERNA', 'Atego', 'Mercedes', 2020, 3, 12000, 'DISPONIBLE'

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



UPDATE brigadas SET

    nombre = 'Brigada Municipal Rápida',

    codigo = 'MUN-RAPIDA',

    capacidad = 4,

    estado = 'DISPONIBLE',

    id_compania = (SELECT id FROM companias WHERE codigo = 'GUARDIA-PA' LIMIT 1)

WHERE id = 1;



UPDATE brigadas SET

    nombre = 'Brigada Municipal Refuerzo',

    codigo = 'MUN-REFUERZO',

    capacidad = 12,

    estado = 'DISPONIBLE',

    id_compania = (SELECT id FROM companias WHERE codigo = 'GUARDIA-PA' LIMIT 1)

WHERE id = 2;



UPDATE brigadistas SET id_brigada = NULL, id_rol_brigadista = NULL WHERE id_brigada IN (1, 2);

DELETE FROM brigada_vehiculos WHERE id_brigada IN (1, 2);

DELETE FROM brigada_herramientas WHERE brigada_id IN (1, 2);

UPDATE brigadas SET id_jefe_brigadista = NULL WHERE id IN (1, 2);



-- === Brigada Municipal Rápida (id=1): 4 integrantes, 1 vehículo ===

UPDATE brigadistas SET id_brigada = 1, id_rol_brigadista = (SELECT id FROM brigadista_roles WHERE codigo = 'JEFE')

WHERE id = 1;

UPDATE brigadistas SET id_brigada = 1, id_rol_brigadista = (SELECT id FROM brigadista_roles WHERE codigo = 'CONDUCTOR')

WHERE id = 2;

UPDATE brigadistas SET id_brigada = 1, id_rol_brigadista = (SELECT id FROM brigadista_roles WHERE codigo = 'COMBATIENTE')

WHERE id IN (3, 4);



UPDATE brigadas SET id_jefe_brigadista = 1 WHERE id = 1;



INSERT INTO brigada_vehiculos (id_brigada, id_vehiculo, principal, activa, f_desde)

SELECT 1, (SELECT id FROM vehiculos WHERE patente = 'REV-1001' LIMIT 1), TRUE, TRUE, NOW();



INSERT INTO brigada_herramientas (brigada_id, herramienta_id, cantidad) VALUES

    (1, 1, 2),

    (1, 2, 1),

    (1, (SELECT id FROM herramientas WHERE nombre = 'Equipo de extinción portátil' LIMIT 1), 2),

    (1, (SELECT id FROM herramientas WHERE nombre = 'Kit primeros auxilios' LIMIT 1), 1);



-- === Brigada Municipal Refuerzo (id=2): 12 integrantes, 3 vehículos ===

UPDATE brigadistas SET id_brigada = 2, id_rol_brigadista = (SELECT id FROM brigadista_roles WHERE codigo = 'JEFE')

WHERE id = 5;

UPDATE brigadistas SET id_rol_brigadista = (SELECT id FROM brigadista_roles WHERE codigo = 'CONDUCTOR'), id_brigada = 2

WHERE id IN (6, 7, 12);

UPDATE brigadistas SET id_brigada = 2, id_rol_brigadista = (SELECT id FROM brigadista_roles WHERE codigo = 'COMBATIENTE')

WHERE id IN (8, 9, 10, 11, 13, 14, 15, 16);



UPDATE brigadas SET id_jefe_brigadista = 5 WHERE id = 2;



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



UPDATE vehiculos SET capacidad_pasajeros = 5, capacidad_carga = 800, marca = 'Nissan', modelo = 'Navara'

WHERE patente = 'REV-1001';

UPDATE vehiculos SET capacidad_pasajeros = 2, capacidad_carga = 12000, marca = 'Iveco', modelo = 'Eurocargo'

WHERE patente = 'REV-2002';


