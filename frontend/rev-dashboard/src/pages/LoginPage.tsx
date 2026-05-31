import { FormEvent, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import ErrorAlert from '../components/ErrorAlert';

export default function LoginPage() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(user, pass);
      navigate('/');
    } catch {
      setError('Credenciales invalidas');
    }
  };

  return (
    <Container className="rev-login-wrap">
      <Row className="justify-content-center mt-5">
        <Col md={5} lg={4}>
          <Card className="rev-card">
            <Card.Body className="text-center">
              <div className="rev-logo-mark mx-auto">
                <span>R<em>V</em></span>
              </div>
              <Card.Title className="rev-login-title mb-1">
                Red de Emergencia Valle
              </Card.Title>
              <Card.Subtitle className="rev-login-subtitle mb-4">
                Municipalidad de Valle del Sol
              </Card.Subtitle>
              <Alert variant="info" className="small text-start mb-0">
                <strong>Usuarios dev</strong> (clave <strong>rev123</strong> para todos):
                <ul className="mb-0 mt-2 ps-3">
                  <li><strong>despachador</strong> — rol Despachador</li>
                  <li><strong>brigadista</strong> — rol Brigadista (consulta)</li>
                  <li><strong>admin</strong> — rol Admin + consola Keycloak</li>
                </ul>
              </Alert>
              <Form onSubmit={handleSubmit} className="text-start">
                <Form.Group className="mb-3">
                  <Form.Label>Usuario</Form.Label>
                  <Form.Control
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Clave</Form.Label>
                  <Form.Control
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </Form.Group>
                <ErrorAlert message={error} onClose={() => setError('')} />
                <Button type="submit" variant="primary" className="w-100">
                  Ingresar
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
