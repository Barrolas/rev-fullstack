-- Usernames Keycloak para brigadistas demo (sub se vincula vía script provisioning)

UPDATE brigadistas SET keycloak_username = 'maria.gonzalez', email = 'maria.gonzalez@valle.local' WHERE id = 1;
UPDATE brigadistas SET keycloak_username = 'pedro.soto', email = 'pedro.soto@valle.local' WHERE id = 2;
UPDATE brigadistas SET keycloak_username = 'ana.munoz', email = 'ana.munoz@valle.local' WHERE id = 3;
UPDATE brigadistas SET keycloak_username = 'luis.rojas', email = 'luis.rojas@valle.local' WHERE id = 4;

UPDATE brigadistas SET keycloak_username = 'carlos.mendez', email = 'carlos.mendez@valle.local' WHERE rut = '55.555.555-5';
UPDATE brigadistas SET keycloak_username = 'patricia.nunez', email = 'patricia.nunez@valle.local' WHERE rut = '81.818.181-8';
UPDATE brigadistas SET keycloak_username = 'marco.ibanez', email = 'marco.ibanez@valle.local' WHERE rut = '92.929.292-9';

UPDATE brigadistas SET
    keycloak_username = LOWER(REPLACE(nombre, ' ', '.')) || '.' || LOWER(REPLACE(apellido, ' ', '.')),
    email = LOWER(REPLACE(nombre, ' ', '.')) || '.' || LOWER(REPLACE(apellido, ' ', '.')) || '@valle.local'
WHERE id_brigada IS NOT NULL AND keycloak_username IS NULL;
