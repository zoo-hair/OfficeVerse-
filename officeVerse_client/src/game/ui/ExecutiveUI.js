export default class ExecutiveUI {
    constructor(scene) {
        this.scene = scene;
        this.setupExecutiveListeners();
    }

    setupExecutiveListeners() {
        const closeBtn = document.getElementById('close-executive-btn');
        if (closeBtn) closeBtn.onclick = () => this.closeExecutivePanel();

        const triggerBtn = document.getElementById('trigger-bonus-btn');
        if (triggerBtn) triggerBtn.onclick = () => this.triggerBonus();

        window.handleBonusRainReceived = () => this.handleBonusRain();
    }

    openExecutivePanel() {
        const overlay = document.getElementById('executive-panel-overlay');
        if (overlay) overlay.style.display = 'flex';
    }

    closeExecutivePanel() {
        const overlay = document.getElementById('executive-panel-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    triggerBonus() {
        if (window.sendGlobalMessage) {
            window.sendGlobalMessage('BONUS_RAIN');
            this.scene.showPopup('Office-wide Bonus Triggered! 🤑');
            this.closeExecutivePanel();
            this.handleBonusRain();
        }
    }

    handleBonusRain() {
        const tint = document.createElement('div');
        tint.className = 'gold-tint active';
        document.body.appendChild(tint);

        const emojis = ['💰', '💵', '💎', '🚀', '🤑'];
        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                const money = document.createElement('div');
                money.className = 'bonus-money';
                money.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                money.style.left = Math.random() * 100 + 'vw';
                money.style.animationDuration = (2 + Math.random() * 2) + 's';
                document.body.appendChild(money);
                setTimeout(() => money.remove(), 4000);
            }, i * 100);
        }

        setTimeout(() => {
            tint.classList.remove('active');
            setTimeout(() => tint.remove(), 1000);
        }, 5000);
    }

    showFeaturesPopup() {
        setTimeout(() => {
            const overlay = document.getElementById('features-popup-overlay');
            if (!overlay) {
                console.error('Features popup overlay not found in DOM');
                return;
            }
            overlay.style.display = 'flex';

            // Setup close button
            const closeBtn = document.getElementById('features-popup-close');
            if (closeBtn) {
                closeBtn.onclick = (e) => {
                    e.stopPropagation();
                    overlay.style.display = 'none';
                };
            }

            // Setup feature buttons
            const techBlogBtn = document.getElementById('feature-techblog');
            if (techBlogBtn) {
                techBlogBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open('https://technewsworld.com/', '_blank');
                    overlay.style.display = 'none';
                };
            }

            const coming1Btn = document.getElementById('feature-coming1');
            if (coming1Btn) {
                coming1Btn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('Coming Soon! 🚀');
                    overlay.style.display = 'none';
                };
            }

            const coming2Btn = document.getElementById('feature-coming2');
            if (coming2Btn) {
                coming2Btn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('Coming Soon! 🚀');
                    overlay.style.display = 'none';
                };
            }

            // Close on outside click
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    overlay.style.display = 'none';
                }
            };
        }, 100);
    }
}
