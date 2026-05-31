import { useCallback } from 'react';
import { Badge, Button, Col, Row, Table } from 'react-bootstrap';
import { fetchRecursos } from '../api';
import AppPage from '../components/layout/AppPage';
import ModuleHub, { KpiCol, KpiRow } from '../components/layout/ModuleHub';
import Topbar from '../components/layout/Topbar';
import KpiCard from '../components/primitives/KpiCard';
import StateView from '../components/primitives/StateView';
import { useApiQuery } from '../hooks/useApiQuery';

export default function RecursosPage() {
  const fetchFn = useCallback(() => fetchRecursos(), []);
  const { data, loading, error, refetch } = useApiQuery({ fetchFn });

  const viewState = loading ? 'loading' : error ? 'error' : !data ? 'empty' : 'idle';

  const kpiSection = (
    <KpiRow>
      <KpiCol>
        <KpiCard label="Brigadas" value={data?.brigadas.length ?? 0} icon="bi-people" />
      </KpiCol>
      <KpiCol>
        <KpiCard label="Vehiculos" value={data?.vehiculos.length ?? 0} icon="bi-truck" iconVariant="cyan" />
      </KpiCol>
      <KpiCol>
        <KpiCard label="Herramientas" value={data?.herramientas.length ?? 0} icon="bi-tools" iconVariant="warning" />
      </KpiCol>
      <KpiCol>
        <KpiCard
          label="Disponibles"
          value={
            (data?.brigadas.filter((b) => b.estado === 'DISPONIBLE').length ?? 0) +
            (data?.vehiculos.filter((v) => v.estado === 'DISPONIBLE').length ?? 0)
          }
          icon="bi-check2-circle"
          sub="Brigadas + vehículos"
        />
      </KpiCol>
    </KpiRow>
  );

  const toolbar = (
    <>
      <small className="text-muted">Brigadas, vehiculos y herramientas disponibles</small>
      <Button variant="outline-secondary" size="sm" onClick={refetch}>
        <i className="bi bi-arrow-clockwise me-1" />
        Actualizar
      </Button>
    </>
  );

  return (
    <>
      <Topbar
        title="Recursos de emergencia"
        breadcrumbs={[{ label: 'Despacho', to: '/' }, { label: 'Recursos' }]}
      />
      <AppPage>
        <ModuleHub kpis={kpiSection} toolbar={toolbar}>
          <StateView
            state={viewState}
            errorMessage={error}
            onRetry={refetch}
            emptyTitle="Sin recursos"
            emptyMessage="No hay recursos disponibles en el sistema."
          >
            <Row className="g-4">
              <Col lg={4}>
                <div className="rev-card p-3">
                  <h2 className="h6 mb-3">Brigadas</h2>
                  <Table responsive size="sm" variant="dark" className="mb-0">
                    <thead>
                      <tr><th>Nombre</th><th>Cap.</th><th>Estado</th></tr>
                    </thead>
                    <tbody>
                      {data?.brigadas.map((b) => (
                        <tr key={b.id}>
                          <td>{b.nombre}</td>
                          <td>{b.capacidad}</td>
                          <td><Badge bg="success">{b.estado}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Col>
              <Col lg={4}>
                <div className="rev-card p-3">
                  <h2 className="h6 mb-3">Vehiculos</h2>
                  <Table responsive size="sm" variant="dark" className="mb-0">
                    <thead>
                      <tr><th>Patente</th><th>Tipo</th><th>Estado</th></tr>
                    </thead>
                    <tbody>
                      {data?.vehiculos.map((v) => (
                        <tr key={v.id}>
                          <td>{v.patente}</td>
                          <td>{v.tipo}</td>
                          <td><Badge bg="success">{v.estado}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Col>
              <Col lg={4}>
                <div className="rev-card p-3">
                  <h2 className="h6 mb-3">Herramientas</h2>
                  <Table responsive size="sm" variant="dark" className="mb-0">
                    <thead>
                      <tr><th>Nombre</th><th>Disponible</th><th>Total</th></tr>
                    </thead>
                    <tbody>
                      {data?.herramientas.map((h) => (
                        <tr key={h.id}>
                          <td>{h.nombre}</td>
                          <td>{h.cantidadDisponible}</td>
                          <td>{h.cantidadTotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Col>
            </Row>
          </StateView>
        </ModuleHub>
      </AppPage>
    </>
  );
}
