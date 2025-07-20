# Gate Garden - A Surreal Gatekeeper's Tale

A Phaser 3 game set in a mysterious, Bosch-inspired garden where you play as a gatekeeper making crucial decisions about unusual visitors. Each choice affects the delicate balance of four realm resources: Public Health, Economic Support, Social Trust, and Political Stability.

## 🎮 Game Overview

### Core Gameplay

- **Duration**: 7-14 in-game days
- **Daily Visitors**: 2 unique creatures per day
- **Decision Points**: Allow or Deny passage for each visitor
- **Resource Management**: Balance 4 interconnected meters (0-100 scale)
- **Random Events**: Special decisions that can dramatically affect your realm

### The Four Pillars of Power

1. **🦠 Public Health** - Disease control and medical stability
2. **🌺 Support/Economy** - Trade, prosperity, and resource flow
3. **🗣️ Public Trust** - Social stability and faith in authority
4. **⚖️ Political Stability** - Governmental control and order

### Victory Conditions

- **Survival**: All meters above 40 at game end
- **Failure States**: Any meter reaches 0, or poor final balance leads to:
  - Plague Overrun (Health = 0)
  - Economic Collapse (Support = 0)
  - Civil Rebellion (Trust/Stability critical)
  - Despotism (High Stability, Low Trust)

## 🚀 How to Run

### Prerequisites

- Modern web browser with JavaScript support
- Node.js (for the Vite development server)

### Quick Start

1. **Clone or download** this repository
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
   This will start Vite dev server at `http://localhost:8080` and automatically open your browser

### Production Build

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🏗️ Project Structure

```
gate-garden/
├── index.html              # Main HTML entry point
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tsconfig.node.json      # TypeScript configuration for Node.js (Vite config)
├── vite/                   # Vite configuration files
│   ├── config.dev.mjs      # Development configuration
│   └── config.prod.mjs     # Production configuration
├── src/                    # Source code directory
│   ├── main.ts             # Phaser game initialization & global state
│   ├── scenes/             # Game scenes
│   │   ├── TitleScene.ts   # Title screen and game intro
│   │   ├── GameScene.ts    # Main gameplay scene
│   │   └── EndScene.ts     # Game over screen with multiple endings
│   ├── components/         # Reusable game components
│   │   └── VisitorCard.ts  # Interactive visitor decision cards
│   ├── ui/                 # User interface components
│   │   └── MeterPanel.ts   # Resource meter display and animations
│   └── data/               # Game data and logic
│       ├── visitors.ts     # Visitor definitions and effects
│       └── events.ts       # Random event definitions
└── assets/                 # Art assets (placeholder paths)
    ├── visitors/           # Visitor character images
    ├── icons/              # UI icons for meters and interface
    ├── backgrounds/        # Scene backgrounds
    └── effects/            # Particle effects and animations
```

## 🎨 Asset Requirements

The game currently uses placeholder graphics and emoji icons. For full visual implementation, the following assets should be created:

### Visitor Character Art (320x320px recommended)

- `assets/visitors/fruit_merchant.png` - Trader with fruit-based body parts
- `assets/visitors/worm_pilgrim.png` - Religious figure with worm head
- `assets/visitors/noble_hybrid.png` - Aristocrat with animal features
- `assets/visitors/crystal_child.png` - Translucent crystalline being
- `assets/visitors/root_scholar.png` - Academic with tree root lower body
- `assets/visitors/mirror_twin.png` - Dual-faced conjoined entity
- `assets/visitors/plague_healer.png` - Bandaged figure with glowing oils
- `assets/visitors/mushroom_court.png` - Colony of tiny mushroom people
- `assets/visitors/bone_architect.png` - Skeletal designer in velvet
- `assets/visitors/wind_singer.png` - Ethereal being with flowing energy
- `assets/visitors/clockwork_prophet.png` - Mechanical fortune teller
- `assets/visitors/shadow_merchant.png` - Living darkness trader

### UI Icons (64x64px recommended)

- `assets/icons/health.png` - Fly swarm or plague indicator
- `assets/icons/support.png` - Golden fruit or coin symbol
- `assets/icons/trust.png` - Cracked mirror or eye symbol
- `assets/icons/stability.png` - Twisted scepter or balance scales

### Effects & Particles

- `assets/effects/mystical_particles.png` - Floating light effects
- `assets/effects/fog_overlay.png` - Atmospheric fog layers
- `assets/effects/meter_glow.png` - Meter warning effects

## 🕹️ Gameplay Features

### Visitor System

- **12 Unique Visitors** with distinct personalities and effects
- **Rarity System**: Common, Uncommon, Rare, and Legendary visitors
- **Balanced Effects**: Each decision has meaningful trade-offs
- **Visual Feedback**: Cards show predicted meter changes

### Random Events

- **7 Special Events** that can trigger throughout the game
- **Multiple Choices**: Events offer 2-3 decision options
- **Significant Impact**: Events can dramatically shift meter values
- **Narrative Depth**: Rich storytelling that enhances the surreal atmosphere

### Dynamic Endings

- **6+ Different Endings** based on final meter values
- **Atmospheric Effects**: Visual changes reflect your realm's condition
- **Detailed Narration**: Each ending provides closure and consequence
- **Replayability**: Different strategies lead to different outcomes

## 🛠️ Technical Features

### Built With

- **Phaser 3.90.0** - Modern HTML5 game framework
- **TypeScript 5.7.2** - Type-safe JavaScript with enhanced development experience
- **Vite** - Lightning-fast build tool and dev server
- **ES6 Modules** - Clean, modular code structure
- **Hot Module Replacement** - Instant updates during development
- **Responsive Design** - Scales to different screen sizes
- **Rich Animations** - Smooth tweens and particle effects

### Code Architecture

- **Scene Management**: Clean separation between title, game, and ending
- **Component System**: Reusable UI elements and game objects
- **State Management**: Global game state with utility functions
- **Event System**: Flexible random event framework
- **Data-Driven**: Easy to modify visitors and events via JSON-like structures

## 🎭 Design Philosophy

The game draws inspiration from Hieronymus Bosch's surreal medieval art, creating an atmosphere where the bizarre becomes normal. Each visitor represents different aspects of society and human nature, forcing players to make difficult moral and practical decisions.

The resource management system creates meaningful tension - every choice has consequences, and there's no single "correct" path to victory. Players must adapt their strategy based on the random visitors and events they encounter.

## 🔧 Customization

### Adding New Visitors

Edit `data/visitors.js` to add new visitor entries with:

- Unique ID and descriptive name
- Rich flavor text description
- Rarity classification
- Balanced meter effects for Allow/Deny decisions

### Creating New Events

Modify `data/events.js` to add special events with:

- Trigger conditions (day, probability)
- Multiple choice options
- Significant meter impacts
- Engaging narrative text

### Adjusting Game Balance

Tune the experience by modifying:

- Starting meter values in `main.js`
- Game duration (`maxDays` in GameState)
- Meter change ranges in visitor/event definitions
- Ending thresholds in `GameUtils.getFinalOutcome()`

## 📝 License

MIT License - Feel free to use, modify, and distribute as needed.

---

_Step through the garden gates and begin your surreal journey as the keeper of impossible choices..._
