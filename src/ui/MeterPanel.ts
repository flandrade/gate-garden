export default class MeterPanel {
    private scene: Phaser.Scene;
    private x: number;
    private y: number;
    private container: Phaser.GameObjects.Container;
    private medalIcons: Phaser.GameObjects.Text[] = [];
    private emptyMedalBackgrounds: Phaser.GameObjects.Text[] = [];
    private medalText!: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.container = scene.add.container(x, y);

        this.createPanel();
        this.createMedalDisplay();
    }

    private createPanel(): void {
        // Create parchment-style background
        const panelWidth = 200;
        const panelHeight = 90;

        // Background parchment
        const bg = this.scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x8B7355, 0.9);
        bg.setStrokeStyle(3, 0x654321);
        this.container.add(bg);

        // Decorative border
        const border = this.scene.add.rectangle(0, 0, panelWidth - 10, panelHeight - 10, 0x8B7355, 0);
        border.setStrokeStyle(2, 0x4A3429);
        this.container.add(border);
    }

    private createMedalDisplay(): void {
        // Create 3 medal icon slots
        const startX = -65;
        const spacing = 30;

        for (let i = 0; i < 3; i++) {
            const x = startX + (i * spacing);

            // Medal slot background (empty medal)
            const emptyMedal = this.scene.add.text(x, 0, '⚪', {
                fontSize: '24px',
                fontFamily: 'Arial, sans-serif'
            });
            emptyMedal.setOrigin(0.5);
            this.container.add(emptyMedal);
            this.emptyMedalBackgrounds.push(emptyMedal);

            // Medal icon (hidden initially)
            const medalIcon = this.scene.add.text(x, 0, '🥇', {
                fontSize: '24px',
                fontFamily: 'Arial, sans-serif'
            });
            medalIcon.setOrigin(0.5);
            medalIcon.setVisible(false);
            this.container.add(medalIcon);

            this.medalIcons.push(medalIcon);
        }

        // Medal count text
        const medalCountStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '20px',
            fontFamily: 'Georgia, serif',
            color: '#2F1B14',
            fontStyle: 'bold'
        };

        this.medalText = this.scene.add.text(50, 0, '0 / 3', medalCountStyle);
        this.medalText.setOrigin(0.5);
        this.container.add(this.medalText);
    }

    updateMeters(): void {
        const state = window.GameState;
        const medals = Math.max(0, Math.min(3, state.medals)); // Clamp between 0-3

        // Update medal count text
        this.medalText.setText(`${medals} / 3`);

        // Update medal icons visibility and hide empty backgrounds when medals are earned
        this.medalIcons.forEach((icon, index) => {
            icon.setVisible(index < medals);
        });

        // Hide empty medal backgrounds for earned medals
        this.emptyMedalBackgrounds.forEach((background, index) => {
            background.setVisible(index >= medals);
        });

        // Add special effect for gate opening threshold
        if (medals >= 2) {
            this.medalText.setColor('#FFD700');
        } else {
            this.medalText.setColor('#2F1B14');
        }
    }

    animateMedalGain(newMedalCount: number): void {
        // Animate the new medal appearing
        if (newMedalCount > 0 && newMedalCount <= 3) {
            const medalIndex = newMedalCount - 1;
            const newMedal = this.medalIcons[medalIndex];

            // Make medal visible and hide the corresponding empty background
            newMedal.setVisible(true);
            newMedal.setScale(0);

            // Hide the empty medal background for this position
            const emptyBackground = this.emptyMedalBackgrounds[medalIndex];
            if (emptyBackground) {
                emptyBackground.setVisible(false);
            }

            this.scene.tweens.add({
                targets: newMedal,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 300,
                ease: 'Back.easeOut',
                onComplete: () => {
                    this.scene.tweens.add({
                        targets: newMedal,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 200,
                        ease: 'Power2'
                    });
                }
            });

            // Show celebration text
            this.showCelebrationText(newMedalCount);
        }

        // Update the display
        this.updateMeters();
    }

    private showCelebrationText(medalCount: number): void {
        let celebrationText = 'Medal Earned!';
        let textColor = '#32CD32';

        if (medalCount === 2) {
            celebrationText = 'Gate Unlocked!';
            textColor = '#FFD700';
        } else if (medalCount === 3) {
            celebrationText = 'All Medals!';
            textColor = '#FF6347';
        }

        const celebrationStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '24px',
            fontFamily: 'Georgia, serif',
            color: textColor,
            fontStyle: 'bold'
        };

        const celebration = this.scene.add.text(0, 65, celebrationText, celebrationStyle);
        celebration.setOrigin(0.5);
        this.container.add(celebration);

        // Animate the celebration text
        this.scene.tweens.add({
            targets: celebration,
            y: 55,
            alpha: 0,
            duration: 2000,
            ease: 'Power2.easeOut',
            onComplete: () => {
                celebration.destroy();
            }
        });
    }

    canOpenGate(): boolean {
        return window.GameState.medals >= 2;
    }

    getContainer(): Phaser.GameObjects.Container {
        return this.container;
    }

    destroy(): void {
        this.container.destroy();
    }
}