-- Brigada liviana para emergencias urbanas de riesgo bajo (basurero, pastizal, etc.)
-- y limpieza de asignaciones de prueba para grabación demo.

DELETE FROM asignacion_brigadistas;
DELETE FROM asignacion_herramientas;
DELETE FROM asignaciones;

UPDATE vehiculos SET estado = 'DISPONIBLE' WHERE estado = 'ASIGNADO';
UPDATE brigadas SET estado = 'DISPONIBLE' WHERE estado = 'ASIGNADO';

INSERT INTO brigadistas (nombre, apellido, rut, especialidad, estado)
SELECT 'Patricia', 'Núñez', '81.818.181-8', 'Jefe de brigada urbana', 'DISPONIBLE'
WHERE NOT EXISTS (SELECT 1 FROM brigadistas WHERE rut = '81.818.181-8');

INSERT INTO brigadistas (nombre, apellido, rut, especialidad, estado)
SELECT 'Marco', 'Ibáñez', '92.929.292-9', 'Combate urbano', 'DISPONIBLE'
WHERE NOT EXISTS (SELECT 1 FROM brigadistas WHERE rut = '92.929.292-9');

INSERT INTO brigadas (nombre, codigo, capacidad, estado, id_compania)
SELECT 'Brigada Municipal Urbana', 'MUN-URBANA', 2, 'DISPONIBLE',
       (SELECT id FROM companias WHERE codigo = 'GUARDIA-PA' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM brigadas WHERE codigo = 'MUN-URBANA');

UPDATE brigadistas b SET id_brigada = br.id, id_rol_brigadista = r.id, estado = 'DISPONIBLE'
FROM brigadas br, brigadista_roles r
WHERE br.codigo = 'MUN-URBANA' AND r.codigo = 'JEFE'
  AND b.rut = '81.818.181-8';

UPDATE brigadistas b SET id_brigada = br.id, id_rol_brigadista = r.id, estado = 'DISPONIBLE'
FROM brigadas br, brigadista_roles r
WHERE br.codigo = 'MUN-URBANA' AND r.codigo = 'COMBATIENTE'
  AND b.rut = '92.929.292-9';

UPDATE brigadas SET id_jefe_brigadista = (SELECT id FROM brigadistas WHERE rut = '81.818.181-8' LIMIT 1)
WHERE codigo = 'MUN-URBANA';

INSERT INTO brigada_vehiculos (id_brigada, id_vehiculo, principal, activa, f_desde)
SELECT br.id, v.id, TRUE, TRUE, NOW()
FROM brigadas br
JOIN vehiculos v ON v.patente = 'REV-3004'
WHERE br.codigo = 'MUN-URBANA'
  AND NOT EXISTS (
    SELECT 1 FROM brigada_vehiculos bv
    WHERE bv.id_brigada = br.id AND bv.id_vehiculo = v.id
  );

INSERT INTO brigada_herramientas (brigada_id, herramienta_id, cantidad)
SELECT br.id, h.id, 1
FROM brigadas br
JOIN herramientas h ON h.sku = 'EXT-PQS-6'
WHERE br.codigo = 'MUN-URBANA'
  AND NOT EXISTS (
    SELECT 1 FROM brigada_herramientas bh
    WHERE bh.brigada_id = br.id AND bh.herramienta_id = h.id
  );

INSERT INTO brigada_herramientas (brigada_id, herramienta_id, cantidad)
SELECT br.id, h.id, 1
FROM brigadas br
JOIN herramientas h ON h.nombre = 'Equipo de extinción portátil'
WHERE br.codigo = 'MUN-URBANA'
  AND NOT EXISTS (
    SELECT 1 FROM brigada_herramientas bh
    WHERE bh.brigada_id = br.id AND bh.herramienta_id = h.id
  );

INSERT INTO brigada_herramientas (brigada_id, herramienta_id, cantidad)
SELECT br.id, h.id, 1
FROM brigadas br
JOIN herramientas h ON h.nombre = 'Kit primeros auxilios'
WHERE br.codigo = 'MUN-URBANA'
  AND NOT EXISTS (
    SELECT 1 FROM brigada_herramientas bh
    WHERE bh.brigada_id = br.id AND bh.herramienta_id = h.id
  );
