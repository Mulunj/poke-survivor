const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ui = {
  runCounter: document.getElementById('runCounter'),
  levelDisplay: document.getElementById('levelDisplay'),
  healthDisplay: document.getElementById('healthDisplay'),
  xpDisplay: document.getElementById('xpDisplay'),
  coinDisplay: document.getElementById('coinDisplay'),
  waveDisplay: document.getElementById('waveDisplay'),
  currentMoveLabel: document.getElementById('currentMoveLabel'),
  attackBoostLabel: document.getElementById('attackBoostLabel'),
  buffTimerLabel: document.getElementById('buffTimerLabel'),
  evolutionLabel: document.getElementById('evolutionLabel'),
  mapLabel: document.getElementById('mapLabel'),
  rosterList: document.getElementById('rosterList'),
  gachaBtn: document.getElementById('gachaBtn'),
  overlay: document.getElementById('gameOverlay'),
  pauseOverlay: document.getElementById('pauseOverlay'),
  skillOverlay: document.getElementById('skillOverlay'),
  summaryOverlay: document.getElementById('summaryOverlay'),
  startBtn: document.getElementById('startBtn'),
  resumeBtn: document.getElementById('resumeBtn'),
  menuBtn: document.getElementById('menuBtn'),
  pauseBtn: document.getElementById('pauseBtn'),
  speciesSelect: document.getElementById('speciesSelect'),
  skillChoiceGrid: document.getElementById('skillChoiceGrid'),
  summaryStats: document.getElementById('summaryStats'),
  playAgainBtn: document.getElementById('playAgainBtn'),
  summaryMenuBtn: document.getElementById('summaryMenuBtn')
};

const maps = [
  {
    name: 'Sunlit Meadow',
    background: '#11263c',
    grid: '#93c5fd',
    accent: '#7dd3fc',
    enemyBias: ['grass', 'electric'],
    bossName: 'Thorn Titan',
    bossType: 'grass'
  },
  {
    name: 'Cinder Cavern',
    background: '#221417',
    grid: '#fca5a5',
    accent: '#f87171',
    enemyBias: ['fire', 'water'],
    bossName: 'Molten Leviathan',
    bossType: 'fire'
  },
  {
    name: 'Storm Reach',
    background: '#10243c',
    grid: '#a5b4fc',
    accent: '#60a5fa',
    enemyBias: ['water', 'electric'],
    bossName: 'Tempest Seraph',
    bossType: 'electric'
  }
];

const speciesCatalog = {
  Sparkit: {
    name: 'Sparkit',
    baseType: 'electric',
    primary: '#facc15',
    secondary: '#fef08a',
    accent: '#7dd3fc',
    moves: [
      { id: 1, name: 'Spark', type: 'electric', power: 15, color: '#facc15', cooldown: 0.42, projectileSpeed: 420 },
      { id: 2, name: 'Volt Rush', type: 'electric', power: 22, color: '#fde68a', cooldown: 0.8, projectileSpeed: 440 },
      { id: 3, name: 'Static Pulse', type: 'electric', power: 18, color: '#fef3c7', cooldown: 0.56, projectileSpeed: 430 },
      { id: 4, name: 'Charge Up', type: 'buff', power: 0, color: '#fbbf24', cooldown: 2.4, projectileSpeed: 0 }
    ]
  },
  Cascadeon: {
    name: 'Cascadeon',
    baseType: 'water',
    primary: '#60a5fa',
    secondary: '#dbeafe',
    accent: '#93c5fd',
    moves: [
      { id: 1, name: 'Aqua Burst', type: 'water', power: 16, color: '#60a5fa', cooldown: 0.5, projectileSpeed: 390 },
      { id: 2, name: 'Tidal Dash', type: 'water', power: 25, color: '#93c5fd', cooldown: 0.85, projectileSpeed: 470 },
      { id: 3, name: 'Mist Spray', type: 'water', power: 18, color: '#dbeafe', cooldown: 0.58, projectileSpeed: 410 },
      { id: 4, name: 'Swords Dance', type: 'buff', power: 0, color: '#fbbf24', cooldown: 2.2, projectileSpeed: 0 }
    ]
  },
  Bloomfin: {
    name: 'Bloomfin',
    baseType: 'grass',
    primary: '#34d399',
    secondary: '#a7f3d0',
    accent: '#86efac',
    moves: [
      { id: 1, name: 'Leaf Cutter', type: 'grass', power: 18, color: '#34d399', cooldown: 0.58, projectileSpeed: 400 },
      { id: 2, name: 'Vine Lash', type: 'grass', power: 24, color: '#86efac', cooldown: 0.9, projectileSpeed: 440 },
      { id: 3, name: 'Bloom Shot', type: 'grass', power: 20, color: '#bbf7d0', cooldown: 0.62, projectileSpeed: 420 },
      { id: 4, name: 'Growth Cycle', type: 'buff', power: 0, color: '#fbbf24', cooldown: 2.3, projectileSpeed: 0 }
    ]
  },
  Emberkin: {
    name: 'Emberkin',
    baseType: 'fire',
    primary: '#f87171',
    secondary: '#fecaca',
    accent: '#fdba74',
    moves: [
      { id: 1, name: 'Ember', type: 'fire', power: 15, color: '#f87171', cooldown: 0.45, projectileSpeed: 420 },
      { id: 2, name: 'Flame Arc', type: 'fire', power: 23, color: '#fca5a5', cooldown: 0.8, projectileSpeed: 450 },
      { id: 3, name: 'Blaze Shot', type: 'fire', power: 18, color: '#fed7aa', cooldown: 0.6, projectileSpeed: 430 },
      { id: 4, name: 'Vigil Flame', type: 'buff', power: 0, color: '#fbbf24', cooldown: 2.4, projectileSpeed: 0 }
    ]
  }
};

const skillTrees = [
  {
    id: 'power-surge',
    name: 'Power Surge',
    description: '+18% attack damage and bigger projectiles.',
    apply: () => {
      if (!player) return;
      player.damageBoost *= 1.18;
      player.projectileScale = (player.projectileScale || 1) * 1.14;
      player.dpsBonus = (player.dpsBonus || 0) + 0.18;
    }
  },
  {
    id: 'swift-reflexes',
    name: 'Swift Reflexes',
    description: '+12% movement speed and magnet reach.',
    apply: () => {
      if (!player) return;
      player.speed *= 1.12;
      player.magnetRadius += 20;
      player.mobilityBonus = (player.mobilityBonus || 0) + 0.12;
    }
  },
  {
    id: 'guardian-sap',
    name: 'Guardian Sap',
    description: '+20 max HP and passive healing after each wave.',
    apply: () => {
      if (!player) return;
      player.maxHealth += 20;
      player.health = player.maxHealth;
      player.healingBonus = (player.healingBonus || 0) + 1;
    }
  }
];

const typeChart = {
  fire: { grass: 1.45, water: 0.7, electric: 1, fire: 1 },
  water: { fire: 1.45, grass: 0.7, electric: 0.8, water: 1 },
  grass: { water: 1.45, fire: 0.7, electric: 1, grass: 1 },
  electric: { water: 1.45, fire: 1, grass: 1, electric: 1 }
};

const keys = {};
const arena = { width: canvas.width, height: canvas.height };
const unlockedPokemon = new Set(['Sparkit', 'Cascadeon']);
const sound = new SoundManager();

const state = {
  mode: 'menu',
  selectedSpecies: 'Sparkit',
  runNumber: 1,
  coins: 0,
  wave: 1,
  spawnTimer: 1.2,
  lastTime: performance.now(),
  bossActive: false,
  mapIndex: 0,
  currentMap: maps[0],
  runStats: {
    survivalTime: 0,
    enemiesKilled: 0,
    highestWave: 1,
    coinsEarned: 0,
    bossDefeated: false,
    species: 'Sparkit'
  }
};

let player = null;
let projectiles = [];
let enemies = [];
let xpOrbs = [];
let particles = [];

function SoundManager() {
  this.ctx = null;
}

SoundManager.prototype.ensure = function () {
  if (!this.ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) {
      this.ctx = new Ctx();
    }
  }
};

SoundManager.prototype.playTone = function (frequency, duration, type = 'square', volume = 0.04) {
  this.ensure();
  if (!this.ctx) return;
  const osc = this.ctx.createOscillator();
  const gain = this.ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(this.ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
  osc.stop(this.ctx.currentTime + duration);
};

SoundManager.prototype.fire = function () { this.playTone(320, 0.06, 'square', 0.03); };
SoundManager.prototype.hit = function () { this.playTone(170, 0.08, 'triangle', 0.04); };
SoundManager.prototype.levelUp = function () { this.playTone(450, 0.14, 'sawtooth', 0.05); setTimeout(() => this.playTone(650, 0.14, 'sawtooth', 0.04), 80); };
SoundManager.prototype.buff = function () { this.playTone(520, 0.16, 'triangle', 0.05); };
SoundManager.prototype.gameOver = function () { this.playTone(120, 0.24, 'sawtooth', 0.045); };
SoundManager.prototype.boss = function () { this.playTone(90, 0.28, 'sawtooth', 0.045); };

function buildSpeciesCards() {
  const entries = Object.entries(speciesCatalog);
  ui.speciesSelect.innerHTML = '';

  entries.forEach(([key, species]) => {
    const button = document.createElement('button');
    button.className = 'species-card';
    button.innerHTML = `<strong>${species.name}</strong><span>${species.baseType}</span>`;
    if (state.selectedSpecies === key) button.classList.add('active');
    button.addEventListener('click', () => {
      state.selectedSpecies = key;
      buildSpeciesCards();
    });
    ui.speciesSelect.appendChild(button);
  });
}

function renderSkillChoices() {
  ui.skillChoiceGrid.innerHTML = '';
  skillTrees.forEach((skill) => {
    const button = document.createElement('button');
    button.className = 'skill-card';
    button.innerHTML = `<strong>${skill.name}</strong><span>${skill.description}</span>`;
    button.addEventListener('click', () => {
      skill.apply();
      state.mode = 'playing';
      ui.skillOverlay.classList.remove('visible');
      ui.skillOverlay.classList.add('hidden');
      updateUI();
    });
    ui.skillChoiceGrid.appendChild(button);
  });
}

function setMap(index = state.mapIndex) {
  state.mapIndex = index;
  state.currentMap = maps[index];
  ui.mapLabel.textContent = state.currentMap.name;
}

function createPlayerFromSpecies(speciesName) {
  const species = speciesCatalog[speciesName];
  return {
    x: arena.width / 2,
    y: arena.height / 2,
    radius: 18,
    baseSpeed: 190,
    speed: 190,
    health: 100,
    maxHealth: 100,
    xp: 0,
    xpToNext: 100,
    level: 1,
    damageBoost: 1,
    magnetRadius: 92,
    fireCooldown: 0,
    boostTimer: 0,
    moveIndex: 0,
    Species: species,
    evolutionStage: 'Base',
    moves: species.moves.map((move) => ({ ...move })),
    pulse: 0,
    speciesName,
    projectileScale: 1,
    dpsBonus: 0,
    mobilityBonus: 0,
    healingBonus: 0
  };
}

function resetRun() {
  if (!player) {
    player = createPlayerFromSpecies(state.selectedSpecies);
  }

  player.x = arena.width / 2;
  player.y = arena.height / 2;
  player.baseSpeed = 190;
  player.speed = 190;
  player.health = 100;
  player.maxHealth = 100;
  player.xp = 0;
  player.xpToNext = 100;
  player.level = 1;
  player.damageBoost = 1;
  player.boostTimer = 0;
  player.magnetRadius = 92;
  player.fireCooldown = 0;
  player.projectileScale = 1;
  player.dpsBonus = 0;
  player.mobilityBonus = 0;
  player.healingBonus = 0;
  player.evolutionStage = 'Base';
  player.moves = speciesCatalog[state.selectedSpecies].moves.map((move) => ({ ...move }));
  player.moveIndex = 0;
  projectiles = [];
  enemies = [];
  xpOrbs = [];
  particles = [];
  state.wave = 1;
  state.spawnTimer = 1.2;
  state.bossActive = false;
  state.runStats = {
    survivalTime: 0,
    enemiesKilled: 0,
    highestWave: 1,
    coinsEarned: 0,
    bossDefeated: false,
    species: state.selectedSpecies
  };
  state.currentMap = maps[Math.floor(Math.random() * maps.length)];
  state.mapIndex = maps.indexOf(state.currentMap);
  ui.mapLabel.textContent = state.currentMap.name;
  updateUI();
}

function startRun() {
  state.mode = 'playing';
  ui.overlay.classList.remove('visible');
  ui.overlay.classList.add('hidden');
  ui.pauseOverlay.classList.add('hidden');
  ui.summaryOverlay.classList.remove('visible');
  ui.summaryOverlay.classList.add('hidden');
  resetRun();
  sound.ensure();
}

function returnToMenu() {
  state.mode = 'menu';
  ui.overlay.classList.remove('hidden');
  ui.overlay.classList.add('visible');
  ui.pauseOverlay.classList.add('hidden');
  ui.skillOverlay.classList.add('hidden');
  ui.summaryOverlay.classList.add('hidden');
  updateUI();
}

function togglePause() {
  if (state.mode === 'menu' || state.mode === 'summary' || state.mode === 'skillSelect') return;
  if (state.mode === 'playing') {
    state.mode = 'paused';
    ui.pauseOverlay.classList.remove('hidden');
    ui.pauseOverlay.classList.add('visible');
  } else if (state.mode === 'paused') {
    state.mode = 'playing';
    ui.pauseOverlay.classList.remove('visible');
    ui.pauseOverlay.classList.add('hidden');
  }
}

function triggerSkillSelection() {
  state.mode = 'skillSelect';
  ui.skillOverlay.classList.remove('hidden');
  ui.skillOverlay.classList.add('visible');
  renderSkillChoices();
}

function showSummary() {
  const summary = state.runStats;
  ui.summaryStats.innerHTML = `
    <div class="summary-card"><label>Species</label><strong>${summary.species}</strong></div>
    <div class="summary-card"><label>Map</label><strong>${state.currentMap.name}</strong></div>
    <div class="summary-card"><label>Time</label><strong>${summary.survivalTime.toFixed(1)}s</strong></div>
    <div class="summary-card"><label>Highest Wave</label><strong>${summary.highestWave}</strong></div>
    <div class="summary-card"><label>Enemies</label><strong>${summary.enemiesKilled}</strong></div>
    <div class="summary-card"><label>Coins</label><strong>${summary.coinsEarned}</strong></div>
    <div class="summary-card"><label>Boss</label><strong>${summary.bossDefeated ? 'Defeated' : 'Not reached'}</strong></div>
    <div class="summary-card"><label>Level</label><strong>${player ? player.level : 1}</strong></div>
  `;

  ui.summaryOverlay.classList.remove('hidden');
  ui.summaryOverlay.classList.add('visible');
}

function updateUI() {
  if (!player) {
    return;
  }

  ui.runCounter.textContent = String(state.runNumber);
  ui.levelDisplay.textContent = String(player.level);
  ui.healthDisplay.textContent = `${Math.max(0, Math.ceil(player.health))} / ${player.maxHealth}`;
  ui.xpDisplay.textContent = `${Math.floor(player.xp)} / ${player.xpToNext}`;
  ui.coinDisplay.textContent = String(state.coins);
  ui.waveDisplay.textContent = String(state.wave);
  ui.currentMoveLabel.textContent = player.moves[player.moveIndex].name;
  ui.attackBoostLabel.textContent = `x${player.damageBoost.toFixed(2)}`;
  ui.buffTimerLabel.textContent = `${player.boostTimer.toFixed(1)}s`;
  ui.evolutionLabel.textContent = player.evolutionStage;
  ui.mapLabel.textContent = state.currentMap.name;

  const moveSlots = document.querySelectorAll('.move-slot');
  moveSlots.forEach((slot) => {
    const index = Number(slot.dataset.index);
    const move = player.moves[index];
    slot.classList.toggle('selected', index === player.moveIndex);
    if (move) {
      slot.querySelector('.name').textContent = move.name;
      slot.querySelector('.type').textContent = move.type === 'buff' ? 'Buff' : move.type;
      slot.querySelector('.type').className = `type ${move.type === 'buff' ? 'buff' : move.type}`;
    }
  });

  ui.rosterList.innerHTML = '';
  Array.from(unlockedPokemon).forEach((name) => {
    const li = document.createElement('li');
    li.textContent = name;
    ui.rosterList.appendChild(li);
  });
}

function unlockRandomSpecies() {
  const pool = ['Sparkit', 'Cascadeon', 'Bloomfin', 'Emberkin', 'Frostail', 'Galeon', 'Mossling', 'Dracume'];
  const available = pool.filter((entry) => !unlockedPokemon.has(entry));
  const next = available.length ? available[Math.floor(Math.random() * available.length)] : 'Mystic Capsule';
  if (next !== 'Mystic Capsule') {
    unlockedPokemon.add(next);
  }
  return next;
}

function rollGacha() {
  const prize = unlockRandomSpecies();
  state.coins += 5;
  ui.gachaBtn.textContent = `New: ${prize}`;
  setTimeout(() => {
    ui.gachaBtn.textContent = 'Gacha';
  }, 1100);
  updateUI();
}

function applyPermanentUpgrade(type) {
  if (state.coins <= 0) return;
  state.coins -= 1;
  if (type === 'speed') {
    player.baseSpeed += 10;
    player.speed = player.baseSpeed;
  } else if (type === 'damage') {
    player.damageBoost *= 1.08;
  } else if (type === 'magnet') {
    player.magnetRadius += 18;
  }
  updateUI();
}

function getEvolutionStage(level) {
  if (level >= 7) return 'Final';
  if (level >= 4) return 'Evolved';
  return 'Base';
}

function addProjectile(x, y, vx, vy, dmg, type, color) {
  projectiles.push({
    x, y, vx, vy, radius: 5 * (player ? player.projectileScale : 1), damage: dmg, type, color, life: 1.6
  });
}

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x = 0;
  let y = 0;

  if (side === 0) {
    x = Math.random() * arena.width;
    y = -18;
  } else if (side === 1) {
    x = arena.width + 18;
    y = Math.random() * arena.height;
  } else if (side === 2) {
    x = Math.random() * arena.width;
    y = arena.height + 18;
  } else {
    x = -18;
    y = Math.random() * arena.height;
  }

  const enemyType = state.currentMap.enemyBias[Math.floor(Math.random() * state.currentMap.enemyBias.length)];
  const enemy = {
    x,
    y,
    radius: 14 + Math.random() * 10,
    speed: 52 + state.wave * 2.2 + Math.random() * 18,
    maxHealth: 18 + state.wave * 2.6,
    health: 18 + state.wave * 2.6,
    type: enemyType,
    color: enemyType === 'fire' ? '#f87171' : enemyType === 'water' ? '#60a5fa' : enemyType === 'grass' ? '#4ade80' : '#facc15',
    damage: 7 + state.wave * 0.8,
    attackCooldown: 0.9,
    aiTimer: Math.random() * 2,
    isBoss: false
  };
  enemies.push(enemy);
}

function spawnBoss() {
  const bossInfo = {
    name: state.currentMap.bossName,
    type: state.currentMap.bossType,
    color: state.currentMap.accent,
    radius: 28,
    speed: 46,
    health: 220 + state.wave * 15,
    maxHealth: 220 + state.wave * 15,
    damage: 15 + state.wave * 1.5,
    attackCooldown: 1.0,
    aiTimer: 0,
    isBoss: true,
    x: arena.width / 2,
    y: -40
  };
  enemies.push(bossInfo);
  sound.boss();
}

function spawnXPOrb(x, y, amount = 15) {
  xpOrbs.push({ x, y, radius: 7, amount, drift: Math.random() * Math.PI * 2 });
}

function createBurst(x, y, color, count = 12) {
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 220,
      vy: (Math.random() - 0.5) * 220,
      life: 0.5 + Math.random() * 0.4,
      radius: 2 + Math.random() * 3,
      color
    });
  }
}

function getEffectiveDamage(move, targetType) {
  if (move.type === 'buff') return 0;
  const multiplier = typeChart[move.type]?.[targetType] || 1;
  return move.power * multiplier;
}

function selectMove(index) {
  if (!player || index < 0 || index >= player.moves.length) return;
  player.moveIndex = index;
  updateUI();
}

function useMove() {
  if (!player || state.mode !== 'playing' || player.fireCooldown > 0) return;
  const move = player.moves[player.moveIndex];
  if (!move) return;

  if (move.type === 'buff') {
    player.damageBoost = (player.damageBoost || 1) * 1.2;
    player.boostTimer = 5;
    player.fireCooldown = move.cooldown;
    createBurst(player.x, player.y, '#fbbf24', 18);
    sound.buff();
    updateUI();
    return;
  }

  let target = null;
  let minDist = Infinity;

  for (const enemy of enemies) {
    const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (dist < minDist) {
      minDist = dist;
      target = enemy;
    }
  }

  if (!target) return;

  const angle = Math.atan2(target.y - player.y, target.x - player.x);
  const speed = move.projectileSpeed;
  const dmg = getEffectiveDamage(move, target.type) * player.damageBoost;

  addProjectile(player.x, player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, dmg, move.type, move.color);
  player.fireCooldown = move.cooldown;
  sound.fire();
}

function updatePlayer(dt) {
  if (!player) return;

  if (player.fireCooldown > 0) player.fireCooldown -= dt;
  if (player.boostTimer > 0) {
    player.boostTimer -= dt;
    if (player.boostTimer <= 0) {
      player.damageBoost = Math.max(1, player.damageBoost / 1.2);
    }
  }

  const dx = (keys.d || keys.right ? 1 : 0) - (keys.a || keys.left ? 1 : 0);
  const dy = (keys.s || keys.down ? 1 : 0) - (keys.w || keys.up ? 1 : 0);
  const length = Math.hypot(dx, dy) || 1;
  player.x += (dx / length) * player.speed * dt;
  player.y += (dy / length) * player.speed * dt;
  player.x = Math.min(arena.width - player.radius, Math.max(player.radius, player.x));
  player.y = Math.min(arena.height - player.radius, Math.max(player.radius, player.y));

  player.pulse += dt * 7;
  player.evolutionStage = getEvolutionStage(player.level);
  state.runStats.survivalTime += dt;
  updateUI();
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.life -= dt;

    if (projectile.x < -30 || projectile.x > arena.width + 30 || projectile.y < -30 || projectile.y > arena.height + 30 || projectile.life <= 0) {
      projectiles.splice(i, 1);
      continue;
    }

    for (let j = enemies.length - 1; j >= 0; j -= 1) {
      const enemy = enemies[j];
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      if (dist < enemy.radius + projectile.radius) {
        enemy.health -= projectile.damage;
        createBurst(projectile.x, projectile.y, projectile.color, 6);
        sound.hit();
        projectiles.splice(i, 1);

        if (enemy.health <= 0) {
          const dropRoll = Math.random();
          if (dropRoll < 0.8) {
            spawnXPOrb(enemy.x, enemy.y, 18 + state.wave * 2);
          }
          enemies.splice(j, 1);
          state.coins += 4 + Math.floor(Math.random() * 4);
          state.runStats.coinsEarned += 4 + Math.floor(Math.random() * 4);
          state.runStats.enemiesKilled += 1;
          if (enemy.isBoss) {
            state.runStats.bossDefeated = true;
            state.bossActive = false;
            state.coins += 30;
            state.runStats.coinsEarned += 30;
          }
        }
        break;
      }
    }
  }
}

function updateEnemies(dt) {
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx);

    if (enemy.isBoss) {
      enemy.x += Math.cos(angle) * enemy.speed * dt * 0.85;
      enemy.y += Math.sin(angle) * enemy.speed * dt * 0.85;
    } else {
      const strafe = Math.sin((performance.now() / 1000) + enemy.aiTimer) * 0.8;
      enemy.x += Math.cos(angle + strafe) * enemy.speed * dt;
      enemy.y += Math.sin(angle + strafe) * enemy.speed * dt;
    }

    if (dist < player.radius + enemy.radius + 4) {
      enemy.attackCooldown -= dt;
      if (enemy.attackCooldown <= 0) {
        player.health -= enemy.damage;
        enemy.attackCooldown = enemy.isBoss ? 1.1 : 0.8;
        createBurst(player.x, player.y, '#f87171', enemy.isBoss ? 12 : 8);
      }
    }

    if (player.health <= 0) {
      state.mode = 'summary';
      showSummary();
      sound.gameOver();
      return;
    }
  }
}

function updateXPOrbs(dt) {
  for (let i = xpOrbs.length - 1; i >= 0; i -= 1) {
    const orb = xpOrbs[i];
    const dx = player.x - orb.x;
    const dy = player.y - orb.y;
    const dist = Math.hypot(dx, dy) || 1;
    const pull = dist < player.magnetRadius ? 300 : 0;

    if (pull > 0) {
      orb.x += (dx / dist) * pull * dt;
      orb.y += (dy / dist) * pull * dt;
    }

    if (dist < player.radius + orb.radius + 2) {
      player.xp += orb.amount;
      xpOrbs.splice(i, 1);
      if (player.xp >= player.xpToNext) {
        player.xp -= player.xpToNext;
        player.level += 1;
        player.xpToNext = Math.round(player.xpToNext * 1.35);
        player.maxHealth += 12;
        player.health = player.maxHealth;
        player.evolutionStage = getEvolutionStage(player.level);
        createBurst(player.x, player.y, player.Species.primary, 20);
        sound.levelUp();
        if (player.level % 2 === 0) {
          triggerSkillSelection();
        }
      }
    }
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function updateWave(dt) {
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    if (state.wave > 1 && state.wave % 5 === 0 && !state.bossActive) {
      spawnBoss();
      state.bossActive = true;
      state.spawnTimer = 3;
      return;
    }

    const count = 1 + Math.min(4, Math.floor(state.wave / 2));
    for (let i = 0; i < count; i += 1) {
      spawnEnemy();
    }
    state.wave += 1;
    state.runStats.highestWave = Math.max(state.runStats.highestWave, state.wave);
    state.spawnTimer = Math.max(0.7, 1.8 - state.wave * 0.08);
  }
}

function drawGrid() {
  ctx.fillStyle = state.currentMap.background;
  ctx.fillRect(0, 0, arena.width, arena.height);

  ctx.strokeStyle = state.currentMap.grid + '33';
  ctx.lineWidth = 1;
  for (let x = 0; x < arena.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, arena.height);
    ctx.stroke();
  }
  for (let y = 0; y < arena.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(arena.width, y);
    ctx.stroke();
  }
}

function roundedRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawPlayerSprite(entity) {
  const pulse = 1 + Math.sin(entity.pulse) * 0.08;
  const bodySize = entity.radius * pulse;

  ctx.save();
  ctx.translate(entity.x, entity.y);
  roundedRect(-bodySize, -bodySize, bodySize * 2, bodySize * 2, 11);
  ctx.fillStyle = entity.Species.primary;
  ctx.fill();

  ctx.fillStyle = entity.Species.secondary;
  ctx.beginPath();
  ctx.ellipse(0, 0, bodySize * 0.8, bodySize * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-bodySize * 0.7, -bodySize * 0.2, bodySize * 1.4, bodySize * 0.18);
  ctx.fillStyle = '#fff';
  ctx.fillRect(-bodySize * 0.4, -bodySize * 0.12, bodySize * 0.18, bodySize * 0.18);
  ctx.fillRect(bodySize * 0.22, -bodySize * 0.12, bodySize * 0.18, bodySize * 0.18);
  ctx.restore();
}

function drawEnemySprite(enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.fillStyle = enemy.color;
  ctx.beginPath();
  ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
  ctx.fill();

  if (enemy.isBoss) {
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius + 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.fillRect(-18, -enemy.radius - 12, 36, 6);
  ctx.fillStyle = '#34d399';
  ctx.fillRect(-18, -enemy.radius - 12, (enemy.health / enemy.maxHealth) * 36, 6);
  ctx.restore();
}

function drawXPOrb(orb) {
  ctx.save();
  ctx.translate(orb.x, orb.y);
  ctx.fillStyle = '#c4b5fd';
  ctx.beginPath();
  ctx.arc(0, 0, orb.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fef3c7';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('+', 0, 4);
  ctx.restore();
}

function drawProjectiles() {
  projectiles.forEach((projectile) => {
    ctx.beginPath();
    ctx.fillStyle = projectile.color;
    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawParticles() {
  particles.forEach((particle) => {
    ctx.beginPath();
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function drawHUD() {
  if (!player) return;
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '16px Arial';
  ctx.fillText(`Wave ${state.wave}`, 20, 28);
  ctx.fillText(`Coins ${state.coins}`, 20, 52);
  ctx.fillText(`Move: ${player.moves[player.moveIndex].name}`, 20, 76);
  ctx.fillText(`Form: ${player.evolutionStage}`, 20, 100);
}

function drawSummaryIfNeeded() {
  if (state.mode !== 'summary') return;
  ctx.fillStyle = 'rgba(3,7,18,0.68)';
  ctx.fillRect(0, 0, arena.width, arena.height);
}

function draw() {
  drawGrid();
  drawProjectiles();
  xpOrbs.forEach(drawXPOrb);
  enemies.forEach(drawEnemySprite);
  drawParticles();

  if (player) {
    drawPlayerSprite(player);
    drawHUD();
  }

  if (state.mode === 'summary') {
    drawSummaryIfNeeded();
  }
}

function networkStub() {
  console.log('Multiplayer-ready architecture active: WebSocket layer can sync players and enemy state.');
}

function gameLoop(time) {
  const dt = Math.min(0.033, (time - state.lastTime) / 1000);
  state.lastTime = time;

  if (state.mode === 'playing') {
    updatePlayer(dt);
    updateWave(dt);
    updateProjectiles(dt);
    updateEnemies(dt);
    updateXPOrbs(dt);
    updateParticles(dt);
    useMove();
  }

  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if (key === 'p') {
    togglePause();
    return;
  }

  if (key === 'r' && state.mode === 'summary') {
    state.runNumber += 1;
    startRun();
    return;
  }

  if (key === '1') selectMove(0);
  if (key === '2') selectMove(1);
  if (key === '3') selectMove(2);
  if (key === '4') selectMove(3);

  keys[key] = true;
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  keys[key] = false;
});

document.querySelectorAll('.upgrade-btn').forEach((button) => {
  button.addEventListener('click', () => applyPermanentUpgrade(button.dataset.upgrade));
});

ui.gachaBtn.addEventListener('click', rollGacha);
ui.startBtn.addEventListener('click', startRun);
ui.resumeBtn.addEventListener('click', togglePause);
ui.menuBtn.addEventListener('click', returnToMenu);
ui.pauseBtn.addEventListener('click', togglePause);
ui.playAgainBtn.addEventListener('click', () => {
  state.runNumber += 1;
  ui.summaryOverlay.classList.remove('visible');
  ui.summaryOverlay.classList.add('hidden');
  startRun();
});
ui.summaryMenuBtn.addEventListener('click', returnToMenu);

buildSpeciesCards();
networkStub();
setMap(0);
updateUI();
requestAnimationFrame(gameLoop);
