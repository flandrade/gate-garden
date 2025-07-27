# Gate Garden - Phaser Game

Game inspired by Bosch's ["The Garden of Earthly Delights"](https://www.museodelprado.es/en/the-collection/art-work/the-garden-of-earthly-delights/02388242-6d6a-4e9e-a992-e1311eab3609). Talk to the mystical animals, solve their puzzles, and earn medals to open the ancient gate.

👉 [Play the game](http://ferandrade.com/gate-garden)

**Made with:** Phaser 3, TypeScript, and Vite. The game also includes a webhook for remote control of settings (disabled by default).

## Screenshots

![Screenshot 1](public/screenshot-1.png)
![Screenshot 2](public/screenshot-2.png)

## How to run

1. (Optional) To enable the webhook, create a `.env` file in the project root and add:

```
VITE_WEBHOOK_ENABLED=false
```

2. Install dependencies:

```sh
pnpm install # or npm install
```

3. Start the development server:

```sh
pnpm dev # or npm run dev
```

## Game Overview

```mermaid
graph TD
    A[Player] --> B[Gate Garden Game]

    B --> C[Title Scene]
    C --> D[Game Scene Hub]

    D --> E[Talk to Animals]
    E --> F[Fish Trial]
    E --> G[Memory Trial]

    F --> H[Earn Medal 🥇]
    G --> I[Earn Medal 🥇]

    H --> J{2 Medals?}
    I --> J

    J -->|No| D
    J -->|Yes| K[Gate Opens]
    K --> L[Credit Scene]

    subgraph "Webhook System"
        M[External Server]
        N[Game Parameters]
        O[AI Responses]
        P[Dynamic Content]
    end

    M --> N
    M --> O
    M --> P

    N -.-> F
    N -.-> G
    O -.-> E
    P -.-> D

    style B fill:#2d5a87,color:#fff
    style M fill:#ff6b6b,color:#fff
    style N fill:#ffa07a,color:#000
    style O fill:#ffa07a,color:#000
    style P fill:#ffa07a,color:#000
```

### Webhook Integration

The game includes a webhook system for remote control and dynamic content. When it’s enabled, it connects to an external server to pull in AI-generated responses and game settings.

This makes it easy to update content on the fly, so every playthrough is different.
