import { TEXT_COLORS, TEXT_STYLES } from '../utils/textConfig';

export default class CreditScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CreditScene' });
    }

    preload(): void {
        // Load the credit background image
        this.load.image('credit_background', 'assets/backgrounds/credit.png');

        // Fallback in case the image doesn't load
        this.load.on('loaderror', (file: any) => {
            if (file.key === 'credit_background') {
                console.log('Credit background image not found, using fallback');
            }
        });
    }

    create(): void {
        // Create background
        this.createBackground();

        // Create the main congratulations text
        this.createCongratulatoryText();

        // Create credits section
        this.createCreditsSection();

        // Create continue button
        this.createContinueButton();

        // Fade in effect
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // Add some ambient particles for magic effect
        this.createMagicalParticles();
    }

    private createBackground(): void {
        const { width, height } = this.cameras.main;

        if (this.textures.exists('credit_background')) {
            // Use the credit background image
            const bg = this.add.image(width/2, height/2, 'credit_background');
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            const scale = Math.max(scaleX, scaleY);
            bg.setScale(scale);

            // Add a subtle overlay to ensure text readability
            this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.3);
        } else {
            // Fallback gradient background
            this.add.rectangle(width/2, height/2, width, height, 0x2F1B45);

            // Add some mystical elements
            this.add.circle(width * 0.2, height * 0.3, 80, 0x4B0082, 0.3);
            this.add.circle(width * 0.8, height * 0.7, 120, 0x663399, 0.2);
        }
    }

    private createCongratulatoryText(): void {
        const { width, height } = this.cameras.main;

        // Main congratulations title
        const titleText = this.add.text(
            width/2,
            height * 0.15,
            'Congratulations!',
            TEXT_STYLES.title
        );
        titleText.setOrigin(0.5);

        // Achievement text
        const achievementText = this.add.text(
            width/2,
            height * 0.3,
            'You have earned the right to enter\nThe Garden of Earthly Delights',
            TEXT_STYLES.subtitle
        );
        achievementText.setOrigin(0.5);

        // Description text
        const descriptionText = this.add.text(
            width/2,
            height * 0.45,
            'Through wisdom, patience, and skill, you have proven yourself worthy.\nThe ancient mysteries of the garden now await your discovery.',
            TEXT_STYLES.dialogue
        );
        descriptionText.setOrigin(0.5);

        // Animate the title
        titleText.setScale(0);
        this.tweens.add({
            targets: titleText,
            scaleX: 1,
            scaleY: 1,
            duration: 800,
            ease: 'Back.easeOut'
        });

        // Stagger the other text animations
        achievementText.setAlpha(0);
        this.tweens.add({
            targets: achievementText,
            alpha: 1,
            duration: 1000,
            delay: 500,
            ease: 'Power2.easeOut'
        });

        descriptionText.setAlpha(0);
        this.tweens.add({
            targets: descriptionText,
            alpha: 1,
            duration: 1000,
            delay: 1000,
            ease: 'Power2.easeOut'
        });
    }

    private createCreditsSection(): void {
        const { width, height } = this.cameras.main;

        // Credits header
        const creditsHeader = this.add.text(
            width/2,
            height * 0.65,
            'Credits',
            {
                fontSize: '32px',
                fontFamily: 'Georgia, serif',
                color: TEXT_COLORS.title,
                fontStyle: 'bold'
            }
        );
        creditsHeader.setOrigin(0.5);


        // Author credit
        const authorText = this.add.text(
            width/2,
             height * 0.7,
            'Created by Fernanda Andrade',
            TEXT_STYLES.dialogue
        );
        authorText.setOrigin(0.5);

        // GitHub link (interactive)
        const githubText = this.add.text(
            width/2,
            height * 0.73,
            'github.com/flandrade',
            {
                ...TEXT_STYLES.dialogue,
                fontStyle: 'italic'
            }
        );
        githubText.setOrigin(0.5);
        githubText.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                githubText.setScale(1.1);
                githubText.setColor(TEXT_COLORS.goldLight);
            })
            .on('pointerout', () => {
                githubText.setScale(1);
                githubText.setColor(TEXT_COLORS.goldLight);
            })
            .on('pointerdown', () => {
                window.open('https://github.com/flandrade', '_blank');
            });


        // Game inspiration
        const inspirationText = this.add.text(
            width/2,
            height * 0.83,
            'Game based on The Garden of Earthly Delights\nby Hieronymus Bosch',
            TEXT_STYLES.dialogue
        );
        inspirationText.setOrigin(0.5);

        // Animate credits with staggered delays
        [creditsHeader, inspirationText, authorText, githubText].forEach((text, index) => {
            text.setAlpha(0);
            this.tweens.add({
                targets: text,
                alpha: 1,
                duration: 800,
                delay: 1500 + (index * 300),
                ease: 'Power2.easeOut'
            });
        });
    }

    private createContinueButton(): void {
        const { width, height } = this.cameras.main;

        const buttonText = this.add.text(
            width/2,
            height * 0.95,
            'Press any key to return to the garden',
            TEXT_STYLES.instructions
        );
        buttonText.setOrigin(0.5);

        // Pulsing effect
        this.tweens.add({
            targets: buttonText,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Power2.easeInOut'
        });

        // Set up input to return to game
        this.input.keyboard?.once('keydown', () => {
            this.returnToGame();
        });

        this.input.once('pointerdown', () => {
            this.returnToGame();
        });

        // Animate button in
        buttonText.setAlpha(0);
        this.tweens.add({
            targets: buttonText,
            alpha: 1,
            duration: 800,
            delay: 3000,
            ease: 'Power2.easeOut'
        });
    }

    private createMagicalParticles(): void {
        const { width, height } = this.cameras.main;

        // Create floating golden particles
        for (let i = 0; i < 30; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(2, 4),
                0xFFD700,
                Phaser.Math.FloatBetween(0.3, 0.7)
            );

            this.tweens.add({
                targets: particle,
                x: particle.x + Phaser.Math.Between(-100, 100),
                y: particle.y + Phaser.Math.Between(-50, 50),
                alpha: particle.alpha * 0.1,
                duration: Phaser.Math.Between(6000, 10000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    private returnToGame(): void {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }

    shutdown(): void {
        // Clean up input listeners
        this.input.removeAllListeners();

        // Stop all tweens
        this.tweens.killAll();

        // Clear all time events
        this.time.removeAllEvents();

        // Clear any ongoing camera effects
        this.cameras.main.resetFX();
    }
}