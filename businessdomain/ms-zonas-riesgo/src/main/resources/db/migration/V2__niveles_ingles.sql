UPDATE zonas SET nivel_riesgo = 'HIGH' WHERE nivel_riesgo = 'ALTO';
UPDATE zonas SET nivel_riesgo = 'MEDIUM' WHERE nivel_riesgo = 'MEDIO';

INSERT INTO zonas (nombre, nivel_riesgo, min_lat, max_lat, min_lng, max_lng)
SELECT 'Valle del Sol - Cordillera', 'LOW', -34.5, -34.0, -70.8, -70.2
WHERE NOT EXISTS (SELECT 1 FROM zonas WHERE nombre = 'Valle del Sol - Cordillera');
