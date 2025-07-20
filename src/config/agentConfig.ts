// Simple Webhook Configuration
export let webhookUrl: string | null = null;
export let webhookEnabled: boolean = false;

// Setup webhook
export const setupWebhook = (url: string): void => {
    webhookUrl = url;
    webhookEnabled = true;
    console.log('Webhook configured:', url);
};

// Disable webhook
export const disableWebhook = (): void => {
    webhookEnabled = false;
    console.log('Webhook disabled');
};

// Get current webhook URL
export const getWebhookUrl = (): string | null => {
    return webhookUrl;
};

// Check if webhook is enabled
export const isWebhookEnabled = (): boolean => {
    return webhookEnabled && webhookUrl !== null;
};

// Export for global access
if (typeof window !== 'undefined') {
    (window as any).WebhookConfig = {
        setupWebhook,
        disableWebhook,
        getWebhookUrl,
        isWebhookEnabled
    };
}