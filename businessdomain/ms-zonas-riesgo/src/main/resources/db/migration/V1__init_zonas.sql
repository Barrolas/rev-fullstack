CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE zonas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    nivel_riesgo VARCHAR(30) NOT NULL,
    min_lat DOUBLE PRECISION NOT NULL,
    max_lat DOUBLE PRECISION NOT NULL,
    min_lng DOUBLE PRECISION NOT NULL,
    max_lng DOUBLE PRECISION NOT NULL
);

CREATE TABLE condiciones_climaticas (
    id BIGSERIAL PRIMARY KEY,
    zona_id BIGINT NOT NULL REFERENCES zonas(id),
    temperatura_c DOUBLE PRECISION NOT NULL,
    humedad_pct INTEGER NOT NULL,
    viento_kmh DOUBLE PRECISION NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    registrado_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO zonas (nombre, nivel_riesgo, min_lat, max_lat, min_lng, max_lng) VALUES
    ('Valle del Sol - Metropolitana', 'ALTO', -34.0, -33.2, -71.0, -70.3),
    ('Valle del Sol - Costa', 'MEDIO', -33.5, -32.8, -72.0, -71.2);

INSERT INTO condiciones_climaticas (zona_id, temperatura_c, humedad_pct, viento_kmh, descripcion) VALUES
    (1, 28.5, 35, 18.0, 'Soleado, baja humedad'),
    (2, 22.0, 72, 32.0, 'Viento costero moderado');
