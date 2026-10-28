# PokeSurvivor Prototype

A browser-based 2D survival fan game prototype inspired by Pokémon and vampire-survivor style combat.

## Features

- WASD movement
- Auto-targeting projectile combat
- Enemy waves and survival loop
- XP collection and leveling
- Type effectiveness for fire, water, grass, and electric
- Move-slot management with buffing move
- Permanent upgrade system
- Gacha-style Pokémon unlocks

## Run locally

Open `index.html` directly in a browser, or serve the folder with a simple local HTTP server:

```bash
cd poke-survivor
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Controls

- Move: `W`, `A`, `S`, `D`
- Switch move: `1`, `2`, `3`, `4`
- Pause: `P`
- Restart after death: `R`

## Notes

This is a lightweight prototype for the core gameplay loop. It is intentionally built with plain HTML, CSS, and JavaScript so it runs without a build step.
