ALTER TABLE incidentes ALTER COLUMN lat DROP NOT NULL;
ALTER TABLE incidentes ALTER COLUMN lng DROP NOT NULL;

ALTER TABLE incidentes ADD COLUMN direccion_referencia VARCHAR(500);
ALTER TABLE incidentes ADD COLUMN anonimo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE incidentes ADD COLUMN reportante_nombre VARCHAR(100);
ALTER TABLE incidentes ADD COLUMN reportante_apellido VARCHAR(100);
ALTER TABLE incidentes ADD COLUMN reportante_rut VARCHAR(20);
ALTER TABLE incidentes ADD COLUMN reportante_contacto VARCHAR(100);
ALTER TABLE incidentes ADD COLUMN origen_reporte VARCHAR(20) NOT NULL DEFAULT 'INTERNO';
ALTER TABLE incidentes ADD COLUMN folio VARCHAR(20);

UPDATE incidentes
SET folio = 'REV-LEG-' || UPPER(SUBSTRING(REPLACE(CAST(id AS VARCHAR), '-', ''), 1, 8))
WHERE folio IS NULL;

ALTER TABLE incidentes ALTER COLUMN folio SET NOT NULL;
ALTER TABLE incidentes ADD CONSTRAINT uk_incidentes_folio UNIQUE (folio);

CREATE SEQUENCE IF NOT EXISTS incidente_folio_seq START WITH 1000;

CREATE TABLE incidente_adjuntos (
    id UUID PRIMARY KEY,
    incidente_id UUID NOT NULL REFERENCES incidentes(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    contenido_hash CHAR(64) NOT NULL,
    ruta_storage VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    tamano_bytes BIGINT NOT NULL,
    orden INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_incidente_adjunto_hash UNIQUE (incidente_id, contenido_hash)
);

CREATE INDEX idx_incidente_adjuntos_incidente ON incidente_adjuntos(incidente_id);
