package cl.duocuc.rev.incidentes.correlacion;

import java.util.UUID;

public final class CorrelacionPairOrder {

    private CorrelacionPairOrder() {
    }

    public static OrderedPair ordenar(UUID id1, UUID id2) {
        if (comparePostgresUuid(id1, id2) < 0) {
            return new OrderedPair(id1, id2);
        }
        return new OrderedPair(id2, id1);
    }

    /** Misma semántica que CHECK (incidente_a_id < incidente_b_id) en PostgreSQL. */
    static int comparePostgresUuid(UUID a, UUID b) {
        int cmp = Long.compareUnsigned(a.getMostSignificantBits(), b.getMostSignificantBits());
        if (cmp != 0) {
            return cmp;
        }
        return Long.compareUnsigned(a.getLeastSignificantBits(), b.getLeastSignificantBits());
    }

    public record OrderedPair(UUID incidenteAId, UUID incidenteBId) {
    }
}
