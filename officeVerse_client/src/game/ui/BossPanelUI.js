export default class BossPanelUI {
    constructor(scene) {
        this.scene = scene;
        this.setupBossListeners();
    }

    setupBossListeners() {
        const closeBtn = document.getElementById('close-boss-btn');
        if (closeBtn) closeBtn.onclick = () => this.closeBossPanel();

        const assignBtn = document.getElementById('assign-boss-task-btn');
        if (assignBtn) assignBtn.onclick = () => this.assignBossTask();

        const input = document.getElementById('boss-task-input');
        if (input) {
            input.onkeydown = (e) => {
                if (e.key === 'Enter') this.assignBossTask();
            };
        }

        const deskBoxes = document.querySelectorAll('.desk-box');
        deskBoxes.forEach(box => {
            box.onclick = () => {
                deskBoxes.forEach(b => b.classList.remove('active'));
                box.classList.add('active');
                this.renderDeskDetail(box.dataset.desk);
            };
        });

        window.handleBossTaskReceived = (text) => {
            if (this.scene.todoManager) {
                this.scene.todoManager.assignGlobalTask(text);
                this.scene.showPopup(`THE BOSS HAS ASSIGNED A NEW TASK! 💡`);
                this.updateDeskNotifications();
                if (this.scene.activeDesk) this.scene.todoUI.renderTodos();
            }
        };
    }

    openBossPanel() {
        const overlay = document.getElementById('boss-panel-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            const list = document.getElementById('boss-detail-list');
            if (list) list.innerHTML = '';
            const title = document.getElementById('detail-title');
            if (title) title.textContent = 'Select a desk to view tasks';
            document.querySelectorAll('.desk-box').forEach(b => b.classList.remove('active'));
        }
    }

    renderDeskDetail(deskId) {
        const list = document.getElementById('boss-detail-list');
        const title = document.getElementById('detail-title');
        if (!list || !title) return;

        title.textContent = `Tasks for Desk ${deskId.toUpperCase()}`;
        list.innerHTML = '';
        const tasks = this.scene.todoManager.getTasks(deskId);

        if (tasks.length === 0) {
            list.innerHTML = '<li style="color:#666; font-style:italic">No active tasks found</li>';
            return;
        }

        tasks.forEach(t => {
            const li = document.createElement('li');
            li.className = `boss-read-only-item ${t.completed ? 'done' : ''}`;
            li.innerHTML = `<span class="status-dot ${t.completed ? 'done' : ''}"></span>${t.text}`;
            list.appendChild(li);
        });
    }

    closeBossPanel() {
        const overlay = document.getElementById('boss-panel-overlay');
        if (overlay) overlay.style.display = 'none';

        const input = document.getElementById('boss-task-input');
        if (input) input.value = '';
    }

    assignBossTask() {
        if (this.scene.playerRole !== 'boss') return;
        const input = document.getElementById('boss-task-input');
        if (!input) return;

        const text = input.value.trim();
        if (text) {
            this.scene.todoManager.assignGlobalTask(text);
            if (window.sendGlobalMessage) window.sendGlobalMessage(`BOSS_TASK:${text}`);
            this.scene.showPopup('Global Task Assigned to all Desks! 📢');
            this.closeBossPanel();
            this.updateDeskNotifications();
        }
    }

    updateDeskNotifications() {
        if (this.scene.deskNotifications) {
            this.scene.deskNotifications.forEach(n => n.destroy());
        }
        this.scene.deskNotifications = [];

        const desks = [
            { id: 'd1', x: 460, y: 100 }, { id: 'd2', x: 580, y: 100 }, { id: 'd3', x: 720, y: 95 },
            { id: 'd4', x: 460, y: 190 }, { id: 'd5', x: 590, y: 195 }, { id: 'd6', x: 715, y: 190 }
        ];

        desks.forEach(d => {
            const hasBossTask = this.scene.todoManager.getTasks(d.id).some(t => t.immutable && !t.completed);
            if (hasBossTask) {
                const bulb = this.scene.add.text(d.x, d.y - 30, '💡', { fontSize: '24px' }).setOrigin(0.5);
                bulb.setDepth(2000);
                this.scene.tweens.add({
                    targets: bulb,
                    y: bulb.y - 5,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                this.scene.deskNotifications.push(bulb);
            }
        });
    }
}
