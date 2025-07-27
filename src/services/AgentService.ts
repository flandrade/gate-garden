import {  isWebhookEnabled } from '../utils/webhookConfig';

export let WEBHOOK_AGENT_URL: string | null = (import.meta as any).env.VITE_WEBHOOK_AGENT_URL || null;

export interface WebhookRequest {
    prompt: string;
    context: {
        gameState: {
            medals: number;
        };
        character: string; // 'guardian', 'unicorn', 'elephant', etc.
        previousMessages?: string[];
    };
}

export interface WebhookResponse {
    text: string;
    success: boolean;
    error?: string;
}

export class WebhookService {
    private timeout: number = 5000;

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

    private async callWebhook(request: WebhookRequest, webhookUrl: string | null = WEBHOOK_AGENT_URL): Promise<string> {
        if (!webhookUrl) throw new Error('No webhook URL provided');

        const payload = {
            character: request.context.character,
            gameState: request.context.gameState,
            prompt: request.prompt,
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId()
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(webhookUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Webhook call failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

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
        const character = request.context.character;

        const fallbackMessages = {
            guardian: [
                "Listen to the whispers of the ancient ones. They guide those who seek true balance."
            ],
            unicorn: [
                "Trust your instincts.",
                "Magic flows where trust and stability meet.",
                "I sense great potential in your realm."
            ],
            elephant: [
                "Strength comes not from force, but from wisdom.",
                "Stability is built on foundations of trust and support.",
                "The health of the realm reflects the health of its people."
            ],
            giraffe: [
                "Look beyond the immediate.",
                "Support flows like water through the land.",
                "Time is your ally."
            ],
            rabbit: [
                "Quick decisions can save lives.",
                "I hear whispers of change in the wind.",
                "Health and happiness go hand in hand."
            ],
            dog: [
                "Loyalty is earned through trust and fairness.",
                "Even in dark times, hope remains.",
                "Guard your realm well."
            ]
        };

        const messages = fallbackMessages[character as keyof typeof fallbackMessages] || fallbackMessages.guardian;
        const randomIndex = Math.floor(Math.random() * messages.length);

        return {
            text: messages[randomIndex],
            success: true
        };
    }

    async generateEventDescription(eventType: string, gameState: any): Promise<string> {
        const request: WebhookRequest = {
            prompt: `Generate a mystical description for a ${eventType} event in the realm.`,
            context: {
                gameState,
                character: 'guardian'
            },
        };

        const response = await this.generateResponse(request);
        return response.text;
    }

    async generateCharacterAdvice(character: string, gameState: any, situation: string): Promise<string> {
        const request: WebhookRequest = {
            prompt: `Provide advice about: ${situation}`,
            context: {
                gameState,
                character
            },
        };

        const response = await this.generateResponse(request);
        return response.text;
    }
}

export const webhookService = new WebhookService();

if (typeof window !== 'undefined') {
    (window as any).webhookService = webhookService;
}