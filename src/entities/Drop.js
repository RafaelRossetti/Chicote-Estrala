import Phaser from 'phaser';

export default class Drop extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'xp') {
        super(scene, x, y, 'rapadura');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.dropType = type;
        this.value = 10;

        this.setScale(1.2);
        
        // Efeito de pulso / flutuação suave na rapadura
        scene.tweens.add({
            targets: this,
            scaleX: 1.4,
            scaleY: 1.4,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}
