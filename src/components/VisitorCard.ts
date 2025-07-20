import { Visitor, MeterEffects } from '../data/visitors';

type Decision = 'allow' | 'deny';
type OnDecisionCallback = (visitorData: Visitor, decision: Decision) => void;

export default class VisitorCard {
    private scene: Phaser.Scene;
    private x: number;
    private y: number;
    private visitorData: Visitor;
    private onDecision: OnDecisionCallback;
    private container: Phaser.GameObjects.Container;
    private isInteractive: boolean;
    private allowButton?: { bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text };
    private denyButton?: { bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text };

    constructor(scene: Phaser.Scene, x: number, y: number, visitorData: Visitor, onDecision: OnDecisionCallback) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.visitorData = visitorData;
        this.onDecision = onDecision;
        this.container = scene.add.container(x, y);
        this.isInteractive = true;

        this.createCard();
        this.createVisitorInfo();
        this.createButtons();
        this.addAnimations();
    }

    private createCard(): void {
        // Card dimensions
        const cardWidth = 320;
        const cardHeight = 450;

        // Main card background - parchment style
        const cardBg = this.scene.add.rectangle(0, 0, cardWidth, cardHeight, 0xF5DEB3, 0.95);
        cardBg.setStrokeStyle(3, 0x8B7355);
        this.container.add(cardBg);

        // Inner border decoration
        const innerBorder = this.scene.add.rectangle(0, 0, cardWidth - 20, cardHeight - 20, 0xF5DEB3, 0);
        innerBorder.setStrokeStyle(2, 0xD2B48C);
        this.container.add(innerBorder);

        // Ornate corner decorations
        this.createCornerDecorations(cardWidth, cardHeight);

        // Shadow effect
        const shadow = this.scene.add.rectangle(3, 3, cardWidth, cardHeight, 0x000000, 0.2);
        this.container.addAt(shadow, 0);
    }

    private createCornerDecorations(width: number, height: number): void {
        const cornerSize = 15;
        const cornerColor = 0x8B7355;

        // Top-left corner
        const topLeft = this.scene.add.graphics();
        topLeft.fillStyle(cornerColor);
        topLeft.fillCircle(-width/2 + 10, -height/2 + 10, cornerSize);
        this.container.add(topLeft);

        // Top-right corner
        const topRight = this.scene.add.graphics();
        topRight.fillStyle(cornerColor);
        topRight.fillCircle(width/2 - 10, -height/2 + 10, cornerSize);
        this.container.add(topRight);

        // Bottom-left corner
        const bottomLeft = this.scene.add.graphics();
        bottomLeft.fillStyle(cornerColor);
        bottomLeft.fillCircle(-width/2 + 10, height/2 - 10, cornerSize);
        this.container.add(bottomLeft);

        // Bottom-right corner
        const bottomRight = this.scene.add.graphics();
        bottomRight.fillStyle(cornerColor);
        bottomRight.fillCircle(width/2 - 10, height/2 - 10, cornerSize);
        this.container.add(bottomRight);
    }

    private createVisitorInfo(): void {
        // Visitor name
        const nameStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '22px',
            fontFamily: 'Georgia, serif',
            color: '#2F1B14',
            fontStyle: 'bold',
            align: 'center'
        };

        const nameText = this.scene.add.text(0, -180, this.visitorData.name, nameStyle);
        nameText.setOrigin(0.5);
        this.container.add(nameText);

        // Rarity indicator
        const rarityColors: Record<string, string> = {
            common: '#CD853F',
            uncommon: '#4169E1',
            rare: '#9370DB',
            legendary: '#FFD700'
        };

        const rarityStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '14px',
            fontFamily: 'Georgia, serif',
            color: rarityColors[this.visitorData.rarity] || '#CD853F',
            fontStyle: 'italic'
        };

        const rarityText = this.scene.add.text(0, -155, this.visitorData.rarity.toUpperCase(), rarityStyle);
        rarityText.setOrigin(0.5);
        this.container.add(rarityText);

        // Visitor image placeholder
        this.createVisitorImage();

        // Description
        const descStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '14px',
            fontFamily: 'Georgia, serif',
            color: '#2F1B14',
            align: 'center',
            wordWrap: { width: 280 },
            lineSpacing: 5
        };

        const descText = this.scene.add.text(0, 40, this.visitorData.description, descStyle);
        descText.setOrigin(0.5);
        this.container.add(descText);

        // Effects preview
        this.createEffectsPreview();
    }

    private createVisitorImage(): void {
        // Placeholder image area
        const imageSize = 120;
        const imageBg = this.scene.add.rectangle(0, -80, imageSize, imageSize, 0xDDD8C8);
        imageBg.setStrokeStyle(2, 0x8B7355);
        this.container.add(imageBg);

        // Placeholder icon based on visitor type
        const placeholderStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            color: '#8B7355'
        };

        // Get placeholder icon based on visitor ID
        let placeholderIcon = '👤'; // Default human silhouette

        if (this.visitorData.id.includes('fruit')) placeholderIcon = '🍎';
        else if (this.visitorData.id.includes('worm')) placeholderIcon = '🪱';
        else if (this.visitorData.id.includes('noble')) placeholderIcon = '👑';
        else if (this.visitorData.id.includes('crystal')) placeholderIcon = '💎';
        else if (this.visitorData.id.includes('root')) placeholderIcon = '🌳';
        else if (this.visitorData.id.includes('mirror')) placeholderIcon = '🪞';
        else if (this.visitorData.id.includes('plague')) placeholderIcon = '💀';
        else if (this.visitorData.id.includes('mushroom')) placeholderIcon = '🍄';
        else if (this.visitorData.id.includes('bone')) placeholderIcon = '🦴';
        else if (this.visitorData.id.includes('wind')) placeholderIcon = '🌪️';
        else if (this.visitorData.id.includes('clockwork')) placeholderIcon = '⚙️';
        else if (this.visitorData.id.includes('shadow')) placeholderIcon = '👻';

        const placeholder = this.scene.add.text(0, -80, placeholderIcon, placeholderStyle);
        placeholder.setOrigin(0.5);
        this.container.add(placeholder);

        // Add subtle floating animation to the image
        this.scene.tweens.add({
            targets: [imageBg, placeholder],
            y: '-=5',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private createEffectsPreview(): void {
        const previewStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '11px',
            fontFamily: 'Georgia, serif',
            color: '#654321',
            align: 'center'
        };

        // Allow effects
        const allowEffects = this.formatEffects(this.visitorData.effects.allow);
        const allowText = this.scene.add.text(-70, 130, `Allow:\n${allowEffects}`, previewStyle);
        allowText.setOrigin(0.5);
        this.container.add(allowText);

        // Deny effects
        const denyEffects = this.formatEffects(this.visitorData.effects.deny);
        const denyText = this.scene.add.text(70, 130, `Deny:\n${denyEffects}`, previewStyle);
        denyText.setOrigin(0.5);
        this.container.add(denyText);

        // Separator line
        const line = this.scene.add.graphics();
        line.lineStyle(1, 0x8B7355);
        line.moveTo(0, 110);
        line.lineTo(0, 150);
        line.strokePath();
        this.container.add(line);
    }

    private formatEffects(effects: MeterEffects): string {
        const icons: Record<keyof MeterEffects, string> = {
            health: '🦠',
            support: '🌺',
            trust: '🗣️',
            stability: '⚖️'
        };

        const lines: string[] = [];
        for (const [key, value] of Object.entries(effects) as [keyof MeterEffects, number][]) {
            if (value !== 0) {
                const icon = icons[key] || '?';
                const sign = value > 0 ? '+' : '';
                lines.push(`${icon} ${sign}${value}`);
            }
        }

        return lines.join('\n') || 'No change';
    }

    private createButtons(): void {
        const buttonWidth = 80;
        const buttonHeight = 35;

        // Allow button
        const allowBg = this.scene.add.rectangle(-75, 180, buttonWidth, buttonHeight, 0x228B22, 0.9);
        allowBg.setStrokeStyle(2, 0x006400);
        this.container.add(allowBg);

        const allowStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '16px',
            fontFamily: 'Georgia, serif',
            color: '#FFFFFF',
            fontStyle: 'bold'
        };

        const allowText = this.scene.add.text(-75, 180, 'ALLOW', allowStyle);
        allowText.setOrigin(0.5);
        this.container.add(allowText);

        // Deny button
        const denyBg = this.scene.add.rectangle(75, 180, buttonWidth, buttonHeight, 0xB22222, 0.9);
        denyBg.setStrokeStyle(2, 0x8B0000);
        this.container.add(denyBg);

        const denyStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '16px',
            fontFamily: 'Georgia, serif',
            color: '#FFFFFF',
            fontStyle: 'bold'
        };

        const denyText = this.scene.add.text(75, 180, 'DENY', denyStyle);
        denyText.setOrigin(0.5);
        this.container.add(denyText);

        // Store button references
        this.allowButton = { bg: allowBg, text: allowText };
        this.denyButton = { bg: denyBg, text: denyText };

        // Make buttons interactive
        this.setupButtonInteractivity();
    }

    private setupButtonInteractivity(): void {
        if (!this.allowButton || !this.denyButton) return;

        // Allow button
        this.allowButton.bg.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.makeDecision('allow'))
            .on('pointerover', () => {
                if (this.isInteractive && this.allowButton) {
                    this.allowButton.bg.setFillStyle(0x32CD32);
                    this.scene.tweens.add({
                        targets: [this.allowButton.bg, this.allowButton.text],
                        scaleX: 1.1,
                        scaleY: 1.1,
                        duration: 150
                    });
                }
            })
            .on('pointerout', () => {
                if (this.isInteractive && this.allowButton) {
                    this.allowButton.bg.setFillStyle(0x228B22);
                    this.scene.tweens.add({
                        targets: [this.allowButton.bg, this.allowButton.text],
                        scaleX: 1,
                        scaleY: 1,
                        duration: 150
                    });
                }
            });

        // Deny button
        this.denyButton.bg.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.makeDecision('deny'))
            .on('pointerover', () => {
                if (this.isInteractive && this.denyButton) {
                    this.denyButton.bg.setFillStyle(0xFF4500);
                    this.scene.tweens.add({
                        targets: [this.denyButton.bg, this.denyButton.text],
                        scaleX: 1.1,
                        scaleY: 1.1,
                        duration: 150
                    });
                }
            })
            .on('pointerout', () => {
                if (this.isInteractive && this.denyButton) {
                    this.denyButton.bg.setFillStyle(0xB22222);
                    this.scene.tweens.add({
                        targets: [this.denyButton.bg, this.denyButton.text],
                        scaleX: 1,
                        scaleY: 1,
                        duration: 150
                    });
                }
            });
    }

    private makeDecision(decision: Decision): void {
        if (!this.isInteractive || !this.allowButton || !this.denyButton) return;

        this.isInteractive = false;

        // Visual feedback for the chosen decision
        const chosenButton = decision === 'allow' ? this.allowButton : this.denyButton;
        const chosenColor = decision === 'allow' ? 0x00FF00 : 0xFF0000;

        chosenButton.bg.setFillStyle(chosenColor);

        // Pulse effect on chosen button
        this.scene.tweens.add({
            targets: [chosenButton.bg, chosenButton.text],
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 300,
            yoyo: true,
            ease: 'Power2'
        });

        // Fade out the other button
        const otherButton = decision === 'allow' ? this.denyButton : this.allowButton;
        this.scene.tweens.add({
            targets: [otherButton.bg, otherButton.text],
            alpha: 0.3,
            duration: 300
        });

        // Call the decision callback after a brief delay
        this.scene.time.delayedCall(500, () => {
            this.onDecision(this.visitorData, decision);
        });
    }

    private addAnimations(): void {
        // Initial entrance animation
        this.container.setScale(0);
        this.container.setAlpha(0);

        this.scene.tweens.add({
            targets: this.container,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 600,
            ease: 'Back.easeOut'
        });

        // Subtle hover effect for the entire card
        this.container.setInteractive(new Phaser.Geom.Rectangle(-160, -225, 320, 450), Phaser.Geom.Rectangle.Contains)
            .on('pointerover', () => {
                if (this.isInteractive) {
                    this.scene.tweens.add({
                        targets: this.container,
                        y: this.y - 5,
                        duration: 200,
                        ease: 'Power2'
                    });
                }
            })
            .on('pointerout', () => {
                if (this.isInteractive) {
                    this.scene.tweens.add({
                        targets: this.container,
                        y: this.y,
                        duration: 200,
                        ease: 'Power2'
                    });
                }
            });
    }

    // Method to animate card removal
    removeCard(callback?: () => void): void {
        this.scene.tweens.add({
            targets: this.container,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            rotation: Phaser.Math.DegToRad(Math.random() > 0.5 ? 15 : -15),
            duration: 400,
            ease: 'Power2.easeIn',
            onComplete: () => {
                this.destroy();
                if (callback) callback();
            }
        });
    }

    // Get the container for positioning
    getContainer(): Phaser.GameObjects.Container {
        return this.container;
    }

    // Destroy the visitor card
    destroy(): void {
        this.container.destroy();
    }
}