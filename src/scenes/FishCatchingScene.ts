import { TEXT_STYLES, TEXT_COLORS } from '../utils/textConfig';
import { createDialogContainer } from '../utils/dialogs';
import { spawningService, FishSpawnRequest, FishSpawnData } from '../services/SpawningService';

export default class FishCatchingScene extends Phaser.Scene {
    private unicorn!: Phaser.GameObjects.Sprite;
    private basket!: Phaser.GameObjects.Image;
    private fishes: Phaser.GameObjects.Image[] = [];
    private score: number = 0;
    private gameActive: boolean = true;

    private countdownTimer!: Phaser.Time.TimerEvent;
    private instructionText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private timeLeft: number = 0;
    private timeText!: Phaser.GameObjects.Text;
    private tooltip!: Phaser.GameObjects.Container;
    private fishSpeed: number = 0; // Starting speed
    private maxFishSpeed: number = 0; // Maximum speed
    private fishesNeeded: number = 0; // Target number of blue fish to catch

    constructor() {
        super({ key: 'FishCatchingScene' });
    }

    preload(): void {
        this.load.image('fish_good', 'assets/animals/fish-good.png');
        this.load.image('fish_bad', 'assets/animals/fish-bad.png');

        this.createBasketTexture();
    }

    async create(): Promise<void> {
        const gameParameters = await spawningService.getGameParameters();

        this.score = 0;
        this.timeLeft = gameParameters.fish.timeLimit;
        this.gameActive = true;
        this.fishSpeed = gameParameters.fish.minSpeed;
        this.maxFishSpeed = gameParameters.fish.maxSpeed;
        this.fishesNeeded = gameParameters.fish.fishesNeeded;
        this.fishes = [];

        const { width } = this.cameras.main;

        this.createBackground();
        this.createUnicorn();
        this.createBasket();
        this.createUI();
        this.showUnicornGuidance();
        this.time.delayedCall(3000, () => {
            this.startFishSpawning();
        });

        this.startTimer();
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.gameActive && this.basket) {
                this.basket.x = Phaser.Math.Clamp(pointer.x, 50, width - 50);
            }
        });
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    private createBackground(): void {
        const { width, height } = this.cameras.main;

        if (this.textures.exists('main_background')) {
            const bg = this.add.image(width/2, height/2, 'main_background');
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            const scale = Math.max(scaleX, scaleY);
            bg.setScale(scale);

            // Add overlay for mystical water theme
            this.add.rectangle(width/2, height/2, width, height, 0x000080, 0.3);
        } else {
            // Fallback with mystical water theme
            this.add.rectangle(width/2, height/2, width, height, 0x191970);
        }

        // Add mystical water particles
        this.createWaterParticles();
    }

    private createWaterParticles(): void {
        const { width, height } = this.cameras.main;

        // Floating water droplets
        for (let i = 0; i < 20; i++) {
            const droplet = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(2, 6),
                0x87CEEB,
                Phaser.Math.FloatBetween(0.3, 0.7)
            );

            this.tweens.add({
                targets: droplet,
                x: droplet.x + Phaser.Math.Between(-100, 100),
                y: droplet.y + Phaser.Math.Between(-50, 50),
                alpha: droplet.alpha * 0.2,
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    private createUnicorn(): void {
        const { width, height } = this.cameras.main;

        // Create unicorn on the left side, facing center
        this.unicorn = this.add.sprite(width * 0.15, height * 0.75, 'unicorn_1');
        this.unicorn.setScale(0.4);
        this.unicorn.setDepth(100);

        // Subtle breathing animation
        this.tweens.add({
            targets: this.unicorn,
            scaleX: 0.42,
            scaleY: 0.42,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Occasional blink animation
        this.time.addEvent({
            delay: Phaser.Math.Between(3000, 8000),
            callback: () => {
                if (this.gameActive) {
                    this.unicorn.setTexture('unicorn_2');
                    this.time.delayedCall(200, () => {
                        if (this.unicorn && this.unicorn.active) {
                            this.unicorn.setTexture('unicorn_1');
                        }
                    });
                }
            },
            loop: true
        });
    }

    private createBasket(): void {
        const { width, height } = this.cameras.main;

        this.basket = this.add.image(width/2, height - 120, 'basket');
        this.basket.setScale(1.4);
        this.basket.setDepth(50);
        this.basket.setInteractive();

        // Add a subtle glow effect
        const glow = this.add.circle(this.basket.x, this.basket.y, 80, 0xFFD700, 0.3);
        glow.setDepth(45);

        // Make glow follow basket
        this.tweens.add({
            targets: glow,
            alpha: 0.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Update glow position when basket moves
        this.basket.on('pointermove', () => {
            glow.x = this.basket.x;
        });

        // Store glow reference for position updates
        this.registry.set('basketGlow', glow);
    }

    private createUI(): void {
        const { width, height } = this.cameras.main;

        // Score display
        this.scoreText = this.add.text(20, 20, 'Good Fish: 0 / ' + this.fishesNeeded, TEXT_STYLES.gameLabel);

        // Time display
        this.timeText = this.add.text(width - 20, 20, 'Time: ' + this.timeLeft, TEXT_STYLES.gameLabel);
        this.timeText.setOrigin(1, 0);

        // Instructions
        this.instructionText = this.add.text(width/2, height - 30,
            'Move your mouse to guide the basket. Catch good fish, avoid bad ones!',
            TEXT_STYLES.instructions,

        );
        this.instructionText.setOrigin(0.5);
    }

    private showUnicornGuidance(): void {
        // Create the guidance tooltip using dialog container
        this.tooltip = createDialogContainer(
            this,
            this.unicorn.x + 100, this.unicorn.y - 150,  // position
            400, 150,                                     // size
            '"Catch the pure, avoid the tainted.\nLet your hands be wise."',  // guidance text
            undefined,                                    // no children
        );

        // Auto-hide after 4 seconds
        this.time.delayedCall(4000, () => {
            if (this.tooltip && this.tooltip.active) {
                this.tweens.add({
                    targets: this.tooltip,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        this.tooltip.destroy();
                    }
                });
            }
        });
    }

    private startFishSpawning(): void {
        if (!this.gameActive) return;

        this.generateAllFishSpawns().catch(error => {
            console.error('Error generating fish spawns:', error);
        });
    }

    private async generateAllFishSpawns(): Promise<void> {
        if (!this.gameActive) return;

        const { width, height } = this.cameras.main;

        const spawnRequest: FishSpawnRequest = {
            screenDimensions: {
                width,
                height
            },
        };

        const spawnResponse = await spawningService.generateFishSpawn(spawnRequest);
        if (!spawnResponse.success) {
            console.warn('Failed to get spawn parameters, using fallback');
            return;
        }

        // Schedule each fish to spawn at its designated time
        spawnResponse.items.forEach((fishData) => {
            this.time.delayedCall(fishData.spawnDelay, () => {
                if (this.gameActive) {
                    this.spawnSingleFish(fishData);
                }
            });
        });
    }

    private spawnSingleFish(fishData: FishSpawnData): void {
        if (!this.gameActive) return;

        const { height } = this.cameras.main;

        // Create fish with webhook-provided parameters
        const fish = this.add.image(fishData.x, fishData.y, fishData.fishType);
        fish.setScale(0.18);
        fish.setDepth(25);

        // Store fish type for collision detection
        fish.setData('isGood', fishData.fishType === 'fish_good');
        this.fishes.push(fish);

        // Make fish fall with webhook-provided speed
        this.tweens.add({
            targets: fish,
            y: height + 50,
            duration: fishData.speed,
            ease: 'Linear',
            onComplete: () => {
                this.removeFish(fish);
            }
        });

        // Add side-to-side movement with webhook-provided parameters
        this.tweens.add({
            targets: fish,
            x: fish.x + fishData.sideMovement.range,
            duration: fishData.sideMovement.duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private startTimer(): void {
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {

                this.timeLeft--;
                this.timeText.setText('Time: ' + this.timeLeft);

                if (this.timeLeft % 5 === 0 && this.fishSpeed < this.maxFishSpeed) {
                    this.fishSpeed += 20;
                }

                if (this.timeLeft <= 0) {
                    this.endGame(true);
                }
            },
            loop: true
        });
    }

    update(): void {
        if (!this.gameActive) return;

        // Check for fish-basket collisions
        this.fishes.forEach(fish => {
            if (this.basket && Phaser.Geom.Rectangle.Overlaps(
                fish.getBounds(),
                this.basket.getBounds()
            )) {
                this.catchFish(fish);
            }
        });

        // Update basket glow position
        const glow = this.registry.get('basketGlow');
        if (glow && this.basket) {
            glow.x = this.basket.x;
        }
    }

    private catchFish(fish: Phaser.GameObjects.Image): void {
        const isGood = fish.getData('isGood');

        this.removeFish(fish);

        if (isGood) {
            // Caught a good fish - excellent!
            this.score++;
            this.scoreText.setText('Good Fish: ' + this.score + ' / ' + this.fishesNeeded);

            // Victory condition
            if (this.score >= this.fishesNeeded) {
                this.endGame(true);
                return;
            }

            // Show positive feedback
            this.showFloatingText(this.basket.x, this.basket.y - 30, '+1', TEXT_COLORS.skyBlue);
        } else {
            // Caught a bad fish - failure!
            this.endGame(false);
        }
    }

    private removeFish(fish: Phaser.GameObjects.Image): void {
        const index = this.fishes.indexOf(fish);
        if (index > -1) {
            this.fishes.splice(index, 1);
        }
        fish.destroy();
    }

    private showFloatingText(x: number, y: number, text: string, color: string): void {
        const floatingText = this.add.text(x, y, text, {
            ...TEXT_STYLES.floating,
            color
        });
        floatingText.setOrigin(0.5);
        floatingText.setDepth(200);

        this.tweens.add({
            targets: floatingText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                floatingText.destroy();
            }
        });
    }

        private endGame(success: boolean): void {
        if (!this.gameActive) return; // Prevent multiple calls

        this.gameActive = false;

        // Stop all timers and spawning
        if (this.countdownTimer) {
            this.countdownTimer.destroy();
        }

        // Clear remaining fish
        this.fishes.forEach(fish => fish.destroy());
        this.fishes = [];

        const { width, height } = this.cameras.main;

        let resultText: string;

        if (success) {
            if (this.score >= this.fishesNeeded) {
                resultText = `The water sings for you. Take this medal.

You have caught ${this.score} pure fish and proven yourself worthy of the unicorn's trust.

Medal Earned! 🥇
`;
                window.GameUtils.awardMedal('fishCatching');
            } else {
                resultText = `The trial ends as the waters still whisper.

You caught ${this.score} pure fish, but more wisdom was needed. The streams flow on...`;
            }
        } else {
            resultText = `You've touched the corrupted stream. The trial ends here.

The tainted fish carries darkness that clouds the waters. Your journey continues elsewhere.`;
        }

        // Create the result dialog container
        createDialogContainer(
            this,
            width/2, height/2,  // position
            600, 400,           // size
            resultText,         // result text
            [{
                text: 'Return to Garden',
                callback: () => this.returnToGame()
            }],           // children (medal text and continue button)
            {
                ...TEXT_STYLES.dialogue,
                color: success ? TEXT_COLORS.skyBlue : TEXT_COLORS.red
            }
        );
    }

    private returnToGame(): void {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }

    async shutdown(): Promise<void> {
        // Ensure complete cleanup when scene is destroyed
        this.gameActive = false;

        // Clean up timers
        if (this.countdownTimer) {
            this.countdownTimer.destroy();
            this.countdownTimer = null!;
        }

        // Clean up input event listeners
        this.input.off('pointermove');

        // Clean up basket and its event listeners
        if (this.basket) {
            this.basket.off('pointermove');
            this.basket.destroy();
            this.basket = null!;
        }

        // Clean up unicorn sprite
        if (this.unicorn) {
            this.unicorn.destroy();
            this.unicorn = null!;
        }

        // Clean up UI text elements
        if (this.instructionText) {
            this.instructionText.destroy();
            this.instructionText = null!;
        }
        if (this.scoreText) {
            this.scoreText.destroy();
            this.scoreText = null!;
        }
        if (this.timeText) {
            this.timeText.destroy();
            this.timeText = null!;
        }

        // Clean up tooltip if it exists
        if (this.tooltip && this.tooltip.active) {
            this.tooltip.destroy();
            this.tooltip = null!;
        }

        // Clean up registry entries
        const basketGlow = this.registry.get('basketGlow');
        if (basketGlow) {
            basketGlow.destroy();
        }
        this.registry.remove('basketGlow');

        // Clear fish array completely
        this.fishes.forEach(fish => {
            if (fish && fish.active) {
                fish.destroy();
            }
        });
        this.fishes = [];

        // Stop all tweens and animations
        this.tweens.killAll();
        this.anims.pauseAll();

        // Clear all delayed calls and events
        this.time.removeAllEvents();

        // Reset game state variable
        const gameParameters = await spawningService.getGameParameters();
        this.score = 0;
        this.timeLeft = gameParameters.fish.timeLimit;
        this.fishSpeed = gameParameters.fish.minSpeed;
        this.maxFishSpeed = gameParameters.fish.maxSpeed;
        this.fishesNeeded = gameParameters.fish.fishesNeeded;

        // Clear any cached textures created in this scene
        if (this.textures.exists('basket')) {
            this.textures.remove('basket');
        }
    }


    private createBasketTexture(): void {
        const graphics = this.add.graphics();

        // Basket texture - woven pattern
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(0, 0, 80, 40);
        graphics.fillStyle(0xA0522D);
        for (let i = 0; i < 80; i += 8) {
            graphics.fillRect(i, 0, 4, 40);
        }
        for (let i = 0; i < 40; i += 8) {
            graphics.fillRect(0, i, 80, 4);
        }
        graphics.generateTexture('basket', 80, 40);
        graphics.clear();
    }
}