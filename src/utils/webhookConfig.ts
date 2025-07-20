// Simple Webhook Configuration
export let webhookEnabled: boolean = (import.meta as any).env.VITE_WEBHOOK_ENABLED === 'true' || false;

// Check if webhook is enabled
export const isWebhookEnabled = (): boolean => {
    return webhookEnabled;
};

// Export for global access
if (typeof window !== 'undefined') {
    (window as any).WebhookConfig = {
        isWebhookEnabled
    };
}