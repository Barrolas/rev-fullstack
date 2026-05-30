package cl.duocuc.rev.bff.controller;

import cl.duocuc.rev.bff.dto.DashboardResponse;
import cl.duocuc.rev.bff.service.DashboardFacadeService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardFacadeService dashboardFacadeService;

    @GetMapping("/incidente/{id}")
    public DashboardResponse obtenerPorIncidente(@PathVariable UUID id) {
        return dashboardFacadeService.obtenerPorIncidenteId(id);
    }

    @GetMapping("/incidentes")
    public List<DashboardResponse> listarIncidentes() {
        return dashboardFacadeService.listarDashboards();
    }
}
