import Phaser from 'phaser';

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, angle, speed, damage, bouncesLeft) {
        super(scene, x, y, 'ferradura');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.damage = damage;
        this.bouncesLeft = bouncesLeft;

        this.body.setBounce(1, 1);
        this.body.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;

        this.setScale(1.2);

        // Define a velocidade inicial baseada no ângulo
        this.scene.physics.velocityFromRotation(angle, speed, this.body.velocity);

        // Destrói após 6 segundos caso não acabe os quiques
        this.scene.time.delayedCall(6000, () => {
            if (this.active) this.destroy();
        });
    }

    update() {
        if (!this.active) return;
        // Rotação visual enquanto voa
        this.rotation += 0.15;
    }

    onHitEnemy(enemy) {
        enemy.takeDamage(this.damage);
        this.bouncesLeft--;
        if (this.bouncesLeft <= 0) {
            this.destroy();
        }
    }
}
