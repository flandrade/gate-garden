import Phaser from 'phaser';
import TitleScene from './scenes/TitleScene';
import GameScene from './scenes/GameScene';
import FishCatchingScene from './scenes/FishCatchingScene';
import ElephantSearchScene from './scenes/ElephantSearchScene';
import CreditScene from './scenes/CreditScene';

// Game state interface
interface GameState {
    medals: number; // 0-3 medals earned from puzzles
    gameOver: boolean;
    gameResult: string | null;
    guardianIntroductionShown: boolean; // Track if guardian intro has been shown
    elephantSearchShown: boolean; // Track if elephant search has been shown
    fishCatchingShown: boolean; // Track if fish catching has been shown
    lastKnownMedals: number; // Track previous medal count for animation detection
}

// Utility functions interface
interface GameUtils {
    awardMedal(meterName: 'elephantSearch' | 'fishCatching'): boolean; // Returns true if medal was awarded
    resetMedals(): void;
    canOpenGate(): boolean; // Returns true if user has 2+ medals
    getGameOverReason(meterName: string): string;
    resetGame(): void;
    hasShownElephantSearch(): boolean;
    hasShownFishCatching(): boolean;
}

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1536,
    height: 1024,
    parent: 'game-container',
    backgroundColor: '#2c1810',
    scene: [TitleScene, GameScene, FishCatchingScene, ElephantSearchScene, CreditScene],
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
    medals: 0, // Start with 0 medals
    gameOver: false,
    gameResult: null,
    guardianIntroductionShown: false,
    elephantSearchShown: false,
    fishCatchingShown: false,
    lastKnownMedals: 0
};

// Utility functions for game state
const gameUtils: GameUtils = {
    // Award a medal for completing a puzzle (max 3 medals)
    awardMedal(meterName: 'elephantSearch' | 'fishCatching'): boolean {
        if (gameState.medals < 3) {
            gameState.medals++;
            if (meterName === 'elephantSearch') {
                gameState.elephantSearchShown = true;
            } else if (meterName === 'fishCatching') {
                gameState.fishCatchingShown = true;
            }
            return true; // Medal was awarded
        }
        return false; // Already at max medals
    },

    // Reset medals to 0
    resetMedals(): void {
        gameState.medals = 0;
    },

    // Check if user has enough medals to open the gate
    canOpenGate(): boolean {
        return gameState.medals >= 2;
    },

    // Check if elephant search has been shown
    hasShownElephantSearch(): boolean {
        return gameState.elephantSearchShown;
    },

    // Check if fish catching has been shown
    hasShownFishCatching(): boolean {
        return gameState.fishCatchingShown;
    },

    // Determine game over reason based on which meter hit zero
    getGameOverReason(meterName: string): string {
        switch(meterName) {
            case 'medals': return 'medals';
            default: return 'unknown';
        }
    },

    // Reset game state
    resetGame(): void {
        gameState.medals = 0;
        gameState.gameOver = false;
        gameState.gameResult = null;
        gameState.guardianIntroductionShown = false;
        gameState.elephantSearchShown = false;
        gameState.fishCatchingShown = false;
        gameState.lastKnownMedals = 0;
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

