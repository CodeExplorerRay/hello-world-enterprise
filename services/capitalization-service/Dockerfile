FROM maven:3.9-eclipse-temurin-17

WORKDIR /app

COPY pom.xml ./

RUN mvn dependency:go-offline

COPY src ./src

RUN mvn package -DskipTests

EXPOSE 8087

CMD ["java", "-jar", "target/capitalization-service-1.0.0.jar"]