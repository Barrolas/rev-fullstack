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

    public static int severidad(String value) {
        if (value == null) {
            return 0;
        }
        return switch (value.toUpperCase()) {
            case "HIGH" -> 3;
            case "MEDIUM" -> 2;
            case "LOW" -> 1;
            default -> 0;
        };
    }
}
