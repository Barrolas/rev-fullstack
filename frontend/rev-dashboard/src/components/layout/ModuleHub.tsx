import { type ReactNode } from 'react';
import { Row, Col } from 'react-bootstrap';

interface ModuleHubProps {
  kpis?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  rail?: ReactNode;
}

export default function ModuleHub({ kpis, toolbar, children, rail }: ModuleHubProps) {
  return (
    <div className="rev-module-hub">
      {kpis && <div className="rev-module-hub__kpis">{kpis}</div>}
      {(kpis || toolbar) && <hr className="rev-module-hub__divider" />}
      {toolbar && <div className="rev-module-hub__toolbar">{toolbar}</div>}
      <div className={`rev-module-hub__body${rail ? ' rev-module-hub__body--with-rail' : ''}`}>
        <div className="rev-module-hub__primary">{children}</div>
        {rail && <aside className="rev-module-hub__rail">{rail}</aside>}
      </div>
    </div>
  );
}

export function KpiRow({ children }: { children: ReactNode }) {
  return (
    <Row className="g-3">
      {children}
    </Row>
  );
}

export function KpiCol({ children }: { children: ReactNode }) {
  return <Col xs={6} lg={3}>{children}</Col>;
}
