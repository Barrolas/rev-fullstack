import { useCallback } from 'react';
import { Button, Col, Row, Table } from 'react-bootstrap';
import { fetchZonas } from '../api';
import AppPage from '../components/layout/AppPage';
import ModuleHub, { KpiCol, KpiRow } from '../components/layout/ModuleHub';
import Topbar from '../components/layout/Topbar';
import KpiCard from '../components/primitives/KpiCard';
import StateView from '../components/primitives/StateView';
import RiskBadge from '../components/RiskBadge';
import { useApiQuery } from '../hooks/useApiQuery';
import { countZonasByLevel } from '../utils/dashboardAggregates';

export default function ZonasPage() {
  const fetchFn = useCallback(() => fetchZonas(), []);
  const { data: zonas, loading, error, refetch } = useApiQuery({ fetchFn });

  const list = zonas ?? [];
  const counts = countZonasByLevel(list);
  const viewState = loading ? 'loading' : error ? 'error' : list.length === 0 ? 'empty' : 'idle';

  const kpiSection = (
    <KpiRow>
      <KpiCol>
        <KpiCard label="Total zonas" value={counts.total} icon="bi-map" />
      </KpiCol>
      <KpiCol>
        <KpiCard label="Riesgo bajo" value={counts.low} icon="bi-check-circle" iconVariant="cyan" />
      </KpiCol>
      <KpiCol>
        <KpiCard label="Riesgo medio" value={counts.medium} icon="bi-dash-circle" iconVariant="warning" />
      </KpiCol>
      <KpiCol>
        <KpiCard label="Riesgo alto" value={counts.high} icon="bi-exclamation-triangle" />
      </KpiCol>
    </KpiRow>
  );

  const toolbar = (
    <>
      <small className="text-muted">Territorio municipal — niveles LOW / MEDIUM / HIGH</small>
      <Button variant="outline-secondary" size="sm" onClick={refetch}>
        <i className="bi bi-arrow-clockwise me-1" />
        Actualizar
      </Button>
    </>
  );

  return (
    <>
      <Topbar
        title="Zonas de riesgo"
        breadcrumbs={[{ label: 'Despacho', to: '/' }, { label: 'Zonas' }]}
      />
      <AppPage>
        <ModuleHub kpis={kpiSection} toolbar={toolbar}>
          <StateView
            state={viewState}
            errorMessage={error}
            onRetry={refetch}
            emptyTitle="Sin zonas"
            emptyMessage="No hay zonas de riesgo configuradas."
          >
            <Row className="mb-4">
              {list.map((z) => (
                <Col md={6} lg={4} key={z.id} className="mb-3">
                  <div className="rev-card p-3 h-100">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h2 className="h6 mb-0">{z.nombre}</h2>
                      <RiskBadge nivel={z.nivelRiesgo} />
                    </div>
                    <small className="text-muted d-block">
                      Lat: {z.minLat} — {z.maxLat}
                    </small>
                    <small className="text-muted d-block">
                      Lng: {z.minLng} — {z.maxLng}
                    </small>
                  </div>
                </Col>
              ))}
            </Row>
            <div className="rev-card p-3">
              <h2 className="h6 mb-3">Tabla resumen</h2>
              <Table responsive striped bordered hover variant="dark" size="sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Nivel</th>
                    <th>Limites lat</th>
                    <th>Limites lng</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((z) => (
                    <tr key={z.id}>
                      <td>{z.id}</td>
                      <td>{z.nombre}</td>
                      <td><RiskBadge nivel={z.nivelRiesgo} /></td>
                      <td>{z.minLat} / {z.maxLat}</td>
                      <td>{z.minLng} / {z.maxLng}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </StateView>
        </ModuleHub>
      </AppPage>
    </>
  );
}
