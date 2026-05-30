#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "=== REV: levantando infraestructura Docker ==="
docker compose up -d
echo ""
echo "Orden de arranque: eureka -> admin -> MS -> bff -> keycloak-adapter -> gateway -> frontend"
echo "Keycloak: http://localhost:8090 (admin/admin)"
