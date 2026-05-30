# Ejemplos de commits REV

## Infraestructura

```
[ INFRA ]: Agregar eureka-server con registro en puerto 8761
[ INFRA ]: Configurar docker-compose con PostgreSQL y Keycloak
[ INFRA ]: Implementar api-gateway con filtro JWT hacia keycloak-adapter
```

## Funcionalidad

```
[ FEAT ]: Crear ms-incidentes con CRUD y estados Factory Method
[ FEAT ]: Agregar FakeWeatherAdapter en ms-zonas-riesgo
[ FEAT ]: Orquestar dashboard en bff-rev con fallbacks Resilience4j
```

## Calidad y mantenimiento

```
[ TEST ]: Validar transici�n a En Progreso sin georreferenciaci�n
[ BUILD ]: Centralizar BOM Spring Boot 4 en rev-parent
[ CHORE ]: Agregar reglas Cursor y skills de desarrollo
[ DOCS ]: Documentar orden de arranque en README
```

## Correcciones

```
[ FIX ]: Corregir validaci�n de rol Despachador en gateway
[ REFACTOR ]: Extraer DTOs de respuesta en ms-recursos
```

## Anti-patrones (no hacer)

```
# ? Sin tipo
Agregar incidentes

# ? Tipo incorrecto
[ feature ]: agregar bff

# ? Mezcla de concerns
[ FEAT ]: BFF, frontend y docker-compose completo
```
