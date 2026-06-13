-- Integrantes de MUN-RAPIDA quedaron ASIGNADO sin asignación activa (despacho de prueba liberado).

UPDATE brigadistas SET estado = 'DISPONIBLE'
WHERE id_brigada = 1 AND estado = 'ASIGNADO';

UPDATE brigadas SET estado = 'DISPONIBLE' WHERE id = 1 AND estado = 'ASIGNADO';

UPDATE vehiculos SET estado = 'DISPONIBLE'
WHERE id = (SELECT id_vehiculo FROM brigada_vehiculos WHERE id_brigada = 1 AND principal = TRUE AND activa = TRUE LIMIT 1)
  AND estado = 'ASIGNADO';
