export default class LoginUI {
    constructor(scene) {
        this.scene = scene;
        this.selectedCharacter = 'owlet';
        this.selectedRole = 'boss';
        this.selectedSkin = '0xffffff';
        this.pendingAction = null;
        this.confirmedPlayerId = null;
        this.isRunning = true;
        this.animations = [];
    }

    init() {
        const tabs = document.querySelectorAll('.login-tab');
        const forms = document.querySelectorAll('.role-form');
        const skins = document.querySelectorAll('.skin-option');
        const createBtn = document.getElementById('create-office-btn');
        const joinBtn = document.getElementById('join-office-btn');

        // Character Selection Setup
        const characters = document.querySelectorAll('.character-option');
        characters.forEach(char => {
            char.onclick = () => {
                characters.forEach(c => c.classList.remove('selected'));
                char.classList.add('selected');
                this.selectedCharacter = char.getAttribute('data-character');
            };
        });

        // Initialize animations
        this.initCharacterAnimations();

        // Initial state: buttons disabled until socket connects
        if (createBtn) createBtn.disabled = true;
        if (joinBtn) joinBtn.disabled = true;
        if (createBtn) createBtn.textContent = 'Connecting...';
        if (joinBtn) joinBtn.textContent = 'Connecting...';

        // Tab Switching
        tabs.forEach(tab => {
            tab.onclick = () => {
                tabs.forEach(t => t.classList.remove('active'));
                forms.forEach(f => f.classList.remove('active'));

                tab.classList.add('active');
                this.selectedRole = tab.getAttribute('data-role');
                document.getElementById(`${this.selectedRole}-form`).classList.add('active');
            };
        });

        // Skin Selection
        skins.forEach(skin => {
            skin.onclick = () => {
                skins.forEach(s => s.classList.remove('selected'));
                skin.classList.add('selected');
                this.selectedSkin = skin.getAttribute('data-color');
            };
        });

        // Room WebSocket for Login Coordination
        this.setupRoomSocket(createBtn, joinBtn);

        // Setup button callbacks
        if (createBtn) createBtn.onclick = () => this.handleCreateOffice(createBtn);
        if (joinBtn) joinBtn.onclick = () => this.handleJoinOffice(joinBtn);
    }

    setupRoomSocket(createBtn, joinBtn) {
        this.roomSocket = new WebSocket('ws://localhost:8080/rooms');

        this.roomSocket.onopen = () => {
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

        this.roomSocket.onerror = (err) => {
            console.error('Room Socket Error:', err);
            alert('Failed to connect to the game server. Please ensure the backend is running at localhost:8080');
            if (createBtn) createBtn.textContent = 'Connection Error';
            if (joinBtn) joinBtn.textContent = 'Connection Error';
        };

        this.roomSocket.onclose = () => {
            console.log('Room Socket Closed');
            if (createBtn) createBtn.disabled = true;
            if (joinBtn) joinBtn.disabled = true;
        };

        this.roomSocket.onmessage = (event) => {
            const response = JSON.parse(event.data);
            console.log('Room Response:', response);

            if (response.type === 'registered') {
                this.confirmedPlayerId = response.data.playerId;
                if (this.pendingAction) {
                    this.roomSocket.send(JSON.stringify(this.pendingAction));
                    this.pendingAction = null;
                }
            } else if (response.type === 'roomCreated' || response.type === 'joinedRoom') {
                const room = response.data.room;
                const nameInput = document.getElementById(`${this.selectedRole}-name`);
                const playerName = nameInput.value.trim() || 'Player';
                const playerId = this.confirmedPlayerId || Math.floor(Math.random() * 100000);

                // Cleanup animations before transitioning
                this.cleanup();

                // Start Game with Room Data + Character
                document.getElementById('login-screen').style.display = 'none';

                this.scene.scene.start('OfficeScene', {
                    name: playerName,
                    id: playerId,
                    skin: this.selectedSkin,
                    character: this.selectedCharacter,
                    role: this.selectedRole,
                    roomId: room.id,
                    roomName: room.name,
                    roomCode: room.joinCode
                });

                this.roomSocket.close();
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
                this.pendingAction = null;
            }
        };
    }

    handleCreateOffice(createBtn) {
        const name = document.getElementById('boss-name').value.trim();
        const officeName = document.getElementById('office-name').value.trim();

        if (!name || !officeName) {
            alert('Please enter your name and an office name');
            return;
        }

        if (this.roomSocket.readyState !== WebSocket.OPEN) {
            alert('Connection lost. Please refresh the page.');
            return;
        }

        createBtn.disabled = true;
        createBtn.textContent = 'Creating...';

        this.pendingAction = {
            type: 'createRoom',
            data: { roomName: officeName, maxPlayers: 20, isPrivate: true }
        };

        this.roomSocket.send(JSON.stringify({
            type: 'join',
            data: { playerName: name }
        }));
    }

    handleJoinOffice(joinBtn) {
        const name = document.getElementById('employee-name').value.trim();
        const code = document.getElementById('join-code').value.trim().toUpperCase();

        if (!name || !code) {
            alert('Please enter your name and the 6-digit office code');
            return;
        }

        if (this.roomSocket.readyState !== WebSocket.OPEN) {
            alert('Connection lost. Please refresh the page.');
            return;
        }

        joinBtn.disabled = true;
        joinBtn.textContent = 'Joining...';

        this.pendingAction = {
            type: 'joinRoomByCode',
            data: { joinCode: code }
        };

        this.roomSocket.send(JSON.stringify({
            type: 'join',
            data: { playerName: name }
        }));
    }

    initCharacterAnimations() {
        const charConfigs = [
            { id: 'owlet', path: './assets/sprites/Owlet_Monster_Idle_4.png' },
            { id: 'dude', path: './assets/sprites/Dude_Monster_Idle_4.png' },
            { id: 'pink', path: './assets/sprites/Pink_Monster_Idle_4.png' }
        ];

        charConfigs.forEach(char => {
            const canvas = document.getElementById(`canvas-${char.id}`);
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = char.path;

            let frame = 0;
            const totalFrames = 4;
            const frameWidth = 32;
            const frameHeight = 32;
            let lastTime = 0;
            const frameInterval = 1000 / 8; // 8 FPS

            img.onload = () => {
                const animate = (timestamp) => {
                    if (!this.isRunning) return;

                    if (timestamp - lastTime >= frameInterval) {
                        lastTime = timestamp;

                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.imageSmoothingEnabled = false;
                        ctx.drawImage(
                            img,
                            frame * frameWidth, 0,
                            frameWidth, frameHeight,
                            0, 0,
                            canvas.width, canvas.height
                        );

                        frame = (frame + 1) % totalFrames;
                    }
                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            };

            this.animations.push({ canvas, ctx, img });
        });
    }

    cleanup() {
        this.isRunning = false;
        this.animations.forEach(({ ctx, canvas }) => {
            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });
    }
}
