-- Re-limpieza total de incidentes (por si V8 no llegó a aplicarse en el entorno).

DELETE FROM incidente_adjuntos;
DELETE FROM incidente_correlacion;
DELETE FROM transiciones_estado;
DELETE FROM incidentes;

SELECT setval('incidente_folio_seq', 1000, false);
