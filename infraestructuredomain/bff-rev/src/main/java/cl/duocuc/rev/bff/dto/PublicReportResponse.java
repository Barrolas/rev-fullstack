package cl.duocuc.rev.bff.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicReportResponse {

    private String id;
    private String folio;
    private String mensaje;
}
