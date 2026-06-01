import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gatewayPort = env.VITE_REV_GATEWAY_PORT || env.REV_GATEWAY_PORT || '18080';
  const frontendPort = Number(env.VITE_REV_FRONTEND_PORT || env.REV_FRONTEND_PORT || '15173');
  const gatewayUrl = `http://localhost:${gatewayPort}`;

  return {
    plugins: [react()],
    server: {
      port: frontendPort,
      proxy: {
        '/api': gatewayUrl,
        '/auth': gatewayUrl,
      },
    },
  };
});
