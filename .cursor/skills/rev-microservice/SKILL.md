---
name: rev-microservice
description: >-
  Crea un nuevo microservicio Spring Boot dentro del monorepo REV siguiendo
  convenciones Maven, Eureka, PostgreSQL y Flyway. Usar al a�adir ms-* o
  m�dulos de infraestructura al businessdomain/infraestructuredomain.
---

# REV � Nuevo microservicio

## Checklist

```
- [ ] M�dulo en businessdomain/pom.xml o infraestructuredomain/pom.xml
- [ ] pom.xml hijo con parent correcto (rev-parent v�a agregador)
- [ ] Clase @SpringBootApplication
- [ ] spring.application.name en MAY�SCULAS para Eureka
- [ ] Eureka client + Actuator + springdoc (si expone API)
- [ ] Flyway + PostgreSQL (si persiste datos)
- [ ] @RestControllerAdvice
- [ ] Test ApplicationTests.java
- [ ] Entrada en docker-compose (cuando exista)
- [ ] Commit [ FEAT ] o [ INFRA ] at�mico
```

## application.properties m�nimo

```properties
spring.application.name=MS-INCIDENTES
server.port=8081
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/
management.endpoints.web.exposure.include=health,info,circuitbreakers
```

## Nombres Eureka REV

| spring.application.name | Rol |
|-------------------------|-----|
| EUREKA-SERVER | Discovery (no client) |
| MS-INCIDENTES | Incidentes |
| MS-ZONAS-RIESGO | Zonas + clima |
| MS-RECURSOS | Brigadas/recursos |
| BFF-REV | Orquestador |
| API-GATEWAY | Entrada HTTP |
| KEYCLOAK-ADAPTER | Auth JWT |
| SPRING-BOOT-ADMIN | Monitor |

## BFF: dependencias extra

- `spring-boot-starter-webflux`
- `spring-boot-starter-aspectj`
- `resilience4j-spring-boot3`

Ver Fase 6 del skill `rev-develop` para fallbacks obligatorios.
