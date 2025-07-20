// Random events that can occur during gameplay
// These provide one-time decision opportunities that affect meters

import { MeterEffects } from './visitors';

// Type definitions
export interface EventChoice {
    text: string;
    effects: MeterEffects;
}

export interface RandomEvent {
    id: string;
    name: string;
    description: string;
    triggerDay: number;
    choices: EventChoice[];
}

export const RANDOM_EVENTS: RandomEvent[] = [
    {
        id: 'plague_outbreak',
        name: 'Plague Outbreak',
        description: 'A mysterious illness spreads through the nearby villages. Refugees seek shelter, but they may carry the contagion.',
        triggerDay: 3,
        choices: [
            {
                text: 'Open the gates to refugees',
                effects: { health: -15, support: 12, trust: 10, stability: -5 }
            },
            {
                text: 'Seal the garden completely',
                effects: { health: 10, support: -8, trust: -12, stability: 8 }
            }
        ]
    },
    {
        id: 'harvest_boom',
        name: 'Abundant Harvest',
        description: 'The garden produces an extraordinary bounty. You must decide how to distribute the surplus among the people.',
        triggerDay: 5,
        choices: [
            {
                text: 'Share freely with all',
                effects: { health: 8, support: 15, trust: 12, stability: -5 }
            },
            {
                text: 'Trade for political favors',
                effects: { health: 3, support: 8, trust: -8, stability: 15 }
            }
        ]
    },
    {
        id: 'merchant_caravan',
        name: 'Merchant Caravan',
        description: 'A large trading caravan arrives with exotic goods, but they demand exclusive access to your garden for a full day.',
        triggerDay: 7,
        choices: [
            {
                text: 'Grant exclusive access',
                effects: { health: -5, support: 18, trust: -10, stability: 5 }
            },
            {
                text: 'Maintain open access',
                effects: { health: 5, support: -8, trust: 10, stability: -3 }
            }
        ]
    },
    {
        id: 'noble_feast',
        name: 'Noble\'s Feast',
        description: 'A powerful noble requests to host a grand feast in your garden, promising to invite influential guests.',
        triggerDay: 4,
        choices: [
            {
                text: 'Host the grand feast',
                effects: { health: -8, support: 5, trust: -5, stability: 18 }
            },
            {
                text: 'Decline politely',
                effects: { health: 3, support: 8, trust: 10, stability: -12 }
            }
        ]
    },
    {
        id: 'cult_gathering',
        name: 'Mystical Gathering',
        description: 'A mysterious cult wishes to perform rituals in your garden during the full moon, claiming it will bring prosperity.',
        triggerDay: 6,
        choices: [
            {
                text: 'Allow the rituals',
                effects: { health: -10, support: -5, trust: -15, stability: 12 }
            },
            {
                text: 'Forbid the gathering',
                effects: { health: 5, support: 8, trust: 12, stability: -8 }
            }
        ]
    },
    {
        id: 'tax_collector',
        name: 'Royal Tax Collector',
        description: 'The crown demands increased taxes from your garden. You can comply, negotiate, or resist.',
        triggerDay: 8,
        choices: [
            {
                text: 'Pay the increased taxes',
                effects: { health: 0, support: -12, trust: -5, stability: 15 }
            },
            {
                text: 'Negotiate a compromise',
                effects: { health: -3, support: -5, trust: 8, stability: 3 }
            },
            {
                text: 'Refuse to pay',
                effects: { health: 5, support: 10, trust: 12, stability: -20 }
            }
        ]
    },
    {
        id: 'hermit_prophecy',
        name: 'Hermit\'s Prophecy',
        description: 'An ancient hermit emerges from the deep woods, speaking of visions and omens. They offer cryptic guidance.',
        triggerDay: 9,
        choices: [
            {
                text: 'Heed the prophecy',
                effects: { health: 8, support: -8, trust: -10, stability: 10 }
            },
            {
                text: 'Dismiss as nonsense',
                effects: { health: -3, support: 10, trust: 8, stability: -5 }
            }
        ]
    }
];

// Utility functions for random events
export class EventUtils {
    // Get events that should trigger on a specific day
    static getEventsForDay(day: number): RandomEvent[] {
        return RANDOM_EVENTS.filter(event => {
            // Add some randomness - 70% chance to trigger on the designated day
            return event.triggerDay === day && Math.random() < 0.7;
        });
    }

    // Get a random event (fallback method)
    static getRandomEvent(): RandomEvent | null {
        const availableEvents = RANDOM_EVENTS.filter(event =>
            event.triggerDay <= window.GameState.currentDay
        );

        if (availableEvents.length === 0) return null;

        return availableEvents[Math.floor(Math.random() * availableEvents.length)];
    }

    // Check if any events should trigger
    static shouldTriggerEvent(day: number): boolean {
        // Random events have a base 30% chance to trigger on any day after day 2
        if (day <= 2) return false;

        // Higher chance on specific trigger days
        const dayEvents = this.getEventsForDay(day);
        if (dayEvents.length > 0) return true;

        // Base chance for any other day
        return Math.random() < 0.3;
    }
}