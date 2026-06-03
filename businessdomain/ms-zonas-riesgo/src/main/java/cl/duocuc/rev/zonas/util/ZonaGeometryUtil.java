package cl.duocuc.rev.zonas.util;

import cl.duocuc.rev.zonas.entity.Zona;

/**
 * Deriva centro y radio (metros) desde el bbox administrativo para visualización circular en mapas.
 */
public final class ZonaGeometryUtil {

    private static final double EARTH_RADIUS_METERS = 6_371_000.0;

    private ZonaGeometryUtil() {
    }

    public static double centerLat(Zona zona) {
        return (zona.getMinLat() + zona.getMaxLat()) / 2.0;
    }

    public static double centerLng(Zona zona) {
        return (zona.getMinLng() + zona.getMaxLng()) / 2.0;
    }

    public static double radioMetros(Zona zona) {
        double cLat = centerLat(zona);
        double cLng = centerLng(zona);
        double toMaxLat = haversineMetros(cLat, cLng, zona.getMaxLat(), cLng);
        double toMaxLng = haversineMetros(cLat, cLng, cLat, zona.getMaxLng());
        double toMinLat = haversineMetros(cLat, cLng, zona.getMinLat(), cLng);
        double toMinLng = haversineMetros(cLat, cLng, cLat, zona.getMinLng());
        return Math.max(Math.max(toMaxLat, toMaxLng), Math.max(toMinLat, toMinLng));
    }

    private static double haversineMetros(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }
}
