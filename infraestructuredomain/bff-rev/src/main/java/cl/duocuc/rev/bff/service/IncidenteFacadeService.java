package cl.duocuc.rev.bff.service;

import cl.duocuc.rev.bff.client.IncidenteClientService;
import cl.duocuc.rev.bff.dto.IncidenteTimelineItemDto;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IncidenteFacadeService {

    private final IncidenteClientService incidenteClientService;

    public List<IncidenteTimelineItemDto> timeline(UUID incidenteId) {
        return incidenteClientService.timeline(incidenteId).block();
    }
}
