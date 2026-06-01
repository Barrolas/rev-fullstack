-- Alinear tipo con JPA (String @Column length=64) tras CHAR(64) en V3
ALTER TABLE incidente_adjuntos
    ALTER COLUMN contenido_hash TYPE VARCHAR(64);
