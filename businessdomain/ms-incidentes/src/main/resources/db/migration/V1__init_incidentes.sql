CREATE TABLE incidentes (
    id UUID PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    descripcion VARCHAR(500) NOT NULL,
    reportante_uuid UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE transiciones_estado (
    id BIGSERIAL PRIMARY KEY,
    incidente_id UUID NOT NULL REFERENCES incidentes(id),
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
