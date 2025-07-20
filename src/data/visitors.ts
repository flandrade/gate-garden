// Visitor data structure for the Gate Garden game
// Each visitor has Allow and Deny effects on the four meters: health, support, trust, stability

// Type definitions
export interface MeterEffects {
    health: number;
    support: number;
    trust: number;
    stability: number;
}

export interface VisitorEffects {
    allow: MeterEffects;
    deny: MeterEffects;
}

export type VisitorRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Visitor {
    id: string;
    name: string;
    description: string;
    image: string;
    rarity: VisitorRarity;
    effects: VisitorEffects;
}

export interface RarityWeights {
    common: number;
    uncommon: number;
    rare: number;
    legendary: number;
}

export const VISITORS: Visitor[] = [
    {
        id: 'fruit_merchant',
        name: 'Fruit-Bodied Merchant',
        description: 'A strange trader with oranges for limbs and grapes for eyes. They offer exotic goods from distant realms, but their wares emit an unusual sweet-sour scent.',
        image: 'assets/visitors/fruit_merchant.png',
        rarity: 'common',
        effects: {
            allow: { health: -5, support: 10, trust: 8, stability: 0 },
            deny: { health: 0, support: -8, trust: -3, stability: 5 }
        }
    },
    {
        id: 'worm_pilgrim',
        name: 'Worm-Headed Pilgrim',
        description: 'A devout traveler with earthworms writhing where their head should be. They seek passage to the sacred grove, carrying mysterious relics that pulse with earthy energy.',
        image: 'assets/visitors/worm_pilgrim.png',
        rarity: 'common',
        effects: {
            allow: { health: 3, support: -2, trust: -8, stability: 0 },
            deny: { health: 8, support: -5, trust: 0, stability: -3 }
        }
    },
    {
        id: 'noble_hybrid',
        name: 'Noble Hybrid',
        description: 'An aristocrat with the torso of a human, legs of a deer, and wings of a raven. They bear official papers sealed with wax that shifts color in the light.',
        image: 'assets/visitors/noble_hybrid.png',
        rarity: 'common',
        effects: {
            allow: { health: -8, support: 5, trust: 10, stability: 12 },
            deny: { health: 0, support: -3, trust: -12, stability: -8 }
        }
    },
    {
        id: 'crystal_child',
        name: 'Crystal Child',
        description: 'A young being made entirely of translucent crystal that rings like bells when they move. They claim to bring visions of the future, but their presence makes others uneasy.',
        image: 'assets/visitors/crystal_child.png',
        rarity: 'uncommon',
        effects: {
            allow: { health: -3, support: -5, trust: -10, stability: 15 },
            deny: { health: 5, support: 8, trust: 5, stability: -10 }
        }
    },
    {
        id: 'root_scholar',
        name: 'Root Scholar',
        description: 'An ancient academic whose lower body has transformed into a mass of gnarled tree roots. They offer forbidden knowledge in exchange for sanctuary.',
        image: 'assets/visitors/root_scholar.png',
        rarity: 'uncommon',
        effects: {
            allow: { health: 8, support: -3, trust: -5, stability: -8 },
            deny: { health: -5, support: 5, trust: 8, stability: 3 }
        }
    },
    {
        id: 'mirror_twin',
        name: 'Mirror Twin',
        description: 'Two beings fused back-to-back, one beautiful and one grotesque. They speak in perfect unison but their words often contradict each other.',
        image: 'assets/visitors/mirror_twin.png',
        rarity: 'rare',
        effects: {
            allow: { health: 0, support: 8, trust: -15, stability: 10 },
            deny: { health: -8, support: -5, trust: 12, stability: -5 }
        }
    },
    {
        id: 'plague_healer',
        name: 'Plague Healer',
        description: 'A mysterious figure wrapped in bandages that seep with luminous oils. They claim their touch can cure any ailment, but previous patients have... changed.',
        image: 'assets/visitors/plague_healer.png',
        rarity: 'rare',
        effects: {
            allow: { health: 15, support: -10, trust: -12, stability: -8 },
            deny: { health: -12, support: 8, trust: 5, stability: 10 }
        }
    },
    {
        id: 'mushroom_court',
        name: 'Mushroom Court',
        description: 'A procession of tiny humanoids growing from a single enormous mushroom cap. They speak of establishing a new colony and offer spores as payment.',
        image: 'assets/visitors/mushroom_court.png',
        rarity: 'uncommon',
        effects: {
            allow: { health: -5, support: 12, trust: 5, stability: -8 },
            deny: { health: 8, support: -10, trust: -8, stability: 5 }
        }
    },
    {
        id: 'bone_architect',
        name: 'Bone Architect',
        description: 'A skeletal figure draped in moth-eaten velvet, carrying blueprints drawn on skin. They wish to build monuments that commemorate forgotten sorrows.',
        image: 'assets/visitors/bone_architect.png',
        rarity: 'rare',
        effects: {
            allow: { health: -10, support: -8, trust: 8, stability: 15 },
            deny: { health: 5, support: 10, trust: -5, stability: -12 }
        }
    },
    {
        id: 'wind_singer',
        name: 'Wind Singer',
        description: 'A ethereal being whose voice carries seeds and pollen on otherworldly melodies. Birds follow in their wake, but some claim their songs drive listeners mad.',
        image: 'assets/visitors/wind_singer.png',
        rarity: 'uncommon',
        effects: {
            allow: { health: 5, support: 8, trust: -8, stability: -5 },
            deny: { health: -3, support: -5, trust: 10, stability: 8 }
        }
    },
    {
        id: 'clockwork_prophet',
        name: 'Clockwork Prophet',
        description: 'A figure of brass gears and ticking mechanisms, steam venting from joints. They speak prophecies in mechanical verse, each word precisely timed.',
        image: 'assets/visitors/clockwork_prophet.png',
        rarity: 'legendary',
        effects: {
            allow: { health: -8, support: 15, trust: 12, stability: -10 },
            deny: { health: 10, support: -12, trust: -15, stability: 20 }
        }
    },
    {
        id: 'shadow_merchant',
        name: 'Shadow Merchant',
        description: 'A trader made of living darkness who deals in memories and dreams. Their wares shift and change when not directly observed.',
        image: 'assets/visitors/shadow_merchant.png',
        rarity: 'legendary',
        effects: {
            allow: { health: 10, support: -15, trust: -20, stability: 12 },
            deny: { health: -15, support: 12, trust: 8, stability: -8 }
        }
    }
];

// Rarity weights for random selection
export const RARITY_WEIGHTS: RarityWeights = {
    common: 60,
    uncommon: 25,
    rare: 12,
    legendary: 3
};

// Utility functions for visitor selection
export class VisitorUtils {
    // Get random visitor based on rarity weights
    static getRandomVisitor(): Visitor {
        const totalWeight = Object.values(RARITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
            random -= weight;
            if (random <= 0) {
                const visitorsOfRarity = VISITORS.filter(v => v.rarity === rarity);
                return visitorsOfRarity[Math.floor(Math.random() * visitorsOfRarity.length)];
            }
        }

        // Fallback to a random common visitor
        const commonVisitors = VISITORS.filter(v => v.rarity === 'common');
        return commonVisitors[Math.floor(Math.random() * commonVisitors.length)];
    }

    // Get two different random visitors for a day
    static getDailyVisitors(): [Visitor, Visitor] {
        const visitor1 = this.getRandomVisitor();
        let visitor2: Visitor;
        do {
            visitor2 = this.getRandomVisitor();
        } while (visitor2.id === visitor1.id);

        return [visitor1, visitor2];
    }

    // Get visitor by ID
    static getVisitorById(id: string): Visitor | undefined {
        return VISITORS.find(v => v.id === id);
    }
}