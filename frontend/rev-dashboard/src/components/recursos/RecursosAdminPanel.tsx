import { useState } from 'react';
import { Badge, Button, Form, Table } from 'react-bootstrap';
import type { RecursosCatalogo } from '../../api';
import type { useBrigadaSelection } from '../../hooks/useBrigadaSelection';
import type { useBrigadasResumen } from '../../hooks/useBrigadasResumen';
import { labelListaDespacho, labelEstadoOperacion } from '../../utils/recursosLabels';
import BrigadaBulkActionBar from '../shared/BrigadaBulkActionBar';
import DotacionWizard from './DotacionWizard';
import RecursosAltaHub from './RecursosAltaHub';
import RecursosGlosario from './RecursosGlosario';

interface RecursosAdminPanelProps {
  catalogo: RecursosCatalogo;
  onRefresh: () => void;
  brigadasResumen: ReturnType<typeof useBrigadasResumen>;
  brigadaSelection: ReturnType<typeof useBrigadaSelection>;
  onDespacharSeleccion: () => void;
}

export default function RecursosAdminPanel({
  catalogo,
  onRefresh,
  brigadasResumen,
  brigadaSelection,
  onDespacharSeleccion,
}: RecursosAdminPanelProps) {
  const [dotacionBrigadaId, setDotacionBrigadaId] = useState<number | null>(null);

  const {
    resumenes,
    loading: resumenLoading,
    brigadasListas,
    refreshOne,
    reload,
  } = brigadasResumen;

  const handleRefresh = () => {
    onRefresh();
    reload();
  };

  const handleDotacionSaved = () => {
    handleRefresh();
    if (dotacionBrigadaId != null) {
      refreshOne(dotacionBrigadaId);
    }
  };

  return (
    <div className="rev-recursos-admin">
      <RecursosGlosario
        brigadasListas={brigadasListas}
        brigadasTotal={catalogo.brigadas.length}
      />

      <RecursosAltaHub
        onRefresh={handleRefresh}
        counts={{
          brigadistas: catalogo.brigadistas.length,
          vehiculos: catalogo.vehiculos.length,
          herramientas: catalogo.herramientas.length,
          brigadas: catalogo.brigadas.length,
        }}
      />

      <section className="rev-recursos-admin__section">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div>
            <h2 className="h6 rev-recursos-admin__heading mb-1">Brigadas operativas</h2>
            <p className="small text-muted mb-0">
              Configure la dotación de cada brigada y verifique si está lista para despacho.
            </p>
          </div>
        </div>

        <div className="rev-card p-3">
          {resumenLoading && (
            <p className="text-muted small">Cargando estado de brigadas…</p>
          )}
          <div className="table-responsive">
            <Table hover className="rev-data-table rev-data-table--compact mb-0">
              <thead>
                <tr>
                  <th className="rev-recursos-table__check-col">
                    <Form.Check
                      type="checkbox"
                      aria-label="Seleccionar todas"
                      checked={brigadaSelection.allVisibleSelected}
                      onChange={brigadaSelection.toggleSelectAllVisible}
                    />
                  </th>
                  <th>Brigada</th>
                  <th>Cupo máx.</th>
                  <th>Integrantes</th>
                  <th>Vehículos</th>
                  <th>Operación</th>
                  <th>Despacho</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {catalogo.brigadas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-muted small text-center py-4">
                      No hay brigadas. Use <strong>Agregar recurso → Brigada</strong> para crear la
                      primera.
                    </td>
                  </tr>
                ) : (
                  catalogo.brigadas.map((b) => {
                    const resumen = resumenes[b.id];
                    const eleg = resumen?.elegibilidad;
                    const integ = eleg?.integrantes ?? 0;
                    const cap = eleg?.capacidadBrigada ?? b.capacidad;
                    const lista = eleg?.listaParaDespacho ?? false;
                    const selectable = brigadaSelection.canSelect({
                      id: b.id,
                      estado: b.estado,
                      listaParaDespacho: lista,
                    });
                    return (
                      <tr key={b.id}>
                        <td className="rev-recursos-table__check-col">
                          <Form.Check
                            type="checkbox"
                            aria-label={`Seleccionar ${b.nombre}`}
                            checked={brigadaSelection.isSelected(b.id)}
                            disabled={!selectable}
                            onChange={() => brigadaSelection.toggle(b.id)}
                          />
                        </td>
                        <td>
                          <span className="rev-recursos-table__name">{b.nombre}</span>
                          {b.codigo && (
                            <span className="d-block small text-muted">{b.codigo}</span>
                          )}
                        </td>
                        <td>{b.capacidad}</td>
                        <td className="small">
                          {resumenLoading && !resumen ? '…' : `${integ} / ${cap}`}
                        </td>
                        <td className="small text-muted">
                          {resumen
                            ? resumen.vehiculoCount > 0
                              ? resumen.vehiculoPatentes
                              : '—'
                            : '…'}
                        </td>
                        <td>
                          <Badge bg={b.estado === 'DISPONIBLE' ? 'secondary' : 'warning'} text="dark">
                            {labelEstadoOperacion(b.estado)}
                          </Badge>
                        </td>
                        <td>
                          {resumenLoading && !eleg ? (
                            <span className="text-muted small">…</span>
                          ) : (
                            <Badge bg={lista ? 'success' : 'warning'} text={lista ? undefined : 'dark'}>
                              {labelListaDespacho(lista)}
                            </Badge>
                          )}
                        </td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={b.estado === 'ASIGNADO'}
                            onClick={() => setDotacionBrigadaId(b.id)}
                          >
                            Configurar dotación
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
          <BrigadaBulkActionBar
            count={brigadaSelection.count}
            onDespachar={onDespacharSeleccion}
            onDotacion={
              brigadaSelection.count === 1
                ? () => setDotacionBrigadaId(brigadaSelection.selectedArray[0])
                : undefined
            }
            onClear={brigadaSelection.clear}
            dotacionDisabled={brigadaSelection.count === 1 && catalogo.brigadas.find(
              (x) => x.id === brigadaSelection.selectedArray[0],
            )?.estado === 'ASIGNADO'}
          />
        </div>
      </section>

      <DotacionWizard
        show={dotacionBrigadaId != null}
        brigadaId={dotacionBrigadaId}
        catalogo={catalogo}
        onHide={() => setDotacionBrigadaId(null)}
        onSaved={handleDotacionSaved}
        onElegibilidadRefresh={refreshOne}
      />
    </div>
  );
}
