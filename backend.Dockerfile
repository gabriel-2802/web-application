# Multi-stage build: Compile Stage
FROM maven:3-eclipse-temurin AS builder

WORKDIR /app

# Copy dependency files first (layer caching optimization)
COPY backend/pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY backend/src ./src
COPY backend/src/main/resources ./src/main/resources

# Build application (skip tests for faster builds)
RUN mvn clean package -DskipTests -q

# ============================================
# Runtime Stage: Minimal JRE Image
# ============================================
# Java 25 - NOTE: eclipse-temurin does NOT publish a 25-jre-alpine image,
# only 25-jdk-alpine. Using the JDK variant is the only Alpine option for Java 25.
FROM eclipse-temurin:25-jdk-alpine

WORKDIR /app

# Install dumb-init for proper signal handling + curl for healthcheck
RUN apk add --no-cache dumb-init curl netcat-openbsd

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy built JAR from builder stage
COPY --from=builder /app/target/demo-0.0.1-SNAPSHOT.jar app.jar

# Change ownership of the application
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Health check to verify Spring Boot is running
HEALTHCHECK --interval=10s --timeout=5s --start-period=40s --retries=5 \
    CMD nc -z localhost 8080 || exit 1

# Expose internal port (not published to host)
EXPOSE 8080

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start Spring Boot application
CMD ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
