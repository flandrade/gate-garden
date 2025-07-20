// Interface for meter configuration
interface MeterConfig {
    key: string;
    name: string;
    icon: string;
    color: number;
    warningColor: number;
    dangerColor: number;
}

export default class MeterPanel {
    private scene: Phaser.Scene;
    private x: number;
    private y: number;
    private container: Phaser.GameObjects.Container;
    private meterConfigs: MeterConfig[];
    private meterBars: Record<string, Phaser.GameObjects.Rectangle>;
    private meterTexts: Record<string, Phaser.GameObjects.Text>;
    private meterIcons: Record<string, Phaser.GameObjects.Text>;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.container = scene.add.container(x, y);

        // Meter configurations with surreal medieval icons
        this.meterConfigs = [
            {
                key: 'health',
                name: 'Public Health',
                icon: '🦠', // Fly swarm icon (placeholder)
                color: 0x32CD32,
                warningColor: 0xFFD700,
                dangerColor: 0xFF4169
            },
            {
                key: 'support',
                name: 'Support/Economy',
                icon: '🌺', // Golden fruit icon (placeholder)
                color: 0xFFD700,
                warningColor: 0xFF8C00,
                dangerColor: 0xFF4169
            },
            {
                key: 'trust',
                name: 'Public Trust',
                icon: '🗣️', // Cracked mirror/eye icon (placeholder)
                color: 0x4169E1,
                warningColor: 0xFFD700,
                dangerColor: 0xFF4169
            },
            {
                key: 'stability',
                name: 'Political Stability',
                icon: '⚖️', // Twisted sceptre icon (placeholder)
                color: 0x9370DB,
                warningColor: 0xFFD700,
                dangerColor: 0xFF4169
            }
        ];

        this.meterBars = {};
        this.meterTexts = {};
        this.meterIcons = {};

        this.createPanel();
        this.createMeters();
    }

    private createPanel(): void {
        // Create parchment-style background
        const panelWidth = 280;
        const panelHeight = 200;

        // Background parchment
        const bg = this.scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x8B7355, 0.9);
        bg.setStrokeStyle(3, 0x654321);
        this.container.add(bg);

        // Decorative border
        const border = this.scene.add.rectangle(0, 0, panelWidth - 10, panelHeight - 10, 0x8B7355, 0);
        border.setStrokeStyle(2, 0x4A3429);
        this.container.add(border);
    }

    private createMeters(): void {
        const startY = -60;
        const meterSpacing = 40;
        const meterWidth = 120;
        const meterHeight = 12;

        this.meterConfigs.forEach((config, index) => {
            const y = startY + (index * meterSpacing);

            // Icon
            const iconStyle: Phaser.Types.GameObjects.Text.TextStyle = {
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif'
            };

            const icon = this.scene.add.text(-120, y, config.icon, iconStyle);
            icon.setOrigin(0.5);
            this.container.add(icon);
            this.meterIcons[config.key] = icon;

            // Meter name
            const nameStyle: Phaser.Types.GameObjects.Text.TextStyle = {
                fontSize: '12px',
                fontFamily: 'Georgia, serif',
                color: '#2F1B14',
                fontStyle: 'bold'
            };

            const nameText = this.scene.add.text(-90, y - 20, config.name, nameStyle);
            nameText.setOrigin(0, 0.5);
            this.container.add(nameText);

            // Meter background
            const meterBg = this.scene.add.rectangle(-30, y, meterWidth, meterHeight, 0x333333);
            meterBg.setStrokeStyle(1, 0x000000);
            this.container.add(meterBg);

            // Meter fill
            const meterFill = this.scene.add.rectangle(-30 - (meterWidth/2), y, 0, meterHeight - 2, config.color);
            meterFill.setOrigin(0, 0.5);
            this.container.add(meterFill);
            this.meterBars[config.key] = meterFill;

            // Value text
            const valueStyle: Phaser.Types.GameObjects.Text.TextStyle = {
                fontSize: '12px',
                fontFamily: 'Georgia, serif',
                color: '#2F1B14',
                fontStyle: 'bold'
            };

            const valueText = this.scene.add.text(80, y, '75', valueStyle);
            valueText.setOrigin(0.5);
            this.container.add(valueText);
            this.meterTexts[config.key] = valueText;
        });
    }

    updateMeters(): void {
        const state = window.GameState;

        this.meterConfigs.forEach(config => {
            const value = state.meters[config.key as keyof typeof state.meters];
            const percentage = value / 100;
            const meterWidth = 118; // Slightly less than background for padding

            // Update meter fill
            const meterBar = this.meterBars[config.key];
            meterBar.width = meterWidth * percentage;

            // Update color based on value
            let color = config.color;
            if (value <= 25) {
                color = config.dangerColor;
            } else if (value <= 50) {
                color = config.warningColor;
            }
            meterBar.fillColor = color;

            // Update value text
            this.meterTexts[config.key].setText(value.toString());

            // Add pulsing effect for critically low values
            if (value <= 25) {
                this.scene.tweens.add({
                    targets: this.meterIcons[config.key],
                    alpha: 0.3,
                    duration: 500,
                    yoyo: true,
                    repeat: 1,
                    ease: 'Power2'
                });
            }
        });
    }

    animateMeterChange(meterName: string, oldValue: number, newValue: number): void {
        const config = this.meterConfigs.find(c => c.key === meterName);
        if (!config) return;

        const meterBar = this.meterBars[meterName];
        const meterText = this.meterTexts[meterName];
        const meterIcon = this.meterIcons[meterName];

        // Calculate colors
        let oldColor = config.color;
        let newColor = config.color;

        if (oldValue <= 25) oldColor = config.dangerColor;
        else if (oldValue <= 50) oldColor = config.warningColor;

        if (newValue <= 25) newColor = config.dangerColor;
        else if (newValue <= 50) newColor = config.warningColor;

        // Animate meter bar
        const meterWidth = 118;
        this.scene.tweens.add({
            targets: meterBar,
            width: (newValue / 100) * meterWidth,
            duration: 800,
            ease: 'Power2.easeOut'
        });

        // Animate color change
        if (oldColor !== newColor) {
            this.scene.tweens.addCounter({
                from: 0,
                to: 1,
                duration: 800,
                onUpdate: (tween) => {
                    const progress = tween.getValue() ?? 0;
                    const interpolatedColor = Phaser.Display.Color.Interpolate.ColorWithColor(
                        Phaser.Display.Color.ValueToColor(oldColor),
                        Phaser.Display.Color.ValueToColor(newColor),
                        1,
                        progress
                    );
                    meterBar.fillColor = Phaser.Display.Color.GetColor(
                        interpolatedColor.r,
                        interpolatedColor.g,
                        interpolatedColor.b
                    );
                }
            });
        }

        // Animate text value change
        const valueDiff = newValue - oldValue;
        this.scene.tweens.addCounter({
            from: oldValue,
            to: newValue,
            duration: 800,
            ease: 'Power2.easeOut',
            onUpdate: (tween) => {
                const currentValue = Math.round(tween.getValue() ?? 0);
                meterText.setText(currentValue.toString());
            }
        });

        // Show change indicator
        this.showChangeIndicator(meterName, valueDiff);

        // Icon animation for significant changes
        if (Math.abs(valueDiff) >= 10) {
            this.scene.tweens.add({
                targets: meterIcon,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 200,
                yoyo: true,
                ease: 'Power2'
            });
        }
    }

    private showChangeIndicator(meterName: string, change: number): void {
        if (change === 0) return;

        const config = this.meterConfigs.find(c => c.key === meterName);
        if (!config) return;

        const index = this.meterConfigs.indexOf(config);
        const y = -60 + (index * 35);

        const changeStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '14px',
            fontFamily: 'Georgia, serif',
            color: change > 0 ? '#32CD32' : '#FF4169',
            fontStyle: 'bold'
        };

        const changeText = this.scene.add.text(120, y,
            (change > 0 ? '+' : '') + change.toString(), changeStyle);
        changeText.setOrigin(0.5);
        this.container.add(changeText);

        // Animate the change indicator
        this.scene.tweens.add({
            targets: changeText,
            y: y - 20,
            alpha: 0,
            duration: 1500,
            ease: 'Power2.easeOut',
            onComplete: () => {
                changeText.destroy();
            }
        });
    }

    // Method to show warning for critically low meters
    showCriticalWarning(meterName: string): void {
        const config = this.meterConfigs.find(c => c.key === meterName);
        if (!config) return;

        // Flash the entire panel
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0.5,
            duration: 150,
            yoyo: true,
            repeat: 3,
            ease: 'Power2'
        });

        // Create warning text
        const warningStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '16px',
            fontFamily: 'Georgia, serif',
            color: '#FF4169',
            fontStyle: 'bold',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        };

        const warningText = this.scene.add.text(0, 80,
            `⚠️ ${config.name} Critical!`, warningStyle);
        warningText.setOrigin(0.5);
        this.container.add(warningText);

        // Remove warning after a few seconds
        this.scene.time.delayedCall(3000, () => {
            if (warningText && warningText.active) {
                warningText.destroy();
            }
        });
    }

    // Get the container for positioning
    getContainer(): Phaser.GameObjects.Container {
        return this.container;
    }

    // Destroy the meter panel
    destroy(): void {
        this.container.destroy();
    }
}