package cl.duocuc.rev.zonas.model;

public final class TipoZona {

    public static final String ESTRATEGICA = "ESTRATEGICA";
    public static final String OPERATIVA = "OPERATIVA";

    private TipoZona() {
    }

    public static boolean isValid(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            return true;
        }
        String t = tipo.toUpperCase();
        return ESTRATEGICA.equals(t) || OPERATIVA.equals(t);
    }
}
