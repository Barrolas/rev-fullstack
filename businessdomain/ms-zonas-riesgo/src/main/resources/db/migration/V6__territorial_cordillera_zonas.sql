-- Catálogo territorial Cordillera (mismo PK codigo_casen que ms-recursos)

CREATE TABLE provincias (
    codigo_casen INT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    f_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    f_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE comunas (
    codigo_casen INT PRIMARY KEY,
    codigo_provincia_casen INT NOT NULL REFERENCES provincias(codigo_casen),
    nombre VARCHAR(120) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    f_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    f_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO provincias (codigo_casen, nombre, estado) VALUES (132, 'Cordillera', 'ACTIVA');
INSERT INTO comunas (codigo_casen, codigo_provincia_casen, nombre, estado) VALUES
    (13201, 132, 'Puente Alto', 'ACTIVA'),
    (13202, 132, 'Pirque', 'ACTIVA'),
    (13203, 132, 'San José de Maipo', 'ACTIVA');

ALTER TABLE zonas ADD COLUMN id_comuna INT REFERENCES comunas(codigo_casen);

UPDATE zonas SET id_comuna = (SELECT codigo_casen FROM comunas WHERE nombre = 'Puente Alto')
WHERE id_comuna IS NULL;
