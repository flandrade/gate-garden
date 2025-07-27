import Phaser from 'phaser';
import TitleScene from './scenes/TitleScene';
import GameScene from './scenes/GameScene';
import FishCatchingScene from './scenes/FishCatchingScene';
import ElephantSearchScene from './scenes/ElephantSearchScene';
import CreditScene from './scenes/CreditScene';

interface GameState {
    medals: number;
    gameOver: boolean;
    gameResult: string | null;
    guardianIntroductionShown: boolean;
    elephantSearchShown: boolean;
    fishCatchingShown: boolean;
    lastKnownMedals: number;
}

interface GameUtils {
    awardMedal(meterName: 'elephantSearch' | 'fishCatching'): boolean;
    resetMedals(): void;
    canOpenGate(): boolean;
    getGameOverReason(meterName: string): string;
    resetGame(): void;
    hasShownElephantSearch(): boolean;
    hasShownFishCatching(): boolean;
}

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

const game = new Phaser.Game(config);

const gameState: GameState = {
    medals: 0,
    gameOver: false,
    gameResult: null,
    guardianIntroductionShown: false,
    elephantSearchShown: false,
    fishCatchingShown: false,
    lastKnownMedals: 0
};

const gameUtils: GameUtils = {
    awardMedal(meterName: 'elephantSearch' | 'fishCatching'): boolean {
        if (gameState.medals < 3) {
            gameState.medals++;
            if (meterName === 'elephantSearch') {
                gameState.elephantSearchShown = true;
            } else if (meterName === 'fishCatching') {
                gameState.fishCatchingShown = true;
            }
            return true;
        }
        return false;
    },

    resetMedals(): void {
        gameState.medals = 0;
    },

    canOpenGate(): boolean {
        return gameState.medals >= 2;
    },

    hasShownElephantSearch(): boolean {
        return gameState.elephantSearchShown;
    },

    hasShownFishCatching(): boolean {
        return gameState.fishCatchingShown;
    },

    getGameOverReason(meterName: string): string {
        switch(meterName) {
            case 'medals': return 'medals';
            default: return 'unknown';
        }
    },

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

