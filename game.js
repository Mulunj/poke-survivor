const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ui = {
  runCounter: document.getElementById('runCounter'),
  levelDisplay: document.getElementById('levelDisplay'),
  healthDisplay: document.getElementById('healthDisplay'),
  xpDisplay: document.getElementById('xpDisplay'),
  coinDisplay: document.getElementById('coinDisplay'),
  currentMoveLabel: document.getElementById('currentMoveLabel'),
  attackBoostLabel: document.getElementById('attackBoostLabel'),
  buffTimerLabel: document.getElementById('buffTimerLabel'),
  rosterList: document.getElementById('rosterList'),
  gachaBtn: document.getElementById('gachaBtn')
};

const typeChart = {
  fire: { grass: 1.45, water: 0.7, electric: 1, fire: 1 },
  water: { fire: 1.45, grass: 0.7, electric: 0.8, water: 1 },
  grass: { water: 1.45, fire: 0.7, electric: 1, grass: 1 },
  electric: { water: 1.45, fire: 1, grass: 1, electric: 1 }
};

const moveLibrary = [
  { id: 1, name: 'Spark', type: 'electric', power: 14, color: '#facc15', cooldown: 0.45, projectileSpeed: 420 },
  { id: 2, name: 'Aqua Burst', type: 'water', power: 16, color: '#60a5fa', cooldown: 0.55, projectileSpeed: 390 },
  { id: 3, name: 'Leaf Cutter', type: 'grass', power: 18, color: '#34d399', cooldown: 0.6, projectileSpeed: 410 },
  { id: 4, name: 'Swords Dance', type: 'buff', power: 0, color: '#fbbf24', cooldown: 2.25, projectileSpeed: 0 }
];

const starterPokemon = ['Pikachu', 'Bulbasaur', 'Charmander'];
const unlockedPokemon = new Set(starterPokemon);

const keys = {};
const arena = { width: canvas.width, height: canvas.height };

let runNumber = 1;
let gameState = 'playing';
let lastTime = performance.now();
let spawnTimer = 0;
let xpOrbId = 0;
let enemyId = 0;
let projectileId = 0;
let waveNumber = 1;
let coinBalance = 0;
let runCoins = 0;

const player = {
  x: arena.width / 2,
  y: arena.height / 2,
  radius: 18,
  baseSpeed: 198,
  speed: 198,
  health: 100,
  maxHealth: 100,
  xp: 0,
  xpToNext: 100,
  level: 1,
  moveIndex: 0,
  fireCooldown: 0,
  damageBoost: 1,
  boostTimer: 0,
  magnetRadius: 95,
  coins: 0,
  color: '#7dd3fc'
};

const stats = {
  speedLevel: 0,
  damageLevel: 0,
  magnetLevel: 0
};

let projectiles = [];
let enemies = [];
let xpOrbs = [];
let particles = [];

function resetRun() {
  player.x = arena.width / 2;
  player.y = arena.height / 2;
  player.speed = player.baseSpeed + stats.speedLevel * 12;
  player.health = player.maxHealth;
  player.xp = 0;
  player.xpToNext = 100;
  player.level = 1;
  player.moveIndex = 0;
  player.damageBoost = 1;
  player.boostTimer = 0;
  player.magnetRadius = 95 + stats.magnetLevel * 18;
  player.fireCooldown = 0;
  projectiles = [];
  enemies = [];
  xpOrbs = [];
  particles = [];
  spawnTimer = 0;
  waveNumber = 1;
  runCoins = 0;
  gameState = 'playing';
  updateUI();
}

function applyPermanentUpgrade(type) {
  if (coinBalance <= 0) {
    return;
  }

  coinBalance -= 1;

  if (type === 'speed') {
    stats.speedLevel += 1;
    player.baseSpeed += 10;
    player.speed = player.baseSpeed + stats.speedLevel * 12;
  }

  if (type === 'damage') {
    stats.damageLevel += 1;
    player.damageBoost = 1 + stats.damageLevel * 0.08;
  }

  if (type === 'magnet') {
    stats.magnetLevel += 1;
    player.magnetRadius += 20;
  }

  updateUI();
}

function updateUI() {
  ui.runCounter.textContent = String(runNumber);
  ui.levelDisplay.textContent = String(player.level);
  ui.healthDisplay.textContent = `${Math.max(0, Math.ceil(player.health))} / ${player.maxHealth}`;
  ui.xpDisplay.textContent = `${Math.floor(player.xp)} / ${player.xpToNext}`;
  ui.coinDisplay.textContent = String(coinBalance);
  ui.currentMoveLabel.textContent = moveLibrary[player.moveIndex].name;
  ui.attackBoostLabel.textContent = `x${player.damageBoost.toFixed(2)}`;
  ui.buffTimerLabel.textContent = `${player.boostTimer.toFixed(1)}s`;

  const moveSlots = document.querySelectorAll('.move-slot');
  moveSlots.forEach((slot) => {
    const index = Number(slot.dataset.index);
    slot.classList.toggle('selected', index === player.moveIndex);
  });

  ui.rosterList.innerHTML = '';
  Array.from(unlockedPokemon).forEach((name) => {
    const li = document.createElement('li');
    li.textContent = name;
    ui.rosterList.appendChild(li);
  });
}

function unlockRandomSpecies() {
  const pool = ['Pikachu', 'Squirtle', 'Bulbasaur', 'Charmander', 'Gengar', 'Eevee', 'Snorlax', 'Mew', 'Lapras', 'Lucario'];
  const available = pool.filter((entry) => !unlockedPokemon.has(entry));

  if (available.length === 0) {
    return 'Mystic Capsule';
  }

  const selected = available[Math.floor(Math.random() * available.length)];
  unlockedPokemon.add(selected);
  return selected;
}

function rollGacha() {
  const prize = unlockRandomSpecies();
  coinBalance += 5;
  runCoins += 5;
  ui.gachaBtn.textContent = `New Pokémon: ${prize}`;
  setTimeout(() => {
    ui.gachaBtn.textContent = 'Gacha: Unlock Pokémon';
  }, 1400);
  updateUI();
}

function addProjectile(x, y, vx, vy, dmg, type, color) {
  projectiles.push({
    id: ++projectileId,
    x,
    y,
    vx,
    vy,
    radius: 5,
    damage: dmg,
    type,
    color,
    life: 1.5
  });
}

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x = 0;
  let y = 0;

  if (side === 0) {
    x = Math.random() * arena.width;
    y = -20;
  } else if (side === 1) {
    x = arena.width + 20;
    y = Math.random() * arena.height;
  } else if (side === 2) {
    x = Math.random() * arena.width;
    y = arena.height + 20;
  } else {
    x = -20;
    y = Math.random() * arena.height;
  }

  const enemyTypeRoll = ['fire', 'water', 'grass', 'electric'][Math.floor(Math.random() * 4)];
  const enemy = {
    id: ++enemyId,
    x,
    y,
    radius: 16 + Math.random() * 10,
    speed: 42 + waveNumber * 3 + Math.random() * 20,
    maxHealth: 20 + waveNumber * 3,
    health: 20 + waveNumber * 3,
    type: enemyTypeRoll,
    color: enemyTypeRoll === 'fire' ? '#f87171' : enemyTypeRoll === 'water' ? '#60a5fa' : enemyTypeRoll === 'grass' ? '#4ade80' : '#facc15',
    damage: 8 + waveNumber * 0.8,
    attackCooldown: 0.8
  };

  enemies.push(enemy);
}

function spawnXPOrb(x, y, amount = 20) {
  xpOrbs.push({
    id: ++xpOrbId,
    x,
    y,
    radius: 8,
    amount,
    drift: Math.random() * Math.PI * 2
  });
}

function createBurst(x, y, color, count = 12) {
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 200,
      vy: (Math.random() - 0.5) * 200,
      life: 0.45 + Math.random() * 0.5,
      radius: 2 + Math.random() * 3,
      color
    });
  }
}

function getEffectiveDamage(move, targetType) {
  if (move.type === 'buff') {
    return 0;
  }

  const multiplier = typeChart[move.type]?.[targetType] || 1;
  return move.power * multiplier;
}

function handleMovement(dt) {
  const dx = (keys.d || keys.right ? 1 : 0) - (keys.a || keys.left ? 1 : 0);
  const dy = (keys.s || keys.down ? 1 : 0) - (keys.w || keys.up ? 1 : 0);

  const len = Math.hypot(dx, dy) || 1;
  player.x += (dx / len) * player.speed * dt;
  player.y += (dy / len) * player.speed * dt;

  player.x = Math.min(arena.width - player.radius, Math.max(player.radius, player.x));
  player.y = Math.min(arena.height - player.radius, Math.max(player.radius, player.y));
}

function selectMove(index) {
  if (index < 0 || index >= moveLibrary.length) return;
  player.moveIndex = index;
  updateUI();
}

function useMove() {
  const move = moveLibrary[player.moveIndex];

  if (player.fireCooldown > 0) {
    return;
  }

  if (move.type === 'buff') {
    player.damageBoost = 1.65 + stats.damageLevel * 0.1;
    player.boostTimer = 5;
    player.fireCooldown = move.cooldown;
    createBurst(player.x, player.y, '#fbbf24', 18);
    updateUI();
    return;
  }

  let target = null;
  let minDist = Infinity;

  for (const enemy of enemies) {
    const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (dist < minDist) {
      target = enemy;
      minDist = dist;
    }
  }

  if (!target) {
    return;
  }

  const angle = Math.atan2(target.y - player.y, target.x - player.x);
  const speed = move.projectileSpeed;
  const dmg = getEffectiveDamage(move, target.type) * player.damageBoost;

  addProjectile(player.x, player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, dmg, move.type, move.color);
  player.fireCooldown = move.cooldown;
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.life -= dt;

    if (projectile.x < -20 || projectile.x > arena.width + 20 || projectile.y < -20 || projectile.y > arena.height + 20 || projectile.life <= 0) {
      projectiles.splice(i, 1);
      continue;
    }

    for (let j = enemies.length - 1; j >= 0; j -= 1) {
      const enemy = enemies[j];
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      if (dist < enemy.radius + projectile.radius) {
        const actualDamage = projectile.damage;
        enemy.health -= actualDamage;
        createBurst(projectile.x, projectile.y, projectile.color, 6);
        projectiles.splice(i, 1);

        if (enemy.health <= 0) {
          const dropChance = Math.random();
          if (dropChance < 0.8) {
            spawnXPOrb(enemy.x, enemy.y, 18 + waveNumber * 2);
          }
          enemies.splice(j, 1);
          const earned = 5 + Math.floor(Math.random() * 4);
          coinBalance += earned;
          runCoins += earned;
        }

        break;
      }
    }
  }
}

function updateEnemies(dt) {
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.x += Math.cos(angle) * enemy.speed * dt;
    enemy.y += Math.sin(angle) * enemy.speed * dt;

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist < player.radius + enemy.radius) {
      player.health -= enemy.damage * dt * 1.2;
    }

    enemy.attackCooldown -= dt;
    if (enemy.attackCooldown <= 0 && dist < 30) {
      player.health -= enemy.damage;
      enemy.attackCooldown = 0.8;
    }

    if (player.health <= 0) {
      gameState = 'gameover';
      return;
    }
  }
}

function updateXPOrbs(dt) {
  for (let i = xpOrbs.length - 1; i >= 0; i -= 1) {
    const orb = xpOrbs[i];
    const dx = player.x - orb.x;
    const dy = player.y - orb.y;
    const dist = Math.hypot(dx, dy);
    const pullStrength = dist < player.magnetRadius ? 280 : 0;

    if (dist > 0.01) {
      orb.x += (dx / dist) * pullStrength * dt;
      orb.y += (dy / dist) * pullStrength * dt;
    }

    if (dist < player.radius + orb.radius + 3) {
      player.xp += orb.amount;
      xpOrbs.splice(i, 1);
      if (player.xp >= player.xpToNext) {
        player.xp -= player.xpToNext;
        player.level += 1;
        player.xpToNext = Math.round(player.xpToNext * 1.35);
        player.maxHealth += 8;
        player.health = player.maxHealth;
        createBurst(player.x, player.y, '#7dd3fc', 20);
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
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function updateWave(dt) {
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    const spawnCount = 1 + Math.min(3, Math.floor(waveNumber / 2));
    for (let i = 0; i < spawnCount; i += 1) {
      spawnEnemy();
    }
    spawnTimer = Math.max(0.75, 1.8 - waveNumber * 0.09);
    waveNumber += 1;
  }
}

function updatePlayer(dt) {
  if (player.fireCooldown > 0) {
    player.fireCooldown -= dt;
  }

  if (player.boostTimer > 0) {
    player.boostTimer -= dt;
    if (player.boostTimer <= 0) {
      player.damageBoost = 1 + stats.damageLevel * 0.08;
    }
  }

  handleMovement(dt);
  updateUI();
}

function drawArena() {
  ctx.clearRect(0, 0, arena.width, arena.height);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, arena.width, arena.height);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
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

  if (player.magnetRadius > 0) {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.magnetRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.18)';
    ctx.stroke();
  }

  projectiles.forEach((projectile) => {
    ctx.beginPath();
    ctx.fillStyle = projectile.color;
    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  xpOrbs.forEach((orb) => {
    ctx.beginPath();
    ctx.fillStyle = '#a78bfa';
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  enemies.forEach((enemy) => {
    ctx.beginPath();
    ctx.fillStyle = enemy.color;
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(enemy.x - 18, enemy.y - enemy.radius - 12, 36, 6);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(enemy.x - 18, enemy.y - enemy.radius - 12, (enemy.health / enemy.maxHealth) * 36, 6);
  });

  ctx.beginPath();
  ctx.fillStyle = '#7dd3fc';
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.fillRect(player.x - 26, player.y - player.radius - 18, 52, 7);
  ctx.fillStyle = '#f87171';
  ctx.fillRect(player.x - 26, player.y - player.radius - 18, (player.health / player.maxHealth) * 52, 7);

  particles.forEach((particle) => {
    ctx.beginPath();
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '16px Arial';
  ctx.fillText(`Wave ${waveNumber}`, 20, 28);
  ctx.fillText(`Coins ${coinBalance}`, 20, 52);
  ctx.fillText(`Move: ${moveLibrary[player.moveIndex].name}`, 20, 76);

  if (gameState === 'gameover') {
    ctx.fillStyle = 'rgba(3,7,18,0.66)';
    ctx.fillRect(0, 0, arena.width, arena.height);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 42px Arial';
    ctx.fillText('Run Over', arena.width / 2 - 110, arena.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Press R to restart', arena.width / 2 - 100, arena.height / 2 + 20);
  }
}

function gameLoop(timestamp) {
  const dt = Math.min(0.033, (timestamp - lastTime) / 1000);
  lastTime = timestamp;

  if (gameState === 'playing') {
    updatePlayer(dt);
    updateWave(dt);
    updateProjectiles(dt);
    updateEnemies(dt);
    updateXPOrbs(dt);
    updateParticles(dt);
    useMove();
  }

  drawArena();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'p') {
    gameState = gameState === 'playing' ? 'paused' : 'playing';
    return;
  }

  if (key === 'r' && gameState === 'gameover') {
    runNumber += 1;
    resetRun();
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
  button.addEventListener('click', () => {
    applyPermanentUpgrade(button.dataset.upgrade);
  });
});

ui.gachaBtn.addEventListener('click', rollGacha);

resetRun();
requestAnimationFrame(gameLoop);

console.log('PokeSurvivor prototype initialized.');
