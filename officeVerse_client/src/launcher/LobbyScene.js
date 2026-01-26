import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';

export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super("LobbyScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#020617");

    const { width, height } = this.scale;

    this.add.text(width / 2, 120, "LOBBY", {
      fontSize: "42px",
      color: "#38bdf8"
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 40, "Connected", {
      fontSize: "18px",
      color: "#94a3b8"
    }).setOrigin(0.5);

    this.createButton("ENTER OFFICE", height / 2 + 20, () => {
      this.closePopup();
      this.scene.start("OfficeScene");
    });

    this.createButton("BACK", height / 2 + 80, () => {
      this.closePopup();
      this.scene.start("LauncherScene");
    });

    // Show features popup with a slight delay to ensure DOM is ready
    setTimeout(() => this.showFeaturesPopup(), 100);
  }

  closePopup() {
    const overlay = document.getElementById('features-popup-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  showFeaturesPopup() {
    const overlay = document.getElementById('features-popup-overlay');
    if (!overlay) {
      console.warn('Features popup overlay not found in DOM');
      return;
    }

    overlay.style.display = 'flex';

    const closeBtn = document.getElementById('features-popup-close');
    const techBlogBtn = document.getElementById('feature-techblog');
    const coming1Btn = document.getElementById('feature-coming1');
    const coming2Btn = document.getElementById('feature-coming2');

    // Close button
    if (closeBtn) {
      closeBtn.onclick = () => this.closePopup();
    }

    // Tech Blog button
    if (techBlogBtn) {
      techBlogBtn.onclick = (e) => {
        e.preventDefault();
        window.open('https://www.technewsworld.com/section/tech-blog', '_blank');
      };
    }

    // Coming Soon buttons
    if (coming1Btn) {
      coming1Btn.onclick = (e) => {
        e.preventDefault();
        alert('This feature is coming soon!');
      };
    }

    if (coming2Btn) {
      coming2Btn.onclick = (e) => {
        e.preventDefault();
        alert('This feature is coming soon!');
      };
    }

    // Close popup when clicking outside the modal
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        this.closePopup();
      }
    };
  }

  createButton(label, y, callback) {
    const btn = this.add.text(this.scale.width / 2, y, label, {
      fontSize: "22px",
      backgroundColor: "#1e293b",
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerdown", callback);
  }
}
