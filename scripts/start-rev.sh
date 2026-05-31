#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "=== REV: use dev-up.ps1 en Windows (PowerShell) ==="
echo "En Linux/macOS: docker compose -p rev up -d && mvn spring-boot:run por modulo"
docker compose -p rev up -d
