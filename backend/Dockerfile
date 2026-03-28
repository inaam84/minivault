# ------------------------
# Development Stage
# ------------------------
FROM gradle:8.9-jdk17-alpine AS dev

WORKDIR /home/gradle/project

# Just keep the container ready for the volumes mount and bootRun
#ENTRYPOINT ["gradle", "bootRun", "--continuous"]

# ------------------------
# Build stage
# ------------------------
FROM gradle:8.9-jdk17-alpine AS build

# Set working directory
WORKDIR /home/gradle/project

# Copy Gradle files first for caching
COPY build.gradle settings.gradle ./

# Download dependencies (caching layer)
RUN gradle dependencies --quiet || true

# Copy source code
COPY src ./src

# Build the application
RUN gradle spotlessApply
RUN gradle clean bootJar -x test

# ------------------------
# Run stage (Production)
# ------------------------
FROM eclipse-temurin:17-jre-alpine

# Set working directory
WORKDIR /app

# Copy the jar from build stage
COPY --from=build /home/gradle/project/build/libs/*.jar app.jar

# Expose application port
EXPOSE 8080

# Optional: environment variable for JVM options
ENV JAVA_OPTS=""

# Run Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
