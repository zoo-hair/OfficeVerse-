# OfficeVerse Backend Manual

## Overview
The OfficeVerse backend is a web application built using **Spring Boot 4.0.1** and **Java 21**. It serves as the server-side component for the virtual office environment, handling data persistence, business logic, and potential WebSocket communications.

## Technology Stack
- **Languages**: Java 21
- **Framework**: Spring Boot 4.0.1
- **Dependency Management**: Gradle
- **Database**: H2 (In-memory database)
- **Other Dependencies**:
  - Spring WebMVC
  - Spring WebSocket
  - Spring Data JPA
  - Lombok

## Prerequisites
Before running the backend, ensure you have the following installed:
- **Java Development Kit (JDK) 21**
- **Gradle** (optional, as the wrapper is included)

## Setup and Installation

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd ov/officeVerse_server
    ```

2.  **Build the Project**
    Use the included Gradle wrapper to build the project:
    ```bash
    ./gradlew build
    ```
    *(On Windows, use `gradlew.bat build`)*

## Running the Application

To start the server, run the following command in the `officeVerse_server` directory:

```bash
./gradlew bootRun
```
*(On Windows, use `gradlew.bat bootRun`)*

By default, the application will start on `http://localhost:8080`.

## Project Structure
- `src/main/java/com/offficeVerse`: Contains the Java source code.
- `src/main/resources`: Contains configuration files (e.g., `application.properties`) and static resources.
- `build.gradle`: Gradle build configuration file.

## API Endpoints
(This section can be populated as specific endpoints are identified and verified)

## Database
The application uses an H2 in-memory database. By default, data is lost when the application stops.
- **Console**: If enabled in `application.properties`, the H2 console may be accessible at `http://localhost:8080/h2-console`.
