import { useEffect, useState } from 'react';
import { DashboardItem, fetchDashboard, getToken, login } from './api';

export default function App() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(!!getToken());

  const load = async () => {
    try {
      setError('');
      setItems(await fetchDashboard());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    }
  };

  useEffect(() => {
    if (loggedIn) load();
  }, [loggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(user, pass);
      setLoggedIn(true);
    } catch {
      setError('Credenciales invalidas');
    }
  };

  if (!loggedIn) {
    return (
      <div className="app">
        <h1>REV - Panel Despachador</h1>
        <form onSubmit={handleLogin} className="card">
          <p>Usuario: despachador / rev123</p>
          <input placeholder="Usuario" value={user} onChange={(e) => setUser(e.target.value)} />
          {' '}
          <input type="password" placeholder="Clave" value={pass} onChange={(e) => setPass(e.target.value)} />
          {' '}
          <button type="submit">Ingresar</button>
          {error && <p style={{ color: '#f87171' }}>{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>REV - Despacho de Emergencias</h1>
        <button onClick={load}>Actualizar</button>
      </header>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {items.map((item) => (
        <article key={item.incidente.id} className="card">
          {item.degraded && (
            <div className="degraded">Modo degradado: recursos no disponibles (Circuit Breaker activo)</div>
          )}
          <h2>{item.incidente.tipo} — {item.incidente.estado}</h2>
          <p>{item.incidente.descripcion}</p>
          <p>
            <span className="badge">Riesgo: {item.zonaRiesgo.nivel}</span>
            {item.zonaRiesgo.cached && <span className="badge"> Cache</span>}
            {' '}
            <span className="badge">Geo: {item.incidente.lat}, {item.incidente.lng}</span>
          </p>
          <h3>Recursos asignados</h3>
          {item.recursos.length === 0 ? (
            <p>Sin recursos asignados</p>
          ) : (
            <ul>
              {item.recursos.map((r, i) => (
                <li key={i}>{r.tipo}: {r.descripcion} ({r.estado})</li>
              ))}
            </ul>
          )}
        </article>
      ))}
      {items.length === 0 && <p className="card">No hay incidentes activos.</p>}
    </div>
  );
}
