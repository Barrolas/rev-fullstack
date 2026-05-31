package cl.duocuc.rev.zonas.model;

public enum NivelRiesgo {
    LOW,
    MEDIUM,
    HIGH;

    public static boolean isValid(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        try {
            valueOf(value.toUpperCase());
            return true;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }
}
