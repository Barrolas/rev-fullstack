import { useCallback, useEffect, useMemo, useState } from 'react';

import { Alert, Badge, Button, Form, Nav, Tab } from 'react-bootstrap';
import BrigadaSeleccionList from '../components/despacho/BrigadaSeleccionList';
import DespachoWizard from '../components/despacho/DespachoWizard';
import ConfirmDialog from '../components/primitives/ConfirmDialog';
import BrigadaBulkActionBar from '../components/shared/BrigadaBulkActionBar';
import { useBrigadaSelection } from '../hooks/useBrigadaSelection';

import { Link, useSearchParams } from 'react-router-dom';

import {

  DespachoColaItem,

  fetchDespachoActivos,

  fetchDespachoCola,

  fetchDashboardItem,

  actualizarEstadoDespachoAsignacion,

  cerrarIncidenteDespacho,

  liberarAsignacion,

  type AsignacionActiva,

  type DashboardItem,

} from '../api';

import {

  accionEstadoDespachoLabel,

  estadoDespachoCardClass,

  estadoDespachoLabel,

  estadoIncidenteLabel,

  prioridadOrden,

  siguienteEstadoDespacho,

  tipoIncidenteIcon,

} from '../components/despacho/despachoLabels';

import RiskBadge from '../components/RiskBadge';

import AppPage from '../components/layout/AppPage';

import Topbar from '../components/layout/Topbar';

import StateView from '../components/primitives/StateView';

import { useApiQuery } from '../hooks/useApiQuery';

import { useAuth } from '../hooks/useAuth';
import { tiempoRelativo } from '../utils/formatFecha';
import { ejecutarDespachoRapido } from '../utils/despachoRapido';



type RiesgoFiltro = '' | 'HIGH' | 'MEDIUM' | 'LOW' | 'DESCONOCIDO';



function colaRiskClass(nivel?: string): string {

  if (nivel === 'HIGH') return 'rev-despacho-cola-item--risk-high';

  if (nivel === 'MEDIUM') return 'rev-despacho-cola-item--risk-medium';

  if (nivel === 'LOW') return 'rev-despacho-cola-item--risk-low';

  return '';

}



export default function DespachoOperacionPage() {

  const { username, displayName } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const incidenteParam = searchParams.get('incidente');



  const fetchCola = useCallback(() => fetchDespachoCola(), []);

  const { data: colaData, loading, error, refetch: refetchCola } = useApiQuery({ fetchFn: fetchCola });



  const [activos, setActivos] = useState<Awaited<ReturnType<typeof fetchDespachoActivos>>>([]);

  const [activosLoading, setActivosLoading] = useState(false);

  const [tab, setTab] = useState<'cola' | 'activos'>('cola');

  const [selectedIncidente, setSelectedIncidente] = useState<DespachoColaItem | null>(null);

  const [detalle, setDetalle] = useState<DashboardItem | null>(null);

  const [colaSearch, setColaSearch] = useState('');

  const [riesgoFiltro, setRiesgoFiltro] = useState<RiesgoFiltro>('');

  const [showDespachoWizard, setShowDespachoWizard] = useState(false);

  const [quickDispatchOpen, setQuickDispatchOpen] = useState(false);

  const [quickDispatching, setQuickDispatching] = useState(false);

  const [quickDispatchError, setQuickDispatchError] = useState('');

  const [activosActionId, setActivosActionId] = useState<number | null>(null);

  const [cerrandoIncidenteId, setCerrandoIncidenteId] = useState<string | null>(null);



  const loadActivos = useCallback(() => {

    setActivosLoading(true);

    fetchDespachoActivos()

      .then(setActivos)

      .finally(() => setActivosLoading(false));

  }, []);



  useEffect(() => {

    loadActivos();

  }, [loadActivos]);



  useEffect(() => {

    if (!colaData?.cola.length || !incidenteParam) return;

    const item = colaData.cola.find((c) => c.incidenteId === incidenteParam);

    if (item) setSelectedIncidente(item);

  }, [colaData, incidenteParam]);



  useEffect(() => {

    if (!selectedIncidente) {

      setDetalle(null);

      return;

    }

    fetchDashboardItem(selectedIncidente.incidenteId)

      .then(setDetalle)

      .catch(() => setDetalle(null));

  }, [selectedIncidente]);



  const brigadas = colaData?.brigadasDisponibles ?? [];



  const brigadasListas = brigadas.filter((b) => b.listaParaDespacho).length;

  const brigadaSelectionRows = useMemo(
    () =>
      brigadas.map((b) => ({
        id: b.id,
        estado: b.estado,
        listaParaDespacho: b.listaParaDespacho,
      })),
    [brigadas],
  );

  const brigadaSelection = useBrigadaSelection({
    rows: brigadaSelectionRows,
    isRowSelectable: (r) => r.estado === 'DISPONIBLE' && !!r.listaParaDespacho,
  });



  const colaFiltrada = useMemo(() => {

    const q = colaSearch.trim().toLowerCase();

    let items = [...(colaData?.cola ?? [])];

    if (riesgoFiltro) {

      items = items.filter((i) => (i.zonaNivelRiesgo ?? 'DESCONOCIDO') === riesgoFiltro);

    }

    if (q) {

      items = items.filter(

        (i) =>

          (i.folio ?? '').toLowerCase().includes(q) ||

          i.incidenteId.toLowerCase().includes(q) ||

          i.tipo.toLowerCase().includes(q) ||

          i.descripcion.toLowerCase().includes(q),

      );

    }

    return items.sort((a, b) => prioridadOrden(b) - prioridadOrden(a));

  }, [colaData?.cola, colaSearch, riesgoFiltro]);



  const pasoActual =
    selectedIncidente && brigadaSelection.count > 0 ? 3 : selectedIncidente ? 2 : 1;

  const brigadasSeleccionadasNombres = useMemo(() => {
    const ids = new Set(brigadaSelection.selectedArray);
    return brigadas
      .filter((b) => ids.has(b.id))
      .map((b) => b.nombre)
      .join(', ');
  }, [brigadas, brigadaSelection.selectedArray]);



  const activosPorIncidente = useMemo(() => {

    const map = new Map<string, AsignacionActiva[]>();

    for (const a of activos) {

      const list = map.get(a.incidenteId) ?? [];

      list.push(a);

      map.set(a.incidenteId, list);

    }

    return Array.from(map.entries());

  }, [activos]);



  const handleAvanzarEstado = async (asignacion: AsignacionActiva) => {

    const siguiente = siguienteEstadoDespacho(asignacion.estadoDespacho);

    if (!siguiente) return;

    setActivosActionId(asignacion.id);

    try {

      await actualizarEstadoDespachoAsignacion(asignacion.id, siguiente);

      loadActivos();

    } finally {

      setActivosActionId(null);

    }

  };



  const handleCerrarIncidente = async (incidenteId: string) => {

    setCerrandoIncidenteId(incidenteId);

    try {

      await cerrarIncidenteDespacho(incidenteId);

      loadActivos();

      refetchCola();

    } finally {

      setCerrandoIncidenteId(null);

    }

  };



  const handleDespachoRapido = async () => {

    if (!selectedIncidente || brigadaSelection.count === 0) return;

    setQuickDispatching(true);

    setQuickDispatchError('');

    try {

      await ejecutarDespachoRapido(
        selectedIncidente.incidenteId,
        brigadaSelection.selectedArray,
        displayName || username || 'despachador',
      );

      setQuickDispatchOpen(false);

      brigadaSelection.clear();

      setSelectedIncidente(null);

      setSearchParams({});

      refetchCola();

      loadActivos();

      setTab('activos');

    } catch (e) {

      setQuickDispatchError(e instanceof Error ? e.message : 'Error al despachar');

      setQuickDispatchOpen(false);

    } finally {

      setQuickDispatching(false);

    }

  };



  const selectIncidente = (item: DespachoColaItem) => {

    setSelectedIncidente(item);

    brigadaSelection.clear();

    setQuickDispatchError('');

    setSearchParams({ incidente: item.incidenteId });

  };



  const riesgoDetalle =

    detalle?.zonaRiesgo?.nivel ?? selectedIncidente?.zonaNivelRiesgo;



  return (

    <>

      <Topbar title="Despacho operativo" subtitle="Cola, asignación y activos en terreno" />

      <AppPage>

        {colaData?.recursosDegraded && (

          <Alert variant="warning" className="mb-3 d-flex align-items-start gap-2">

            <i className="bi bi-exclamation-triangle-fill mt-1" aria-hidden />

            <div>

              <strong>Recursos en modo degradado.</strong> La elegibilidad de brigadas puede no

              reflejar la dotación real. Revise el módulo Recursos si ve brigadas incompletas sin

              motivo claro.

            </div>

          </Alert>

        )}



        <div className="rev-despacho-ops-bar rev-card">

          <div className="rev-despacho-ops-bar__kpis">

            <span className="rev-despacho-ops-kpi">

              <i className="bi bi-inbox" aria-hidden />

              Cola: <strong>{colaData?.cola.length ?? 0}</strong>

            </span>

            <span className="rev-despacho-ops-kpi rev-despacho-ops-kpi--ok">

              <i className="bi bi-people-fill" aria-hidden />

              Brigadas listas:{' '}

              <strong>

                {brigadasListas}/{brigadas.length}

              </strong>

            </span>

            <span className="rev-despacho-ops-kpi rev-despacho-ops-kpi--warn">

              <i className="bi bi-truck" aria-hidden />

              En terreno: <strong>{activos.length}</strong>

            </span>

          </div>

          <nav className="rev-despacho-steps" aria-label="Pasos de asignación">

            <span

              className={`rev-despacho-steps__item${pasoActual >= 1 ? ' rev-despacho-steps__item--active' : ''}${pasoActual > 1 ? ' rev-despacho-steps__item--done' : ''}`}

            >

              <i className="bi bi-1-circle" aria-hidden /> Incidente

            </span>

            <span className="rev-despacho-steps__sep" aria-hidden>

              ›

            </span>

            <span

              className={`rev-despacho-steps__item${pasoActual >= 2 ? ' rev-despacho-steps__item--active' : ''}${pasoActual > 2 ? ' rev-despacho-steps__item--done' : ''}`}

            >

              <i className="bi bi-2-circle" aria-hidden /> Brigada

            </span>

            <span className="rev-despacho-steps__sep" aria-hidden>

              ›

            </span>

            <span

              className={`rev-despacho-steps__item${pasoActual >= 3 ? ' rev-despacho-steps__item--active' : ''}`}

            >

              <i className="bi bi-3-circle" aria-hidden /> Confirmar

            </span>

          </nav>

        </div>



        <Tab.Container activeKey={tab} onSelect={(k) => setTab((k as 'cola' | 'activos') ?? 'cola')}>

          <Nav variant="tabs" className="mb-3 rev-despacho-tabs">

            <Nav.Item>

              <Nav.Link eventKey="cola">

                Cola de despacho

                <span className="rev-despacho-tab-badge">{colaData?.cola.length ?? 0}</span>

              </Nav.Link>

            </Nav.Item>

            <Nav.Item>

              <Nav.Link eventKey="activos">

                Activos en terreno

                <span className="rev-despacho-tab-badge">{activos.length}</span>

              </Nav.Link>

            </Nav.Item>

          </Nav>



          <Tab.Content>

            <Tab.Pane eventKey="cola">

              <StateView

                state={loading ? 'loading' : error ? 'error' : 'idle'}

                errorMessage={error ?? undefined}

                onRetry={refetchCola}

              >

                <div className="rev-despacho-operacion">

                  <section className="rev-despacho-panel-col rev-despacho-operacion__cola">

                    <header className="rev-despacho-panel-col__head">

                      <h2 className="rev-despacho-panel-col__title">

                        <i className="bi bi-list-ul" aria-hidden />

                        Cola pendiente

                      </h2>

                      <span className="rev-despacho-panel-col__count">{colaFiltrada.length}</span>

                    </header>

                    <div className="rev-despacho-panel-col__tools">

                      <Form.Control

                        size="sm"

                        type="search"

                        placeholder="Buscar folio, tipo o descripción…"

                        value={colaSearch}

                        onChange={(e) => setColaSearch(e.target.value)}

                        aria-label="Buscar en cola"

                      />

                      <div className="rev-despacho-filter-chips" role="group" aria-label="Filtrar por riesgo">

                        {(

                          [

                            ['', 'Todos'],

                            ['HIGH', 'Alto'],

                            ['MEDIUM', 'Medio'],

                            ['LOW', 'Bajo'],

                            ['DESCONOCIDO', 'Sin dato'],

                          ] as const

                        ).map(([value, label]) => (

                          <button

                            key={value || 'all'}

                            type="button"

                            className={`rev-despacho-filter-chip${riesgoFiltro === value ? ' rev-despacho-filter-chip--active' : ''}`}

                            onClick={() => setRiesgoFiltro(value)}

                          >

                            {label}

                          </button>

                        ))}

                      </div>

                    </div>

                    <div className="rev-despacho-panel-col__body">

                      {colaFiltrada.length === 0 ? (

                        <div className="rev-despacho-empty">

                          <i className="bi bi-inbox" aria-hidden />

                          <p className="mb-0">

                            {colaData?.cola.length

                              ? 'Ningún incidente coincide con el filtro.'

                              : 'No hay incidentes en cola de despacho.'}

                          </p>

                        </div>

                      ) : (

                        <ul className="rev-despacho-cola-list">

                          {colaFiltrada.map((item) => (

                            <li key={item.incidenteId}>

                              <button

                                type="button"

                                className={`rev-despacho-cola-item ${colaRiskClass(item.zonaNivelRiesgo)}${selectedIncidente?.incidenteId === item.incidenteId ? ' selected' : ''}`}

                                onClick={() => selectIncidente(item)}

                              >

                                <i

                                  className={`bi ${tipoIncidenteIcon(item.tipo)} rev-despacho-cola-item__icon`}

                                  aria-hidden

                                />

                                <span className="rev-despacho-cola-item__folio">

                                  {item.folio ?? item.incidenteId.slice(0, 12)}

                                </span>

                                <span className="rev-despacho-cola-item__badges">

                                  <Badge bg="secondary" className="rev-despacho-table__badge">

                                    {estadoIncidenteLabel(item.estado)}

                                  </Badge>

                                  {item.zonaNivelRiesgo && (

                                    <RiskBadge nivel={item.zonaNivelRiesgo} />

                                  )}

                                </span>

                                <span className="rev-despacho-cola-item__desc">

                                  {item.tipo} — {item.descripcion}

                                  {item.createdAt && (
                                    <span className="rev-despacho-cola-item__time text-muted small d-block">
                                      Registrado {tiempoRelativo(item.createdAt)}
                                    </span>
                                  )}

                                </span>

                              </button>

                            </li>

                          ))}

                        </ul>

                      )}

                    </div>

                  </section>



                  <section className="rev-despacho-panel-col rev-despacho-operacion__detalle">

                    <header className="rev-despacho-panel-col__head">

                      <h2 className="rev-despacho-panel-col__title">

                        <i className="bi bi-card-text" aria-hidden />

                        Incidente seleccionado

                      </h2>

                    </header>

                    <div className="rev-despacho-panel-col__body">

                      {!selectedIncidente ? (

                        <div className="rev-despacho-empty">

                          <i className="bi bi-cursor" aria-hidden />

                          <p className="mb-0">Elija un incidente de la cola para ver detalle y asignar brigada.</p>

                        </div>

                      ) : (

                        <article className="rev-despacho-incidente">

                          <h3 className="rev-despacho-incidente__headline">

                            {selectedIncidente.folio ?? 'Sin folio'}

                          </h3>

                          <div className="rev-despacho-incidente__chips">

                            <Badge bg="secondary">{estadoIncidenteLabel(selectedIncidente.estado)}</Badge>

                            <Badge bg="dark">{selectedIncidente.tipo}</Badge>

                            {riesgoDetalle && <RiskBadge nivel={riesgoDetalle} />}

                          </div>

                          <p className="rev-despacho-incidente__desc">{selectedIncidente.descripcion}</p>

                          <div className="rev-despacho-incidente__meta">

                            <div className="rev-despacho-incidente__meta-row">

                              <i className="bi bi-geo-alt" aria-hidden />

                              <span>

                                {detalle?.incidente.zonaNombre ?? selectedIncidente.zonaNombre ?? 'Zona no indicada'}

                              </span>

                            </div>

                            {selectedIncidente.lat != null && selectedIncidente.lng != null && (

                              <div className="rev-despacho-incidente__meta-row">

                                <i className="bi bi-crosshair" aria-hidden />

                                <span>

                                  {selectedIncidente.lat.toFixed(4)}, {selectedIncidente.lng.toFixed(4)}

                                </span>

                              </div>

                            )}

                          </div>

                          <div className="rev-despacho-incidente__actions">

                            <Link

                              to={`/incidentes/${selectedIncidente.incidenteId}`}

                              className="btn btn-sm btn-outline-secondary"

                            >

                              <i className="bi bi-file-earmark-text me-1" aria-hidden />

                              Ficha completa

                            </Link>

                            {selectedIncidente.lat != null && selectedIncidente.lng != null && (

                              <Link to="/zonas" className="btn btn-sm btn-outline-secondary">

                                <i className="bi bi-map me-1" aria-hidden />

                                Ver en mapa

                              </Link>

                            )}

                          </div>

                        </article>

                      )}

                    </div>

                  </section>



                  <section className="rev-despacho-panel-col rev-despacho-operacion__brigadas">

                    <header className="rev-despacho-panel-col__head">

                      <h2 className="rev-despacho-panel-col__title">

                        <i className="bi bi-people" aria-hidden />

                        Brigadas

                      </h2>

                      <span className="rev-despacho-panel-col__count">{brigadas.length}</span>

                    </header>

                    <div className="rev-despacho-panel-col__body">

                      <BrigadaSeleccionList
                        brigadas={brigadas}
                        selection={brigadaSelection}
                        enabled={!!selectedIncidente}
                        onToggle={() => setQuickDispatchError('')}
                      />

                      {selectedIncidente && (
                        <>
                          {quickDispatchError && (
                            <Alert variant="danger" className="small py-2 mt-2 mb-0">
                              {quickDispatchError}
                            </Alert>
                          )}
                          <BrigadaBulkActionBar
                            count={brigadaSelection.count}
                            onDespachar={() => setShowDespachoWizard(true)}
                            onDespachoRapido={() => {
                              setQuickDispatchError('');
                              setQuickDispatchOpen(true);
                            }}
                            despachoRapidoLoading={quickDispatching}
                            onClear={brigadaSelection.clear}
                          />
                        </>
                      )}

                    </div>

                  </section>

                </div>



              </StateView>

            </Tab.Pane>



            <Tab.Pane eventKey="activos">

              {activosLoading ? (

                <p className="text-muted d-flex align-items-center gap-2">

                  <span className="spinner-border spinner-border-sm" role="status" />

                  Cargando activos en terreno…

                </p>

              ) : activos.length === 0 ? (

                <div className="rev-despacho-empty rev-card p-4">

                  <i className="bi bi-truck" aria-hidden />

                  <p className="mb-2">No hay brigadas asignadas en terreno en este momento.</p>

                  <Button variant="outline-primary" size="sm" onClick={() => setTab('cola')}>

                    Ir a cola de despacho

                  </Button>

                </div>

              ) : (

                <div className="rev-despacho-activos-incidentes">

                  {activosPorIncidente.map(([incidenteId, asignaciones]) => {

                    return (

                      <section key={incidenteId} className="rev-despacho-activos-incidente rev-card">

                        <header className="rev-despacho-activos-incidente__head">

                          <div>

                            <h3 className="h6 mb-1">

                              Incidente {incidenteId.slice(0, 8)}…

                            </h3>

                            <p className="small text-muted mb-0">

                              {asignaciones.length} brigada{asignaciones.length !== 1 ? 's' : ''} asignada

                              {asignaciones.length !== 1 ? 's' : ''}

                            </p>

                          </div>

                          <Button

                            size="sm"

                            variant="outline-danger"

                            disabled={cerrandoIncidenteId === incidenteId}

                            title="Cierra el incidente y libera todas las brigadas (resuelto, falsa alarma o error)"

                            onClick={() => handleCerrarIncidente(incidenteId)}

                          >

                            {cerrandoIncidenteId === incidenteId ? (

                              <>

                                <span className="spinner-border spinner-border-sm me-1" role="status" />

                                Cerrando…

                              </>

                            ) : (

                              <>

                                <i className="bi bi-check-circle me-1" aria-hidden />

                                Cerrar incidente

                              </>

                            )}

                          </Button>

                        </header>



                        <div className="rev-despacho-activos-grid">

                          {asignaciones.map((a) => {

                            const accion = accionEstadoDespachoLabel(a.estadoDespacho);

                            return (

                              <article

                                key={a.id}

                                className={`rev-despacho-activos-card ${estadoDespachoCardClass(a.estadoDespacho)}`}

                              >

                                <div className="rev-despacho-activos-card__head">

                                  <div>

                                    <strong>{a.brigadaNombre ?? `Brigada #${a.brigadaId}`}</strong>

                                    {a.vehiculoPatente && (

                                      <Badge bg="secondary" className="ms-2">

                                        {a.vehiculoPatente}

                                      </Badge>

                                    )}

                                    <p className="rev-despacho-activos-card__estado mb-0 mt-1">

                                      {estadoDespachoLabel(a.estadoDespacho)}

                                    </p>

                                  </div>

                                </div>



                                <div className="rev-despacho-activos-card__actions">

                                  {accion && (

                                    <Button

                                      size="sm"

                                      variant="primary"

                                      disabled={activosActionId === a.id}

                                      onClick={() => handleAvanzarEstado(a)}

                                    >

                                      {activosActionId === a.id ? (

                                        <>

                                          <span className="spinner-border spinner-border-sm me-1" role="status" />

                                          Actualizando…

                                        </>

                                      ) : (

                                        accion

                                      )}

                                    </Button>

                                  )}

                                  <Button

                                    size="sm"

                                    variant="outline-warning"

                                    onClick={() =>

                                      liberarAsignacion(a.id).then(() => {

                                        loadActivos();

                                        refetchCola();

                                      })

                                    }

                                  >

                                    Liberar

                                  </Button>

                                </div>



                                <Link

                                  to={`/incidentes/${a.incidenteId}`}

                                  className="btn btn-sm btn-link p-0 align-self-start"

                                >

                                  Ver ficha del incidente

                                </Link>

                              </article>

                            );

                          })}

                        </div>

                      </section>

                    );

                  })}

                </div>

              )}

            </Tab.Pane>

          </Tab.Content>

        </Tab.Container>

      </AppPage>

      <DespachoWizard
        show={showDespachoWizard}
        brigadaIds={brigadaSelection.selectedArray}
        despachadoPor={displayName || username || 'despachador'}
        incidenteIdPreseleccionado={selectedIncidente?.incidenteId ?? incidenteParam}
        onHide={() => {
          setShowDespachoWizard(false);
          brigadaSelection.clear();
        }}
        onSuccess={() => {
          refetchCola();
          loadActivos();
          setTab('activos');
        }}
      />

      <ConfirmDialog
        show={quickDispatchOpen}
        title="Despacho rápido"
        message={
          selectedIncidente
            ? `Se despachará ${selectedIncidente.folio ?? 'el incidente seleccionado'} con dotación completa (integrantes, vehículos y kit por defecto) hacia: ${brigadasSeleccionadasNombres || 'las brigadas seleccionadas'}.`
            : 'Confirme el despacho rápido con la dotación completa.'
        }
        confirmLabel="Sí, despachar"
        cancelLabel="Seguir revisando"
        variant="primary"
        onConfirm={() => void handleDespachoRapido()}
        onCancel={() => setQuickDispatchOpen(false)}
      />

    </>

  );

}

