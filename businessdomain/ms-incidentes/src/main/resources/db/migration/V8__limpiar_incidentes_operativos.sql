-- Limpieza total de incidentes para recrear casos desde cero (UI / reporte público).
-- No elimina esquema ni secuencia de folios.

DELETE FROM incidente_adjuntos;
DELETE FROM incidente_correlacion;
DELETE FROM transiciones_estado;
DELETE FROM incidentes;

SELECT setval('incidente_folio_seq', 1000, false);
