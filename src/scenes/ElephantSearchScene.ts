import { TEXT_STYLES, TEXT_COLORS } from '../utils/textConfig';
import { createDialogContainer } from '../utils/dialogs';
import { spawningService, TargetPositionRequest } from '../services/SpawningService';


export default class ElephantSearchScene extends Phaser.Scene {
    private elephant!: Phaser.GameObjects.Sprite;
    private gameBoard!: Phaser.GameObjects.Image;
    private searchTargets: Phaser.GameObjects.Image[] = [];
    private score: number = 0;
    private gameActive: boolean = true;
    private countdownTimer!: Phaser.Time.TimerEvent;
    private instructionText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private timeLeft: number = 0;
    private timeText!: Phaser.GameObjects.Text;
    private tooltip!: Phaser.GameObjects.Container;
    private targetsNeeded: number = 0; // Number of items to find
    private targetItemName: string = 'mystical figures'; // What the player is looking for
    private foundItems: Set<number> = new Set(); // Track found items by ID
    private targetImages: string[] = ['person-blue', 'man-flying', 'bird', 'owl', 'persons-strawberry', 'animal-1', 'animal-2'];

    constructor() {
        super({ key: 'ElephantSearchScene' });
    }

    preload(): void {
        // Load the Garden of Earthly Delights puzzle images
        this.load.image('puzzle-background', 'assets/puzzle/board.png');
        this.load.image('animal-2', 'assets/puzzle/animal-2.png');
        this.load.image('person-blue', 'assets/puzzle/person-blue.png');
        this.load.image('man-flying', 'assets/puzzle/man-flying.png');
        this.load.image('bird', 'assets/puzzle/bird.png');
        this.load.image('owl', 'assets/puzzle/owl.png');
        this.load.image('persons-strawberry', 'assets/puzzle/persons-strawberry.png');
        this.load.image('animal-1', 'assets/puzzle/animal-1.png');
    }

    async create(): Promise<void> {
        const gameParameters = await spawningService.getGameParameters();

        this.timeLeft = gameParameters.puzzle.timeLimit;
        this.targetsNeeded = gameParameters.puzzle.targetsNeeded;
        // Reset game state
        this.score = 0;
        this.gameActive = true;
        this.foundItems.clear();

        // Create the same background as FishCatchingScene
        this.createBackground();

        // Create the elephant on the left side
        this.createElephant();

        // Create the search board
        this.createSearchBoard();

        // Create UI elements
        this.createUI();

        // Show initial guidance from elephant
        this.showElephantGuidance();

        // Start countdown timer
        this.startTimer();

        // Fade in effect
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    private createBackground(): void {
        const { width, height } = this.cameras.main;

        // Same background as FishCatchingScene
        if (this.textures.exists('main_background')) {
            const bg = this.add.image(width/2, height/2, 'main_background');
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            const scale = Math.max(scaleX, scaleY);
            bg.setScale(scale);

            // Add overlay for mystical search theme
            this.add.rectangle(width/2, height/2, width, height, 0x4B0082, 0.3);
        } else {
            // Fallback with mystical purple theme
            this.add.rectangle(width/2, height/2, width, height, 0x2F1B45);
        }

        // Add mystical search particles
        this.createSearchParticles();
    }

    private createSearchParticles(): void {
        const { width, height } = this.cameras.main;

        // Floating mystical sparkles
        for (let i = 0; i < 25; i++) {
            const sparkle = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(1, 3),
                0xFFD700,
                Phaser.Math.FloatBetween(0.4, 0.8)
            );

            this.tweens.add({
                targets: sparkle,
                x: sparkle.x + Phaser.Math.Between(-80, 80),
                y: sparkle.y + Phaser.Math.Between(-40, 40),
                alpha: sparkle.alpha * 0.1,
                duration: Phaser.Math.Between(4000, 7000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    private createElephant(): void {
        const { width, height } = this.cameras.main;

        // Create elephant on the left side, facing center
        this.elephant = this.add.sprite(width * 0.12, height * 0.8, 'elephant_1');
        this.elephant.setScale(0.5);
        this.elephant.setDepth(100);

        // Subtle breathing animation
        this.tweens.add({
            targets: this.elephant,
            scaleX: 0.52,
            scaleY: 0.52,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Occasional trunk sway animation
        this.time.addEvent({
            delay: Phaser.Math.Between(4000, 8000),
            callback: () => {
                if (this.gameActive) {
                    this.elephant.setTexture('elephant_2');
                    this.time.delayedCall(300, () => {
                        if (this.elephant && this.elephant.active) {
                            this.elephant.setTexture('elephant_1');
                        }
                    });
                }
            },
            loop: true
        });
    }

    private createSearchBoard(): void {
        const { width, height } = this.cameras.main;

        // Create the main search board using the Garden of Earthly Delights image
        this.gameBoard = this.add.image(width * 0.65, height * 0.5, 'puzzle-background');

        // Scale to fit nicely on screen
        const boardScale = Math.min(
            (width * 0.83) / this.gameBoard.width,
            (height * 0.83) / this.gameBoard.height
        );
        this.gameBoard.setScale(boardScale);
        this.gameBoard.setDepth(20);
        this.gameBoard.setInteractive();

        // Add a mystical border around the board
        const border = this.add.graphics();
        border.lineStyle(4, 0xFFD700, 0.8);
        border.strokeRect(
            this.gameBoard.x - (this.gameBoard.displayWidth / 2) - 5,
            this.gameBoard.y - (this.gameBoard.displayHeight / 2) - 5,
            this.gameBoard.displayWidth + 10,
            this.gameBoard.displayHeight + 10
        );
        border.setDepth(19);

        // Create hidden targets on the board
        this.createSearchTargets();
    }

    private async createSearchTargets(): Promise<void> {
        const boardBounds = this.gameBoard.getBounds();

        // Create target positioning request for webhook service
        const positionRequest: TargetPositionRequest = {
            boardBounds: {
                x: boardBounds.x,
                y: boardBounds.y,
                width: boardBounds.width,
                height: boardBounds.height
            },
            targetImages: this.targetImages,
        };


        // Get target positions from webhook service
        const positionResponse = await spawningService.generateTargetPositions(positionRequest);

        // Create targets with webhook-provided positions
        for (let i = 0; i < this.targetsNeeded; i++) {
            const position = positionResponse.items[i];
            if (!position) continue;

            // Create a subtle aura effect behind the target
            const aura = this.add.circle(position.x, position.y, 25, 0xFFD700, 0.15);
            aura.setDepth(23);
            aura.setData('targetId', i);

            // Add gentle pulsing animation to the aura
            this.tweens.add({
                targets: aura,
                scaleX: 1.2,
                scaleY: 1.2,
                alpha: 0.25,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            const target = this.add.image(position.x, position.y, position.targetImage);

            // Scale targets to be small but findable
            target.setScale(position.scale);
            target.setDepth(25);
            target.setData('id', i);
            target.setData('found', false);
            target.setData('targetName', position.targetImage);
            target.setData('aura', aura);

            // Make targets interactive
            target.setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.foundTarget(target))
                .on('pointerover', () => {
                    if (!target.getData('found')) {
                        target.setTint(0xFFFF00);
                        target.setScale(target.scaleX * 1.1);
                        // Brighten aura on hover
                        const targetAura = target.getData('aura');
                        if (targetAura) {
                            targetAura.setAlpha(0.4);
                        }
                    }
                })
                .on('pointerout', () => {
                    if (!target.getData('found')) {
                        target.clearTint();
                        target.setScale(position.scale);
                        // Return aura to normal
                        const targetAura = target.getData('aura');
                        if (targetAura) {
                        targetAura.setAlpha(0.15);
                        }
                    }
                });

            // Initially make targets slightly transparent to blend in
            target.setAlpha(position.alpha);

            this.searchTargets.push(target);
        }

    }


    private createUI(): void {
        const { width, height } = this.cameras.main;

        // Score display
        this.scoreText = this.add.text(20, 20, `Found: 0 / ${this.targetsNeeded}`, TEXT_STYLES.gameLabel);

        // Time display
        this.timeText = this.add.text(width - 20, 20, `Time: ${this.timeLeft}`, TEXT_STYLES.gameLabel);
        this.timeText.setOrigin(1, 0);

        // Instructions
        this.instructionText = this.add.text(width/2, height - 30,
            `Find the hidden ${this.targetItemName} from The Garden of Earthly Delights. Click when you spot them!`,
            TEXT_STYLES.instructions
        );
        this.instructionText.setOrigin(0.5);
    }

    private showElephantGuidance(): void {
        // Create the guidance tooltip using dialog container
        this.tooltip = createDialogContainer(
            this,
            this.elephant.x + 120, this.elephant.y - 180,  // position
            480, 200,                                       // size
            `"Memory recalls the Garden of Earthly Delights.\nSeek the mystical figures hidden within this ancient vision.\nPatience reveals what haste conceals."`,  // guidance text
            undefined,                                      // no children
        );

        // Auto-hide after 6 seconds
        this.time.delayedCall(6000, () => {
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

    private startTimer(): void {
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.gameActive) return;

                this.timeLeft--;
                this.timeText.setText(`Time: ${this.timeLeft}`);

                if (this.timeLeft <= 0) {
                    this.endGame(false); // Time up - failure
                }
            },
            loop: true
        });
    }

    private foundTarget(target: Phaser.GameObjects.Image): void {
        const targetId = target.getData('id');

        if (this.foundItems.has(targetId) || !this.gameActive) {
            return; // Already found or game not active
        }

        // Mark as found
        this.foundItems.add(targetId);
        target.setData('found', true);
        this.score++;

        // Visual feedback for found target
        target.clearTint();
        target.setAlpha(1);
        target.setScale(0.35); // Slightly larger when found
        target.setTint(0x00FF00);

        // Update aura to show target is found
        const aura = target.getData('aura');
        if (aura) {
            // Stop the pulsing animation and change aura to green
            this.tweens.killTweensOf(aura);
            aura.setFillStyle(0x00FF00, 0.3);
            aura.setScale(1.5);
        }

        // Celebration effect
        this.showFoundEffect(target.x, target.y);

        // Update score
        this.scoreText.setText(`Found: ${this.score} / ${this.targetsNeeded}`);

        // Check victory condition
        if (this.score >= this.targetsNeeded) {
            this.endGame(true);
        } else {
            // Show encouraging feedback with target name
            const targetName = target.getData('targetName').replace('-', ' ');
            this.showFloatingText(target.x, target.y - 40, `Found ${targetName}!`, TEXT_COLORS.green);
        }
    }

    private showFoundEffect(x: number, y: number): void {
        // Create sparkle effect at found target location
        for (let i = 0; i < 8; i++) {
            const sparkle = this.add.circle(x, y, 3, 0xFFD700, 1);
            sparkle.setDepth(200);

            this.tweens.add({
                targets: sparkle,
                x: x + Phaser.Math.Between(-50, 50),
                y: y + Phaser.Math.Between(-50, 50),
                alpha: 0,
                scale: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => sparkle.destroy()
            });
        }
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

        // Stop timer
        if (this.countdownTimer) {
            this.countdownTimer.destroy();
        }

        const { width, height } = this.cameras.main;

        let resultText: string;

        if (success) {
            resultText = `The elephant's memory holds all mysteries, as does yours.

You found all ${this.targetsNeeded} mystical figures hidden within The Garden of Earthly Delights, seeing beyond the surface to discover the secrets within.

Medal Earned! 🥇
`;
            window.GameUtils.awardMedal('elephantSearch');
        } else {
            resultText = `Time flows like a river through the garden, and this moment has passed.

You found ${this.score} of ${this.targetsNeeded} mystical figures from The Garden of Earthly Delights. The elephant encourages you to look again with eyes of wonder.`;
        }

        // Create the result dialog container
        createDialogContainer(
            this,
            width/2, height/2,  // position
            680, 450,           // size
            resultText,         // result text
            [{
                text: 'Return to Garden',
                callback: () => this.returnToGame()
            }],
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

        // Clean up timer
        if (this.countdownTimer) {
            this.countdownTimer.destroy();
            this.countdownTimer = null!;
        }

        // Clean up elephant sprite
        if (this.elephant) {
            this.elephant.destroy();
            this.elephant = null!;
        }

        // Clean up game board and its event listeners
        if (this.gameBoard) {
            this.gameBoard.off('pointermove');
            this.gameBoard.destroy();
            this.gameBoard = null!;
        }

        // Clear search targets and their auras
        this.searchTargets.forEach(target => {
            if (target && target.active) {
                // Clean up associated aura
                const aura = target.getData('aura');
                if (aura && aura.active) {
                    aura.destroy();
                }
                // Clean up target
                target.destroy();
            }
        });
        this.searchTargets = [];

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

        // Clear found items set
        this.foundItems.clear();

        // Stop all tweens and animations
        this.tweens.killAll();
        this.anims.pauseAll();

        // Clear all delayed calls and events
        this.time.removeAllEvents();

        // Clean up input event listeners
        this.input.off('pointermove');

        // Reset game state variables
        const gameParameters = await spawningService.getGameParameters();
        this.score = 0;
        this.timeLeft = gameParameters.puzzle.timeLimit;
        this.targetsNeeded = gameParameters.puzzle.targetsNeeded;
        this.foundItems = new Set();
    }
}