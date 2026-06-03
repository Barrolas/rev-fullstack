package cl.duocuc.rev.zonas.util;

import cl.duocuc.rev.zonas.entity.Zona;

public final class ZonaGeometryUtil {

    private static final double EARTH_RADIUS_METERS = 6_371_000.0;
    private static final double METERS_PER_DEGREE_LAT = 111_320.0;

    private ZonaGeometryUtil() {
    }

    public static double haversineMetros(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }

    public static boolean contienePunto(Zona zona, double lat, double lng) {
        if (!zona.isActiva()) {
            return false;
        }
        return haversineMetros(zona.getCenterLat(), zona.getCenterLng(), lat, lng) <= zona.getRadioMetros();
    }

    public static void aplicarBboxDerivado(Zona zona) {
        double deltaLat = zona.getRadioMetros() / METERS_PER_DEGREE_LAT;
        double cosLat = Math.cos(Math.toRadians(zona.getCenterLat()));
        double deltaLng = zona.getRadioMetros() / (METERS_PER_DEGREE_LAT * Math.max(cosLat, 0.01));
        zona.setMinLat(zona.getCenterLat() - deltaLat);
        zona.setMaxLat(zona.getCenterLat() + deltaLat);
        zona.setMinLng(zona.getCenterLng() - deltaLng);
        zona.setMaxLng(zona.getCenterLng() + deltaLng);
    }

    /** @deprecated Solo compatibilidad con datos legacy sin center_lat. */
    public static double centerLat(Zona zona) {
        if (zona.getCenterLat() != null) {
            return zona.getCenterLat();
        }
        return (zona.getMinLat() + zona.getMaxLat()) / 2.0;
    }

    /** @deprecated Solo compatibilidad con datos legacy sin center_lng. */
    public static double centerLng(Zona zona) {
        if (zona.getCenterLng() != null) {
            return zona.getCenterLng();
        }
        return (zona.getMinLng() + zona.getMaxLng()) / 2.0;
    }

    /** @deprecated Solo compatibilidad con datos legacy sin radio_metros. */
    public static double radioMetros(Zona zona) {
        if (zona.getRadioMetros() != null) {
            return zona.getRadioMetros();
        }
        double cLat = centerLat(zona);
        double cLng = centerLng(zona);
        double toMaxLat = haversineMetros(cLat, cLng, zona.getMaxLat(), cLng);
        double toMaxLng = haversineMetros(cLat, cLng, cLat, zona.getMaxLng());
        return Math.max(toMaxLat, toMaxLng);
    }
}
