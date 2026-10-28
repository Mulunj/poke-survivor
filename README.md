# PokeSurvivor

A browser-based 2D survival fan game prototype inspired by Pokémon and Vampire Survivors-style progression.

## Updated features

- Start menu and pause overlay
- Sprite-style creature art and animation
- Sound effects generated via Web Audio
- Multiple starter species with different move sets
- Evolution-based form changes
- Better enemy pathing and evasive AI
- Upgrade system and gacha unlock flow
- Multiplayer-ready architecture stub for WebSocket-based sync

## Run locally

```bash
cd poke-survivor
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Controls

- Move: `W`, `A`, `S`, `D`
- Switch moves: `1`, `2`, `3`, `4`
- Pause: `P`
- Restart after death: `R`

## Design notes

This prototype intentionally uses original canvas art and generated sound effects instead of copyrighted sprite assets. The networking layer is designed to be ready for a real multiplayer backend, but the HTML/JavaScript version here focuses on a complete single-player loop.

## Next steps

If you want to continue, the next realistic upgrade is to add:

1. real sprite sheets and animation frames
2. a backend server for online multiplayer
3. an inventory, run summary screen, and map selection
4. a richer move system with status effects and skill trees

