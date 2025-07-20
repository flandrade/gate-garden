import { VisitorUtils } from '../data/visitors';
import { EventUtils, RandomEvent } from '../data/events';
import MeterPanel from '../ui/MeterPanel';
import VisitorCard from '../components/VisitorCard';
import { Visitor } from '../data/visitors';
import { webhookService } from '../services/AgentService';

export default class GameScene extends Phaser.Scene {
    private currentVisitors: Visitor[] = [];
    private currentVisitorCards: VisitorCard[] = [];
    private isWaitingForDecision: boolean = false;
    private eventInProgress: boolean = false;
    private meterPanel!: MeterPanel;
    private dayText!: Phaser.GameObjects.Text;
    private instructionText!: Phaser.GameObjects.Text;
    private nextDayButton!: Phaser.GameObjects.Text;
    private eventElements: Phaser.GameObjects.GameObject[] = [];

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

        // Log if image fails to load (fallback handled in create())
        this.load.on('loaderror', (file: any) => {
            if (file.key === 'main_background') {
                console.log('Background image not found, using fallback gradient');
            }
        });

        // Create placeholder textures for the game
        this.createPlaceholderTextures();
    }

    create(): void {
        const { width, height } = this.cameras.main;

        // Initialize game state
        this.currentVisitors = [];
        this.currentVisitorCards = [];
        this.isWaitingForDecision = false;
        this.eventInProgress = false;

        // Create background
        this.createBackground();

        // Create UI elements
        this.createUI();

        // Create meter panel
        this.meterPanel = new MeterPanel(this, width - 150, 120);

        // Start the first day
        this.startNewDay();

        // Fade in effect
        this.cameras.main.fadeIn(1000, 0, 0, 0);
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

        // Add garden-like atmospheric elements
        this.createAtmosphericElements();

        // Create the mystical gate
        this.createGate();

        // Add walking animals on the left side
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
        const gate = this.add.image(width*3/5 + 50, height*2/4, 'gate_closed');
        gate.setScale(0.7); // Adjust scale as needed
        gate.setDepth(100); // Ensure gate appears above animals

        // Store gate reference for later state changes
        this.registry.set('gateSprite', gate);
        this.registry.set('gateOpen', false);

        // Create the Guardian of the Gate
        this.createGuardian();

        // Mystical glow around the gate
        const glow = this.add.circle(width/2, height/2, 160, 0xFFD700, 0.1);
        this.tweens.add({
            targets: glow,
            alpha: 0.2,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
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
        // Day counter
        const dayStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '24px',
            fontFamily: 'Georgia, serif',
            color: '#FFD700',
            fontStyle: 'bold',
            backgroundColor: '#8B4513',
            padding: { x: 15, y: 8 },
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        };

        this.dayText = this.add.text(30, 30, 'Day 1', dayStyle);

        // Game title
        const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '28px',
            fontFamily: 'Georgia, serif',
            color: '#D2691E',
            fontStyle: 'bold',
            align: 'center'
        };

        // Instructions panel
        this.createInstructionsPanel();

        // Next day button (initially hidden)
        this.createNextDayButton();
    }

    private createInstructionsPanel(): void {
        const { width, height } = this.cameras.main;

        const instructionStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '16px',
            fontFamily: 'Georgia, serif',
            color: '#CD853F',
            align: 'center',
            backgroundColor: '#2F1B14',
            padding: { x: 15, y: 10 }
        };

        this.instructionText = this.add.text(width/2, height - 50,
            'Click to speak with the Guardian...', instructionStyle);
        this.instructionText.setOrigin(0.5);
    }

    private createNextDayButton(): void {
        const { width, height } = this.cameras.main;

        const buttonStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '18px',
            fontFamily: 'Georgia, serif',
            color: '#FFD700',
            backgroundColor: '#4B0000',
            padding: { x: 12, y: 6 },
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        };

        this.nextDayButton = this.add.text(width/2, height - 100, 'NEXT DAY', buttonStyle)
            .setOrigin(0.5)
            .setVisible(false)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.advanceToNextDay())
            .on('pointerover', () => {
                this.nextDayButton.setStyle({ backgroundColor: '#800000' });
                this.tweens.add({
                    targets: this.nextDayButton,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 150
                });
            })
            .on('pointerout', () => {
                this.nextDayButton.setStyle({ backgroundColor: '#4B0000' });
                this.tweens.add({
                    targets: this.nextDayButton,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 150
                });
            });
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

    private startNewDay(): void {
        // Update day counter
        this.dayText.setText(`Day ${window.GameState.currentDay}`);

        // Ensure gate starts closed for the new day
        this.toggleGate(false);

        // Check for random events first
        if (EventUtils.shouldTriggerEvent(window.GameState.currentDay)) {
            this.triggerRandomEvent();
            return;
        }

        // Generate daily visitors
        this.currentVisitors = VisitorUtils.getDailyVisitors();
        window.GameState.visitorsToday = 0;

        // Display visitors
        //this.displayVisitors();

        // Update instructions
        this.instructionText.setText('Click to speak with the Guardian...');

        // Hide next day button
        this.nextDayButton.setVisible(false);
    }

    private displayVisitors(): void {
        const { width, height } = this.cameras.main;

        // Clear any existing visitor cards
        this.currentVisitorCards.forEach(card => card.destroy());
        this.currentVisitorCards = [];

        // Create visitor cards
        const cardPositions = [
            { x: width/2 - 200, y: height/2 },
            { x: width/2 + 200, y: height/2 }
        ];

        this.currentVisitors.forEach((visitor, index) => {
            const position = cardPositions[index];
            const card = new VisitorCard(
                this,
                position.x,
                position.y,
                visitor,
                (visitorData, decision) => this.handleVisitorDecision(visitorData, decision)
            );

            this.currentVisitorCards.push(card);
        });

        this.isWaitingForDecision = true;
    }

    private handleVisitorDecision(visitorData: Visitor, decision: 'allow' | 'deny'): void {
        // Store old meter values for animation
        const oldValues = { ...window.GameState.meters };

        // Open or close gate based on decision
        this.toggleGate(decision === 'allow');

        // Apply effects based on decision
        const effects = visitorData.effects[decision];

        Object.entries(effects).forEach(([meter, change]) => {
            if (change !== 0) {
                window.GameUtils.updateMeter(meter as keyof typeof window.GameState.meters, change);

                // Animate meter change
                this.meterPanel.animateMeterChange(meter, oldValues[meter as keyof typeof oldValues], window.GameState.meters[meter as keyof typeof window.GameState.meters]);

                // Show critical warning if meter is very low
                if (window.GameState.meters[meter as keyof typeof window.GameState.meters] <= 25) {
                    this.meterPanel.showCriticalWarning(meter);
                }
            }
        });

        // Update visitor count
        window.GameState.visitorsToday++;

        // Update instructions with decision feedback
        const decisionText = decision === 'allow' ? 'granted passage' : 'turned away';
        this.instructionText.setText(`${visitorData.name} was ${decisionText}.`);

        // Remove the visitor card after a delay
        const cardIndex = this.currentVisitors.indexOf(visitorData);
        if (cardIndex >= 0 && this.currentVisitorCards[cardIndex]) {
            this.time.delayedCall(1000, () => {
                this.currentVisitorCards[cardIndex].removeCard();
            });
        }

        // Close gate after visitor passes through (if it was opened)
        if (decision === 'allow') {
            this.time.delayedCall(2000, () => {
                this.toggleGate(false); // Close the gate
            });
        }

        // Check if day is complete or game should end
        this.time.delayedCall(1500, () => {
            this.checkDayCompletion();
        });
    }

    private checkDayCompletion(): void {
        // Check for game over conditions
        if (window.GameState.gameOver) {
            this.endGame();
            return;
        }

        // Check if all visitors for the day have been processed
        if (window.GameState.visitorsToday >= window.GameState.maxVisitorsPerDay) {
            this.instructionText.setText('The gates close as evening falls...');
            this.nextDayButton.setVisible(true);
        }
    }

    private advanceToNextDay(): void {
        // Advance game state
        window.GameUtils.nextDay();

        // Check if game should end due to day limit
        if (window.GameState.gameOver) {
            this.endGame();
            return;
        }

        // Start new day
        this.startNewDay();
    }

    private triggerRandomEvent(): void {
        this.eventInProgress = true;

        // Get a random event for this day
        const events = EventUtils.getEventsForDay(window.GameState.currentDay);
        const event = events.length > 0 ? events[0] : EventUtils.getRandomEvent();

        if (!event) {
            // No event triggered, proceed with normal day
            this.eventInProgress = false;
            this.startNewDay();
            return;
        }

        this.displayEventCard(event);
    }

    private displayEventCard(event: RandomEvent): void {
        const { width, height } = this.cameras.main;

        // Create event card background
        const cardWidth = 500;
        const cardHeight = 400;

        const eventBg = this.add.rectangle(width/2, height/2, cardWidth, cardHeight, 0x4B0082, 0.95);
        eventBg.setStrokeStyle(3, 0x9370DB);

        // Event title
        const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '24px',
            fontFamily: 'Georgia, serif',
            color: '#FFD700',
            fontStyle: 'bold',
            align: 'center'
        };

        const title = this.add.text(width/2, height/2 - 150, event.name, titleStyle);
        title.setOrigin(0.5);

        // Event description
        const descStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '16px',
            fontFamily: 'Georgia, serif',
            color: '#E6E6FA',
            align: 'center',
            wordWrap: { width: 450 },
            lineSpacing: 8
        };

        const description = this.add.text(width/2, height/2 - 50, event.description, descStyle);
        description.setOrigin(0.5);

        // Create choice buttons
        this.createEventChoiceButtons(event, width, height);

        // Store event elements for cleanup
        this.eventElements = [eventBg, title, description];
    }

    private createEventChoiceButtons(event: RandomEvent, width: number, height: number): void {
        const buttonStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '14px',
            fontFamily: 'Georgia, serif',
            color: '#FFFFFF',
            backgroundColor: '#4B0082',
            padding: { x: 10, y: 8 },
            wordWrap: { width: 200 }
        };

        event.choices.forEach((choice, index) => {
            const y = height/2 + 80 + (index * 60);

            const button = this.add.text(width/2, y, choice.text, buttonStyle)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.handleEventChoice(choice))
                .on('pointerover', () => {
                    button.setStyle({ backgroundColor: '#9370DB' });
                    this.tweens.add({
                        targets: button,
                        scaleX: 1.05,
                        scaleY: 1.05,
                        duration: 150
                    });
                })
                .on('pointerout', () => {
                    button.setStyle({ backgroundColor: '#4B0082' });
                    this.tweens.add({
                        targets: button,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 150
                    });
                });

            this.eventElements.push(button);
        });
    }

    private handleEventChoice(choice: { text: string; effects: any }): void {
        // Store old meter values for animation
        const oldValues = { ...window.GameState.meters };

        // Apply event effects
        Object.entries(choice.effects).forEach(([meter, change]) => {
            if (change !== 0) {
                window.GameUtils.updateMeter(meter as keyof typeof window.GameState.meters, change as number);

                // Animate meter change
                this.meterPanel.animateMeterChange(meter, oldValues[meter as keyof typeof oldValues], window.GameState.meters[meter as keyof typeof window.GameState.meters]);
            }
        });

        // Clean up event elements
        this.eventElements.forEach(element => {
            this.tweens.add({
                targets: element,
                alpha: 0,
                duration: 500,
                onComplete: () => element.destroy()
            });
        });

        // Continue with the day after event cleanup
        this.time.delayedCall(800, () => {
            this.eventInProgress = false;

            // Check for game over after event
            if (window.GameState.gameOver) {
                this.endGame();
            } else {
                // Continue with normal day
                this.currentVisitors = VisitorUtils.getDailyVisitors();
                window.GameState.visitorsToday = 0;
                this.displayVisitors();
            }
        });
    }

    private createWalkingAnimals(): void {
        const { width, height } = this.cameras.main;
        const leftSide = width * 0.25; // Position animals on the left quarter of the screen

        this.createWalkingAnimal('giraffe', leftSide - 250, height * 0.56, 0.5);
        this.createWalkingAnimal('elephant', leftSide, height * 0.65, 1.5);

        //this.createWalkingAnimal('dog', leftSide - 150, height * 0.7, 0.65);

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

        // Calculate gate position (where animals should stop and turn around)
        const gateX = width * 3/5 - 100; // Stop before reaching the gate area

        // Animal-specific walking speeds and behaviors
        const animalConfigs = {
            'elephant': { walkSpeed: 8000, frameRate: 250, bobRange: 10, pauseChance: 0.15 },
            'giraffe': { walkSpeed: 8000, frameRate: 250, bobRange: 10, pauseChance: 0.1 },
            'unicorn': { walkSpeed: 8000, frameRate: 200, bobRange: 15, pauseChance: 0.1 },
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

        // Create conversation box
        this.conversationBox = this.add.container(width/2, height/2);
        this.conversationBox.setDepth(150);

        // Background
        const bg = this.add.rectangle(0, 0, 600, 300, 0x2F1B14, 0.95);
        bg.setStrokeStyle(3, 0xFFD700);
        this.conversationBox.add(bg);

        // Loading text while generating message
        const loadingText = this.add.text(0, -50, 'The Guardian is gathering wisdom...', {
            fontSize: '18px',
            fontFamily: 'Georgia, serif',
            color: '#FFD700',
            align: 'center'
        });
        loadingText.setOrigin(0.5);
        this.conversationBox.add(loadingText);

        // Close button
        const closeButton = this.add.text(0, 100, 'Close', {
            fontSize: '16px',
            fontFamily: 'Georgia, serif',
            color: '#FFFFFF',
            backgroundColor: '#4B0000',
            padding: { x: 15, y: 8 }
        });
        closeButton.setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.closeConversation())
            .on('pointerover', () => {
                closeButton.setStyle({ backgroundColor: '#800000' });
            })
            .on('pointerout', () => {
                closeButton.setStyle({ backgroundColor: '#4B0000' });
            });
        this.conversationBox.add(closeButton);

        // Fade in effect
        this.conversationBox.setAlpha(0);
        this.tweens.add({
            targets: this.conversationBox,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });

        // Generate guardian message asynchronously
        try {
            const message = await this.getGuardianMessage();

            const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
                fontSize: '18px',
                fontFamily: 'Georgia, serif',
                color: '#FFD700',
                align: 'center',
                wordWrap: { width: 550 },
                lineSpacing: 8
            };

            // Replace loading text with actual message
            loadingText.setText(message);
            loadingText.setStyle(textStyle);
        } catch (error) {
            console.error('Failed to get guardian message:', error);
            loadingText.setText('The Guardian is silent for now...');
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
                this.instructionText.setText('Click to speak with the Guardian...');
            }
        });
    }

    private async getGuardianMessage(): Promise<string> {
        const { health, support, trust, stability } = window.GameState.meters;
        const day = window.GameState.currentDay;

        // Try to get webhook-generated message first
        try {
            const response = await webhookService.generateResponse({
                prompt: "Provide guidance to the Gatekeeper about the current state of the realm",
                context: {
                    gameState: {
                        meters: { health, support, trust, stability },
                        currentDay: day,
                        maxDays: window.GameState.maxDays
                    },
                    character: 'guardian'
                },
                maxTokens: 120,
                temperature: 0.7
            });

            if (response.success) {
                return response.text;
            }
        } catch (error) {
            console.warn('Webhook generation failed, using fallback:', error);
        }

        // Fallback to static messages
        // Check for critical states first
        if (health <= 25) {
            return "The air grows thick with sickness, Gatekeeper. The realm's health wanes like a dying flame. You must act swiftly to restore balance, lest the plague consume all.";
        }
        if (trust <= 25) {
            return "I sense unrest in the hearts of the people, Gatekeeper. Their trust in your judgment falters like leaves in autumn wind. The seeds of rebellion may soon sprout.";
        }
        if (stability <= 25) {
            return "The foundations of order crumble, Gatekeeper. Chaos whispers in the shadows, waiting to claim what remains of your authority. The realm teeters on the edge of anarchy.";
        }
        if (support <= 25) {
            return "Prosperity flees from your lands, Gatekeeper. The people's support dwindles like water in a drought. Without their backing, your rule becomes as fragile as morning frost.";
        }

        // General advice based on meter balance
        if (health > 70 && support > 70) {
            return "The realm flourishes under your watch, Gatekeeper. Health and prosperity dance together like spring blossoms. Yet remember, even the mightiest tree can fall if its roots are weak.";
        }
        if (trust > 70 && stability > 70) {
            return "Order and trust flow through your lands like a gentle river, Gatekeeper. The people believe in your wisdom, and stability reigns. But beware the calm before the storm.";
        }

        // Day-specific messages
        if (day === 1) {
            return "Welcome, new Gatekeeper. I am the Guardian of this mystical realm. The balance of four forces rests in your hands: Health, Support, Trust, and Stability. Choose wisely, for each decision ripples through the fabric of this world.";
        }
        if (day >= 8) {
            return "The end of your trial approaches, Gatekeeper. The realm's fate hangs in the balance. Your choices have shaped this world - now we shall see if wisdom or folly prevails.";
        }

        // Default message
        return "The mystical energies flow around us, Gatekeeper. Each choice you make affects the delicate balance of this realm. Listen to the whispers of the animals, for they carry ancient wisdom.";
    }

        private async handleAnimalInteraction(animalType: string): Promise<void> {
        if (this.conversationActive) return;

        this.conversationActive = true;
        const { width, height } = this.cameras.main;

        // Create conversation box
        this.conversationBox = this.add.container(width/2, height/2);
        this.conversationBox.setDepth(150);

        // Background
        const bg = this.add.rectangle(0, 0, 500, 250, 0x2F1B14, 0.95);
        bg.setStrokeStyle(3, 0xFFD700);
        this.conversationBox.add(bg);

        // Loading text while generating message
        const loadingText = this.add.text(0, -30, `The ${animalType} is gathering thoughts...`, {
            fontSize: '16px',
            fontFamily: 'Georgia, serif',
            color: '#E6E6FA',
            align: 'center'
        });
        loadingText.setOrigin(0.5);
        this.conversationBox.add(loadingText);

        // Close button
        const closeButton = this.add.text(0, 80, 'Close', {
            fontSize: '14px',
            fontFamily: 'Georgia, serif',
            color: '#FFFFFF',
            backgroundColor: '#4B0000',
            padding: { x: 12, y: 6 }
        });
        closeButton.setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.closeConversation())
            .on('pointerover', () => {
                closeButton.setStyle({ backgroundColor: '#800000' });
            })
            .on('pointerout', () => {
                closeButton.setStyle({ backgroundColor: '#4B0000' });
            });
        this.conversationBox.add(closeButton);

        // Fade in effect
        this.conversationBox.setAlpha(0);
        this.tweens.add({
            targets: this.conversationBox,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });

        // Generate animal message asynchronously
        try {
            const message = await this.getAnimalMessage(animalType);

            const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
                fontSize: '16px',
                fontFamily: 'Georgia, serif',
                color: '#E6E6FA',
                align: 'center',
                wordWrap: { width: 450 },
                lineSpacing: 6
            };

            // Replace loading text with actual message
            loadingText.setText(message);
            loadingText.setStyle(textStyle);
        } catch (error) {
            console.error('Failed to get animal message:', error);
            loadingText.setText(`The ${animalType} is silent for now...`);
        }
    }

        private async getAnimalMessage(animalType: string): Promise<string> {
        const { health, support, trust, stability } = window.GameState.meters;

            const response = await webhookService.generateResponse({
                prompt: `Provide wisdom and guidance to the Gatekeeper as a ${animalType}`,
                context: {
                    gameState: {
                        meters: { health, support, trust, stability },
                        currentDay: window.GameState.currentDay,
                        maxDays: window.GameState.maxDays
                    },
                    character: animalType
                },
                maxTokens: 100,
                temperature: 0.8
            });

        if (response.success) {
            return response.text;
        }

        return response.text;
    }

    private endGame(): void {
        // Fade out and transition to end scene
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('TitleScene');
        });
    }

    update(): void {
        // Update meter panel
        this.meterPanel.updateMeters();

        // Update animal behaviors based on meter states
        this.updateAnimalBehaviors();

        // Any ongoing animations or state checks can go here
    }

    private updateAnimalBehaviors(): void {
        const { health, support, trust, stability } = window.GameState.meters;

        // Update unicorn visibility based on trust
        const unicorn = this.interactiveAnimals.find(animal =>
            animal.texture.key === 'unicorn_1' || animal.texture.key === 'unicorn_2'
        );
        if (unicorn) {
            if (trust <= 20) {
                unicorn.setAlpha(0.3);
            } else if (trust >= 80) {
                unicorn.setAlpha(1);
                unicorn.setTint(0xFFFF00); // Golden glow when trust is high
            } else {
                unicorn.setAlpha(0.7);
                unicorn.clearTint();
            }
        }

        // Update rabbit behavior based on health
        const rabbit = this.interactiveAnimals.find(animal =>
            animal.texture.key === 'rabbit_1' || animal.texture.key === 'rabbit_2'
        );
        if (rabbit) {
            if (health <= 30) {
                rabbit.setScale(rabbit.scaleX * 0.8); // Shrinks when health is low
            } else if (health >= 80) {
                rabbit.setScale(rabbit.scaleX * 1.2); // Grows when health is high
            }
        }
    }
}