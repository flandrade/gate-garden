import { TEXT_STYLES } from '../utils/textConfig';

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

        preload(): void {
        this.load.image('main_background', 'assets/backgrounds/main.jpg');

        this.load.image('rabbit_1', 'assets/animals/rabbit-1.png');
        this.load.image('rabbit_2', 'assets/animals/rabbit-2.png');
        this.load.image('elephant_1', 'assets/animals/elephant-1.png');
        this.load.image('elephant_2', 'assets/animals/elephant-2.png');

        this.load.on('loaderror', (file: any) => {
            if (file.key === 'main_background') {
                console.log('Background image not found, using fallback gradient');
            }
        });
    }

    create(): void {
        const { width, height } = this.cameras.main;

        if (this.textures.exists('main_background')) {
            const bg = this.add.image(width/2, height/2, 'main_background');
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            const scale = Math.max(scaleX, scaleY);
            bg.setScale(scale);

            this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.3);
        }

        const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = TEXT_STYLES.title;
        const title = this.add.text(width/2, height/2 - 150, 'GATE GARDEN', titleStyle)
            .setOrigin(0.5);

        const subtitleStyle: Phaser.Types.GameObjects.Text.TextStyle = TEXT_STYLES.subtitle;
        const subtitle = this.add.text(width/2, height/2 - 80,
            'A Gatekeeper\'s Tale', subtitleStyle)
            .setOrigin(0.5);

        const buttonStyle: Phaser.Types.GameObjects.Text.TextStyle = TEXT_STYLES.buttonStart;

        const startButton = this.add.text(width/2, height/2 + 120, 'START', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.startGame())
            .on('pointerover', () => {
                startButton.setStyle({ color: '#FFFFFF', backgroundColor: '#A0522D' });
                this.tweens.add({
                    targets: startButton,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 200,
                    ease: 'Power2'
                });
            })
            .on('pointerout', () => {
                startButton.setStyle({ color: '#FFD700', backgroundColor: '#8B4513' });
                this.tweens.add({
                    targets: startButton,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Power2'
                });
            });
        startButton.setDepth(100);

        this.tweens.add({
            targets: title,
            alpha: 0.6,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const titleGlow = this.add.circle(width/2, height/2 - 150, 200, 0xFFD700, 0.1);
        titleGlow.setDepth(-1);
        this.tweens.add({
            targets: titleGlow,
            alpha: 0.3,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add a second glow layer for more depth
        const titleGlow2 = this.add.circle(width/2, height/2 - 150, 150, 0xD2691E, 0.15);
        titleGlow2.setDepth(-2);
        this.tweens.add({
            targets: titleGlow2,
            alpha: 0.25,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add some mystical particle effects
        this.createMysticalParticles();

        // Add walking animals on the left side
        this.createWalkingAnimals();

        this.add.text(width/2, height - 30,
            'Click to interact • Escape to pause',
            TEXT_STYLES.instructions).setOrigin(0.5);
    }

    private createMysticalParticles(): void {
        // Simple floating particle effect
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, this.cameras.main.width),
                Phaser.Math.Between(0, this.cameras.main.height),
                Phaser.Math.Between(1, 10),
                0xFFD700,
                0.5
            );

            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(50, 150),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000),
                ease: 'Power1'
            });
        }
    }

    private createWalkingAnimals(): void {
        const { width, height } = this.cameras.main;
        const leftSide = width * 0.25; // Position animals on the left quarter of the screen

        // Create rabbits
        this.createWalkingAnimal('elephant', leftSide - 100, height * 0.60, 1.20);

        // Create elephants
        this.createWalkingAnimal('rabbit', leftSide - 50, height * 0.75, 0.5);
    }

        private createWalkingAnimal(animalType: string, startX: number, y: number, scale: number): void {
        const { width } = this.cameras.main;

        // Create the animal sprite
        const animal = this.add.image(startX, y, `${animalType}_1`);
        animal.setScale(scale * 0.3); // Scale down the animals to appropriate size
        animal.setDepth(50); // Ensure animals appear behind any gate elements

        // Calculate gate position (where animals should stop and turn around)
        const gateX = width * 0.5 - 80; // Stop before reaching the center gate area

        // Create walking animation by alternating between two frames
        let frame = 1;
        this.time.addEvent({
            delay: 400, // Change frame every 400ms
            callback: () => {
                frame = frame === 1 ? 2 : 1;
                animal.setTexture(`${animalType}_${frame}`);
            },
            loop: true
        });

        // Create back-and-forth walking movement
        this.tweens.add({
            targets: animal,
            x: gateX, // Walk to the gate area
            duration: Phaser.Math.Between(8000, 12000), // Random walk speed
            repeat: -1,
            yoyo: true, // Return to starting position
            ease: 'Linear',
            onYoyo: () => {
                // Flip the animal when turning around
                animal.setFlipX(!animal.flipX);
            },
            onRepeat: () => {
                // Flip the animal when starting a new cycle
                animal.setFlipX(!animal.flipX);
            }
        });

        // Add slight vertical bobbing for more natural movement
        this.tweens.add({
            targets: animal,
            y: y + Phaser.Math.Between(-10, 10),
            duration: Phaser.Math.Between(2000, 3000),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private startGame(): void {
        // Reset game state before starting
        window.GameUtils.resetGame();

        // Fade out and transition to game scene
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }

    shutdown(): void {
        this.input.removeAllListeners();
        this.tweens.killAll();
        this.time.removeAllEvents();
        this.cameras.main.resetFX();
    }
}