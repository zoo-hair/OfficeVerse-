import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import { connectMovement, sendMovement } from '../../network/movementSocket.js';
import { initChat } from '../../network/ChatModule.js';
import ZoneManager from '../map/ZoneManager.js';
import MiniMap from '../ui/MiniMap.js';
import TodoManager from '../ui/TodoManager.js';
import TodoUI from '../ui/TodoUI.js';
import BossPanelUI from '../ui/BossPanelUI.js';
import GenAIUI from '../ui/GenAIUI.js';
import ExecutiveUI from '../ui/ExecutiveUI.js';

export default class OfficeScene extends Phaser.Scene {
    constructor() {
        super('OfficeScene');
        this.otherPlayers = {};
        this.nearbyPlayer = null;
        this.interactionPrompt = null;
        this.INTERACTION_DISTANCE = 100;

        // Zone tracking
        this.currentZone = null;
        this.zonePrompt = null;

        // Player Vitals
        this.energy = 100;
        this.stress = 0;
        this.baseSpeed = 125;

        // Character configurations
        this.characterConfigs = {
            owlet: { walk: 'Owlet_Monster_Walk', idle: 'Owlet_Monster_Idle' },
            dude: { walk: 'Dude_Monster_Walk', idle: 'Dude_Monster_Idle' },
            pink: { walk: 'Pink_Monster_Walk', idle: 'Pink_Monster_Idle' }
        };

        this.todoManager = new TodoManager();
        this.activeDesk = null;
    }

    init(data) {
        this.myPlayerName = data?.name || 'Player';
        this.myPlayerId = data?.id || Math.floor(Math.random() * 100000);
        this.myPlayerSkin = data?.skin || 0xffffff;
        this.myPlayerCharacter = data?.character || 'owlet';
        this.roomId = data?.roomId;
        this.roomName = data?.roomName;
        this.roomCode = data?.roomCode;
        this.playerRole = data?.role || 'employee'; // 'boss' or 'employee'

        console.log('--- OfficeScene Initialization ---');
        console.log('Role:', this.playerRole);
    }

    preload() {
        this.load.tilemapTiledJSON('office_map', 'assets/maps/office_map.json');
        this.load.image('office_tileset', 'assets/tilesets/office_tileset.png');
        this.load.image('office_tileset2', 'assets/tilesets/office_tileset2.png');

        ['Owlet', 'Dude', 'Pink'].forEach(char => {
            this.load.spritesheet(`${char}_Monster_Walk`, `assets/sprites/${char}_Monster_Walk_6.png`, { frameWidth: 32, frameHeight: 32 });
            this.load.spritesheet(`${char}_Monster_Idle`, `assets/sprites/${char}_Monster_Idle_4.png`, { frameWidth: 32, frameHeight: 32 });
        });
    }

    create() {
        /* ---------------- ROOM INFO ---------------- */
        const roomInfo = document.getElementById('room-info-ui');
        if (roomInfo) {
            roomInfo.style.display = 'block';
            document.getElementById('room-display-name').textContent = `Office: ${this.roomName}`;
            document.getElementById('room-display-code').textContent = `Code: ${this.roomCode}`;
        }

        /* ---------------- CHAT ---------------- */
        initChat(this.myPlayerId, this.myPlayerName, this.roomId, this.roomCode);

        /* ---------------- MAP ---------------- */
        const map = this.make.tilemap({ key: 'office_map' });
        const tileset1 = map.addTilesetImage('office_tileset', 'office_tileset');
        const tileset2 = map.addTilesetImage('office_tileset2', 'office_tileset2');

        map.createLayer('floor', [tileset1, tileset2], 0, 0);
        map.createLayer('wall', [tileset1, tileset2], 0, 0);
        map.createLayer('furniture', [tileset1, tileset2], 0, 0);
        const collision = map.createLayer('collision', [tileset1, tileset2], 0, 0);

        collision.setCollisionByProperty({ collides: true });
        collision.setVisible(false);

        /* ---------------- PLAYER ---------------- */
        const idleSprite = this.characterConfigs[this.myPlayerCharacter].idle;
        this.player = this.physics.add.sprite(64, 64, idleSprite, 0);
        this.player.setScale(1.25);
        this.player.setTint(this.myPlayerSkin);
        this.player.characterType = this.myPlayerCharacter;
        this.player.body.setAllowGravity(false);
        this.player.body.setSize(20, 20);
        this.player.body.setOffset(6, 10);

        this.physics.add.collider(this.player, collision);

        /* ---------------- CAMERA ---------------- */
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        /* ---------------- HUD ELEMENTS ---------------- */
        this.playerNameText = this.add.text(this.player.x, this.player.y - 45, this.myPlayerName, {
            font: '14px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(1000);

        this.energyIcon = this.add.text(0, 0, '⚡', { fontSize: '10px' }).setOrigin(0.5).setDepth(2001);
        this.stressIcon = this.add.text(0, 0, '😫', { fontSize: '10px' }).setOrigin(0.5).setDepth(2001);

        this.barGraphics = this.add.graphics();
        this.barGraphics.setDepth(2000);

        /* ---------------- CAMERA FX ---------------- */
        this.blurFX = this.cameras.main.postFX.addBlur(1, 0, 0, 1);

        /* ---------------- ANIMATIONS ---------------- */
        this.createAnimations();
        this.player.play(`${this.myPlayerCharacter}_idle`);

        /* ---------------- NETWORK ---------------- */
        connectMovement(this, data => this.handleNetwork(data));

        /* ---------------- ZONES ---------------- */
        this.zoneManager = new ZoneManager(this, map);
        this.zones = this.zoneManager.createZones();

        if (this.zones) {
            this.physics.add.overlap(this.player, this.zones, (player, zone) => {
                this.handleZoneEnter(zone);
            });
        }

        /* ---------------- UI SCENE ---------------- */
        this.scene.launch('UIScene', { player: this.player, map: map });

        /* ---------------- MINIMAP ---------------- */
        const minimapSize = 150;
        const camX = this.scale.width - minimapSize - 20;
        const camY = this.scale.height - minimapSize - 20;

        this.miniMap = new MiniMap(this, map, camX, camY, minimapSize);
        this.miniMap.follow(this.player);
        if (this.miniMap.borderCircle) this.cameras.main.ignore(this.miniMap.borderCircle);

        /* ---------------- INPUT ---------------- */
        this.cursors = this.input.keyboard.createCursorKeys();
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

        /* ---------------- UI COMPONENTS ---------------- */
        this.todoUI = new TodoUI(this);
        this.bossPanelUI = new BossPanelUI(this);
        this.executiveUI = new ExecutiveUI(this);
        this.genAIUI = new GenAIUI(this);
    }

    createAnimations() {
        Object.keys(this.characterConfigs).forEach(charKey => {
            const config = this.characterConfigs[charKey];
            if (!this.textures.exists(config.walk)) return;

            if (!this.anims.exists(`${charKey}_walk`)) {
                this.anims.create({
                    key: `${charKey}_walk`,
                    frames: this.anims.generateFrameNumbers(config.walk, { start: 0, end: 5 }),
                    frameRate: 10,
                    repeat: -1
                });
            }

            if (!this.anims.exists(`${charKey}_idle`)) {
                this.anims.create({
                    key: `${charKey}_idle`,
                    frames: this.anims.generateFrameNumbers(config.idle, { start: 0, end: 3 }),
                    frameRate: 4,
                    repeat: -1
                });
            }
        });
    }

    update(time, delta) {
        const deltaSeconds = delta / 1000;
        const ratePerSec = 100 / 1800;

        // Vitals
        this.stress = Math.min(100, this.stress + (ratePerSec * deltaSeconds));
        const speedMultiplier = 0.5 + (this.energy / 100);
        const speed = this.baseSpeed * speedMultiplier;

        const body = this.player.body;
        const char = this.player.characterType;
        body.setVelocity(0);
        let moving = false;

        if (this.cursors.left.isDown) { body.setVelocityX(-speed); this.player.setFlipX(true); moving = true; }
        else if (this.cursors.right.isDown) { body.setVelocityX(speed); this.player.setFlipX(false); moving = true; }
        if (this.cursors.up.isDown) { body.setVelocityY(-speed); moving = true; }
        else if (this.cursors.down.isDown) { body.setVelocityY(speed); moving = true; }

        if (moving) this.energy = Math.max(0, this.energy - (ratePerSec * deltaSeconds));

        // Anim
        const animKey = moving ? `${char}_walk` : `${char}_idle`;
        if (this.player.anims.currentAnim?.key !== animKey) this.player.play(animKey);

        // Depth & Position
        this.player.setDepth(this.player.y);
        this.playerNameText.setPosition(this.player.x, this.player.y - 45);
        this.playerNameText.setDepth(this.player.y + 1000);

        // Graphics Update
        this.updatePlayerBars();
        this.blurFX.strength = (this.stress / 100) * 2;

        // Network
        this.lastSent = this.lastSent || 0;
        if (time > this.lastSent + 50 && (moving || time > this.lastSent + 1000)) {
            const flipXVal = this.player.flipX ? 1 : 0;
            const anim = moving ? 'walk' : 'idle';
            sendMovement(`${this.roomId}:${this.myPlayerId}:${Math.round(this.player.x)}:${Math.round(this.player.y)}:${this.myPlayerName.replace(/:/g, '')}:${this.myPlayerSkin}:${this.myPlayerCharacter}:${anim}:${flipXVal}`);
            this.lastSent = time;
        }

        this.updateProximityInteraction();
        this.updateZoneInteraction();
        if (this.zonePrompt && this.zonePrompt.visible) {
            this.zonePrompt.setPosition(this.player.x, this.player.y - 65);
            this.zonePrompt.setDepth(this.player.y + 2000);
        }

        if (Phaser.Input.Keyboard.JustDown(this.fKey)) this.handleZoneInteraction();
        if (Phaser.Input.Keyboard.JustDown(this.eKey)) this.handlePlayerInteraction();
    }

    updatePlayerBars() {
        const x = this.player.x - 20;
        const y = this.player.y - 35;
        const width = 40;
        const barH = 4;
        this.barGraphics.clear();

        // Energy
        this.barGraphics.lineStyle(3, 0xffff00, 0.3);
        this.barGraphics.strokeRect(x, y, width, barH);
        this.barGraphics.fillStyle(0xffff00, 0.9);
        this.barGraphics.fillRect(x, y, width * (this.energy / 100), barH);
        this.energyIcon.setPosition(x - 12, y + 2);

        // Stress
        this.barGraphics.lineStyle(3, 0xff0000, 0.3);
        this.barGraphics.strokeRect(x, y + 8, width, barH);
        this.barGraphics.fillStyle(0xff0000, 0.9);
        this.barGraphics.fillRect(x, y + 8, width * (this.stress / 100), barH);
        this.stressIcon.setPosition(x - 12, y + 10);
    }

    handleNetwork(data) {
        try {
            if (data.startsWith('PlayerLeft:')) { this.handlePlayerLeft(Number(data.split(':')[1])); return; }
            const parts = data.split(':');
            if (parts[0] !== 'Broadcast') return;

            let idx = 1;
            if (parts.length >= 11) { if (this.roomId && parts[1] != this.roomId) return; idx = 2; }
            const id = Number(parts[idx]);
            if (isNaN(id) || id === this.myPlayerId) return;

            const x = Number(parts[idx + 1]);
            const y = Number(parts[idx + 2]);
            const name = parts[idx + 3];
            const skin = parseInt(parts[idx + 4]);
            const char = parts[idx + 5];
            const anim = parts[idx + 6];
            const flip = parts[idx + 7] === '1';

            if (!this.otherPlayers[id]) {
                const sprite = this.physics.add.sprite(x, y, this.characterConfigs[char]?.idle || 'Owlet_Monster_Idle');
                sprite.body.setAllowGravity(false);
                sprite.setScale(1.25);
                sprite.setTint(skin);
                sprite.characterType = char;
                sprite.body.setSize(20, 20);
                sprite.body.setOffset(6, 10);
                sprite.play(`${char}_${anim}`, true);
                sprite.setFlipX(flip);
                sprite.setDepth(y);
                const label = this.add.text(x, y - 40, name, { font: '14px Arial', fill: '#fff', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5);
                label.setDepth(y + 1000);
                this.otherPlayers[id] = { sprite, label };
            } else {
                const p = this.otherPlayers[id];
                if (p.sprite.active) {
                    p.sprite.play(`${p.sprite.characterType}_${anim}`, true);
                    p.sprite.setFlipX(flip);
                    if (p.tween) p.tween.stop();
                    p.tween = this.tweens.add({
                        targets: [p.sprite, p.label], x: x, y: { value: y, duration: 100 },
                        onUpdate: () => { p.sprite.setDepth(p.sprite.y); p.label.setPosition(p.sprite.x, p.sprite.y - 40); p.label.setDepth(p.sprite.y + 1000); }
                    });
                }
            }
        } catch (e) { console.error('Network err:', e); }
    }

    handlePlayerLeft(id) {
        const p = this.otherPlayers[id];
        if (p) { if (p.tween) p.tween.stop(); p.sprite.destroy(); p.label.destroy(); delete this.otherPlayers[id]; }
    }

    updateProximityInteraction() {
        let closest = null, dist = this.INTERACTION_DISTANCE;
        for (const [id, p] of Object.entries(this.otherPlayers)) {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.sprite.x, p.sprite.y);
            if (d < dist) { dist = d; closest = { id: parseInt(id), sprite: p.sprite }; }
        }
        if (closest) { this.nearbyPlayer = closest; this.showInteractionPrompt(closest); }
        else { this.nearbyPlayer = null; this.hideInteractionPrompt(); }
    }

    showInteractionPrompt(p) {
        if (!this.interactionPrompt) this.interactionPrompt = this.add.text(0, 0, '', { font: '14px Arial', fill: '#4a90e2', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5);
        this.interactionPrompt.setText('[E] Interact').setPosition(p.sprite.x, p.sprite.y - 55).setDepth(p.sprite.y + 2000).setVisible(true);
    }

    handlePlayerInteraction() {
        if (this.nearbyPlayer && window.selectPlayerForChat) {
            window.selectPlayerForChat(this.nearbyPlayer.id);
            this.showPopup(`Started private chat with ${this.nearbyPlayer.id}! 💬`);
        }
    }

    hideInteractionPrompt() { if (this.interactionPrompt) this.interactionPrompt.setVisible(false); }

    handleZoneEnter(z) {
        if (this.currentZone !== z.name) {
            this.currentZone = z.name;
            this.showZonePrompt(z.name);
        }
    }

    updateZoneInteraction() {
        let oz = null;
        if (this.zones) {
            this.zones.getChildren().forEach(z => {
                if (this.physics.overlap(this.player, z)) {
                    oz = z;
                }
            });
        }
        if (oz) {
            if (this.currentZone !== oz.name) {
                this.handleZoneEnter(oz);
            }
        } else if (this.currentZone) {
            this.hideZonePrompt();
            if (this.activeDesk && this.todoUI) this.todoUI.closeTodo();
        }
    }

    showZonePrompt(n) {
        if (!this.zonePrompt) this.zonePrompt = this.add.text(0, 0, '', { font: '14px Arial', fill: '#4ade80', stroke: '#000', strokeThickness: 3, backgroundColor: '#000', padding: { x: 8, y: 4 } }).setOrigin(0.5);
        let t = '[F] Interact';
        if (n === 'meetingRoom') t = '[F] Start Meeting';
        else if (n === 'genAI') t = '[F] Use AI Assistant';
        else if (n === 'gaming') t = '[F] Play Mini-Game';
        else if (n === 'exit') t = '[F] Exit Office';
        else if (n === 'coffee') t = '[F] Grab Coffee';
        else if (n === 'zenRoom') t = '[F] Meditate';
        else if (n === 'executive') t = '[F] Executive Suite';
        else if (n === 'bossRoom') {
            t = (this.playerRole === 'boss') ? '[F] Boss Control Panel' : 'Boss Only Area';
        }
        else if (n.match(/^d[1-6]$/)) t = '[F] Open To-Do List';
        this.zonePrompt.setText(t).setVisible(true);
    }

    hideZonePrompt() { if (this.zonePrompt) this.zonePrompt.setVisible(false); this.currentZone = null; }

    handleZoneInteraction() {
        if (!this.currentZone) return;
        switch (this.currentZone) {
            case 'lobby': this.executiveUI.showFeaturesPopup(); break;
            case 'meetingRoom': window.open('https://meet.google.com/new', '_blank'); break;
            case 'genAI': this.genAIUI.openGenAIPanel(); break;
            case 'gaming': window.open('https://poki.com/', '_blank'); break;
            case 'exit': if (confirm('Leave office?')) window.location.reload(); break;
            case 'coffee': this.grabCoffee(); break;
            case 'zenRoom': this.toggleZenMode(); break;
            case 'bossRoom':
                if (this.playerRole === 'boss') {
                    this.bossPanelUI.openBossPanel();
                } else {
                    this.showPopup('Access Denied: Only the Boss can enter! 🚫');
                }
                break;
            case 'executive': this.executiveUI.openExecutivePanel(); break;
            default:
                if (this.currentZone.match(/^d[1-6]$/)) {
                    this.todoUI.openTodo(this.currentZone);
                }
                break;
        }
    }

    grabCoffee() {
        this.energy = 100;
        this.showPopup('Coffee finished ☕');
    }

    toggleZenMode() {
        this.stress = 0;
        this.player.setTint(0x88ccff);
        this.showPopup('Zen achieved 🧘');
        this.time.delayedCall(2000, () => this.player.setTint(this.myPlayerSkin));
    }

    showPopup(message) {
        if (this.activePopup) this.activePopup.destroy();
        const container = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY).setScrollFactor(0).setDepth(11000);
        const bg = this.add.rectangle(0, 0, 300, 80, 0xffffff, 1).setStrokeStyle(4, 0x000000);
        const text = this.add.text(0, 0, message, { fontSize: '20px', color: '#000000', fontFamily: 'Arial' }).setOrigin(0.5);
        container.add([bg, text]);
        this.activePopup = container;
        this.tweens.add({ targets: container, alpha: { from: 1, to: 0 }, delay: 2500, duration: 500, onComplete: () => { container.destroy(); if (this.activePopup === container) this.activePopup = null; } });
    }
}