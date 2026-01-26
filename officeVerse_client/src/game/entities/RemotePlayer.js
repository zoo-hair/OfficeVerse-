export default class RemotePlayer {
  constructor(scene, data) {
    this.scene = scene;
    this.playerId = data.playerId;
    this.playerName = data.playerName;
    this.characterType = data.characterType || 'owlet';

    // Character configs
    const characterConfigs = {
      owlet: { idle: 'Owlet_Monster_Idle' },
      dude: { idle: 'Dude_Monster_Idle' },
      pink: { idle: 'Pink_Monster_Idle' }
    };

    const config = characterConfigs[this.characterType] || characterConfigs.owlet;

    // Create sprite
    this.sprite = scene.physics.add.sprite(data.x, data.y, config.idle, 0);
    this.sprite.setScale(1.25);
    this.sprite.setTint(data.skin || 0x88ccff);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setSize(20, 20);
    this.sprite.body.setOffset(6, 10);

    // Name tag
    this.nameTag = scene.add.text(data.x, data.y - 40, data.playerName, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5);

    // Interpolation
    this.targetX = data.x;
    this.targetY = data.y;
    this.interpolationSpeed = 0.2;

    // Play idle animation
    this.sprite.anims.play(`${this.characterType}_idle`, true);
  }

  updatePosition(x, y) {
    this.targetX = x;
    this.targetY = y;

    // Calculate direction for animation
    const dx = x - this.sprite.x;
    const dy = y - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 2) {
      // Moving
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal movement
        this.sprite.setFlipX(dx < 0);
        this.sprite.anims.play(`${this.characterType}_walk`, true);
      } else {
        // Vertical movement
        this.sprite.anims.play(`${this.characterType}_walk`, true);
      }
    } else {
      // Idle
      if (this.sprite.anims.currentAnim?.key !== `${this.characterType}_idle`) {
        this.sprite.anims.play(`${this.characterType}_idle`, true);
      }
    }
  }

  update() {
    // Smooth interpolation
    this.sprite.x += (this.targetX - this.sprite.x) * this.interpolationSpeed;
    this.sprite.y += (this.targetY - this.sprite.y) * this.interpolationSpeed;

    // Update name tag
    this.nameTag.setPosition(this.sprite.x, this.sprite.y - 40);
    
    // Update depth
    this.sprite.setDepth(this.sprite.y);
    this.nameTag.setDepth(this.sprite.y + 1);
  }

  destroy() {
    this.sprite.destroy();
    this.nameTag.destroy();
  }
}