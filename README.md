# 🏢 OfficeVerse

> **The Ultimate Multiplayer Office Metaverse** — Work, Collaborate, and Have Fun in Your Virtual Office!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
![Version](https://img.shields.io/badge/version-0.0.1--SNAPSHOT-blue)
![Phaser](https://img.shields.io/badge/Phaser-3.80.1-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.1-green)

---

## 🎮 What is OfficeVerse?

**OfficeVerse** is a revolutionary multiplayer web-based office simulation game where teams can hang out, collaborate, and interact in a beautiful pixelated office environment. Whether you're managing a team, grabbing virtual coffee, or asking an AI assistant for advice — OfficeVerse makes the office experience engaging and fun!

### ✨ Perfect For:
- 🤝 **Remote Team Building** — Real-time collaboration without the Zoom fatigue
- 🎯 **Project Management** — Integrated to-do lists and desk-based work stations
- 💡 **AI-Powered Assistance** — Ask questions to your personal OpenAI-powered advisor
- 🎉 **Virtual Offices** — Create immersive spaces for your organization
- 🎮 **Casual Gaming** — Break time activities with integrated Poki games

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| 🗺️ **Dynamic Office Map** | Tiled-based environment with multiple zones (meeting rooms, desks, coffee area, zen room, boss office) |
| 👥 **Real-time Multiplayer** | WebSocket-powered player synchronization with smooth movement |
| 💬 **Global & Private Chat** | Text-based communication with peer-to-peer voice call support |
| 🤖 **AI Assistant** | Powered by OpenAI's GPT-3.5-Turbo with dynamic API key configuration |
| 📋 **Personal To-Do Lists** | Desk-based task management with persistent local storage |
| 🎤 **Voice Communication** | Peer-to-peer voice calls using WebRTC |
| 👔 **Role-Based Gameplay** | Boss vs Employee mechanics with exclusive boss room access |
| 🎨 **Customizable Avatars** | Choose from multiple character skins and colors |
| 📊 **Player Vitals System** | Energy and stress levels that affect gameplay |
| 🎯 **Interactive Zones** | Meeting rooms, gaming arcade, coffee stations, and more |
| 🗓️ **Mini-map** | Real-time navigation helper |
| 🎮 **Game Integration** | Quick access to Poki Games for break time |

---

## 🛠️ Tech Stack

### Frontend
- **Phaser 3.80.1** — 2D game engine
- **WebSocket** — Real-time communication
- **HTML5/CSS3** — Modern web standards
- **WebRTC** — Peer-to-peer voice

### Backend
- **Spring Boot 4.0.1** — Java framework
- **WebSocket** — Real-time server
- **OpenAI API** — AI integration
- **H2 Database** — SQL database
- **Gradle** — Build automation

### DevOps
- **Node.js** — Development server
- **Vite** — Module bundler
- **Python HTTP Server** — Local development

---

## 📦 Quick Start

### Prerequisites
- **Node.js** 16+
- **Java** 21+
- **Gradle** 8+
- **Python** 3.8+ (for dev server)

### 1️⃣ Backend Setup

```bash
cd officeVerse_server

# Build the project
gradle build -x test

# Run the server (starts on localhost:8080)
gradle bootRun
```

### 2️⃣ Frontend Setup

```bash
cd officeVerse_client

# Install dependencies
npm install

# Development server (starts on localhost:5501)
python -m http.server 5501

# Or with Vite (recommended)
npm run dev
```

### 3️⃣ Access OfficeVerse

Open your browser and navigate to:
```
http://localhost:5501
```

### 🔑 Configure GenAI

1. Launch the game
2. In-game, press the GenAI panel or wait for the setup prompt
3. Enter your OpenAI API key (get one from [openai.com](https://platform.openai.com/api-keys))
4. The key is validated and securely stored in the backend
5. Start asking your AI assistant questions! 🤖

---

## 🎮 How to Play

### Getting Started
1. **Launch Game** → Enter your name and choose your avatar
2. **Select Room** → Join an office room or create a new one
3. **Explore** → Walk around using arrow keys or WASD
4. **Interact** → Press `F` to interact with zones

### Controls
| Key | Action |
|-----|--------|
| ⬅️ ➡️ ⬆️ ⬇️ | Move around |
| `F` | Interact with zone |
| `E` | Open chat |
| `1-6` | Quick access to desks |

### Zones & Activities

🤝 **Meeting Room** → Google Meet video conference
🤖 **GenAI Room** → Ask AI questions with OpenAI
🎮 **Gaming Zone** → Play games on Poki
☕ **Coffee Station** → Restore energy
🧘 **Zen Room** → Reduce stress
📋 **Desks (D1-D6)** → Manage personal to-do lists
👔 **Boss Office** → *Boss only* exclusive features

---

## 📁 Project Structure

```
OfficeVerse/
├── officeVerse_client/                 # Frontend (Phaser 3 game)
│   ├── src/
│   │   ├── main.js                     # Entry point
│   │   ├── game/
│   │   │   ├── Game.js                 # Core game class
│   │   │   ├── scenes/                 # Game scenes
│   │   │   │   ├── BootScene.js
│   │   │   │   ├── OfficeScene.js      # Main office gameplay
│   │   │   │   └── UIScene.js
│   │   │   ├── entities/               # Player, NPC, RemotePlayer
│   │   │   ├── map/                    # TilemapLoader, ZoneManager
│   │   │   └── ui/                     # ChatBox, Minimap, TodoManager
│   │   ├── launcher/                   # Login/Lobby scenes
│   │   ├── network/                    # WebSocket & API modules
│   │   │   ├── api.js
│   │   │   ├── GenAIModule.js          # AI integration
│   │   │   ├── APIKeyModule.js         # Terminal UI for API config
│   │   │   ├── ChatModule.js
│   │   │   └── movementSocket.js
│   │   ├── state/                      # Game state management
│   │   ├── styles/                     # CSS styling
│   │   └── utils/                      # Helpers, constants, config
│   ├── assets/                         # Maps, sprites, tilesets
│   ├── index.html                      # Main HTML
│   └── package.json
│
├── officeVerse_server/                 # Backend (Spring Boot)
│   ├── src/main/java/com/offficeVerse/
│   │   ├── OffficevVerseApplication.java
│   │   ├── controller/                 # REST endpoints
│   │   │   ├── AuthController.java
│   │   │   ├── GenAIController.java    # AI endpoints
│   │   │   ├── GameController.java
│   │   │   └── WebSocketController.java
│   │   ├── service/                    # Business logic
│   │   │   └── genAIService.java       # OpenAI integration
│   │   ├── model/                      # Data models
│   │   ├── repository/                 # Database access
│   │   ├── config/                     # Configuration classes
│   │   ├── websocket/                  # WebSocket handlers
│   │   └── util/                       # Utility classes
│   ├── src/main/resources/
│   │   └── application.properties      # Server configuration
│   └── build.gradle                    # Dependencies & build config
│
└── README.md                           # This file

```

---

## 🔌 API Endpoints

### Authentication
```
POST   /auth/register              Register a new player
POST   /auth/login                 Login to office
```

### GenAI Integration
```
POST   /api/genai/configure        Set OpenAI API key
POST   /api/genai/validate-key     Validate API key
POST   /api/genai/query            Send prompt to AI
GET    /api/genai/is-configured    Check configuration status
GET    /api/genai/status           Get service status
GET    /api/genai/health           Health check
```

### WebSocket
```
ws://localhost:8080/chat           Chat & voice signaling
ws://localhost:8080/movement       Real-time movement sync
ws://localhost:8080/room           Room events
```

---

## 🎨 Customization

### Create Your Own Office Map
1. Use [Tiled Map Editor](https://www.mapeditor.org/)
2. Create zones using object layers with names: `lobby`, `meeting`, `genai`, `gaming`, etc.
3. Place in `/assets/maps/` directory
4. Update `ZoneManager.js` with new zone handlers

### Add New Zones
Edit [OfficeScene.js](officeVerse_client/src/game/scenes/OfficeScene.js#L383) and add a case:
```javascript
case 'myNewZone':
    this.myCustomAction();
    break;
```

### Customize UI Colors
Edit [ui.css](officeVerse_client/src/styles/ui.css) and modify color variables:
```css
--primary-color: #22d3ee;
--secondary-color: #4ade80;
```

---

## 🔐 Security

### Best Practices
- ✅ API keys stored server-side only
- ✅ WebSocket origin validation
- ✅ Input sanitization on chat
- ✅ Role-based access control
- ⚠️ **In Development** - Add rate limiting, authentication tokens, CORS restrictions

### Environment Variables
Create `.env` file in `officeVerse_server`:
```env
OPENAI_API_KEY=sk-...
CORS_ALLOWED_ORIGINS=http://localhost:3000
DATABASE_URL=jdbc:h2:mem:officeverse
```

---

## 📊 Game Mechanics

### Player Vitals
- **Energy** ⚡ — Decreases over time, restored at coffee station. Affects movement speed.
- **Stress** 😫 — Increases over time, reduced in zen room. High stress affects performance.

### Role System
- **Employee** 👤 — Can access most zones, has personal to-do lists
- **Boss** 👔 — Full access including exclusive boss room, can see all player stats

### Experience System
*Coming soon* — Earn XP for activities, level up, unlock new features!

---

## 🚀 Deployment

### Docker (Coming Soon)
```bash
# Build images
docker-compose build

# Run containers
docker-compose up
```

### Cloud Deployment
- Frontend: Deploy to Vercel, Netlify, or AWS S3 + CloudFront
- Backend: Deploy to Heroku, AWS EC2, or Google Cloud Run

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Write clean, readable code
- Add comments for complex logic
- Test your changes locally
- Follow existing code style

---

## 🐛 Known Issues & Roadmap

### Current Limitations
- ⚠️ Data not persisted across sessions (H2 in-memory)
- ⚠️ No authentication system (dev mode)
- ⚠️ Voice calls require manual peer setup
- ⚠️ Limited to local network testing

### Roadmap 🗺️
- [ ] Database persistence (PostgreSQL)
- [ ] JWT authentication
- [ ] User accounts & profiles
- [ ] Achievement system
- [ ] Customizable office themes
- [ ] Mobile app (React Native)
- [ ] Advanced AI features (GPT-4, voice)
- [ ] Admin dashboard
- [ ] Seasonal events & cosmetics

---

## 📚 Documentation

- [GenAI Setup Guide](./IMPLEMENTATION_SUMMARY.md)
- [Backend Configuration](./officeVerse_server/GENAI_BACKEND_SETUP.md)
- [Client Architecture](./officeVerse_client/README.md)

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) file for details.

**Copyright © 2025 Juhair Islam Sami** — All rights reserved.

---

## 🙌 Credits & Inspiration

- **Phaser** — Amazing 2D game framework
- **Spring Boot** — Robust Java framework
- **OpenAI** — Powerful AI models
- **Tiled** — Map editor tool
- **WebRTC** — Real-time communication
- **Poki Games** — Gaming arcade partner

---

## 📞 Support & Community

- 💬 **Issues** — Report bugs on GitHub
- 💡 **Discussions** — Share ideas and ask questions
- 🐦 **Twitter** — Follow for updates
- 📧 **Email** — contact@officeverse.dev

---

## 🎯 Vision

OfficeVerse is building the future of remote work and collaboration. We believe that work should be engaging, social, and fun. Our vision is to create a platform where teams across the globe can connect, collaborate, and build amazing things together — all within an immersive, gamified environment.

**The office reimagined. The future, now. 🚀**

---

<div align="center">

**Made with ❤️ by the OfficeVerse Team**

*Have fun and happy office-versing!* 🎮✨

</div>
