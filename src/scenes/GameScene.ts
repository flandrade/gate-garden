import MeterPanel from '../ui/MeterPanel';
import { webhookService } from '../services/AgentService';
import { TEXT_STYLES } from '../utils/textConfig';
import { createDialogContainer } from '../utils/dialogs';

const GAME_DIALOGS = {
    INSTRUCTIONS: 'Collect medals to open the gate...',
    GATE_OPEN: 'Gate is now open! Click to enter The Garden of Earthly Delights...',
    GUARDIAN_LOADING: 'The Guardian is gathering wisdom...',
    GUARDIAN_SILENT: 'The Guardian is silent for now...',
    ANIMAL_LOADING: 'The animal is gathering thoughts...',
    ANIMAL_SILENT: 'The animal is silent for now...',
    GUARDIAN_INTRO: `Greetings, traveler...

I am the Guardian of the Ancient Gate, keeper of this mystical passage between realms. The gate before you is sealed by ancient magic, bound by the wisdom of the sacred creatures that roam these grounds.

To unlock the gate's secrets, you must seek counsel from the noble animals and earn their sacred medals by solving their mystical puzzles.

The path to enlightenment awaits... prove yourself worthy.`,
    GUARDIAN_ACCEPT: 'I accept the challenge',
    GUARDIAN_SPEAKING: 'The Guardian speaks of ancient mysteries...',
    ANIMAL_WISDOM: 'Click on the animals to seek their wisdom...',
    UNICORN_COMPLETION: `The waters remember your triumph.

You have already proven yourself worthy in the trial of falling truths.`,
    UNICORN_THANKS: 'Thank you, wise unicorn',
    UNICORN_REMEMBER: 'The unicorn remembers your completed trial...',
    UNICORN_TRIAL: `The waters above whisper your trial.

Will you gather what falls from the dreaming sky?`,
    UNICORN_CATCH: 'Catch the falling truths',
    UNICORN_NOT_YET: 'Not yet',
    UNICORN_OFFERS: 'The unicorn offers a mystical trial...',
    ELEPHANT_COMPLETION: `Memory eternal holds your achievement.

You have already mastered the trial of hidden sight within The Garden of Earthly Delights.`,
    ELEPHANT_THANKS: 'Thank you, wise elephant',
    ELEPHANT_REMEMBER: 'The elephant remembers your completed trial...',
    ELEPHANT_TRIAL: `Memory holds the key to all wisdom.

Can you find what is hidden in plain sight?`,
    ELEPHANT_TEST: 'Test my memory',
    ELEPHANT_OFFERS: 'The elephant offers a trial of memory...'
} as const;

export default class GameScene extends Phaser.Scene {
    private meterPanel!: MeterPanel;
    private instructionText!: Phaser.GameObjects.Text;

    // New interactive elements
    private guardian!: Phaser.GameObjects.Sprite;
    private conversationActive: boolean = false;
    private conversationBox!: Phaser.GameObjects.Container;
    private interactiveAnimals: Phaser.GameObjects.Image[] = [];

    constructor() {
        super({ key: 'GameScene' });
    }

    preload(): void {
        // Load the main background image
        this.load.image('main_background', 'assets/backgrounds/main.jpg');

        // Load guardian sprites
        this.load.image('guardian_p1', 'assets/guardian/guardian-p1.png');
        this.load.image('guardian_p2', 'assets/guardian/guardian-p2.png');
        this.load.image('guardian_p3', 'assets/guardian/guardian-p3.png');

        // Load gate sprites
        this.load.image('gate_closed', 'assets/gate/gate-1.png');
        this.load.image('gate_open', 'assets/gate/gate-2.png');

        // Load animal sprites for walking animations
        this.load.image('rabbit_1', 'assets/animals/rabbit-1.png');
        this.load.image('rabbit_2', 'assets/animals/rabbit-2.png');
        this.load.image('elephant_1', 'assets/animals/elephant-1.png');
        this.load.image('elephant_2', 'assets/animals/elephant-2.png');
        this.load.image('unicorn_1', 'assets/animals/unicorn-1.png');
        this.load.image('unicorn_2', 'assets/animals/unicorn-2.png');
        this.load.image('dog_1', 'assets/animals/dog-1.png');
        this.load.image('dog_2', 'assets/animals/dog-2.png');
        this.load.image('giraffe_1', 'assets/animals/giraffe-1.png');
        this.load.image('giraffe_2', 'assets/animals/giraffe-2.png');

        this.load.on('loaderror', (file: any) => {
            if (file.key === 'main_background') {
                console.log('Background image not found, using fallback gradient');
            }
        });

        this.createPlaceholderTextures();
    }

    create(): void {
        const { width, height } = this.cameras.main;

        // Reset scene state
        this.conversationActive = false;
        this.interactiveAnimals = [];

        this.input.removeAllListeners();
        this.createBackground();
        this.createUI();

        this.meterPanel = new MeterPanel(this, width - 120, 70);

        this.meterPanel.updateMeters();
        this.updateGateState();
        this.checkForNewMedals();
        this.cameras.main.fadeIn(5, 0, 0, 0);

        // Start guardian introduction after fade in completes (only on first visit)
        this.cameras.main.once('camerafadeincomplete', () => {
            this.time.delayedCall(10, () => {
                // Only show guardian introduction if it hasn't been shown before
                if (!window.GameState.guardianIntroductionShown) {
                    this.showGuardianIntroduction();
                    window.GameState.guardianIntroductionShown = true;
                }
            });
        });
    }

    private createBackground(): void {
        const { width, height } = this.cameras.main;

        // Add the main background image
        if (this.textures.exists('main_background')) {
            const bg = this.add.image(width/2, height/2, 'main_background');
            // Scale the background to cover the screen while maintaining aspect ratio
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            const scale = Math.max(scaleX, scaleY);
            bg.setScale(scale);

            // Add a subtle overlay for better UI contrast
            this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.2);
        } else {
            // Fallback gradient background
            this.add.rectangle(width/2, height/2, width, height, 0x2c1810);
        }

        this.createAtmosphericElements();
        this.createGate();
        this.createWalkingAnimals();
    }

    private createAtmosphericElements(): void {
        const { width, height } = this.cameras.main;

        // Floating mystical particles
        for (let i = 0; i < 30; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(1, 4),
                0xFFD700,
                Phaser.Math.FloatBetween(0.2, 0.6)
            );

            this.tweens.add({
                targets: particle,
                x: particle.x + Phaser.Math.Between(-50, 50),
                y: particle.y + Phaser.Math.Between(-30, 30),
                alpha: particle.alpha * 0.3,
                duration: Phaser.Math.Between(4000, 8000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    private createGate(): void {
        const { width, height } = this.cameras.main;

        // Create the gate using sprites
        const gate = this.add.image(width*1/5 + 100, height*2/5, 'gate_closed');
        gate.setScale(0.5); // Adjust scale as needed
        gate.setDepth(100); // Ensure gate appears above animals

        // Make gate interactive for when it opens
        gate.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.handleGateClick())
            .on('pointerover', () => {
                if (this.registry.get('gateOpen')) {
                    gate.setTint(0xFFD700); // Golden highlight when open
                }
            })
            .on('pointerout', () => {
                gate.clearTint();
            });

        // Store gate reference for later state changes
        this.registry.set('gateSprite', gate);
        this.registry.set('gateOpen', false);

        // Create the Guardian of the Gate
        this.createGuardian();
    }

    private toggleGate(shouldOpen: boolean): void {
        const gate = this.registry.get('gateSprite');
        const isCurrentlyOpen = this.registry.get('gateOpen');

        if (!gate || isCurrentlyOpen === shouldOpen) {
            return; // No gate sprite or already in desired state
        }

        // Change gate texture
        const newTexture = shouldOpen ? 'gate_open' : 'gate_closed';
        if (this.textures.exists(newTexture)) {
            gate.setTexture(newTexture);
            this.registry.set('gateOpen', shouldOpen);

            // Add a subtle transition effect
            this.tweens.add({
                targets: gate,
                scaleX: gate.scaleX * 1.05,
                scaleY: gate.scaleY * 1.05,
                duration: 200,
                yoyo: true,
                ease: 'Power2'
            });
        }
    }

    private createGuardian(): void {
        const { width, height } = this.cameras.main;

        // Create guardian sprite animation frames
        const guardianFrames = [
            { key: 'guardian_p1' },
        ];

        // Create animation
        this.anims.create({
            key: 'guardian_idle',
            frames: guardianFrames,
            frameRate: 2, // Slow, mystical animation
            repeat: -1,
            yoyo: true
        });

        // Create the guardian sprite
        this.guardian = this.add.sprite(width*3/5, height*3/4 + 40, 'guardian_p1');
        this.guardian.setDepth(120);

        // Scale the guardian to be 25% of screen height
        const targetHeight = height * 0.25; // 25% of screen height
        const spriteHeight = this.guardian.height;
        const scale = targetHeight / spriteHeight;
        this.guardian.setScale(scale);

        // Make guardian interactive
        this.guardian.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.startGuardianConversation())
            .on('pointerout', () => {
                this.guardian.setTint(0xFFFF00);
                this.instructionText.setText('Click to speak with the Guardian...');
            })


        // Start the idle animation
        this.guardian.play('guardian_idle');

        // Add very subtle floating animation
        this.tweens.add({
            targets: this.guardian,
            y: this.guardian.y - 3,
            duration: 6000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private createUI(): void {
        this.createInstructionsPanel();
    }

    private createInstructionsPanel(): void {
        const { width, height } = this.cameras.main;

        this.instructionText = this.add.text(width/2, height - 50,
            GAME_DIALOGS.INSTRUCTIONS, TEXT_STYLES.instructions);
        this.instructionText.setOrigin(0.5);
    }

    private createPlaceholderTextures(): void {
        // Create simple colored rectangles for various game elements
        const graphics = this.add.graphics();

        // Visitor placeholder backgrounds
        graphics.fillStyle(0x8B7355);
        graphics.fillRect(0, 0, 100, 100);
        graphics.generateTexture('visitor_placeholder', 100, 100);
        graphics.clear();
    }

    private createWalkingAnimals(): void {
        const { width, height } = this.cameras.main;
        const leftSide = width * 0.25; // Position animals on the left quarter of the screen

        this.createWalkingAnimal('giraffe', leftSide + 350, height * 0.56, 0.5);
        this.createWalkingAnimal('elephant', leftSide + 300, height * 0.65, 1.5);


        this.createWalkingAnimal('unicorn', leftSide - 200, height * 0.75, 0.8);
        this.createWalkingAnimal('rabbit', leftSide - 50, height * 0.80, 0.5);
    }

        private createWalkingAnimal(animalType: string, startX: number, y: number, scale: number): void {
        const { width } = this.cameras.main;

        // Create the animal sprite
        const animal = this.add.image(startX, y, `${animalType}_1`);
        animal.setScale(scale * 0.3); // Scale down the animals to appropriate size
        animal.setDepth(50); // Ensure animals appear behind the gate

        // Make animal interactive
        animal.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.handleAnimalInteraction(animalType))
            .on('pointerover', () => {
                animal.setTint(0xFFFF00);
                this.instructionText.setText(`Click to hear the ${animalType}'s wisdom...`);
            })
            .on('pointerout', () => {
                animal.clearTint();
                if (!this.conversationActive) {
                    this.instructionText.setText('Click to speak with the Guardian...');
                }
            });

        // Store reference for later updates
        this.interactiveAnimals.push(animal);

        const gateX = width * 4/5; // Stop before reaching the right side of the screen

        // Animal-specific walking speeds and behaviors
        const animalConfigs = {
            'elephant': { walkSpeed: 8000, frameRate: 350, bobRange: 10, pauseChance: 0.15 },
            'giraffe': { walkSpeed: 6000, frameRate: 250, bobRange: 30, pauseChance: 0.15 },
            'unicorn': { walkSpeed: 8000, frameRate: 200, bobRange: 15, pauseChance: 0.15 },
            'rabbit': { walkSpeed: 6000, frameRate: 150, bobRange: 50, pauseChance: 0.4 },
            'dog': { walkSpeed: 9000, frameRate: 180, bobRange: 10, pauseChance: 0.25 }
        };

        const config = animalConfigs[animalType as keyof typeof animalConfigs] ||
                    { walkSpeed: 10000, frameRate: 250, bobRange: 10, pauseChance: 0.2 };

        // Create walking animation by alternating between two frames
        let frame = 1;
        let isPaused = false;
        this.time.addEvent({
            delay: config.frameRate,
            callback: () => {
                if (!isPaused) {
                    frame = frame === 1 ? 2 : 1;
                    animal.setTexture(`${animalType}_${frame}`);
                }
            },
            loop: true
        });

        // Create back-and-forth walking movement with natural pauses
        this.tweens.add({
            targets: animal,
            x: gateX,
            duration: config.walkSpeed,
            repeat: -1,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onYoyo: () => {
                // Flip the animal when turning around
                animal.setFlipX(!animal.flipX);

                // Random pause at turning points
                if (Math.random() < config.pauseChance) {
                    isPaused = true;
                    this.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
                        isPaused = false;
                    });
                }
            },
            onRepeat: () => {
                // Flip the animal when starting a new cycle
                animal.setFlipX(!animal.flipX);

                // Random pause at starting points
                if (Math.random() < config.pauseChance) {
                    isPaused = true;
                    this.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
                        isPaused = false;
                    });
                }
            }
        });

        // Add natural vertical bobbing that varies by animal type
        this.tweens.add({
            targets: animal,
            y: y + Phaser.Math.Between(-config.bobRange, config.bobRange),
            duration: Phaser.Math.Between(1500, 2500),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add occasional head movement for more realism
        this.time.addEvent({
            delay: Phaser.Math.Between(5000, 15000),
            callback: () => {
                if (!isPaused) {
                    this.tweens.add({
                        targets: animal,
                        angle: Phaser.Math.Between(-5, 5),
                        duration: 1000,
                        yoyo: true,
                        ease: 'Sine.easeInOut'
                    });
                }
            },
            loop: true
        });
    }

        private async startGuardianConversation(): Promise<void> {
        if (this.conversationActive) return;

        this.conversationActive = true;
        const { width, height } = this.cameras.main;


        // Create the dialog container with buttons as children
        this.conversationBox = createDialogContainer(
            this,
            width/2, height/2,  // position
            600, 250,           // size
            GAME_DIALOGS.GUARDIAN_LOADING, // initial loading text
            [{
                text: 'Close',
                callback: () => this.closeConversation()
            }]
        );


        const message = await this.getGuardianMessage();
        const dialogText = this.conversationBox.list.find(child =>
            child instanceof Phaser.GameObjects.Text && child.text.includes('gathering wisdom')
        ) as Phaser.GameObjects.Text;

        if (dialogText) {
            dialogText.setText(message);
            dialogText.setStyle(TEXT_STYLES.dialogue);
        }

    }

    private closeConversation(): void {
        this.tweens.add({
            targets: this.conversationBox,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.conversationBox.destroy();
                this.conversationActive = false;
            }
        });
    }

    private showGuardianIntroduction(): void {
        if (this.conversationActive) return;

        this.conversationActive = true;
        const { width, height } = this.cameras.main;

        // Create the dialog container with the button as a child
        this.conversationBox = createDialogContainer(
            this,
            width/2, height/2,  // position
            650, 600,           // size
            GAME_DIALOGS.GUARDIAN_INTRO,          // text
            [{
                text: GAME_DIALOGS.GUARDIAN_ACCEPT,
                callback: () => this.closeIntroduction()
            }]
        );

        // Update instruction text
        this.instructionText.setText(GAME_DIALOGS.GUARDIAN_SPEAKING);
    }

    private closeIntroduction(): void {
        this.tweens.add({
            targets: this.conversationBox,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.conversationBox.destroy();
                this.conversationActive = false;
                this.instructionText.setText(GAME_DIALOGS.ANIMAL_WISDOM);
            }
        });
    }

    private async getGuardianMessage(): Promise<string> {
        const { medals } = window.GameState;


            const response = await webhookService.generateResponse({
                prompt: "Provide guidance to the Gatekeeper about the current state of the realm",
                context: {
                    gameState: {
                        medals
                    },
                    character: 'guardian'
                },
            });

            if (response.success) {
                return response.text;
            }

        return GAME_DIALOGS.GUARDIAN_SILENT;
    }


        private async handleAnimalInteraction(animalType: string): Promise<void> {
        if (this.conversationActive) return;

        // Special handling for unicorn - show mystical trial dialog
        if (animalType === 'unicorn') {
            this.showUnicornTrialDialog();
            return;
        }

        // Special handling for elephant - show memory trial dialog
        if (animalType === 'elephant') {
            this.showElephantTrialDialog();
            return;
        }

        this.conversationActive = true;
        const { width, height } = this.cameras.main;

        // Create the dialog container with close button as child
        this.conversationBox = createDialogContainer(
            this,
            width/2, height/2,  // position
            500, 250,           // size
            GAME_DIALOGS.ANIMAL_LOADING.replace('animal', animalType), // initial loading text
            [{
                text: 'Close',
                callback: () => this.closeConversation()
            }]
        );


        const message = await this.getAnimalMessage(animalType);
        const dialogText = this.conversationBox.list.find(child =>
            child instanceof Phaser.GameObjects.Text && child.text.includes('gathering thoughts')
        ) as Phaser.GameObjects.Text;

        if (dialogText) {
            dialogText.setText(message);
            dialogText.setStyle(TEXT_STYLES.dialogue);
        }

    }

    private showUnicornTrialDialog(): void {
        if (this.conversationActive) return;

        this.conversationActive = true;
        const { width, height } = this.cameras.main;

        // Check if fish catching trial has already been completed
        if (window.GameUtils.hasShownFishCatching()) {
            // Show completion message instead
            this.conversationBox = createDialogContainer(
                this,
                width/2, height/2,  // position
                600, 300,           // size
                GAME_DIALOGS.UNICORN_COMPLETION,     // text
                [{
                    text: GAME_DIALOGS.UNICORN_THANKS,
                    callback: () => this.closeConversation()
                }]
            );

            this.instructionText.setText(GAME_DIALOGS.UNICORN_REMEMBER);
            return;
        }

        // Create the dialog container with buttons as children
        this.conversationBox = createDialogContainer(
            this,
            width/2, height/2,  // position
            600, 400,           // size
            GAME_DIALOGS.UNICORN_TRIAL,          // text
            [{
                text: GAME_DIALOGS.UNICORN_CATCH,
                callback: () => this.startFishCatchingTrial()
            }, {
                text: GAME_DIALOGS.UNICORN_NOT_YET,
                callback: () => this.closeConversation()
            }]
        );

        // Update instruction text
        this.instructionText.setText(GAME_DIALOGS.UNICORN_OFFERS);
    }

    private startFishCatchingTrial(): void {
        this.tweens.add({
            targets: this.conversationBox,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.conversationBox.destroy();
                this.conversationActive = false;

                // Fade out and transition to fish catching scene
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('FishCatchingScene');
                });
            }
        });
    }

    private showElephantTrialDialog(): void {
        if (this.conversationActive) return;

        this.conversationActive = true;
        const { width, height } = this.cameras.main;

        // Check if elephant search trial has already been completed
        if (window.GameUtils.hasShownElephantSearch()) {
            // Show completion message instead
            this.conversationBox = createDialogContainer(
                this,
                width/2, height/2,  // position
                600, 300,           // size
                GAME_DIALOGS.ELEPHANT_COMPLETION,     // text
                [{
                    text: GAME_DIALOGS.ELEPHANT_THANKS,
                    callback: () => this.closeConversation()
                }]
            );

            this.instructionText.setText(GAME_DIALOGS.ELEPHANT_REMEMBER);
            return;
        }

        // Create the dialog container with buttons as children
        this.conversationBox = createDialogContainer(
            this,
            width/2, height/2,  // position
            600, 400,           // size
            GAME_DIALOGS.ELEPHANT_TRIAL,          // text
            [{
                text: GAME_DIALOGS.ELEPHANT_TEST,
                callback: () => this.startElephantSearchTrial()
            }, {
                text: GAME_DIALOGS.UNICORN_NOT_YET,
                callback: () => this.closeConversation()
            }]
        );

        // Update instruction text
        this.instructionText.setText(GAME_DIALOGS.ELEPHANT_OFFERS);
    }

    private startElephantSearchTrial(): void {
        this.tweens.add({
            targets: this.conversationBox,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.conversationBox.destroy();
                this.conversationActive = false;

                // Fade out and transition to elephant search scene
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('ElephantSearchScene');
                });
            }
        });
    }

        private async getAnimalMessage(animalType: string): Promise<string> {
        const { medals } = window.GameState;

            const response = await webhookService.generateResponse({
                prompt: `Provide wisdom and guidance to the Gatekeeper as a ${animalType}`,
                context: {
                    gameState: {
                        medals
                    },
                    character: animalType
                },
            });

        if (response.success) {
            return response.text;
        }

        return GAME_DIALOGS.ANIMAL_SILENT;
    }

    private endGame(): void {
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('TitleScene');
        });
    }

    update(): void {
        this.meterPanel.updateMeters();
    }

    // Method to update gate state based on medals
    updateGateState(): void {
        const canOpen = window.GameUtils.canOpenGate();
        this.toggleGate(canOpen);

        // Update instruction text
        if (canOpen) {
            this.instructionText.setText(GAME_DIALOGS.GATE_OPEN);
        } else {
            this.instructionText.setText(GAME_DIALOGS.INSTRUCTIONS);
        }
    }

    // Handle gate click when it's open
    private handleGateClick(): void {
        const isGateOpen = this.registry.get('gateOpen');

        if (isGateOpen && window.GameUtils.canOpenGate()) {
            // Transition to Credit Scene
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('CreditScene');
            });
        }
    }

    private checkForNewMedals(): void {
        const currentMedals = window.GameState.medals;
        const lastKnownMedals = window.GameState.lastKnownMedals;

        if (currentMedals > lastKnownMedals) {
            // New medal earned! Trigger animation
            this.meterPanel.animateMedalGain(currentMedals);
        } else {
            // No new medals, just update the display
            this.meterPanel.updateMeters();
        }

        // Always update the last known count for future comparisons
        window.GameState.lastKnownMedals = currentMedals;
    }

    shutdown(): void {
        // Clean up conversation state
        this.conversationActive = false;

        // Clean up conversation box if active
        if (this.conversationBox && this.conversationBox.active) {
            this.conversationBox.destroy();
            this.conversationBox = null!;
        }

        // Clean up guardian
        if (this.guardian) {
            this.guardian.destroy();
            this.guardian = null!;
        }

        // Clean up interactive animals and their event listeners
        this.interactiveAnimals.forEach(animal => {
            if (animal && animal.active) {
                animal.off('pointerdown');
                animal.off('pointerover');
                animal.off('pointerout');
                animal.destroy();
            }
        });
        this.interactiveAnimals = [];

        // Clean up UI elements
        if (this.instructionText) {
            this.instructionText.destroy();
            this.instructionText = null!;
        }

        if (this.meterPanel) {
            this.meterPanel.destroy();
            this.meterPanel = null!;
        }

        // Clean up registry entries
        this.registry.remove('gateSprite');
        this.registry.remove('gateOpen');

        this.tweens.killAll();
        this.anims.pauseAll();

        this.time.removeAllEvents();

        this.input.off('pointerdown');
        this.input.off('pointerover');
        this.input.off('pointerout');
    }
}