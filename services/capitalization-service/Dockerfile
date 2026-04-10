FROM maven:3.9-eclipse-temurin-21

WORKDIR /app

COPY pom.xml ./

RUN mvn dependency:go-offline

COPY src ./src

RUN mvn clean package -DskipTests

RUN groupadd -r app && useradd -r -g app app && chown -R app:app /app

ENV SERVER_PORT=8087
EXPOSE 8087

USER app

CMD ["java", "-jar", "target/capitalization-service-1.0.0.jar"]
