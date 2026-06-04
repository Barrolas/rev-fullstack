ALTER TABLE zonas ADD COLUMN center_lat DOUBLE PRECISION;
ALTER TABLE zonas ADD COLUMN center_lng DOUBLE PRECISION;
ALTER TABLE zonas ADD COLUMN radio_metros DOUBLE PRECISION;
ALTER TABLE zonas ADD COLUMN comuna VARCHAR(80) DEFAULT 'Puente Alto';
ALTER TABLE zonas ADD COLUMN tipo VARCHAR(30) DEFAULT 'ESTRATEGICA';
ALTER TABLE zonas ADD COLUMN activa BOOLEAN DEFAULT TRUE;

UPDATE zonas SET
    center_lat = (min_lat + max_lat) / 2,
    center_lng = (min_lng + max_lng) / 2,
    radio_metros = GREATEST(max_lat - min_lat, max_lng - min_lng) * 111000 / 2,
    comuna = 'Puente Alto',
    tipo = 'ESTRATEGICA',
    activa = TRUE
WHERE center_lat IS NULL;

DELETE FROM condiciones_climaticas;
DELETE FROM zonas;

INSERT INTO zonas (nombre, nivel_riesgo, center_lat, center_lng, radio_metros, comuna, tipo, activa, min_lat, max_lat, min_lng, max_lng) VALUES
    ('Centro Puente Alto', 'MEDIUM', -33.6110, -70.5750, 1200, 'Puente Alto', 'ESTRATEGICA', TRUE, -33.622, -33.600, -70.586, -70.564),
    ('Alto Jahuel', 'HIGH', -33.6280, -70.5620, 1500, 'Puente Alto', 'ESTRATEGICA', TRUE, -33.641, -33.615, -70.575, -70.549),
    ('Bajos de Mena', 'MEDIUM', -33.5850, -70.5920, 1800, 'Puente Alto', 'ESTRATEGICA', TRUE, -33.601, -33.569, -70.608, -70.576),
    ('Cordillera Oriente', 'HIGH', -33.6450, -70.5480, 2200, 'Puente Alto', 'ESTRATEGICA', TRUE, -33.665, -33.625, -70.568, -70.528),
    ('Industrial Los Libertadores', 'LOW', -33.5980, -70.5480, 1000, 'Puente Alto', 'OPERATIVA', TRUE, -33.607, -33.589, -70.557, -70.539),
    ('Villa San José', 'MEDIUM', -33.6180, -70.5880, 1100, 'Puente Alto', 'ESTRATEGICA', TRUE, -33.628, -33.608, -70.598, -70.578);

INSERT INTO condiciones_climaticas (zona_id, temperatura_c, humedad_pct, viento_kmh, descripcion)
SELECT z.id, v.temp, v.hum, v.viento, v.descr
FROM (VALUES
    ('Centro Puente Alto', 24.0, 45, 12.0, 'Centro urbano, viento moderado'),
    ('Alto Jahuel', 26.0, 38, 18.0, 'Sector alto, baja humedad'),
    ('Bajos de Mena', 23.0, 55, 10.0, 'Zona residencial densa'),
    ('Cordillera Oriente', 22.0, 40, 22.0, 'Interfaz cordillera, viento elevado'),
    ('Industrial Los Libertadores', 25.0, 50, 8.0, 'Parque industrial'),
    ('Villa San José', 24.5, 48, 14.0, 'Villa residencial')
) AS v(nombre, temp, hum, viento, descr)
JOIN zonas z ON z.nombre = v.nombre;

ALTER TABLE zonas ALTER COLUMN center_lat SET NOT NULL;
ALTER TABLE zonas ALTER COLUMN center_lng SET NOT NULL;
ALTER TABLE zonas ALTER COLUMN radio_metros SET NOT NULL;
