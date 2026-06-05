import { useCallback, useEffect, useMemo, useState } from 'react';

import { Alert, Badge, Button, Form, Nav, Tab } from 'react-bootstrap';
import DespachoWizard from '../components/despacho/DespachoWizard';
import BrigadaBulkActionBar from '../components/shared/BrigadaBulkActionBar';
import { useBrigadaSelection } from '../hooks/useBrigadaSelection';

import { Link, useSearchParams } from 'react-router-dom';

import {

  AsignarRecurso,

  DespachoBrigadaCard,

  DespachoColaItem,

  asignarRecurso,

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



type RiesgoFiltro = '' | 'HIGH' | 'MEDIUM' | 'LOW' | 'DESCONOCIDO';



function colaRiskClass(nivel?: string): string {

  if (nivel === 'HIGH') return 'rev-despacho-cola-item--risk-high';

  if (nivel === 'MEDIUM') return 'rev-despacho-cola-item--risk-medium';

  if (nivel === 'LOW') return 'rev-despacho-cola-item--risk-low';

  return '';

}



function semaforoClass(lista: boolean): string {

  return lista ? 'rev-despacho-semaforo--ok' : 'rev-despacho-semaforo--warn';

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

  const [selectedBrigada, setSelectedBrigada] = useState<DespachoBrigadaCard | null>(null);

  const [vehiculoDespachoId, setVehiculoDespachoId] = useState<number | ''>('');

  const [assigning, setAssigning] = useState(false);

  const [assignError, setAssignError] = useState('');

  const [colaSearch, setColaSearch] = useState('');

  const [riesgoFiltro, setRiesgoFiltro] = useState<RiesgoFiltro>('');

  const [showDespachoWizard, setShowDespachoWizard] = useState(false);

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



  useEffect(() => {

    if (!selectedBrigada?.detalle) {

      setVehiculoDespachoId('');

      return;

    }

    const principal =

      selectedBrigada.detalle.vehiculos?.find((v) => v.principal)?.vehiculoId ??

      selectedBrigada.detalle.vehiculoId;

    setVehiculoDespachoId(principal ?? '');

  }, [selectedBrigada]);



  const brigadas = colaData?.brigadasDisponibles ?? [];



  const brigadasSorted = useMemo(

    () =>

      [...brigadas].sort((a, b) => {

        if (a.listaParaDespacho !== b.listaParaDespacho) {

          return a.listaParaDespacho ? -1 : 1;

        }

        return a.nombre.localeCompare(b.nombre, 'es');

      }),

    [brigadas],

  );



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



  const vehiculosOpciones = useMemo(() => {

    if (!selectedBrigada?.detalle?.vehiculos?.length) {

      const v = selectedBrigada?.detalle?.vehiculo;

      return v ? [{ id: v.id, label: `${v.patente} (${v.tipo})` }] : [];

    }

    return selectedBrigada.detalle.vehiculos.map((v) => ({

      id: v.vehiculoId,

      label: `${v.patente ?? ''} ${v.tipo ?? ''}`.trim(),

    }));

  }, [selectedBrigada]);



  const pasoActual = selectedIncidente && selectedBrigada ? 3 : selectedIncidente ? 2 : 1;



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



  const handleAsignar = async () => {

    if (!selectedIncidente || !selectedBrigada) return;

    setAssigning(true);

    setAssignError('');

    try {

      const payload: AsignarRecurso = {

        incidenteId: selectedIncidente.incidenteId,

        brigadaId: selectedBrigada.id,

        vehiculoId: vehiculoDespachoId ? Number(vehiculoDespachoId) : undefined,

        usarComposicionBrigada: true,

        despachadoPor: displayName || username || 'despachador',

      };

      await asignarRecurso(payload);

      setSelectedIncidente(null);

      setSelectedBrigada(null);

      setSearchParams({});

      refetchCola();

      loadActivos();

      setTab('activos');

    } catch (e) {

      setAssignError(e instanceof Error ? e.message : 'Error al despachar');

    } finally {

      setAssigning(false);

    }

  };



  const selectIncidente = (item: DespachoColaItem) => {

    setSelectedIncidente(item);

    setSelectedBrigada(null);

    setAssignError('');

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

                      <span className="rev-despacho-panel-col__count">{brigadasSorted.length}</span>

                    </header>

                    <div className="rev-despacho-panel-col__body">

                      {!selectedIncidente ? (

                        <p className="rev-despacho-brigadas-hint mb-0">

                          Seleccione primero un incidente para habilitar la asignación de brigada.

                        </p>

                      ) : brigadasSorted.length === 0 ? (

                        <div className="rev-despacho-empty">

                          <i className="bi bi-people" aria-hidden />

                          <p className="mb-2">No hay brigadas registradas como disponibles.</p>

                          <Link to="/recursos" className="btn btn-sm btn-outline-primary">

                            Ir a Recursos

                          </Link>

                        </div>

                      ) : (

                        <div className="rev-despacho-brigadas-list">

                          {brigadasSorted.map((b) => {

                            const cap = b.elegibilidad?.capacidadBrigada ?? 0;

                            const integ = b.elegibilidad?.integrantes ?? 0;

                            const pct = cap > 0 ? Math.min(100, Math.round((integ / cap) * 100)) : 0;

                            const bulkSelectable = brigadaSelection.canSelect({
                              id: b.id,
                              estado: b.estado,
                              listaParaDespacho: b.listaParaDespacho,
                            });

                            return (

                              <button

                                key={b.id}

                                type="button"

                                className={`rev-despacho-brigada-card${selectedBrigada?.id === b.id ? ' selected' : ''}`}

                                onClick={() => {

                                  setSelectedBrigada(b);

                                  setAssignError('');

                                }}

                              >

                                <div className="rev-despacho-brigada-card__row">

                                  <Form.Check
                                    type="checkbox"
                                    className="rev-despacho-brigada-card__check"
                                    aria-label={`Seleccionar ${b.nombre} para despacho masivo`}
                                    checked={brigadaSelection.isSelected(b.id)}
                                    disabled={!bulkSelectable || !selectedIncidente}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={() => brigadaSelection.toggle(b.id)}
                                  />

                                  <span className={`rev-despacho-semaforo ${semaforoClass(b.listaParaDespacho)}`} />

                                  <span className="rev-despacho-brigada-card__nombre">{b.nombre}</span>

                                  <span

                                    className={`rev-despacho-brigada-card__estado ${b.listaParaDespacho ? 'rev-despacho-brigada-card__estado--ok' : 'rev-despacho-brigada-card__estado--warn'}`}

                                  >

                                    {b.listaParaDespacho ? 'Lista' : 'Incompleta'}

                                  </span>

                                </div>

                                {cap > 0 && (

                                  <>

                                    <div className="rev-despacho-brigada-card__progress" aria-hidden>

                                      <div

                                        className={`rev-despacho-brigada-card__progress-bar${b.listaParaDespacho ? ' rev-despacho-brigada-card__progress-bar--ok' : ''}`}

                                        style={{ width: `${pct}%` }}

                                      />

                                    </div>

                                    <span className="rev-despacho-brigada-card__meta">

                                      Dotación {integ}/{cap} integrantes

                                      {b.elegibilidad?.capacidadPasajerosVehiculoPrincipal != null &&

                                        ` · ${b.elegibilidad.capacidadPasajerosVehiculoPrincipal} plazas vehículo principal`}

                                    </span>

                                  </>

                                )}

                                {!b.listaParaDespacho && b.elegibilidad?.motivos?.length ? (

                                  <ul className="rev-despacho-brigada-card__motivos">

                                    {b.elegibilidad.motivos.map((m) => (

                                      <li key={m}>{m}</li>

                                    ))}

                                  </ul>

                                ) : null}

                              </button>

                            );

                          })}

                        </div>

                      )}

                      {selectedIncidente && (
                        <BrigadaBulkActionBar
                          count={brigadaSelection.count}
                          onDespachar={() => setShowDespachoWizard(true)}
                          onClear={brigadaSelection.clear}
                        />
                      )}

                    </div>

                  </section>

                </div>



                {selectedIncidente && selectedBrigada && (

                  <aside className="rev-despacho-dock" aria-label="Confirmar despacho">

                    <div className="rev-despacho-dock__grid">

                      <div>

                        <h3 className="h6 mb-2">Confirmar despacho</h3>

                        <div className="rev-despacho-dock__summary">

                          <span>

                            <i className="bi bi-fire me-1 text-danger" aria-hidden />

                            <strong>{selectedIncidente.folio ?? 'Incidente'}</strong>

                          </span>

                          <span className="rev-despacho-dock__arrow" aria-hidden>

                            →

                          </span>

                          <span>

                            <i className="bi bi-people me-1" aria-hidden />

                            <strong>{selectedBrigada.nombre}</strong>

                          </span>

                          {selectedBrigada.detalle?.jefe && (

                            <span className="text-muted small">

                              Jefe: {selectedBrigada.detalle.jefe.nombre}{' '}

                              {selectedBrigada.detalle.jefe.apellido}

                            </span>

                          )}

                        </div>

                        {vehiculosOpciones.length > 1 && (

                          <Form.Group className="mb-2 mt-2">

                            <Form.Label className="small mb-1">Vehículo de salida</Form.Label>

                            <Form.Select

                              size="sm"

                              value={vehiculoDespachoId}

                              onChange={(e) => setVehiculoDespachoId(Number(e.target.value))}

                            >

                              {vehiculosOpciones.map((v) => (

                                <option key={v.id} value={v.id}>

                                  {v.label}

                                </option>

                              ))}

                            </Form.Select>

                          </Form.Group>

                        )}

                        {!selectedBrigada.listaParaDespacho && (

                          <Alert variant="warning" className="small py-2 mb-2">

                            <strong>Brigada incompleta.</strong>{' '}

                            {selectedBrigada.elegibilidad?.motivos?.length

                              ? selectedBrigada.elegibilidad.motivos.join(' · ')

                              : 'Complete dotación en Recursos.'}{' '}

                            <Link to="/recursos" className="alert-link">

                              Completar dotación

                            </Link>

                          </Alert>

                        )}

                        {assignError && (

                          <Alert variant="danger" className="small py-2 mb-2">

                            {assignError}

                          </Alert>

                        )}

                      </div>

                      <div className="d-flex flex-column gap-2 align-items-stretch align-items-md-end">

                        <Button

                          variant="outline-secondary"

                          size="sm"

                          onClick={() => {

                            setSelectedBrigada(null);

                            setAssignError('');

                          }}

                        >

                          Cambiar brigada

                        </Button>

                        <Button

                          variant="success"

                          size="lg"

                          disabled={assigning || !selectedBrigada.listaParaDespacho}

                          onClick={handleAsignar}

                        >

                          {assigning ? (

                            <>

                              <span className="spinner-border spinner-border-sm me-2" role="status" />

                              Despachando…

                            </>

                          ) : (

                            <>

                              <i className="bi bi-send-check me-2" aria-hidden />

                              Confirmar despacho

                            </>

                          )}

                        </Button>

                      </div>

                    </div>

                  </aside>

                )}

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
          setSelectedBrigada(null);
          setTab('activos');
        }}
      />

    </>

  );

}

