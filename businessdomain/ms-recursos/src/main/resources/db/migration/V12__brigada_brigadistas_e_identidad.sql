-- Membresía brigada-brigadista + vínculo identidad Keycloak

ALTER TABLE brigadistas
    ADD COLUMN IF NOT EXISTS keycloak_sub UUID,
    ADD COLUMN IF NOT EXISTS keycloak_username VARCHAR(80),
    ADD COLUMN IF NOT EXISTS email VARCHAR(120);

CREATE UNIQUE INDEX IF NOT EXISTS uq_brigadistas_keycloak_sub
    ON brigadistas (keycloak_sub) WHERE keycloak_sub IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_brigadistas_keycloak_username
    ON brigadistas (keycloak_username) WHERE keycloak_username IS NOT NULL;

CREATE TABLE brigada_brigadistas (
    id BIGSERIAL PRIMARY KEY,
    brigada_id BIGINT NOT NULL REFERENCES brigadas(id) ON DELETE CASCADE,
    brigadista_id BIGINT NOT NULL REFERENCES brigadistas(id) ON DELETE CASCADE,
    id_rol_brigadista BIGINT REFERENCES brigadista_roles(id),
    es_jefe BOOLEAN NOT NULL DEFAULT FALSE,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    f_desde TIMESTAMP NOT NULL DEFAULT NOW(),
    f_hasta TIMESTAMP
);

CREATE UNIQUE INDEX uq_brigada_brigadista_activa
    ON brigada_brigadistas (brigadista_id) WHERE activa = TRUE;

CREATE UNIQUE INDEX uq_brigada_jefe_activo
    ON brigada_brigadistas (brigada_id) WHERE activa = TRUE AND es_jefe = TRUE;

-- Poblar membresías desde dotación actual
INSERT INTO brigada_brigadistas (brigada_id, brigadista_id, id_rol_brigadista, es_jefe, activa, f_desde)
SELECT
    b.id_brigada,
    b.id,
    b.id_rol_brigadista,
    (r.codigo = 'JEFE' OR br.id_jefe_brigadista = b.id),
    TRUE,
    NOW()
FROM brigadistas b
JOIN brigadas br ON br.id = b.id_brigada
LEFT JOIN brigadista_roles r ON r.id = b.id_rol_brigadista
WHERE b.id_brigada IS NOT NULL;

-- Usernames y emails demo (keycloak_sub se asigna al provisionar Keycloak)
UPDATE brigadistas SET
    keycloak_username = v.username,
    email = v.email
FROM (VALUES
    (1,  'maria.gonzalez',    'maria.gonzalez@valle.local'),
    (2,  'pedro.soto',        'pedro.soto@valle.local'),
    (3,  'ana.munoz',         'ana.munoz@valle.local'),
    (4,  'luis.rojas',        'luis.rojas@valle.local')
) AS v(id, username, email)
WHERE brigadistas.id = v.id AND brigadistas.keycloak_username IS NULL;

UPDATE brigadistas SET
    keycloak_username = LOWER(REPLACE(nombre, ' ', '.')) || '.' || LOWER(REPLACE(apellido, ' ', '.')),
    email = LOWER(REPLACE(nombre, ' ', '.')) || '.' || LOWER(REPLACE(apellido, ' ', '.')) || '@valle.local'
WHERE id_brigada IS NOT NULL
  AND keycloak_username IS NULL
  AND rut IS NOT NULL;
