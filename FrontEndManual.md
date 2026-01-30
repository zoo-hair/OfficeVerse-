# OfficeVerse Frontend Manual

## Overview
The OfficeVerse frontend is a 2D virtual office game built with **Phaser 3** and **JavaScript** (ES Modules), served using **Vite**. It features real-time multiplayer movement, chat, and various interactive zones.

## Technology Stack
- **Framework**: Phaser 3.60.0
- **Build Tool**: Vite 5.0.0
- **Language**: JavaScript (ES Modules)
- **Styling**: CSS (in `styles/`)

## Prerequisites
- **Node.js** (LTS recommended)
- **npm** (comes with Node.js)

## Setup and Installation

1.  **Navigate to the Client Directory**
    ```bash
    cd ov/officeVerse_client
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

## Running the Application

To start the development server:

```bash
npm run dev
```

This will typically launch the application at `http://localhost:5173`.

## Building for Production

To create a production build:

```bash
npm run build
```

The output will be in the `dist` directory.

## Project Structure
- `src/main.js`: Entry point.
- `src/game/Game.js`: Main Phaser Game configuration.
- `src/game/scenes/`: Contains all game scenes (Boot, Preload, Office, UI).
  - `OfficeScene.js`: Main gameplay logic.
- `src/game/input/`: Input handling scripts.
- `src/network/`: WebSocket and chat modules.
- `src/styles/`: CSS files.

## Features
- **Multiplayer**: Real-time movement synchronization using WebSockets.
- **Interactive Zones**:
  - **Desks**: Personal Todo lists.
  - **Meeting Room**: External video calls.
  - **Zen Room**: Stress reduction.
  - **Coffee Station**: Energy restoration.
  - **GenAI**: AI Assistant integration.
  - **Gaming**: Mini-games.
- **Role-Based Access**: Specialized zones for Boss/Executive roles.
