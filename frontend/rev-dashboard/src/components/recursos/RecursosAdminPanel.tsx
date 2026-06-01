import { FormEvent, useState } from 'react';
import { Badge, Button, Col, Form, Row, Table } from 'react-bootstrap';
import {
  RecursosCatalogo,
  createBrigada,
  createBrigadista,
  createHerramienta,
  createVehiculo,
} from '../../api';
import { formatRecursoEstado } from '../../utils/recursosUtils';
import BrigadaComposicionModal from './BrigadaComposicionModal';

interface RecursosAdminPanelProps {
  catalogo: RecursosCatalogo;
  onRefresh: () => void;
}

export default function RecursosAdminPanel({ catalogo, onRefresh }: RecursosAdminPanelProps) {
  const [composicionBrigadaId, setComposicionBrigadaId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [brigadaNombre, setBrigadaNombre] = useState('');
  const [brigadaCapacidad, setBrigadaCapacidad] = useState('8');
  const [brigNombre, setBrigNombre] = useState('');
  const [brigApellido, setBrigApellido] = useState('');
  const [brigRut, setBrigRut] = useState('');
  const [brigEsp, setBrigEsp] = useState('');
  const [vehPatente, setVehPatente] = useState('');
  const [vehTipo, setVehTipo] = useState('CAMIONETA');
  const [herNombre, setHerNombre] = useState('');
  const [herCantidad, setHerCantidad] = useState('1');

  const runCreate = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al registrar');
    } finally {
      setBusy(false);
    }
  };

  const handleBrigada = (e: FormEvent) => {
    e.preventDefault();
    runCreate(() =>
      createBrigada({ nombre: brigadaNombre.trim(), capacidad: Number(brigadaCapacidad) }),
    ).then(() => {
      setBrigadaNombre('');
    });
  };

  const handleBrigadista = (e: FormEvent) => {
    e.preventDefault();
    runCreate(() =>
      createBrigadista({
        nombre: brigNombre.trim(),
        apellido: brigApellido.trim(),
        rut: brigRut.trim() || undefined,
        especialidad: brigEsp.trim() || undefined,
      }),
    ).then(() => {
      setBrigNombre('');
      setBrigApellido('');
      setBrigRut('');
      setBrigEsp('');
    });
  };

  const handleVehiculo = (e: FormEvent) => {
    e.preventDefault();
    runCreate(() => createVehiculo({ patente: vehPatente.trim(), tipo: vehTipo.trim() })).then(() => {
      setVehPatente('');
    });
  };

  const handleHerramienta = (e: FormEvent) => {
    e.preventDefault();
    runCreate(() =>
      createHerramienta({ nombre: herNombre.trim(), cantidadTotal: Number(herCantidad) }),
    ).then(() => {
      setHerNombre('');
      setHerCantidad('1');
    });
  };

  return (
    <div className="rev-recursos-admin">
      <p className="text-muted small mb-3">
        Registre brigadistas, vehículos y herramientas; cree brigadas y arme su composición para
        despacho operativo.
      </p>

      {error && <p className="text-danger small">{error}</p>}

      <Row className="g-3 mb-4">
        <Col md={6} lg={3}>
          <div className="rev-card p-3 h-100">
            <h3 className="h6 mb-3">Nueva brigada</h3>
            <Form onSubmit={handleBrigada}>
              <Form.Group className="mb-2">
                <Form.Control
                  placeholder="Nombre"
                  value={brigadaNombre}
                  onChange={(e) => setBrigadaNombre(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="number"
                  min={1}
                  placeholder="Capacidad"
                  value={brigadaCapacidad}
                  onChange={(e) => setBrigadaCapacidad(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" size="sm" variant="primary" disabled={busy} className="w-100">
                Crear brigada
              </Button>
            </Form>
          </div>
        </Col>
        <Col md={6} lg={3}>
          <div className="rev-card p-3 h-100">
            <h3 className="h6 mb-3">Nuevo brigadista</h3>
            <Form onSubmit={handleBrigadista}>
              <Form.Group className="mb-2">
                <Form.Control
                  placeholder="Nombre"
                  value={brigNombre}
                  onChange={(e) => setBrigNombre(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  placeholder="Apellido"
                  value={brigApellido}
                  onChange={(e) => setBrigApellido(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  placeholder="Especialidad"
                  value={brigEsp}
                  onChange={(e) => setBrigEsp(e.target.value)}
                />
              </Form.Group>
              <Button type="submit" size="sm" variant="primary" disabled={busy} className="w-100">
                Registrar
              </Button>
            </Form>
          </div>
        </Col>
        <Col md={6} lg={3}>
          <div className="rev-card p-3 h-100">
            <h3 className="h6 mb-3">Nuevo vehículo</h3>
            <Form onSubmit={handleVehiculo}>
              <Form.Group className="mb-2">
                <Form.Control
                  placeholder="Patente"
                  value={vehPatente}
                  onChange={(e) => setVehPatente(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Select value={vehTipo} onChange={(e) => setVehTipo(e.target.value)}>
                  <option value="CAMIONETA">Camioneta</option>
                  <option value="CISTERNA">Cisterna</option>
                  <option value="AMBULANCIA">Ambulancia</option>
                  <option value="OTRO">Otro</option>
                </Form.Select>
              </Form.Group>
              <Button type="submit" size="sm" variant="primary" disabled={busy} className="w-100">
                Registrar
              </Button>
            </Form>
          </div>
        </Col>
        <Col md={6} lg={3}>
          <div className="rev-card p-3 h-100">
            <h3 className="h6 mb-3">Nueva herramienta</h3>
            <Form onSubmit={handleHerramienta}>
              <Form.Group className="mb-2">
                <Form.Control
                  placeholder="Nombre"
                  value={herNombre}
                  onChange={(e) => setHerNombre(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="number"
                  min={1}
                  value={herCantidad}
                  onChange={(e) => setHerCantidad(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" size="sm" variant="primary" disabled={busy} className="w-100">
                Agregar stock
              </Button>
            </Form>
          </div>
        </Col>
      </Row>

      <div className="rev-card p-3">
        <h3 className="h6 mb-3">Brigadas — armar composición</h3>
        <div className="table-responsive">
          <Table hover className="rev-data-table rev-data-table--compact mb-0">
            <thead>
              <tr>
                <th>Brigada</th>
                <th>Cap.</th>
                <th>Estado</th>
                <th>Vehículo</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {catalogo.brigadas.map((b) => {
                const veh = catalogo.vehiculos.find((v) => v.id === b.vehiculoId);
                return (
                  <tr key={b.id}>
                    <td>{b.nombre}</td>
                    <td>{b.capacidad}</td>
                    <td>
                      <Badge bg={b.estado === 'DISPONIBLE' ? 'secondary' : 'warning'} text="dark">
                        {formatRecursoEstado(b.estado)}
                      </Badge>
                    </td>
                    <td className="small text-muted">{veh ? veh.patente : '—'}</td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        disabled={b.estado === 'ASIGNADO'}
                        onClick={() => setComposicionBrigadaId(b.id)}
                      >
                        Composición
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>

      <BrigadaComposicionModal
        show={composicionBrigadaId != null}
        brigadaId={composicionBrigadaId}
        catalogo={catalogo}
        onHide={() => setComposicionBrigadaId(null)}
        onSaved={onRefresh}
      />
    </div>
  );
}
