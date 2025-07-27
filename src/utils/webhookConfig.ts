export let webhookEnabled: boolean = (import.meta as any).env.VITE_WEBHOOK_ENABLED === 'true' || false;

export const isWebhookEnabled = (): boolean => {
    return webhookEnabled;
};

if (typeof window !== 'undefined') {
    (window as any).WebhookConfig = {
        isWebhookEnabled
    };
}