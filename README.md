# PokeSurvivor

A browser-based 2D survival fan game prototype inspired by Pokémon and Vampire Survivors-style progression.

## Features

- Start menu and pause overlay
- Sprite-style creature art and animation
- Sound effects generated via Web Audio
- Multiple starter species with different move sets
- Evolution-based form changes
- Better enemy pathing and evasive AI
- Boss encounters and map variety
- Upgrade system, gacha unlock flow, and run summaries
- Skill-tree choices at milestone levels
- Multiplayer-ready socket architecture

## Run locally

### Single-player static file mode

```bash
cd poke-survivor
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

### Multiplayer server mode

```bash
cd poke-survivor
npm install
npm start
```

Then open `http://localhost:3000` in the browser.

## Controls

- Move: `W`, `A`, `S`, `D`
- Switch moves: `1`, `2`, `3`, `4`
- Pause: `P`
- Restart after death: `R`

## Notes

The project now includes a lightweight Node.js + Socket.IO server so the game has a real multiplayer-ready backend scaffold. If the server is not running, the client still falls back to local single-player behavior.

## Next phases

The next logical expansion beyond this phase is adding:

1. real sprite-sheet art and animation frames
2. richer move status effects and boss phases
3. full co-op battle sync and lobby flow
4. persistent player profiles and progression storage
