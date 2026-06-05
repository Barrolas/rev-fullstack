-- Elimina todas las zonas (y clima) y recrea el catálogo estratégico Cordillera / Puente Alto.

DELETE FROM condiciones_climaticas;
DELETE FROM zonas;

ALTER SEQUENCE zonas_id_seq RESTART WITH 1;

-- Catálogo territorial (idempotente si V6 ya corrió)
INSERT INTO provincias (codigo_casen, nombre, estado)
SELECT 132, 'Cordillera', 'ACTIVA'
WHERE NOT EXISTS (SELECT 1 FROM provincias WHERE codigo_casen = 132);

INSERT INTO comunas (codigo_casen, codigo_provincia_casen, nombre, estado)
SELECT v.codigo, 132, v.nombre, 'ACTIVA'
FROM (VALUES
    (13201, 'Puente Alto'),
    (13202, 'Pirque'),
    (13203, 'San José de Maipo')
) AS v(codigo, nombre)
WHERE NOT EXISTS (SELECT 1 FROM comunas c WHERE c.codigo_casen = v.codigo);

INSERT INTO zonas (
    nombre, nivel_riesgo, center_lat, center_lng, radio_metros,
    comuna, tipo, activa, min_lat, max_lat, min_lng, max_lng, id_comuna
) VALUES
    ('Centro Puente Alto', 'MEDIUM', -33.6110, -70.5750, 1200, 'Puente Alto', 'ESTRATEGICA', TRUE,
     -33.622, -33.600, -70.586, -70.564, 13201),
    ('Alto Jahuel', 'HIGH', -33.6280, -70.5620, 1500, 'Puente Alto', 'ESTRATEGICA', TRUE,
     -33.641, -33.615, -70.575, -70.549, 13201),
    ('Bajos de Mena', 'MEDIUM', -33.5850, -70.5920, 1800, 'Puente Alto', 'ESTRATEGICA', TRUE,
     -33.601, -33.569, -70.608, -70.576, 13201),
    ('Cordillera Oriente', 'HIGH', -33.6450, -70.5480, 2200, 'Puente Alto', 'ESTRATEGICA', TRUE,
     -33.665, -33.625, -70.568, -70.528, 13201),
    ('Industrial Los Libertadores', 'LOW', -33.5980, -70.5480, 1000, 'Puente Alto', 'OPERATIVA', TRUE,
     -33.607, -33.589, -70.557, -70.539, 13201),
    ('Villa San José', 'MEDIUM', -33.6180, -70.5880, 1100, 'Puente Alto', 'ESTRATEGICA', TRUE,
     -33.628, -33.608, -70.598, -70.578, 13201);

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
