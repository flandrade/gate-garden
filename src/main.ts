import Phaser from 'phaser';
import TitleScene from './scenes/TitleScene';
import GameScene from './scenes/GameScene';

// Game state interface
interface GameState {
    meters: {
        health: number;
        support: number;
        trust: number;
        stability: number;
    };
    currentDay: number;
    maxDays: number;
    visitorsToday: number;
    maxVisitorsPerDay: number;
    gameOver: boolean;
    gameResult: string | null;
}

// Utility functions interface
interface GameUtils {
    updateMeter(meterName: keyof GameState['meters'], change: number): void;
    getGameOverReason(meterName: string): string;
    checkDayLimit(): void;
    getFinalOutcome(): string;
    nextDay(): void;
    resetGame(): void;
}

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1536,
    height: 1024,
    parent: 'game-container',
    backgroundColor: '#2c1810',
    scene: [TitleScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Initialize the game
const game = new Phaser.Game(config);

// Global game state management
const gameState: GameState = {
    meters: {
        health: 75,      // 🦠 Public Health
        support: 75,     // 🌺 Support/Economy
        trust: 75,       // 🗣️ Public Trust/Social Stability
        stability: 75    // ⚖️ Political Stability/Authority
    },
    currentDay: 1,
    maxDays: 10,
    visitorsToday: 0,
    maxVisitorsPerDay: 2,
    gameOver: false,
    gameResult: null
};

// Utility functions for game state
const gameUtils: GameUtils = {
    // Update meters with bounds checking
    updateMeter(meterName: keyof GameState['meters'], change: number): void {
        if (gameState.meters[meterName] !== undefined) {
            gameState.meters[meterName] = Math.max(0, Math.min(100,
                gameState.meters[meterName] + change));

            // Check for game over conditions
            if (gameState.meters[meterName] <= 0) {
                gameState.gameOver = true;
                gameState.gameResult = this.getGameOverReason(meterName);
            }
        }
    },

    // Determine game over reason based on which meter hit zero
    getGameOverReason(meterName: string): string {
        switch(meterName) {
            case 'health': return 'plague';
            case 'support': return 'economic_collapse';
            case 'trust': return 'rebellion';
            case 'stability': return 'chaos';
            default: return 'unknown';
        }
    },

    // Check if game should end (day limit reached)
    checkDayLimit(): void {
        if (gameState.currentDay > gameState.maxDays) {
            gameState.gameOver = true;
            gameState.gameResult = this.getFinalOutcome();
        }
    },

    // Determine final outcome based on meter values
    getFinalOutcome(): string {
        const { health, support, trust, stability } = gameState.meters;

        // Check for specific endings
        if (health <= 0) return 'plague';
        if (trust <= 0 || stability <= 0) return 'rebellion';
        if (trust < 25 || stability < 25) return 'civil_unrest';
        if (stability > 80 && trust < 30) return 'despotism';
        if (health > 40 && support > 40 && trust > 40 && stability > 40) return 'survival';

        return 'uncertain_times';
    },

    // Advance to next day
    nextDay(): void {
        gameState.currentDay++;
        gameState.visitorsToday = 0;
        this.checkDayLimit();
    },

    // Reset game state
    resetGame(): void {
        gameState.meters = { health: 75, support: 75, trust: 75, stability: 75 };
        gameState.currentDay = 1;
        gameState.visitorsToday = 0;
        gameState.gameOver = false;
        gameState.gameResult = null;
    }
};

// Make available globally (for backward compatibility with existing code)
declare global {
    interface Window {
        GameState: GameState;
        GameUtils: GameUtils;
    }
}

window.GameState = gameState;
window.GameUtils = gameUtils;

export { gameState as GameState, gameUtils as GameUtils };
export default game;

