# OfficeVerse Server

Backend service for **OfficeVerse**, a multiplayer virtual office environment. This server handles real-time game state synchronization, WebSocket communication, and AI interactions powered by Mistral AI.

## 🛠️ Tech Stack

- **Java 21**
- **Spring Boot 4.0.1**
- **H2 Database** (In-memory, for rapid prototyping)
- **WebSocket** (Real-time communication)
- **Spring AI** (Integration with Mistral AI)

## 🚀 Quick Start

### Prerequisites

- JDK 21 or higher installed.

### Setup & Run

1.  Navigate to the server directory:
    ```bash
    cd officeVerse_server
    ```

2.  Run the application using Gradle:
    ```bash
    ./gradlew bootRun
    ```

The server will start on port `8080` (default).

## ⚙️ Configuration

The application is configured via `src/main/resources/application.properties`.

### GenAI Configuration

To enable the AI assistant features, you need to provide a Hugging Face API key.

```properties
genai.huggingface.api-key=YOUR_HUGGING_FACE_KEY
genai.huggingface.model=mistralai/Mistral-7B-Instruct
```

> [!NOTE]
> The default key provided in the repository is for demonstration purposes and may be rate-limited or inactive. It is recommended to use your own key.

## 🔌 API Endpoints

The server exposes several endpoints for the client:

| Controller | Description |
| :--- | :--- |
| `AuthController` | Handles user authentication and session management. |
| `GameController` | Manages game state and player data. |
| `WebSocketController` | Handles real-time player movement and interactions. |
| `GenAIController` | Processes generic AI requests (text generation). |
| `AIController` | Specialized AI logic for in-game NPCs. |

## 🧪 Testing

To run the unit and integration tests:

```bash
./gradlew test
```

## 📝 License

This project is licensed under the MIT License.
