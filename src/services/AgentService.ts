import { getWebhookUrl, isWebhookEnabled } from '../config/agentConfig';


// Webhook Service for dynamic content generation
// This service sends game state to webhook endpoints and receives dynamic responses

export interface WebhookRequest {
    prompt: string;
    context: {
        gameState: {
            meters: {
                health: number;
                support: number;
                trust: number;
                stability: number;
            };
            currentDay: number;
            maxDays: number;
        };
        character: string; // 'guardian', 'unicorn', 'elephant', etc.
        previousMessages?: string[];
    };
    maxTokens?: number;
    temperature?: number;
}

export interface WebhookResponse {
    text: string;
    success: boolean;
    error?: string;
}

export class WebhookService {
    private timeout: number = 5000; // 5 second timeout

    // Generate dynamic conversation response via webhook
    async generateResponse(request: WebhookRequest): Promise<WebhookResponse> {
        if (!isWebhookEnabled()) {
            return this.getFallbackResponse(request);
        }

        try {
            const response = await this.callWebhook(request);
            return { text: response, success: true };
        } catch (error) {
            console.warn('Webhook call failed, using fallback:', error);
            return this.getFallbackResponse(request);
        }
    }

    private async callWebhook(request: WebhookRequest): Promise<string> {
        const webhookUrl = getWebhookUrl();
        if (!webhookUrl) throw new Error('No webhook URL provided');

        // Prepare the payload to send to webhook
        const payload = {
            character: request.context.character,
            gameState: request.context.gameState,
            prompt: request.prompt,
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId()
        };

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(webhookUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Webhook call failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Handle different response formats
            if (typeof data === 'string') {
                return data;
            } else if (data.text || data.message || data.response) {
                return data.text || data.message || data.response;
            } else if (data.content) {
                return data.content;
            } else {
                throw new Error('Invalid response format from webhook');
            }
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    private generateRequestId(): string {
        return 'req_' + Math.random().toString(36).substr(2, 9);
    }

        private getFallbackResponse(request: WebhookRequest): WebhookResponse {
        // Fallback responses when webhook is not available
        const { meters } = request.context.gameState;
        const character = request.context.character;

        const fallbackMessages = {
            guardian: [
                "The mystical energies flow around us, Gatekeeper. Each choice you make affects the delicate balance of this realm.",
                "I sense the weight of your decisions, Gatekeeper. The realm's fate hangs in the balance of your wisdom.",
                "Listen to the whispers of the ancient ones, Gatekeeper. They guide those who seek true balance."
            ],
            unicorn: [
                "The unicorn's horn glows with ancient magic. 'Trust your instincts, Gatekeeper.'",
                "The unicorn's eyes shimmer with otherworldly wisdom. 'Magic flows where trust and stability meet.'",
                "The unicorn's mane sparkles like starlight. 'I sense great potential in your realm, Gatekeeper.'"
            ],
            elephant: [
                "The elephant's deep voice rumbles like distant thunder. 'Strength comes not from force, but from wisdom.'",
                "The elephant's wise eyes study you carefully. 'Stability is built on foundations of trust and support.'",
                "The elephant's trunk sways thoughtfully. 'The health of the realm reflects the health of its people.'"
            ],
            giraffe: [
                "The giraffe's long neck reaches toward the sky. 'Look beyond the immediate, Gatekeeper.'",
                "The giraffe's gentle eyes survey the horizon. 'Support flows like water through the land.'",
                "The giraffe's graceful movements speak of patience. 'Time is your ally, Gatekeeper.'"
            ],
            rabbit: [
                "The rabbit's nose twitches with nervous energy. 'Quick decisions can save lives, Gatekeeper.'",
                "The rabbit's ears perk up at distant sounds. 'I hear whispers of change in the wind.'",
                "The rabbit hops about excitedly. 'Health and happiness go hand in hand, Gatekeeper.'"
            ],
            dog: [
                "The dog's loyal eyes show unwavering devotion. 'Loyalty is earned through trust and fairness.'",
                "The dog's wagging tail speaks of optimism. 'Even in dark times, hope remains.'",
                "The dog's protective stance shows concern. 'Guard your realm well, Gatekeeper.'"
            ]
        };

        const messages = fallbackMessages[character as keyof typeof fallbackMessages] || fallbackMessages.guardian;
        const randomIndex = Math.floor(Math.random() * messages.length);

        return {
            text: messages[randomIndex],
            success: true
        };
    }

    // Generate dynamic event descriptions
    async generateEventDescription(eventType: string, gameState: any): Promise<string> {
        const request: WebhookRequest = {
            prompt: `Generate a mystical description for a ${eventType} event in the realm.`,
            context: {
                gameState,
                character: 'guardian'
            },
            maxTokens: 100,
            temperature: 0.8
        };

        const response = await this.generateResponse(request);
        return response.text;
    }

    // Generate character-specific advice
    async generateCharacterAdvice(character: string, gameState: any, situation: string): Promise<string> {
        const request: WebhookRequest = {
            prompt: `Provide advice about: ${situation}`,
            context: {
                gameState,
                character
            },
            maxTokens: 120,
            temperature: 0.7
        };

        const response = await this.generateResponse(request);
        return response.text;
    }
}

// Global webhook service instance
export const webhookService = new WebhookService();

// Initialize with webhook URL if available
if (typeof window !== 'undefined') {
    (window as any).webhookService = webhookService;
}