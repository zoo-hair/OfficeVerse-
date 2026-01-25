import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Preload assets here if needed
    }

    create() {
        const loadingScreen = document.getElementById('loading-screen');
        const loginScreen = document.getElementById('login-screen');

        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    if (loginScreen) {
                        loginScreen.style.display = 'flex';
                        this.initLoginUI();
                    }
                }, 500);
            }, 1000);
        }
    }

    initLoginUI() {
        const tabs = document.querySelectorAll('.login-tab');
        const forms = document.querySelectorAll('.role-form');
        const skins = document.querySelectorAll('.skin-option');
        const createBtn = document.getElementById('create-office-btn');
        const joinBtn = document.getElementById('join-office-btn');

        // Character Animation System
        let selectedCharacter = 'owlet';
        const characterAnimations = this.initCharacterAnimations();

        // Character Selection Setup
        const characters = document.querySelectorAll('.character-option');
        characters.forEach(char => {
            char.onclick = () => {
                characters.forEach(c => c.classList.remove('selected'));
                char.classList.add('selected');
                selectedCharacter = char.getAttribute('data-character');
            };
        });

        // Initial state: buttons disabled until socket connects
        if (createBtn) createBtn.disabled = true;
        if (joinBtn) joinBtn.disabled = true;
        if (createBtn) createBtn.textContent = 'Connecting...';
        if (joinBtn) joinBtn.textContent = 'Connecting...';

        let selectedRole = 'boss';
        let selectedSkin = '0xffffff';
        let pendingAction = null;
        this.confirmedPlayerId = null;

        // Tab Switching
        tabs.forEach(tab => {
            tab.onclick = () => {
                tabs.forEach(t => t.classList.remove('active'));
                forms.forEach(f => f.classList.remove('active'));

                tab.classList.add('active');
                selectedRole = tab.getAttribute('data-role');
                document.getElementById(`${selectedRole}-form`).classList.add('active');
            };
        });

        // Skin Selection
        skins.forEach(skin => {
            skin.onclick = () => {
                skins.forEach(s => s.classList.remove('selected'));
                skin.classList.add('selected');
                selectedSkin = skin.getAttribute('data-color');
            };
        });

        // Room WebSocket for Login Coordination
        const roomSocket = new WebSocket('ws://localhost:8080/rooms');

        roomSocket.onopen = () => {
            console.log('Room Socket Connected for Login');
            if (createBtn) {
                createBtn.disabled = false;
                createBtn.textContent = 'Create Office';
            }
            if (joinBtn) {
                joinBtn.disabled = false;
                joinBtn.textContent = 'Join Office';
            }
        };

        roomSocket.onerror = (err) => {
            console.error('Room Socket Error:', err);
            alert('Failed to connect to the game server. Please ensure the backend is running at localhost:8080');
            if (createBtn) createBtn.textContent = 'Connection Error';
            if (joinBtn) joinBtn.textContent = 'Connection Error';
        };

        roomSocket.onclose = () => {
            console.log('Room Socket Closed');
            if (createBtn) createBtn.disabled = true;
            if (joinBtn) joinBtn.disabled = true;
        };

        roomSocket.onmessage = (event) => {
            const response = JSON.parse(event.data);
            console.log('Room Response:', response);

            if (response.type === 'registered') {
                this.confirmedPlayerId = response.data.playerId;
                if (pendingAction) {
                    roomSocket.send(JSON.stringify(pendingAction));
                    pendingAction = null;
                }
            } else if (response.type === 'roomCreated' || response.type === 'joinedRoom') {
                const room = response.data.room;
                const nameInput = document.getElementById(`${selectedRole}-name`);
                const playerName = nameInput.value.trim() || 'Player';
                const playerId = this.confirmedPlayerId || Math.floor(Math.random() * 100000);

                // Get currently selected character
                const activeChar = selectedCharacter;

                // Cleanup animations before transitioning
                if (characterAnimations) {
                    characterAnimations.cleanup();
                }

                // Start Game with Room Data + Character
                document.getElementById('login-screen').style.display = 'none';

                this.scene.start('OfficeScene', {
                    name: playerName,
                    id: playerId,
                    skin: selectedSkin,
                    character: activeChar,
                    role: selectedRole, // New: track player role
                    roomId: room.id,
                    roomName: room.name,
                    roomCode: room.joinCode
                });

                roomSocket.close();
            } else if (response.type === 'error') {
                alert('Error: ' + response.data.message);
                if (createBtn) {
                    createBtn.disabled = false;
                    createBtn.textContent = 'Create Office';
                }
                if (joinBtn) {
                    joinBtn.disabled = false;
                    joinBtn.textContent = 'Join Office';
                }
                pendingAction = null;
            }
        };

        // Boss Flow
        createBtn.onclick = () => {
            const name = document.getElementById('boss-name').value.trim();
            const officeName = document.getElementById('office-name').value.trim();

            if (!name || !officeName) {
                alert('Please enter your name and an office name');
                return;
            }

            if (roomSocket.readyState !== WebSocket.OPEN) {
                alert('Connection lost. Please refresh the page.');
                return;
            }

            createBtn.disabled = true;
            createBtn.textContent = 'Creating...';

            pendingAction = {
                type: 'createRoom',
                data: { roomName: officeName, maxPlayers: 20, isPrivate: true }
            };

            roomSocket.send(JSON.stringify({
                type: 'join',
                data: { playerName: name }
            }));
        };

        // Employee Flow
        joinBtn.onclick = () => {
            const name = document.getElementById('employee-name').value.trim();
            const code = document.getElementById('join-code').value.trim().toUpperCase();

            if (!name || !code) {
                alert('Please enter your name and the 6-digit office code');
                return;
            }

            if (roomSocket.readyState !== WebSocket.OPEN) {
                alert('Connection lost. Please refresh the page.');
                return;
            }

            joinBtn.disabled = true;
            joinBtn.textContent = 'Joining...';

            pendingAction = {
                type: 'joinRoomByCode',
                data: { joinCode: code }
            };

            roomSocket.send(JSON.stringify({
                type: 'join',
                data: { playerName: name }
            }));
        };
    }

    initCharacterAnimations() {
        const characters = [
            { id: 'owlet', path: './assets/sprites/Owlet_Monster_Idle_4.png' },
            { id: 'dude', path: './assets/sprites/Dude_Monster_Idle_4.png' },
            { id: 'pink', path: './assets/sprites/Pink_Monster_Idle_4.png' }
        ];

        const animations = [];
        let isRunning = true;

        characters.forEach(char => {
            const canvas = document.getElementById(`canvas-${char.id}`);
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = char.path;

            // Animation state
            let frame = 0;
            const totalFrames = 4;
            const frameWidth = 32;
            const frameHeight = 32;
            let lastTime = 0;
            const frameInterval = 1000 / 8; // 8 FPS

            img.onload = () => {
                const animate = (timestamp) => {
                    if (!isRunning) return;

                    if (timestamp - lastTime >= frameInterval) {
                        lastTime = timestamp;

                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.imageSmoothingEnabled = false;
                        ctx.drawImage(
                            img,
                            frame * frameWidth, 0,          // Source x, y
                            frameWidth, frameHeight,        // Source width, height
                            0, 0,                           // Dest x, y
                            canvas.width, canvas.height     // Dest width, height
                        );

                        frame = (frame + 1) % totalFrames;
                    }
                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            };

            animations.push({ canvas, ctx, img });
        });

        return {
            cleanup: () => {
                isRunning = false;
                animations.forEach(({ ctx, canvas }) => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                });
            }
        };
    }
}