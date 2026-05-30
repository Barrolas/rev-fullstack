package cl.duocuc.rev.incidentes.dto;

import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import lombok.Data;

@Data
public class TransicionRequest {
    private EstadoIncidente estadoDestino;
}
