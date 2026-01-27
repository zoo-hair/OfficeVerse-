# OfficeVerse Frontend

A multiplayer 2D office simulator built with Phaser 3.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

The game will open at `http://localhost:5173`

## 📁 Project Structure

```
officeverse-frontend/
├── public/
│   ├── index.html
│   └── assets/              # Game assets (tilesets, sprites, audio)
├── src/
│   ├── main.js             # Entry point
│   ├── launcher/           # Pre-game UI scenes
│   ├── game/               # Core game logic
│   │   ├── scenes/         # Phaser scenes (Core game logic only)
│   │   ├── entities/       # Player, NPC, RemotePlayer
│   │   ├── ui/             # Modular UI components (Separated from scenes)
│   │   │   ├── LoginUI.js
│   │   │   ├── TodoUI.js
│   │   │   ├── BossPanelUI.js
│   │   │   ├── GenAIUI.js
│   │   │   └── ExecutiveUI.js
│   │   ├── map/            # Tilemap loader
│   │   └── input/          # Keyboard input
│   ├── network/            # API & WebSocket clients
│   ├── state/              # Global game state
│   └── utils/              # Constants, helpers, config
```

## 🏗️ Architecture

The frontend follows a **Modular UI Architecture**:

- **Phaser Scenes**: Focus exclusively on the game world, player physics, and networking.
- **UI Components**: Specialized classes that handle HTML DOM elements, event listeners, and UI-specific logic.
- **Separation of Concerns**: This approach reduces the complexity of main scene files like `OfficeScene.js` by over 50%.

## 🎮 Features

- **Multiplayer**: Real-time player movement sync
- **Chat System**: In-game text chat
- **NPCs**: Interactive non-player characters
- **Tilemap**: Custom office map built with Tiled
- **UI**: Minimap, player list, chat box
- **Networking**: WebSocket for real-time updates

## 🔧 Configuration

Edit `.env` to configure backend URLs:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

## 🎨 Assets Required

Place the following in `public/assets/`:

### Tilesets

- `tilesets/office_tileset.png` - Office tileset image

### Maps

- `maps/office_map.json` - Tiled JSON map export

### Sprites

- `sprites/Owlet_Monster_Idle_4.png` - Idle animation (32x32 frames)
- `sprites/Owlet_Monster_Walk_6.png` - Walk animation (32x32 frames)

### Audio (Optional)

- `audio/walk.wav`
- `audio/join.wav`
- `audio/chat.wav`

## 🎯 Controls

- **WASD / Arrow Keys**: Move player
- **E**: Interact with NPCs
- **T**: Open chat
- **ESC**: Pause menu
- **Tab**: Toggle UI elements

## 📦 Build

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## 🔗 Backend Integration

This frontend connects to the OfficeVerse backend API:

- REST API: Player auth, room management
- WebSocket: Real-time movement, chat

See backend repository for setup instructions.

## ❓ Troubleshooting

### Port 5173 Already in Use

If you see an error like `Error: listen EADDRINUSE: address already in use :::5173`, it means the port is occupied. You can either:

1.  Kill the process using the port.
2.  Run on a different port:
    ```bash
    npm run dev -- --port 3000
    ```

### WebSocket Connection Failed

Ensure the backend server is running on `localhost:8080`. Check the browser console (F12) for connection errors.

## 📝 License

MIT
