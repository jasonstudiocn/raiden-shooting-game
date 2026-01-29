# Raiden 3 - Classic Arcade Shooting Game

A web-based implementation of the classic Raiden 3 arcade shooting game, built with HTML5 Canvas and JavaScript.

🎮 **Play the game live:** https://raiden-shooting-game.vercel.app

## Features

- 🚀 **Classic Raiden 3 gameplay** - 1:1 recreation of the arcade classic
- 🔫 **Multiple weapon types** - Vulcan, Laser, Plasma, Missile upgrades
- 👾 **Diverse enemy types** - Basic and advanced enemies with AI patterns
- 👹 **Epic boss battles** - Multi-phase boss fights with increasing difficulty
- 💥 **Particle effects & explosions** - Visual effects for destruction
- 🌟 **Power-up system** - Collect weapon upgrades and score bonuses
- 📱 **Mobile responsive** - Touch controls for mobile devices
- 🔊 **Sound effects** - Retro arcade sound effects
- 📊 **Score & stage progression** - High score tracking and multiple stages
- ⭐ **Scrolling starfield** - Classic space shooter background

## How to Play

### Desktop Controls
- **Arrow Keys**: Move fighter jet
- **Spacebar**: Auto-fire weapons

### Mobile Controls
- **D-Pad**: Move fighter jet
- **Fire Button**: Hold to auto-fire

### Game Mechanics
1. **Destroy enemies** to earn points and progress stages
2. **Collect power-ups** to upgrade weapons:
   - 🟡 **VULCAN** - Spread shot (default)
   - 🟣 **LASER** - High damage beam
   - 🔵 **PLASMA** - Multi-directional energy
   - 🟠 **MISSILE** - Homing projectiles
3. **Defeat bosses** to complete stages
4. **Survive** as long as possible for high scores

### Power-Up System
- **Yellow Boxes**: Weapon upgrades (V, L, P, M)
- **Power Levels**: Upgrade weapons up to level 3
- **Strategy**: Different weapons for different situations

## Game Features

### Weapon Types
- **Vulcan**: Balanced spread shot, good for crowd control
- **Laser**: High single-target damage
- **Plasma**: Multi-directional energy balls
- **Missile**: Side-firing projectiles for wide coverage

### Enemy Types
- **Basic Enemies** (Red): Standard movement patterns
- **Advanced Enemies** (Orange): Faster with more health
- **Bosses**: Multi-phase battles with special attacks

### Stage Progression
- Progressive difficulty increase
- More enemies per stage
- Stronger boss enemies
- Faster enemy movement

## Technologies Used

- HTML5 Canvas for game rendering
- Vanilla JavaScript for game logic
- CSS3 for retro arcade styling
- Web Audio API for sound effects
- Local Storage for high scores

## Installation and Running

1. Clone the repository:
```bash
git clone https://github.com/jasonstudiocn/raiden-shooting-game.git
cd raiden-shooting-game
```

2. Start a local server:
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .

# Or use any static file server
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

## Game Development

### Project Structure
```
raiden-shooting-game/
├── index.html          # Main HTML structure
├── styles.css          # Retro arcade CSS styling
├── game.js             # Complete game engine (1500+ lines)
├── sounds.js           # Web Audio API sound system
├── package.json        # Project configuration
└── README.md           # Documentation
```

### Key Classes
- `Game`: Main game controller and loop
- `PlayerFighter`: Player ship with weapon system
- `Bullet`: Projectile system with multiple types
- `Enemy`: Enemy AI with movement patterns
- `Boss`: Multi-phase boss battles
- `PowerUp`: Weapon upgrade system
- `Particle`: Visual effects system
- `Explosion`: Dynamic explosion effects
- `SoundManager`: Audio effects controller

### Game Engine Features
- 60 FPS game loop
- Collision detection system
- Particle effect engine
- Scrolling background system
- Power-up mechanics
- Score and stage management
- Mobile touch controls
- Pause/resume functionality

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use and modify for your own projects.

---

**Experience the classic arcade action of Raiden 3 in your browser!** 🕹️