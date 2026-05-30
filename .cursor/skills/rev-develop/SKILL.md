---
name: rev-develop
description: >-
  Gu�a de desarrollo por fases del proyecto REV (Red de Emergencia Valle).
  Usar al implementar microservicios, infraestructura, BFF, frontend o Docker
  seg�n el plan de arquitectura DSY1106.
---

# REV � Desarrollo por fases

## Orden de implementaci�n

1. **Fase 0** � Parent POM, `.gitignore`, `README`, `docs/`
2. **Fase 1** � eureka-server, spring-boot-admin, keycloak-adapter, docker-compose base
3. **Fase 2** � api-gateway + JWT + realm Keycloak `rev`
4. **Fase 3** � ms-incidentes (Factory Method, Flyway, PostgreSQL)
5. **Fase 4** � ms-zonas-riesgo (PostGIS, Adapter)
6. **Fase 5** � ms-recursos
7. **Fase 6** � bff-rev (Facade, Resilience4j + fallbacks)
8. **Fase 7** � frontend React
9. **Fase 8** � Dockerfiles + docker-compose completo
10. **Fase 9** � JaCoCo, archetype, GitHub Actions

## Plantilla por microservicio

1. Copiar estructura de paymentchain (`customer`/`product`).
2. Adaptar paquete a `cl.duocuc.rev.<modulo>`.
3. `application.properties`: nombre Eureka, puerto, datasource, Flyway.
4. Controller ? Service ? Repository ? Entity.
5. `@RestControllerAdvice`, Actuator, springdoc.
6. Test de contexto + tests de flujo cr�tico.
7. Commit at�mico `[ FEAT ]` o `[ INFRA ]`.

## Referencia paymentchain

Ruta local: `e:\DOWNLOADS\paymentchainparent con circuitcreaker\paymentchainparent`

Tomar: estructura Maven, Eureka, Gateway filter, Keycloak adapter, WebClient.
No tomar: H2, versiones mixtas Boot 3/4, ausencia de fallbacks.

## MVP (fin Fase 6)

Flujo: Login ? Gateway ? BFF ? incidente + riesgo + recursos; fallback si zonas cae.

## Documentaci�n

- Informe arquitectura: `docs/Informe T�cnico de Dise�o de Arquitectura REV*.pdf`
- Presentaci�n: `docs/Presentaci�n Proyecto REV*.pdf`
