ALTER TABLE transiciones_estado
    ADD COLUMN IF NOT EXISTS realizado_por VARCHAR(120),
    ADD COLUMN IF NOT EXISTS origen VARCHAR(30);
