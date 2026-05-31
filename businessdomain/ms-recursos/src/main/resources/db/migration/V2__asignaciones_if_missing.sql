-- Reparacion: BD creada antes de incluir asignaciones en V1
CREATE TABLE IF NOT EXISTS asignaciones (
    id BIGSERIAL PRIMARY KEY,
    incidente_id UUID NOT NULL,
    brigada_id BIGINT NOT NULL REFERENCES brigadas(id),
    vehiculo_id BIGINT REFERENCES vehiculos(id),
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
