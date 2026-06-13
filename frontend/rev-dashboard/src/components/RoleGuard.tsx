import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  requireOperador?: boolean;
  redirectTo?: string;
}

export default function RoleGuard({
  children,
  requireOperador = false,
  redirectTo = '/mis-incidentes',
}: RoleGuardProps) {
  const { isOperador, isBrigadistaOnly } = useAuth();

  if (requireOperador && !isOperador) {
    return <Navigate to={isBrigadistaOnly ? redirectTo : '/inicio'} replace />;
  }

  return <>{children}</>;
}
