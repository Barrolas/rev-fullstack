package cl.duocuc.rev.incidentes.correlacion;

import java.util.UUID;

public final class CorrelacionPairOrder {

    private CorrelacionPairOrder() {
    }

    public static OrderedPair ordenar(UUID id1, UUID id2) {
        if (id1.compareTo(id2) < 0) {
            return new OrderedPair(id1, id2);
        }
        return new OrderedPair(id2, id1);
    }

    public record OrderedPair(UUID incidenteAId, UUID incidenteBId) {
    }
}
