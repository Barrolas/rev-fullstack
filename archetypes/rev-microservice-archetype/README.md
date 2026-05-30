# Custom Maven Archetype REV

Genera un microservicio Spring Boot alineado con el monorepo REV.

## Instalacion

```bash
cd archetypes/rev-microservice-archetype
mvn install
```

## Uso

Desde `businessdomain/`:

```bash
mvn archetype:generate \
  -DarchetypeGroupId=cl.duocuc.rev \
  -DarchetypeArtifactId=rev-microservice-archetype \
  -DarchetypeVersion=1.0-SNAPSHOT \
  -DgroupId=cl.duocuc.rev \
  -DartifactId=ms-nuevo \
  -Dpackage=cl.duocuc.rev.nuevo
```

Agregar el modulo generado en `businessdomain/pom.xml`.
