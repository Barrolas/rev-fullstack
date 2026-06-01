ALTER TABLE incidentes
    ADD COLUMN incidente_canonico_id UUID REFERENCES incidentes(id);

CREATE INDEX idx_incidentes_canonico ON incidentes(incidente_canonico_id);
CREATE INDEX idx_incidentes_estado_created ON incidentes(estado, created_at DESC);

CREATE TABLE incidente_correlacion (
    id UUID PRIMARY KEY,
    incidente_a_id UUID NOT NULL REFERENCES incidentes(id) ON DELETE CASCADE,
    incidente_b_id UUID NOT NULL REFERENCES incidentes(id) ON DELETE CASCADE,
    score SMALLINT NOT NULL,
    distancia_metros DOUBLE PRECISION NOT NULL,
    delta_minutos INT NOT NULL,
    motivo JSONB NOT NULL,
    estado VARCHAR(20) NOT NULL,
    incidente_canonico_id UUID REFERENCES incidentes(id),
    decidido_por VARCHAR(100),
    decidido_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_incidente_correlacion_par UNIQUE (incidente_a_id, incidente_b_id),
    CONSTRAINT chk_incidente_correlacion_orden CHECK (incidente_a_id < incidente_b_id)
);

CREATE INDEX idx_correlacion_estado_created ON incidente_correlacion(estado, created_at DESC);
CREATE INDEX idx_correlacion_canonico ON incidente_correlacion(incidente_canonico_id);
CREATE INDEX idx_correlacion_incidente_a ON incidente_correlacion(incidente_a_id);
CREATE INDEX idx_correlacion_incidente_b ON incidente_correlacion(incidente_b_id);
