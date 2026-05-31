-- Asignación demo: Brigada Alpha al incidente precargado
INSERT INTO asignaciones (incidente_id, brigada_id, vehiculo_id, activa)
SELECT
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    1,
    1,
    TRUE
WHERE EXISTS (SELECT 1 FROM brigadas WHERE id = 1)
  AND NOT EXISTS (
    SELECT 1 FROM asignaciones
    WHERE incidente_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid
  );
