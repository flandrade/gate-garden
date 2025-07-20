import {  isWebhookEnabled } from '../utils/webhookConfig';

export let WEBHOOK_SPAWNING_URL: string | null = (import.meta as any).env.VITE_WEBHOOK_SPAWNING_URL || null;

const FISH_TIME_LIMIT = 60;
const MIN_FISH_SPEED = 200;
const MAX_FISH_SPEED = 400;
const FISHES_NEEDED = 5;
const PUZZLE_TIME_LIMIT = 30;
const PUZZLE_TARGETS_NEEDED = 7;

export interface GameParameters {
    fish: {
        minSpeed: number;
        maxSpeed: number;
        fishesNeeded: number;
        timeLimit: number;
    };
    puzzle: {
        targetsNeeded: number;
        timeLimit: number;
    };
}

// Interfaces for spawning and positioning requests
export interface FishSpawnRequest {
    screenDimensions: {
        width: number;
        height: number;
    };
}

export interface FishSpawnData {
    x: number;
    y: number;
    fishType: 'fish_good' | 'fish_bad';
    speed: number;
    sideMovement: {
        range: number;
        duration: number;
    };
    spawnDelay: number;
}

export interface FishSpawnResponse {
    items: FishSpawnData[];
    success: boolean;
    error?: string;
}

export interface TargetPositionRequest {
    boardBounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    targetImages: string[];
}

export interface TargetPositionResponse {
    items: Array<{
        x: number;
        y: number;
        targetImage: string;
        scale: number;
        alpha: number;
    }>;
    success: boolean;
    error?: string;
}

export class SpawningService {
    private getWebhookUrl(webhookUrl: string | null = WEBHOOK_SPAWNING_URL): string | null {
        return webhookUrl;
    }

    async getGameParameters(): Promise<GameParameters> {
        if (!isWebhookEnabled()) {
            return this.getFallbackGameParameters();
        }

        try {
            const webhookUrl = this.getWebhookUrl();

            if (!webhookUrl) {
            return this.getFallbackGameParameters();
            }

            const response = await fetch(`${webhookUrl}?action=game_parameters`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Webhook call failed: ${response.status}`);
            }

            const data = (await response.json());
            return data as GameParameters;
        } catch (error) {
            console.warn('Game parameters webhook failed, using fallback:', error);
            return this.getFallbackGameParameters();
        }
    }


    getFallbackGameParameters(): GameParameters {
        return {
            fish: {
                minSpeed: MIN_FISH_SPEED,
                maxSpeed: MAX_FISH_SPEED,
                fishesNeeded: FISHES_NEEDED,
                timeLimit: FISH_TIME_LIMIT
            },
            puzzle: {
                targetsNeeded: PUZZLE_TARGETS_NEEDED,
                timeLimit: PUZZLE_TIME_LIMIT
            }
        }
    }

        // Generate fish spawning pattern via webhook
    async generateFishSpawn(request: FishSpawnRequest): Promise<FishSpawnResponse> {
        if (!isWebhookEnabled()) {
            return this.getFallbackFishSpawn(request);
        }

        try {
            const webhookUrl = this.getWebhookUrl();
            if (!webhookUrl) {
                return this.getFallbackFishSpawn(request);
            }

            // Build query parameters for GET request
            const params = new URLSearchParams({
                action: 'fish_spawn',
                screenWidth: request.screenDimensions.width.toString(),
                screenHeight: request.screenDimensions.height.toString(),
                timestamp: new Date().toISOString()
            });

            const response = await fetch(`${webhookUrl}?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Webhook call failed: ${response.status}`);
            }

            const data = await response.json();
            return this.parseFishSpawnResponse(data, request);
        } catch (error) {
            console.warn('Fish spawn webhook failed, using fallback:', error);
            return this.getFallbackFishSpawn(request);
        }
    }

        // Generate target positioning via webhook
    async generateTargetPositions(request: TargetPositionRequest): Promise<TargetPositionResponse> {
        if (!isWebhookEnabled()) {
            return this.getFallbackTargetPositions(request);
        }

        try {
            const webhookUrl = this.getWebhookUrl();
            if (!webhookUrl) {
                return this.getFallbackTargetPositions(request);
            }

            // Build query parameters for GET request
            const params = new URLSearchParams({
                action: 'puzzle',
                boardX: request.boardBounds.x.toString(),
                boardY: request.boardBounds.y.toString(),
                boardWidth: request.boardBounds.width.toString(),
                boardHeight: request.boardBounds.height.toString(),
                targetImages: request.targetImages.join(','),
            });

            const response = await fetch(`${webhookUrl}?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Webhook call failed: ${response.status}`);
            }

            const data = await response.json();
            return this.parseTargetPositionResponse(data, request);
        } catch (error) {
            console.warn('Target position webhook failed, using fallback:', error);
            return this.getFallbackTargetPositions(request);
        }
    }

    // Fallback fish spawning logic (client-side fallback)
    private getFallbackFishSpawn(request: FishSpawnRequest): FishSpawnResponse {

        const { width } = request.screenDimensions;
        const {  fishesNeeded } = {
            fishesNeeded: FISHES_NEEDED
        }
        const fishes: FishSpawnData[] = [];

        // Generate a reasonable number of fishes (enough to ensure we get the needed good fishes)
        const totalFishesToGenerate = fishesNeeded * 10; // Generate 3x the needed amount to account for bad fishes

        for (let i = 0; i < totalFishesToGenerate; i++) {
            // 70% chance for good fish, 30% for bad fish
            const isGood = Math.random() < 0.7;
            const fishType = isGood ? 'fish_good' : 'fish_bad';

            // Calculate spawn position
            const x = Math.max(50, Math.min(width - 50,
                Math.random() * (width - 100) + 50));

            // Calculate speed - make fishes fall slower (higher values = slower)
            const baseSpeed = 8000; // Base speed in milliseconds
            const speedVariation = Math.random() * 2000 + 1000; // Add 1-3 seconds variation
            const speed = baseSpeed + speedVariation;

            // Calculate spawn delay - spawn two fishes at a time with longer intervals
            const baseDelay = 3000; // 3 seconds between spawn groups
            const groupIndex = Math.floor(i / 2); // Group fishes in pairs
            const spawnDelay = baseDelay * groupIndex + (i % 2) * 500; // 500ms between fishes in same group

            fishes.push({
                x,
                y: -50,
                fishType,
                speed,
                sideMovement: {
                    range: Math.random() * 30 + 10,
                    duration: Math.random() * 1000 + 1000
                },
                spawnDelay
            });
        }

        return {
            items: fishes,
            success: true
        };
    }

    // Fallback target positioning logic (client-side fallback)
    private getFallbackTargetPositions(request: TargetPositionRequest): TargetPositionResponse {
        const { boardBounds, targetImages } = request;
        const { targetsNeeded } = {
            targetsNeeded: PUZZLE_TARGETS_NEEDED
        }
        const positions = [];

        for (let i = 0; i < targetsNeeded; i++) {
            const targetImage = targetImages[i];

            // Generate random position within board bounds
            const x = Math.max(boardBounds.x + 50,
                Math.min(boardBounds.x + boardBounds.width - 50,
                    Math.random() * (boardBounds.width - 100) + boardBounds.x + 50));

            const y = Math.max(boardBounds.y + 50,
                Math.min(boardBounds.y + boardBounds.height - 50,
                    Math.random() * (boardBounds.height - 100) + boardBounds.y + 50));

            positions.push({
                x,
                y,
                targetImage,
                scale: 0.2,
                alpha: 0.9
            });
        }

        return {
            items: positions,
            success: true
        };
    }

    // Parse webhook response for fish spawning
    private parseFishSpawnResponse(data: any, request: FishSpawnRequest): FishSpawnResponse {
        // Expect direct JSON response with spawning parameters
        if (data && typeof data === 'object' && data.fishes && Array.isArray(data.fishes)) {
            return {
                items: data.items,
                success: true
            };
        }

        // Fallback if response format is unexpected
        return this.getFallbackFishSpawn(request);
    }

    // Parse webhook response for target positioning
    private parseTargetPositionResponse(data: any, request: TargetPositionRequest): TargetPositionResponse {
        // Expect direct JSON response with positioning parameters
        if (data && typeof data === 'object' && data.positions && Array.isArray(data.positions)) {
            return {
                items: data.items,
                success: true
            };
        }

        // Fallback if response format is unexpected
        return this.getFallbackTargetPositions(request);
    }



    // Calculate difficulty based on game state
    calculateDifficulty(gameState: { score: number, fishesNeeded: number }, timeLeft: number, maxTime: number): number {
        const timeProgress = 1 - (timeLeft / maxTime);
        const scoreProgress = gameState.score / gameState.fishesNeeded;

        // Difficulty increases with time and decreases with score
        return Math.min(1, Math.max(0, timeProgress - (scoreProgress * 0.3)));
    }
}

// Global spawning service instance
export const spawningService = new SpawningService();

// Initialize with global access
if (typeof window !== 'undefined') {
    (window as any).spawningService = spawningService;
}