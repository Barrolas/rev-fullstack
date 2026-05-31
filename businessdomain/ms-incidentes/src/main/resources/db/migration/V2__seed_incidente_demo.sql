-- Incidente demo para entorno local (Valle del Sol, zona metropolitana)
INSERT INTO incidentes (id, tipo, estado, lat, lng, descripcion, reportante_uuid)
SELECT
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    'FORESTAL',
    'REPORTADO',
    -33.5,
    -70.5,
    'Incendio forestal en sector cordillera — incidente demo precargado',
    '11111111-1111-1111-1111-111111111111'::uuid
WHERE NOT EXISTS (SELECT 1 FROM incidentes WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid);

INSERT INTO transiciones_estado (incidente_id, estado_anterior, estado_nuevo)
SELECT
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'REPORTADO'
WHERE EXISTS (SELECT 1 FROM incidentes WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid)
  AND NOT EXISTS (
    SELECT 1 FROM transiciones_estado
    WHERE incidente_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid
  );
