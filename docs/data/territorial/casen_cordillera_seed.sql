-- Catálogo territorial REV: Provincia Cordillera (RM implícita región 13)
-- Fuente: Libro de códigos provincia y comuna CASEN 2024 (Anexo 1 CUT)
-- PK = codigo_casen para alinear ms-recursos y ms-zonas-riesgo

INSERT INTO provincias (codigo_casen, nombre, estado) VALUES
    (132, 'Cordillera', 'ACTIVA')
ON CONFLICT (codigo_casen) DO NOTHING;

INSERT INTO comunas (codigo_casen, codigo_provincia_casen, nombre, estado) VALUES
    (13201, 132, 'Puente Alto', 'ACTIVA'),
    (13202, 132, 'Pirque', 'ACTIVA'),
    (13203, 132, 'San José de Maipo', 'ACTIVA')
ON CONFLICT (codigo_casen) DO NOTHING;
