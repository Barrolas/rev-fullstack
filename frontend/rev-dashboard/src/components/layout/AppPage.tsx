import { type ReactNode } from 'react';

interface AppPageProps {
  children: ReactNode;
}

export default function AppPage({ children }: AppPageProps) {
  return <div className="rev-app-page container-fluid">{children}</div>;
}
