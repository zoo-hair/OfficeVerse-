import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import LoginUI from '../ui/LoginUI.js';

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
                        this.loginUI = new LoginUI(this);
                        this.loginUI.init();
                    }
                }, 500);
            }, 1000);
        }
    }
}
