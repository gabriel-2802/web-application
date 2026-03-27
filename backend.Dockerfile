FROM maven:3-eclipse-temurin AS builder

WORKDIR /app


COPY backend/pom.xml .

RUN mvn dependency:go-offline -B

COPY backend/src ./src
COPY backend/src/main/resources ./src/main/resources

RUN mvn clean package -DskipTests -q

FROM eclipse-temurin:25-jdk-alpin

WORKDIR /app

# dumb-init for proper signal handling + curl for healthcheck
RUN apk add --no-cache dumb-init curl netcat-openbsd

# non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# copy built JAR from builder stage
COPY --from=builder /app/target/demo-0.0.1-SNAPSHOT.jar app.jar

# change ownership of the application
RUN chown -R appuser:appgroup /app

# switch to non-root user
USER appuser

# health check to verify Spring Boot is running
HEALTHCHECK --interval=10s --timeout=5s --start-period=40s --retries=5 \
    CMD nc -z localhost 8080 || exit 1

# expose internal port
EXPOSE 8080

# use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# start Spring Boot application
CMD ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
