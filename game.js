(() => {
  'use strict';

  // --- Constants ---
  const LOGICAL_WIDTH = 420;
  const LOGICAL_HEIGHT = 680;
  const NUM_COLS = 5;
  const COL_SPACING = 74;
  const FIRST_COL_X = (LOGICAL_WIDTH - (NUM_COLS - 1) * COL_SPACING) / 2;
  const STEP_Y = 80;
  const JUMP_DURATION = 0.11; // seconds
  const FROG_START_SCREEN_Y = LOGICAL_HEIGHT * 0.72;

  const STORAGE_KEYS = {
    RECORD: 'frogjump_record_v1',
    BEST_TIME: 'frogjump_best_time_v1',
    COINS: 'frogjump_coins_v1',
    UNLOCKED: 'frogjump_unlocked_skins_v1',
    EQUIPPED: 'frogjump_equipped_skin_v1',
    UNLOCKED_TYPES: 'frogjump_unlocked_types_v1',
    EQUIPPED_TYPE: 'frogjump_equipped_type_v1',
    MUTED: 'frogjump_muted_v1',
    MUSIC: 'frogjump_music_v1',
  };

  const FROG_TYPES = [
    { id: 'classic', name: 'Sapo Comum', icon: '🐸', price: 0 },
    { id: 'wizard', name: 'Sapo Mago', icon: '🧙', price: 40 },
    { id: 'warrior', name: 'Sapo Guerreiro', icon: '⚔️', price: 60 },
    { id: 'ninja', name: 'Sapo Ninja', icon: '🥷', price: 80 },
    { id: 'jamaican', name: 'Sapo Jamaicano', icon: '🇯🇲', price: 100 },
    { id: 'king', name: 'Sapo Rei', icon: '👑', price: 130 },
    { id: 'astro', name: 'Astronauta', icon: '👨‍🚀', price: 160 },
    { id: 'cyber', name: 'Sapo Ciborgue', icon: '🤖', price: 190 },
  ];

  const FROG_SKINS = [
    { id: 'green', name: 'Verde Clássico', price: 0, body: '#4ade80', dark: '#16a34a', belly: '#dcfce7', cheek: '#fb7185' },
    { id: 'sky', name: 'Azul Celeste', price: 15, body: '#38bdf8', dark: '#0284c7', belly: '#e0f2fe', cheek: '#f472b6' },
    { id: 'gold', name: 'Sapo Dourado', price: 30, body: '#fbbf24', dark: '#d97706', belly: '#fef3c7', cheek: '#fb7185' },
    { id: 'pink', name: 'Rosa Chiclete', price: 45, body: '#f472b6', dark: '#db2777', belly: '#fce7f3', cheek: '#fda4af' },
    { id: 'purple', name: 'Roxo Místico', price: 60, body: '#a78bfa', dark: '#7c3aed', belly: '#ede9fe', cheek: '#f472b6' },
    { id: 'flame', name: 'Laranja Fogo', price: 80, body: '#fb923c', dark: '#ea580c', belly: '#ffedd5', cheek: '#ef4444' },
    { id: 'mint', name: 'Menta Glacial', price: 100, body: '#2dd4bf', dark: '#0f766e', belly: '#ccfbf1', cheek: '#38bdf8' },
    { id: 'rainbow', name: 'Sapo Neon', price: 140, body: 'rainbow', dark: '#1e1b4b', belly: '#ffffff', cheek: '#fde047' },
  ];

  // --- DOM Elements ---
  const canvas = document.getElementById('gameCanvas');
  let ctx = canvas.getContext('2d');

  const scoreValueEl = document.getElementById('scoreValue');
  const timeValueEl = document.getElementById('timeValue');
  const recordValueEl = document.getElementById('recordValue');
  const coinsValueEl = document.getElementById('coinsValue');
  const shopCoinsValueEl = document.getElementById('shopCoinsValue');

  const startOverlay = document.getElementById('startOverlay');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const shopOverlay = document.getElementById('shopOverlay');

  const finalScoreEl = document.getElementById('finalScore');
  const finalRecordEl = document.getElementById('finalRecord');
  const finalTimeEl = document.getElementById('finalTime');
  const finalBestTimeEl = document.getElementById('finalBestTime');
  const runCoinsEl = document.getElementById('runCoins');
  const newRecordBadge = document.getElementById('newRecordBadge');
  const startFrogPreview = document.getElementById('startFrogPreview');
  const skinGrid = document.getElementById('skinGrid');
  const tabColorsBtn = document.getElementById('tabColorsBtn');
  const tabTypesBtn = document.getElementById('tabTypesBtn');
  const shopSubtitle = document.getElementById('shopSubtitle');

  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const shopBtn = document.getElementById('shopBtn');
  const openShopFromStartBtn = document.getElementById('openShopFromStartBtn');
  const openShopFromOverBtn = document.getElementById('openShopFromOverBtn');
  const closeShopBtn = document.getElementById('closeShopBtn');
  const musicBtn = document.getElementById('musicBtn');
  const menuMusicBtn = document.getElementById('menuMusicBtn');
  const menuRecordValueEl = document.getElementById('menuRecordValue');
  const menuBestTimeValueEl = document.getElementById('menuBestTimeValue');
  const menuCoinsValueEl = document.getElementById('menuCoinsValue');
  const soundBtn = document.getElementById('soundBtn');
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');

  // --- High-DPI Canvas Setup ---
  function setupCanvasDPI() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = LOGICAL_WIDTH * dpr;
    canvas.height = LOGICAL_HEIGHT * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  setupCanvasDPI();

  // --- Web Audio Synthesizer ---
  const THEME_MELODY = [
    523.25, 0, 659.25, 783.99, 0, 659.25, 587.33, 523.25,
    587.33, 0, 698.46, 880.00, 783.99, 0, 659.25, 0,
    523.25, 659.25, 783.99, 1046.5, 0, 880.00, 783.99, 659.25,
    587.33, 659.25, 587.33, 493.88, 523.25, 0, 392.00, 0,
  ];
  const THEME_BASS = [
    130.81, 0, 196.00, 0, 130.81, 0, 196.00, 0,
    98.00,  0, 146.83, 0, 98.00,  0, 146.83, 0,
    110.00, 0, 164.81, 0, 87.31,  0, 130.81, 0,
    98.00,  0, 146.83, 0, 130.81, 0, 196.00, 0,
  ];

  const audio = {
    ctx: null,
    muted: localStorage.getItem(STORAGE_KEYS.MUTED) === 'true',
    musicEnabled: localStorage.getItem(STORAGE_KEYS.MUSIC) !== 'false',
    musicTimer: null,
    musicStep: 0,
    musicUnlocked: false,
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (this.ctx && this.ctx.state === 'running') {
        this.musicUnlocked = true;
      }
    },
    playMusicNote(freq, duration, type, vol) {
      if (!this.ctx || this.ctx.state !== 'running' || !freq) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    },
    startMusic() {
      if (!this.musicEnabled || this.musicTimer) return;
      this.init();
      this.musicTimer = setInterval(() => {
        if (!this.musicEnabled) return;
        if (this.ctx && this.ctx.state === 'suspended') return;
        this.musicUnlocked = true;
        const volScale = gameState === 'playing' ? 0.52 : 1;
        const mel = THEME_MELODY[this.musicStep];
        const bass = THEME_BASS[this.musicStep];
        if (mel) this.playMusicNote(mel, 0.17, 'triangle', 0.055 * volScale);
        if (bass) this.playMusicNote(bass, 0.22, 'sine', 0.065 * volScale);
        this.musicStep = (this.musicStep + 1) % THEME_MELODY.length;
      }, 190);
    },
    stopMusic() {
      if (this.musicTimer) {
        clearInterval(this.musicTimer);
        this.musicTimer = null;
      }
    },
    unlockAndStartMusic() {
      this.init();
      if (this.musicEnabled) {
        this.startMusic();
      }
      updateHUD();
    },
    playTone(freqStart, freqEnd, duration, type = 'sine', gainVal = 0.14) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);

      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    },
    jump() {
      this.playTone(240, 520, 0.11, 'triangle', 0.15);
    },
    coin() {
      this.playTone(880, 1320, 0.1, 'sine', 0.13);
      setTimeout(() => this.playTone(1320, 1760, 0.12, 'sine', 0.11), 55);
    },
    splash() {
      this.playTone(320, 95, 0.35, 'sawtooth', 0.12);
    },
    buy() {
      this.playTone(523, 784, 0.1, 'triangle', 0.14);
      setTimeout(() => this.playTone(784, 1046, 0.15, 'triangle', 0.14), 80);
    },
  };

  // --- Persistent State ---
  let record = parseInt(localStorage.getItem(STORAGE_KEYS.RECORD) || '0', 10);
  let bestTime = parseFloat(localStorage.getItem(STORAGE_KEYS.BEST_TIME) || '0') || 0;
  let coins = parseInt(localStorage.getItem(STORAGE_KEYS.COINS) || '0', 10);
  let unlockedSkins = JSON.parse(localStorage.getItem(STORAGE_KEYS.UNLOCKED) || '["green"]');
  if (!Array.isArray(unlockedSkins) || !unlockedSkins.includes('green')) {
    unlockedSkins = ['green'];
  }
  let equippedSkinId = localStorage.getItem(STORAGE_KEYS.EQUIPPED) || 'green';
  if (!unlockedSkins.includes(equippedSkinId)) equippedSkinId = 'green';

  let unlockedTypes = JSON.parse(localStorage.getItem(STORAGE_KEYS.UNLOCKED_TYPES) || '["classic"]');
  if (!Array.isArray(unlockedTypes) || !unlockedTypes.includes('classic')) {
    unlockedTypes = ['classic'];
  }
  let equippedTypeId = localStorage.getItem(STORAGE_KEYS.EQUIPPED_TYPE) || 'classic';
  if (!unlockedTypes.includes(equippedTypeId)) equippedTypeId = 'classic';
  let shopTab = 'colors'; // 'colors' | 'types'

  function saveProgress() {
    localStorage.setItem(STORAGE_KEYS.RECORD, String(record));
    localStorage.setItem(STORAGE_KEYS.BEST_TIME, bestTime.toFixed(1));
    localStorage.setItem(STORAGE_KEYS.COINS, String(coins));
    localStorage.setItem(STORAGE_KEYS.UNLOCKED, JSON.stringify(unlockedSkins));
    localStorage.setItem(STORAGE_KEYS.EQUIPPED, equippedSkinId);
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_TYPES, JSON.stringify(unlockedTypes));
    localStorage.setItem(STORAGE_KEYS.EQUIPPED_TYPE, equippedTypeId);
  }

  function getEquippedSkin() {
    return FROG_SKINS.find((s) => s.id === equippedSkinId) || FROG_SKINS[0];
  }

  function getEquippedType() {
    return FROG_TYPES.find((t) => t.id === equippedTypeId) || FROG_TYPES[0];
  }

  // --- Game State ---
  let gameState = 'start'; // 'start' | 'playing' | 'gameover'
  let shopReturnState = 'start';
  let score = 0;
  let runTime = 0;
  let lastDisplayedTime = '';
  let runCoins = 0;
  let beatRecordThisRun = false;
  let beatTimeRecordThisRun = false;

  function formatTime(sec) {
    if (sec < 60) {
      return `${sec.toFixed(1)}s`;
    }
    const mins = Math.floor(sec / 60);
    const rem = (sec % 60).toFixed(1).padStart(4, '0');
    return `${mins}:${rem}`;
  }

  const BIOMES = [
    { minScore: 0, icon: '🌿', label: 'Jardim da Lagoa', top: [96, 195, 245], bottom: [34, 150, 92], platform: 'lily' },
    { minScore: 25, icon: '🌳', label: 'Copa das Árvores', top: [56, 168, 220], bottom: [21, 105, 58], platform: 'leaf' },
    { minScore: 50, icon: '☁️', label: 'Céu e Nuvens', top: [37, 99, 235], bottom: [125, 211, 252], platform: 'cloud' },
    { minScore: 80, icon: '🌅', label: 'Pôr do Sol', top: [109, 40, 217], bottom: [249, 115, 22], platform: 'sunset' },
    { minScore: 115, icon: '🌙', label: 'Noite Estrelada', top: [15, 23, 42], bottom: [49, 46, 129], platform: 'star' },
    { minScore: 155, icon: '🚀', label: 'Espaço Sideral', top: [5, 5, 16], bottom: [30, 11, 54], platform: 'space' },
    { minScore: 210, icon: '🌌', label: 'Galáxia Neon', top: [10, 4, 28], bottom: [88, 28, 135], platform: 'neon' },
  ];

  function getBiomeIndex(alt) {
    let idx = 0;
    for (let i = 0; i < BIOMES.length; i++) {
      if (alt >= BIOMES[i].minScore) idx = i;
    }
    return idx;
  }

  let currentBiomeIndex = 0;
  let biomeBanner = null;
  let platformTimer = 0;
  let platformMaxTimer = 0;

  let platforms = [];
  let lastMainPlatform = null;
  let highestPlatformIndex = 0;
  let nextDeadEndAllowedIndex = 2;
  let particles = [];
  let floatingTexts = [];
  let cameraY = 0;
  let targetCameraY = 0;
  let globalTime = 0;

  const frog = {
    col: 2,
    x: colToX(2),
    y: 0,
    facing: 1, // -1 left, 1 right
    jumping: false,
    jumpTime: 0,
    fromX: 0,
    fromY: 0,
    toX: 0,
    toY: 0,
    willLand: true,
    targetIndex: 0,
    targetCol: 2,
    falling: false,
    vy: 0,
    vx: 0,
    rotation: 0,
    squash: 0, // >0 stretches/squashes on land
    queuedDir: 0,
  };

  function colToX(col) {
    return FIRST_COL_X + col * COL_SPACING;
  }

  function indexToY(idx) {
    return -idx * STEP_Y;
  }

  // --- Platform Generation ---
  function generateNextPlatform() {
    const prev = lastMainPlatform;
    const nextIndex = prev.index + 1;
    let dir;
    if (prev.col <= 0) {
      dir = 1;
    } else if (prev.col >= NUM_COLS - 1) {
      dir = -1;
    } else if (prev.dir && nextIndex > 15) {
      // Higher up: more zig-zags so it's harder to spam one side
      const zigzagChance = Math.min(0.75, 0.5 + nextIndex * 0.002);
      dir = Math.random() < zigzagChance ? -prev.dir : prev.dir;
    } else {
      dir = Math.random() < 0.5 ? -1 : 1;
    }

    const nextCol = prev.col + dir;
    const hasCoin = nextIndex >= 2 && Math.random() < 0.36;
    const isFast = nextIndex >= 12 && Math.random() < Math.min(0.42, 0.18 + (nextIndex - 12) * 0.002);

    const newPlatform = {
      index: nextIndex,
      col: nextCol,
      dir,
      x: colToX(nextCol),
      y: indexToY(nextIndex),
      hasCoin,
      coinCollected: false,
      fast: isFast,
      isDeadEnd: false,
      vanishing: false,
      vanishProgress: 0,
      removed: false,
      bobOffset: Math.random() * Math.PI * 2,
    };
    platforms.push(newPlatform);
    lastMainPlatform = newPlatform;
    highestPlatformIndex = nextIndex;

    maybeGenerateDeadEndBranch(nextIndex - 4);
  }

  function maybeGenerateDeadEndBranch(forkIndex) {
    if (forkIndex < nextDeadEndAllowedIndex) return;

    const forkChance = Math.min(0.68, 0.52 + forkIndex * 0.002);
    if (Math.random() >= forkChance) return;

    const forkOrigin = platforms.find((p) => p.index === forkIndex - 1 && !p.isDeadEnd);
    const mainAtFork = platforms.find((p) => p.index === forkIndex && !p.isDeadEnd);
    if (!forkOrigin || !mainAtFork) return;

    const mainDir = mainAtFork.col - forkOrigin.col;
    const trapDir = -mainDir;
    const firstTrapCol = forkOrigin.col + trapDir;
    if (firstTrapCol < 0 || firstTrapCol >= NUM_COLS) return;

    const desiredLen = Math.random() < 0.65 ? 1 : (Math.random() < 0.7 ? 2 : 3);
    const candidates = [{ index: forkIndex, col: firstTrapCol }];

    for (let s = 1; s < desiredLen; s++) {
      const idx = forkIndex + s;
      const mainP = platforms.find((p) => p.index === idx && !p.isDeadEnd);
      if (!mainP) break;

      const prevCol = candidates[candidates.length - 1].col;
      const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
      // Prefer moving away from the main path so the dead-end branch looks distinct
      dirs.sort((a, b) => Math.abs(prevCol + b - mainP.col) - Math.abs(prevCol + a - mainP.col));

      let chosenCol = null;
      for (const d of dirs) {
        const c = prevCol + d;
        if (c >= 0 && c < NUM_COLS && c !== mainP.col) {
          chosenCol = c;
          break;
        }
      }
      if (chosenCol === null) break;
      candidates.push({ index: idx, col: chosenCol });
    }

    // Ensure the last platform of the branch is a true dead end (cannot jump back to main path)
    while (candidates.length > 0) {
      const endStep = candidates[candidates.length - 1];
      const mainAfterEnd = platforms.find((p) => p.index === endStep.index + 1 && !p.isDeadEnd);
      if (mainAfterEnd && Math.abs(endStep.col - mainAfterEnd.col) !== 1) {
        break;
      }
      candidates.pop();
    }

    if (candidates.length === 0) return;

    for (const step of candidates) {
      platforms.push({
        index: step.index,
        col: step.col,
        dir: 0,
        x: colToX(step.col),
        y: indexToY(step.index),
        hasCoin: Math.random() < 0.35,
        coinCollected: false,
        fast: false,
        isDeadEnd: true,
        vanishing: false,
        vanishProgress: 0,
        removed: false,
        bobOffset: Math.random() * Math.PI * 2,
      });
    }

    nextDeadEndAllowedIndex = forkIndex + candidates.length + 1;
  }

  function resetGame() {
    score = 0;
    runTime = 0;
    lastDisplayedTime = '';
    runCoins = 0;
    beatRecordThisRun = false;
    beatTimeRecordThisRun = false;
    currentBiomeIndex = 0;
    biomeBanner = { text: `${BIOMES[0].icon} ${BIOMES[0].label}`, life: 1.8, maxLife: 1.8 };
    platformTimer = 0;
    platformMaxTimer = 0;
    platforms = [];
    particles = [];
    floatingTexts = [];

    // Base starting platform
    const startPlatform = {
      index: 0,
      col: 2,
      x: colToX(2),
      y: 0,
      hasCoin: false,
      coinCollected: false,
      isDeadEnd: false,
      vanishing: false,
      vanishProgress: 0,
      removed: false,
      bobOffset: 0,
    };
    platforms.push(startPlatform);
    lastMainPlatform = startPlatform;
    highestPlatformIndex = 0;
    nextDeadEndAllowedIndex = 2;

    for (let i = 0; i < 16; i++) {
      generateNextPlatform();
    }

    frog.col = 2;
    frog.x = colToX(2);
    frog.y = 0;
    frog.facing = 1;
    frog.jumping = false;
    frog.jumpTime = 0;
    frog.falling = false;
    frog.vy = 0;
    frog.vx = 0;
    frog.rotation = 0;
    frog.squash = 0;
    frog.queuedDir = 0;
    frog.targetIndex = 0;

    cameraY = 0;
    targetCameraY = 0;
    updateHUD();
  }

  // --- Input & Jump Logic ---
  function requestJump(dir) {
    if (gameState !== 'playing' || frog.falling) return;

    if (frog.jumping) {
      // Buffer one input for snappy controls
      frog.queuedDir = dir;
      return;
    }

    startJump(dir);
  }

  function startJump(dir) {
    platformTimer = 0;
    platformMaxTimer = 0;
    const currentIndex = score;
    const currentPlatform = platforms.find((p) => p.index === currentIndex && p.col === frog.col);

    // Current platform immediately starts disappearing!
    if (currentPlatform && !currentPlatform.vanishing) {
      currentPlatform.vanishing = true;
      spawnVanishParticles(currentPlatform.x, currentPlatform.y + 10);
    }

    const nextIndex = currentIndex + 1;
    const targetCol = frog.col + dir;
    const nextPlatform = platforms.find((p) => p.index === nextIndex && p.col === targetCol);
    const willLand = Boolean(nextPlatform);

    frog.facing = dir;
    frog.jumping = true;
    frog.jumpTime = 0;
    frog.fromX = frog.x;
    frog.fromY = frog.y;
    frog.toX = colToX(targetCol);
    frog.toY = indexToY(nextIndex);
    frog.targetCol = targetCol;
    frog.targetIndex = nextIndex;
    frog.willLand = willLand;
    frog.queuedDir = 0;

    audio.jump();
  }

  function completeJump() {
    frog.jumping = false;
    frog.x = frog.toX;
    frog.y = frog.toY;
    frog.col = frog.targetCol;

    if (frog.willLand) {
      score = frog.targetIndex;
      frog.squash = 1;
      targetCameraY = -frog.y;

      if (score > record) {
        record = score;
        beatRecordThisRun = true;
      }

      const nextBiomeIdx = getBiomeIndex(score);
      if (nextBiomeIdx > currentBiomeIndex) {
        currentBiomeIndex = nextBiomeIdx;
        const b = BIOMES[currentBiomeIndex];
        biomeBanner = { text: `${b.icon} ${b.label}`, life: 2.3, maxLife: 2.3 };
      }

      const landedPlatform = platforms.find((p) => p.index === score && p.col === frog.col);
      if (landedPlatform && landedPlatform.hasCoin && !landedPlatform.coinCollected) {
        landedPlatform.coinCollected = true;
        coins += 1;
        runCoins += 1;
        audio.coin();
        spawnCoinParticles(frog.x, frog.y - 24);
        floatingTexts.push({
          x: frog.x,
          y: frog.y - 34,
          text: '+1 🪙',
          life: 0.8,
          maxLife: 0.8,
          color: '#fbbf24',
        });
      }

      saveProgress();
      updateHUD();

      // Generate more platforms ahead
      while (highestPlatformIndex < score + 14) {
        generateNextPlatform();
      }

      // Clean up old removed platforms
      if (platforms.length > 30) {
        platforms = platforms.filter((p) => !p.removed && p.index >= score - 4);
      }

      if (score >= 1 || (landedPlatform && landedPlatform.fast)) {
        const baseTime = Math.max(0.45, 1.35 - score * 0.011);
        platformMaxTimer = landedPlatform && landedPlatform.fast ? Math.max(0.36, baseTime * 0.55) : baseTime;
        platformTimer = platformMaxTimer;
      }

      if (frog.queuedDir !== 0) {
        const nextDir = frog.queuedDir;
        frog.queuedDir = 0;
        startJump(nextDir);
      }
    } else {
      // Missed! Frog falls into the water
      frog.falling = true;
      frog.vy = -80;
      frog.vx = frog.facing * 55;
      audio.splash();
    }
  }

  function triggerGameOver() {
    gameState = 'gameover';
    if (runTime > bestTime) {
      bestTime = runTime;
      beatTimeRecordThisRun = true;
    }
    saveProgress();
    updateHUD();

    finalScoreEl.textContent = String(score);
    finalRecordEl.textContent = String(record);
    finalTimeEl.textContent = formatTime(runTime);
    finalBestTimeEl.textContent = formatTime(bestTime);
    runCoinsEl.textContent = `+${runCoins} 🪙`;

    const hasScoreRecord = beatRecordThisRun && score > 0;
    const hasTimeRecord = beatTimeRecordThisRun && runTime >= 0.5;
    if (hasScoreRecord && hasTimeRecord) {
      newRecordBadge.textContent = '🏆 NOVO RECORDE DE SUBIDA E TEMPO!';
      newRecordBadge.classList.remove('hidden');
    } else if (hasScoreRecord) {
      newRecordBadge.textContent = '🏆 NOVO RECORDE DE SUBIDA!';
      newRecordBadge.classList.remove('hidden');
    } else if (hasTimeRecord) {
      newRecordBadge.textContent = '⏱️ NOVO RECORDE DE TEMPO!';
      newRecordBadge.classList.remove('hidden');
    } else {
      newRecordBadge.classList.add('hidden');
    }

    gameOverOverlay.classList.remove('hidden');
  }

  // --- Particles ---
  function spawnVanishParticles(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        radius: 3 + Math.random() * 4,
        color: i % 2 === 0 ? '#4ade80' : '#7dd3fc',
        life: 0.45,
        maxLife: 0.45,
      });
    }
  }

  function spawnCoinParticles(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 60 + Math.random() * 60;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 3,
        color: i % 2 === 0 ? '#fde047' : '#fbbf24',
        life: 0.45,
        maxLife: 0.45,
      });
    }
  }

  // --- Update Loop ---
  function update(dt) {
    globalTime += dt;

    if (gameState === 'playing' && !frog.falling) {
      runTime += dt;
      if (runTime > bestTime) {
        bestTime = runTime;
        beatTimeRecordThisRun = true;
      }
      const formatted = formatTime(runTime);
      if (formatted !== lastDisplayedTime) {
        lastDisplayedTime = formatted;
        timeValueEl.textContent = formatted;
      }
    }

    // Smooth camera pan
    cameraY += (targetCameraY - cameraY) * Math.min(1, dt * 12);

    // Update vanishing platforms
    for (const p of platforms) {
      if (p.vanishing && !p.removed) {
        p.vanishProgress += dt * 5.5;
        if (p.vanishProgress >= 1) {
          p.vanishProgress = 1;
          p.removed = true;
        }
      }
    }

    // Update frog
    if (frog.jumping) {
      frog.jumpTime += dt;
      const t = Math.min(1, frog.jumpTime / JUMP_DURATION);
      // Linear horizontal, parabolic arc vertical
      frog.x = frog.fromX + (frog.toX - frog.fromX) * t;
      const arc = Math.sin(t * Math.PI) * 34;
      frog.y = frog.fromY + (frog.toY - frog.fromY) * t - arc;

      if (t >= 1) {
        completeJump();
      }
    } else if (frog.falling) {
      frog.vy += 1550 * dt;
      frog.x += frog.vx * dt;
      frog.y += frog.vy * dt;
      frog.rotation += frog.facing * 6 * dt;

      const screenY = FROG_START_SCREEN_Y + frog.y + cameraY;
      if (screenY > LOGICAL_HEIGHT + 80 && gameState === 'playing') {
        triggerGameOver();
      }
    } else if (gameState === 'playing' && platformMaxTimer > 0) {
      platformTimer -= dt;
      if (platformTimer <= 0) {
        platformTimer = 0;
        platformMaxTimer = 0;
        const currentPlatform = platforms.find((p) => p.index === score && p.col === frog.col);
        if (currentPlatform && !currentPlatform.vanishing) {
          currentPlatform.vanishing = true;
          spawnVanishParticles(currentPlatform.x, currentPlatform.y + 10);
        }
        frog.falling = true;
        frog.vy = -40;
        frog.vx = 0;
        audio.splash();
      }
    }

    if (frog.squash > 0) {
      frog.squash = Math.max(0, frog.squash - dt * 6);
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 220 * dt;
      pt.life -= dt;
      if (pt.life <= 0) particles.splice(i, 1);
    }

    // Update floating texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 42 * dt;
      ft.life -= dt;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }

    if (biomeBanner) {
      biomeBanner.life -= dt;
      if (biomeBanner.life <= 0) biomeBanner = null;
    }
  }

  // --- Rendering ---
  function getSkinColors(skin) {
    if (skin.body === 'rainbow') {
      const hue = (globalTime * 110) % 360;
      return {
        body: `hsl(${hue}, 85%, 60%)`,
        dark: `hsl(${(hue + 40) % 360}, 85%, 38%)`,
        belly: '#ffffff',
        cheek: '#fde047',
      };
    }
    return skin;
  }

  function lerpColor(c1, c2, t) {
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function getSkyGradientColors(alt) {
    const idx = getBiomeIndex(alt);
    const curr = BIOMES[idx];
    const next = BIOMES[idx + 1];
    if (!next) {
      return {
        top: `rgb(${curr.top[0]}, ${curr.top[1]}, ${curr.top[2]})`,
        bottom: `rgb(${curr.bottom[0]}, ${curr.bottom[1]}, ${curr.bottom[2]})`,
      };
    }
    const transitionSpan = 8;
    const startBlend = next.minScore - transitionSpan;
    const t = Math.max(0, Math.min(1, (alt - startBlend) / transitionSpan));
    return {
      top: lerpColor(curr.top, next.top, t),
      bottom: lerpColor(curr.bottom, next.bottom, t),
    };
  }

  function drawBackground() {
    const alt = Math.max(0, cameraY / STEP_Y);
    const sky = getSkyGradientColors(alt);

    const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    grad.addColorStop(0, sky.top);
    grad.addColorStop(1, sky.bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Stars & Space Nebulae (fade in from alt 95+)
    if (alt > 95) {
      const starAlpha = Math.min(1, (alt - 95) / 25);

      // Nebulae in deep space (alt 145+)
      if (alt > 145) {
        const nebAlpha = Math.min(0.32, ((alt - 145) / 30) * 0.32);
        ctx.save();
        ctx.globalAlpha = nebAlpha;
        const n1 = ctx.createRadialGradient(90, 180, 10, 90, 180, 150);
        n1.addColorStop(0, '#c084fc');
        n1.addColorStop(1, 'transparent');
        ctx.fillStyle = n1;
        ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

        const n2 = ctx.createRadialGradient(330, 440, 10, 330, 440, 170);
        n2.addColorStop(0, '#38bdf8');
        n2.addColorStop(1, 'transparent');
        ctx.fillStyle = n2;
        ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
        ctx.restore();
      }

      // Twinkling stars
      ctx.save();
      for (let i = 0; i < 36; i++) {
        const px = ((i * 83 + 17) % (LOGICAL_WIDTH - 16)) + 8;
        const py = ((i * 137 + cameraY * 0.18) % LOGICAL_HEIGHT + LOGICAL_HEIGHT) % LOGICAL_HEIGHT;
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(globalTime * 2 + i));
        ctx.globalAlpha = starAlpha * twinkle * 0.9;
        ctx.fillStyle = i % 5 === 0 ? '#fde047' : '#ffffff';
        const r = i % 4 === 0 ? 2 : 1.2;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Moon in Night Sky (alt 105..170)
      if (alt > 105 && alt < 175) {
        const moonAlpha = Math.min(1, (alt - 105) / 15) * Math.min(1, (175 - alt) / 20);
        const moonY = 120 + (alt - 125) * 2.5;
        ctx.save();
        ctx.globalAlpha = moonAlpha * 0.9;
        ctx.fillStyle = '#fef9c3';
        ctx.beginPath();
        ctx.arc(335, moonY, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = sky.top;
        ctx.beginPath();
        ctx.arc(346, moonY - 6, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Ringed Planet in Space (alt 155+)
      if (alt > 155) {
        const planetAlpha = Math.min(0.85, (alt - 155) / 20);
        const planetY = ((220 + cameraY * 0.08) % (LOGICAL_HEIGHT + 120)) - 60;
        ctx.save();
        ctx.globalAlpha = planetAlpha;
        ctx.translate(95, planetY);
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbcfe8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 2, 42, 10, -0.25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // UFO flying across space
        const ufoX = ((globalTime * 48) % (LOGICAL_WIDTH + 140)) - 70;
        const ufoY = 175 + Math.sin(globalTime * 2.5) * 14;
        ctx.save();
        ctx.globalAlpha = planetAlpha * 0.9;
        ctx.translate(ufoX, ufoY);
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath();
        ctx.arc(0, -5, 11, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let l = -1; l <= 1; l++) {
          ctx.fillStyle = Math.floor(globalTime * 6 + l) % 2 === 0 ? '#fde047' : '#4ade80';
          ctx.beginPath();
          ctx.arc(l * 9, 1, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Rocket flying upward in background
        const rocketY = LOGICAL_HEIGHT - ((globalTime * 55) % (LOGICAL_HEIGHT + 160)) + 60;
        ctx.save();
        ctx.globalAlpha = planetAlpha * 0.85;
        ctx.translate(345, rocketY);
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(-4, 12);
        ctx.lineTo(0, 22 + Math.sin(globalTime * 30) * 4);
        ctx.lineTo(4, 12);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-5, -6);
        ctx.lineTo(0, -16);
        ctx.lineTo(5, -6);
        ctx.fill();
        ctx.restore();
      }

      // Shooting star & Bats in Night Sky (alt 108..165)
      if (alt > 108 && alt < 165) {
        const nightAlpha = Math.min(1, (alt - 108) / 15) * Math.min(1, (165 - alt) / 15);
        // Shooting star
        const starCycle = globalTime % 4;
        if (starCycle < 1.2) {
          const sx = 60 + starCycle * 260;
          const sy = 90 + starCycle * 95;
          ctx.save();
          ctx.globalAlpha = nightAlpha * (1 - starCycle / 1.2);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - 28, sy - 10);
          ctx.stroke();
          ctx.restore();
        }
        // Little bats flapping
        ctx.save();
        ctx.globalAlpha = nightAlpha * 0.65;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        for (let b = 0; b < 3; b++) {
          const bx = ((globalTime * (36 + b * 12) + b * 140) % (LOGICAL_WIDTH + 60)) - 30;
          const by = 240 + b * 95 + Math.sin(globalTime * 4 + b) * 12;
          const flap = Math.sin(globalTime * 14 + b) * 5;
          ctx.beginPath();
          ctx.moveTo(bx - 8, by + flap);
          ctx.quadraticCurveTo(bx - 4, by - 4, bx, by);
          ctx.quadraticCurveTo(bx + 4, by - 4, bx + 8, by + flap);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // Sunset Giant Sun & Bird Silhouettes (alt 75..118)
    if (alt > 75 && alt < 118) {
      const sunAlpha = Math.min(1, (alt - 75) / 12) * Math.min(1, (118 - alt) / 12);
      ctx.save();
      ctx.globalAlpha = sunAlpha * 0.65;
      const sunGrad = ctx.createRadialGradient(210, 460, 10, 210, 460, 90);
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.6, '#fb923c');
      sunGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(210, 460, 90, 0, Math.PI * 2);
      ctx.fill();

      // Silhouetted birds flying across sunset
      ctx.strokeStyle = 'rgba(67, 20, 7, 0.7)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const bx = ((globalTime * 28 + i * 95) % (LOGICAL_WIDTH + 80)) - 40;
        const by = 320 + i * 26 + Math.sin(globalTime * 3 + i) * 6;
        const flap = Math.sin(globalTime * 9 + i) * 4;
        ctx.beginPath();
        ctx.moveTo(bx - 7, by + flap);
        ctx.quadraticCurveTo(bx - 3, by - 3, bx, by);
        ctx.quadraticCurveTo(bx + 3, by - 3, bx + 7, by + flap);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Fluffy Clouds + Hot Air Balloon + Seagulls (alt 38..120)
    if (alt > 38 && alt < 120) {
      const cloudAlpha = Math.min(1, (alt - 38) / 15) * Math.min(1, (120 - alt) / 15);
      const isSunset = alt > 75;
      ctx.save();
      ctx.globalAlpha = cloudAlpha * 0.55;
      ctx.fillStyle = isSunset ? '#fed7aa' : '#ffffff';
      for (let i = 0; i < 6; i++) {
        const cx = ((i * 115 + globalTime * (8 + (i % 3) * 4)) % (LOGICAL_WIDTH + 120)) - 60;
        const cy = ((i * 140 + cameraY * 0.28) % LOGICAL_HEIGHT + LOGICAL_HEIGHT) % LOGICAL_HEIGHT;
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.arc(cx + 18, cy - 6, 18, 0, Math.PI * 2);
        ctx.arc(cx + 34, cy + 2, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // Hot Air Balloon in Sky biome
      if (alt < 85) {
        const bx = 330 + Math.sin(globalTime * 0.7) * 14;
        const by = ((360 + cameraY * 0.14) % (LOGICAL_HEIGHT + 120)) - 60;
        ctx.globalAlpha = cloudAlpha * 0.8;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(bx, by, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(bx, by, 8, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bx - 5, by + 22, 10, 8);
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx - 6, by + 16);
        ctx.lineTo(bx - 4, by + 22);
        ctx.moveTo(bx + 6, by + 16);
        ctx.lineTo(bx + 4, by + 22);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Forest Foliage silhouettes + Flying Forest Birds (alt 16..52)
    if (alt > 16 && alt < 52) {
      const treeAlpha = Math.min(1, (alt - 16) / 10) * Math.min(1, (52 - alt) / 10);
      ctx.save();
      ctx.globalAlpha = treeAlpha * 0.28;
      ctx.fillStyle = '#064e3b';
      for (let i = 0; i < 6; i++) {
        const side = i % 2 === 0 ? 0 : LOGICAL_WIDTH;
        const ty = ((i * 160 + cameraY * 0.45) % LOGICAL_HEIGHT + LOGICAL_HEIGHT) % LOGICAL_HEIGHT;
        ctx.beginPath();
        ctx.arc(side, ty, 52, 0, Math.PI * 2);
        ctx.fill();
      }
      // Colorful forest birds
      ctx.globalAlpha = treeAlpha * 0.85;
      const birdColors = ['#ef4444', '#38bdf8', '#facc15'];
      for (let i = 0; i < 3; i++) {
        const bx = ((globalTime * (40 + i * 10) + i * 130) % (LOGICAL_WIDTH + 60)) - 30;
        const by = 180 + i * 130 + Math.sin(globalTime * 4 + i) * 10;
        const wing = Math.sin(globalTime * 15 + i) * 5;
        ctx.fillStyle = birdColors[i];
        ctx.beginPath();
        ctx.ellipse(bx, by, 7, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx - 2, by);
        ctx.lineTo(bx - 7, by - 4 + wing);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Garden Fireflies & Butterflies (alt < 45)
    if (alt < 45) {
      const gardenAlpha = Math.max(0, 1 - alt / 45);
      ctx.save();
      ctx.globalAlpha = gardenAlpha * 0.45;
      ctx.fillStyle = '#fef08a';
      for (let i = 0; i < 14; i++) {
        const px = ((i * 97 + Math.sin(globalTime + i) * 14) % (LOGICAL_WIDTH - 20)) + 10;
        const py = ((i * 151 + cameraY * 0.3) % LOGICAL_HEIGHT + LOGICAL_HEIGHT) % LOGICAL_HEIGHT;
        ctx.beginPath();
        ctx.arc(px, py, 2 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }

      // Butterflies fluttering in the garden
      ctx.globalAlpha = gardenAlpha * 0.85;
      const bColors = ['#f472b6', '#fbbf24', '#38bdf8'];
      for (let i = 0; i < 3; i++) {
        const bx = ((i * 130 + 60 + Math.sin(globalTime * 1.4 + i * 2) * 55) % (LOGICAL_WIDTH - 40)) + 20;
        const by = ((i * 180 + 220 + cameraY * 0.35 + Math.cos(globalTime * 2 + i) * 20) % LOGICAL_HEIGHT + LOGICAL_HEIGHT) % LOGICAL_HEIGHT;
        const flap = 2 + Math.abs(Math.sin(globalTime * 12 + i)) * 5;
        ctx.fillStyle = bColors[i];
        ctx.beginPath();
        ctx.ellipse(bx - 4, by, flap, 5, -0.3, 0, Math.PI * 2);
        ctx.ellipse(bx + 4, by, flap, 5, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Starting Garden Ground & Pond (scrolls down as you climb!)
    const groundY = FROG_START_SCREEN_Y + 34 + cameraY;
    if (groundY < LOGICAL_HEIGHT + 120) {
      ctx.save();
      // Rolling grass hills
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(90, groundY + 40, 160, 55, 0, 0, Math.PI * 2);
      ctx.ellipse(330, groundY + 45, 170, 58, 0, 0, Math.PI * 2);
      ctx.fill();

      // Garden pond at the base
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, groundY + 25, LOGICAL_WIDTH, LOGICAL_HEIGHT - groundY + 120);

      // Little fish swimming in the garden pond
      for (let f = 0; f < 3; f++) {
        const fx = ((globalTime * (26 + f * 9) + f * 140) % (LOGICAL_WIDTH + 40)) - 20;
        const fy = groundY + 55 + f * 26 + Math.sin(globalTime * 3 + f) * 4;
        ctx.fillStyle = f % 2 === 0 ? '#fb923c' : '#fde047';
        ctx.beginPath();
        ctx.ellipse(fx, fy, 8, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(fx - 7, fy);
        ctx.lineTo(fx - 13, fy - 4);
        ctx.lineTo(fx - 13, fy + 4);
        ctx.closePath();
        ctx.fill();
      }

      // Grass rim & little flowers
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, groundY + 18, LOGICAL_WIDTH, 14);
      const flowerColors = ['#f472b6', '#facc15', '#fb7185', '#ffffff'];
      for (let i = 0; i < 9; i++) {
        const fx = 24 + i * 48;
        ctx.fillStyle = flowerColors[i % flowerColors.length];
        ctx.beginPath();
        ctx.arc(fx, groundY + 16, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawPlatform(p, screenY) {
    if (p.removed) return;

    const scale = p.vanishing ? 1 - p.vanishProgress * 0.65 : 1;
    const alpha = p.vanishing ? 1 - p.vanishProgress : 1;
    const bob = p.vanishing ? p.vanishProgress * 14 : Math.sin(globalTime * 3 + p.bobOffset) * 2;
    const isCurrent = p.index === score && p.col === frog.col && !frog.jumping && !frog.falling;
    const theme = BIOMES[getBiomeIndex(p.index)].platform;
    const timerRatio = isCurrent && platformMaxTimer > 0 ? Math.max(0, platformTimer / platformMaxTimer) : 1;
    const shakeX = isCurrent && platformMaxTimer > 0 && timerRatio < 0.38 ? Math.sin(globalTime * 55) * 2.5 : 0;

    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.translate(p.x + shakeX, screenY + bob + 12);
    ctx.scale(scale, scale);

    // Fast/unstable platform warning aura
    if (p.fast && !p.vanishing) {
      ctx.strokeStyle = `rgba(251, 146, 60, ${0.55 + 0.35 * Math.sin(globalTime * 10)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 33, 13, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 30, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    if (theme === 'cloud' || theme === 'sunset') {
      // Fluffy Cloud Platform
      const baseColor = theme === 'sunset' ? '#fdba74' : '#cbd5e1';
      const topColor = theme === 'sunset' ? (isCurrent ? '#fef3c7' : '#ffedd5') : (isCurrent ? '#ffffff' : '#f1f5f9');
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.ellipse(0, 2, 30, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = topColor;
      ctx.beginPath();
      ctx.arc(-14, -2, 11, 0, Math.PI * 2);
      ctx.arc(0, -5, 14, 0, Math.PI * 2);
      ctx.arc(15, -2, 11, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === 'star') {
      // Lunar / Starlight Crystal Platform
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isCurrent ? '#e0f2fe' : '#7dd3fc';
      ctx.beginPath();
      ctx.ellipse(0, -2, 25, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === 'space' || theme === 'neon') {
      // Asteroid / Neon Space Pad
      ctx.fillStyle = theme === 'neon' ? '#9333ea' : '#475569';
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = theme === 'neon' ? (isCurrent ? '#f0abfc' : '#c084fc') : (isCurrent ? '#cbd5e1' : '#94a3b8');
      ctx.beginPath();
      ctx.ellipse(0, -2, 25, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Craters / glow dots
      ctx.fillStyle = theme === 'neon' ? '#fde047' : '#334155';
      ctx.beginPath();
      ctx.arc(-10, -2, 3, 0, Math.PI * 2);
      ctx.arc(11, -1, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Garden Lily Pad / Tree Leaf
      ctx.fillStyle = isCurrent ? '#22c55e' : '#15803d';
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isCurrent ? '#86efac' : '#4ade80';
      ctx.beginPath();
      ctx.ellipse(0, -2, 26, 8, 0, 0.2, Math.PI * 1.9);
      ctx.fill();

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(14, -9);
      ctx.lineTo(20, -4);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // Countdown bar under current platform (from Clouds biome upward)
    if (isCurrent && platformMaxTimer > 0 && gameState === 'playing') {
      const barW = 50;
      const barH = 5;
      const bx = p.x - barW / 2;
      const by = screenY + bob + 28;
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.roundRect(bx, by, barW, barH, 3);
      ctx.fill();

      ctx.fillStyle = timerRatio > 0.5 ? '#4ade80' : timerRatio > 0.28 ? '#fbbf24' : '#ef4444';
      ctx.beginPath();
      ctx.roundRect(bx, by, barW * timerRatio, barH, 3);
      ctx.fill();
      ctx.restore();
    }

    // Draw coin on platform
    if (p.hasCoin && !p.coinCollected && !p.vanishing) {
      const coinY = screenY - 14 + Math.sin(globalTime * 5 + p.index) * 3;
      const spinWidth = 4 + Math.abs(Math.cos(globalTime * 4 + p.index)) * 7;

      ctx.save();
      ctx.translate(p.x, coinY);

      // Glow
      ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();

      // Coin body
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, spinWidth, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Shine
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(-spinWidth * 0.25, -3, Math.max(1, spinWidth * 0.25), 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function drawFrog(screenX, screenY) {
    let scaleX = 1;
    let scaleY = 1;
    if (frog.jumping) {
      scaleX = 0.84;
      scaleY = 1.22;
    } else if (frog.squash > 0) {
      scaleX = 1 + frog.squash * 0.22;
      scaleY = 1 - frog.squash * 0.18;
    }
    drawFrogCharacter(ctx, screenX, screenY, getEquippedSkin(), equippedTypeId, {
      facing: frog.facing,
      scaleX,
      scaleY,
      rotation: frog.rotation,
      falling: frog.falling,
      jumping: frog.jumping,
    });
  }

  function drawFrogCharacter(targetCtx, screenX, screenY, skin, frogType, opts = {}) {
    const prevCtx = ctx;
    ctx = targetCtx;
    try {
      const colors = getSkinColors(skin);
      const facing = opts.facing ?? 1;
      const scaleX = opts.scaleX ?? 1;
      const scaleY = opts.scaleY ?? 1;
      const rotation = opts.rotation ?? 0;
      const isFalling = Boolean(opts.falling);
      const isJumping = Boolean(opts.jumping);

      ctx.save();
      ctx.translate(screenX, screenY - 6);
      ctx.rotate(rotation);
      ctx.scale(facing * scaleX, scaleY);

    // Back layer (capes, katana, jetpack, dreadlocks)
    if (frogType === 'wizard') {
      // Flowing wizard cape
      ctx.fillStyle = '#3b0764';
      ctx.beginPath();
      ctx.moveTo(-10, -4);
      ctx.lineTo(-22, 13);
      ctx.lineTo(-4, 13);
      ctx.closePath();
      ctx.fill();
    } else if (frogType === 'ninja') {
      // Katana strapped on back
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-19, -22);
      ctx.lineTo(10, 8);
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-20, -23, 5, 3);
    } else if (frogType === 'king') {
      // Royal crimson cape with ermine spots
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(-10, -4);
      ctx.lineTo(-23, 14);
      ctx.lineTo(-2, 14);
      ctx.closePath();
      ctx.fill();
    } else if (frogType === 'astro') {
      // Jetpack with thrusters
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-20, -6, 9, 16);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-19, 10, 7, 3);
      if (isJumping) {
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(-19, 13);
        ctx.lineTo(-15.5, 23 + Math.sin(globalTime * 40) * 3);
        ctx.lineTo(-12, 13);
        ctx.fill();
      }
    } else if (frogType === 'jamaican') {
      // Dreadlocks hanging down
      ctx.fillStyle = '#1c1917';
      for (let d = 0; d < 4; d++) {
        ctx.beginPath();
        ctx.ellipse(-15 + d * 2, -3 + d * 2, 3, 9, 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Back legs
    ctx.fillStyle = frogType === 'astro' ? '#cbd5e1' : frogType === 'cyber' ? '#475569' : colors.dark;
    const legStretch = isJumping ? 8 : 0;
    ctx.beginPath();
    ctx.ellipse(-12, 8 + legStretch * 0.5, 8, 5, -0.4, 0, Math.PI * 2);
    ctx.ellipse(12, 8 + legStretch * 0.5, 8, 5, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Main body
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = colors.belly;
    ctx.beginPath();
    ctx.ellipse(2, 4, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Full-body outfit overlays
    if (frogType === 'wizard') {
      // Purple wizard robe with gold trim & star sash
      ctx.fillStyle = '#581c87';
      ctx.beginPath();
      ctx.ellipse(0, 4, 18, 12, 0, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-14, 2);
      ctx.lineTo(14, 2);
      ctx.stroke();
    } else if (frogType === 'warrior') {
      // Silver steel chestplate + shoulder pauldrons + leather belt
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.ellipse(0, 4, 18, 12, 0, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(-14, 0, 6, 0, Math.PI * 2);
      ctx.arc(14, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-16, 4, 32, 4);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-3, 4, 6, 4);
    } else if (frogType === 'ninja') {
      // Dark shinobi gi + red sash
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, 4, 18, 12, 0, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-15, 2);
      ctx.lineTo(15, 6);
      ctx.stroke();
    } else if (frogType === 'jamaican') {
      // Rasta striped vest (green, yellow, red)
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(0, 3, 17, 10, 0, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-15, 4, 30, 4);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-13, 8, 26, 4);
    } else if (frogType === 'king') {
      // Royal red tunic + white ermine collar + gold medallion
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.ellipse(0, 4, 18, 12, 0, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-15, -1, 30, 4.5);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(2, 7, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (frogType === 'astro') {
      // White NASA spacesuit + orange/blue chest control panel
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.ellipse(0, 3, 18, 12, 0, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-6, 3, 12, 7);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-4, 5, 4, 3);
    } else if (frogType === 'cyber') {
      // Metallic cyborg torso + glowing cyan core
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(0, 4, 18, 12, 0, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(2, 6, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eye bumps
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.arc(-7, -12, 7, 0, Math.PI * 2);
    ctx.arc(8, -12, 7, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (wide-eyed if falling!)
    const eyeRadius = isFalling ? 5.5 : 4.5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-7, -12, eyeRadius, 0, Math.PI * 2);
    ctx.arc(8, -12, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#0f172a';
    const pupilOffset = isFalling ? 0 : 1.3;
    ctx.beginPath();
    ctx.arc(-7 + pupilOffset, -12, isFalling ? 2 : 2.3, 0, Math.PI * 2);
    ctx.arc(8 + pupilOffset, -12, isFalling ? 2 : 2.3, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks
    ctx.fillStyle = colors.cheek;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.arc(-10, -2, 3.2, 0, Math.PI * 2);
    ctx.arc(12, -2, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Mouth
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (isFalling) {
      ctx.arc(2, -3, 3.5, 0, Math.PI * 2);
    } else {
      ctx.arc(2, -5, 5, 0.15, Math.PI - 0.15);
    }
    ctx.stroke();

    // Frog Type Headgear & Hand Weapons
    if (frogType === 'wizard') {
      // Long white beard
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-4, -1);
      ctx.lineTo(2, 13);
      ctx.lineTo(9, -1);
      ctx.closePath();
      ctx.fill();

      // Magic Staff with glowing orb
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(18, 12);
      ctx.lineTo(20, -18);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(20, -20, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Wizard Hat + Gold Star
      ctx.fillStyle = '#4c1d95';
      ctx.beginPath();
      ctx.ellipse(0, -17, 19, 4.5, -0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-11, -17);
      ctx.lineTo(-2, -41);
      ctx.lineTo(10, -17);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(-1, -27, 2.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (frogType === 'warrior') {
      // Red Plume + Silver Helmet
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.ellipse(-2, -26, 9, 5, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(0, -14, 13, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-13, -15, 26, 3);

      // Sword in front hand + Shield on side
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(19, 5);
      ctx.lineTo(24, -14);
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(16, 3, 7, 3);

      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-14, 5, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (frogType === 'ninja') {
      // Ninja Mask + Red Headband with flowing tails
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(0, 0, 17, 10, 0, 0, Math.PI);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-13, -17, 26, 4.5);
      const wave = Math.sin(globalTime * 12) * 3;
      ctx.beginPath();
      ctx.moveTo(-13, -15);
      ctx.lineTo(-24, -19 + wave);
      ctx.lineTo(-22, -12 + wave);
      ctx.closePath();
      ctx.fill();
    } else if (frogType === 'jamaican') {
      // Rasta Beanie + Cool Sunglasses
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(0, -17, 13, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-13, -20, 26, 3.5);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-13, -17, 26, 3);

      ctx.fillStyle = '#09090b';
      ctx.fillRect(-12, -15, 10, 6);
      ctx.fillRect(3, -15, 10, 6);
      ctx.fillRect(-2, -13, 5, 2);
    } else if (frogType === 'king') {
      // Royal Gold Crown + Scepter
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(17, 10);
      ctx.lineTo(19, -12);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(19, -14, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-11, -17);
      ctx.lineTo(-13, -29);
      ctx.lineTo(-5, -22);
      ctx.lineTo(0, -32);
      ctx.lineTo(6, -22);
      ctx.lineTo(13, -29);
      ctx.lineTo(11, -17);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -21, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (frogType === 'astro') {
      // Astronaut Glass Helmet
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(186, 230, 253, 0.24)';
      ctx.beginPath();
      ctx.arc(0, -4, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-6, -12, 10, Math.PI * 1.1, Math.PI * 1.55);
      ctx.stroke();
    } else if (frogType === 'cyber') {
      // Cyborg Glowing Red Visor + Antenna
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, -16);
      ctx.lineTo(-14, -27);
      ctx.stroke();
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(-14, -27, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-12, -15, 25, 5);
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(-8, -14, 16, 2);
    }

      ctx.restore();
    } finally {
      ctx = prevCtx;
    }
  }

  function createFrogPreviewCanvas(skin, typeId, size = 64) {
    const c = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = size * dpr;
    c.height = size * dpr;
    c.style.width = `${size}px`;
    c.style.height = `${size}px`;
    const pCtx = c.getContext('2d');
    pCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const scale = size / 68;
    drawFrogCharacter(pCtx, size / 2, size * 0.68, skin, typeId, {
      facing: 1,
      scaleX: scale,
      scaleY: scale,
    });
    return c;
  }

  function render() {
    drawBackground();

    // Draw platforms
    for (const p of platforms) {
      const screenY = FROG_START_SCREEN_Y + p.y + cameraY;
      if (screenY > -60 && screenY < LOGICAL_HEIGHT + 60) {
        drawPlatform(p, screenY);
      }
    }

    // Draw frog
    const frogScreenY = FROG_START_SCREEN_Y + frog.y + cameraY;
    drawFrog(frog.x, frogScreenY);

    // Draw particles
    for (const pt of particles) {
      const sy = FROG_START_SCREEN_Y + pt.y + cameraY;
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, sy, pt.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw floating texts
    for (const ft of floatingTexts) {
      const sy = FROG_START_SCREEN_Y + ft.y + cameraY;
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.font = '800 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, sy);
      ctx.restore();
    }

    // Current biome badge (top-left)
    if (gameState === 'playing') {
      const b = BIOMES[currentBiomeIndex];
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.beginPath();
      ctx.roundRect(12, 12, 152, 26, 13);
      ctx.fill();
      ctx.font = '700 12px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${b.icon} ${b.label}`, 22, 25);
      ctx.restore();
    }

    // Biome transition banner (top-center)
    if (biomeBanner && gameState === 'playing') {
      const progress = 1 - biomeBanner.life / biomeBanner.maxLife;
      const alpha = progress < 0.15 ? progress / 0.15 : progress > 0.75 ? (1 - progress) / 0.25 : 1;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.beginPath();
      ctx.roundRect(LOGICAL_WIDTH / 2 - 105, 52, 210, 34, 17);
      ctx.fill();
      ctx.font = '800 15px system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(biomeBanner.text, LOGICAL_WIDTH / 2, 69);
      ctx.restore();
    }
  }

  // --- UI & Shop ---
  function updateHUD() {
    scoreValueEl.textContent = String(score);
    const formatted = formatTime(runTime);
    lastDisplayedTime = formatted;
    timeValueEl.textContent = formatted;
    recordValueEl.textContent = String(record);
    coinsValueEl.textContent = String(coins);
    shopCoinsValueEl.textContent = String(coins);
    menuRecordValueEl.textContent = String(record);
    menuBestTimeValueEl.textContent = formatTime(bestTime);
    menuCoinsValueEl.textContent = String(coins);
    soundBtn.textContent = audio.muted ? '🔇' : '🔊';
    musicBtn.textContent = audio.musicEnabled ? '🎵' : '🎶';
    musicBtn.style.opacity = audio.musicEnabled ? '1' : '0.45';

    if (!audio.musicEnabled) {
      menuMusicBtn.textContent = '🎵 Música Tema: Desligada';
      menuMusicBtn.classList.add('off');
    } else if (!audio.musicUnlocked) {
      menuMusicBtn.textContent = '🎵 Música Tema: Ligada (toque para ouvir)';
      menuMusicBtn.classList.remove('off');
    } else {
      menuMusicBtn.textContent = '🎵 Música Tema: Tocando!';
      menuMusicBtn.classList.remove('off');
    }

    const skin = getEquippedSkin();
    startFrogPreview.style.background = 'rgba(255, 255, 255, 0.08)';
    startFrogPreview.innerHTML = '';
    startFrogPreview.appendChild(createFrogPreviewCanvas(skin, equippedTypeId, 64));
  }

  function renderShop() {
    shopCoinsValueEl.textContent = String(coins);
    skinGrid.innerHTML = '';

    tabColorsBtn.classList.toggle('active', shopTab === 'colors');
    tabTypesBtn.classList.toggle('active', shopTab === 'types');
    shopSubtitle.textContent =
      shopTab === 'colors'
        ? 'Use suas moedinhas para desbloquear novas cores!'
        : 'Escolha um estilo especial para combinar com qualquer cor!';

    if (shopTab === 'colors') {
      for (const skin of FROG_SKINS) {
        const isUnlocked = unlockedSkins.includes(skin.id);
        const isEquipped = equippedSkinId === skin.id;
        const canAfford = coins >= skin.price;

        const btn = document.createElement('button');
        btn.className = `skin-item ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}`;

        const preview = createFrogPreviewCanvas(skin, equippedTypeId, 58);

        const nameEl = document.createElement('span');
        nameEl.className = 'skin-name';
        nameEl.textContent = skin.name;

        const statusEl = document.createElement('span');
        statusEl.className = 'skin-status';
        if (isEquipped) {
          statusEl.classList.add('equipped');
          statusEl.textContent = 'Equipado';
        } else if (isUnlocked) {
          statusEl.classList.add('owned');
          statusEl.textContent = 'Selecionar';
        } else {
          statusEl.classList.add(canAfford ? 'price' : 'cant-afford');
          statusEl.textContent = `🪙 ${skin.price}`;
        }

        btn.appendChild(preview);
        btn.appendChild(nameEl);
        btn.appendChild(statusEl);

        btn.addEventListener('click', () => {
          if (isUnlocked) {
            equippedSkinId = skin.id;
            audio.jump();
            saveProgress();
            updateHUD();
            renderShop();
          } else if (coins >= skin.price) {
            coins -= skin.price;
            unlockedSkins.push(skin.id);
            equippedSkinId = skin.id;
            audio.buy();
            saveProgress();
            updateHUD();
            renderShop();
          }
        });

        skinGrid.appendChild(btn);
      }
    } else {
      for (const type of FROG_TYPES) {
        const isUnlocked = unlockedTypes.includes(type.id);
        const isEquipped = equippedTypeId === type.id;
        const canAfford = coins >= type.price;

        const btn = document.createElement('button');
        btn.className = `skin-item ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}`;

        const preview = createFrogPreviewCanvas(getEquippedSkin(), type.id, 62);

        const nameEl = document.createElement('span');
        nameEl.className = 'skin-name';
        nameEl.textContent = type.name;

        const statusEl = document.createElement('span');
        statusEl.className = 'skin-status';
        if (isEquipped) {
          statusEl.classList.add('equipped');
          statusEl.textContent = 'Equipado';
        } else if (isUnlocked) {
          statusEl.classList.add('owned');
          statusEl.textContent = 'Selecionar';
        } else {
          statusEl.classList.add(canAfford ? 'price' : 'cant-afford');
          statusEl.textContent = `🪙 ${type.price}`;
        }

        btn.appendChild(preview);
        btn.appendChild(nameEl);
        btn.appendChild(statusEl);

        btn.addEventListener('click', () => {
          if (isUnlocked) {
            equippedTypeId = type.id;
            audio.jump();
            saveProgress();
            updateHUD();
            renderShop();
          } else if (coins >= type.price) {
            coins -= type.price;
            unlockedTypes.push(type.id);
            equippedTypeId = type.id;
            audio.buy();
            saveProgress();
            updateHUD();
            renderShop();
          }
        });

        skinGrid.appendChild(btn);
      }
    }
  }

  function openShop(fromState) {
    shopReturnState = fromState;
    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    renderShop();
    shopOverlay.classList.remove('hidden');
  }

  function closeShop() {
    shopOverlay.classList.add('hidden');
    if (shopReturnState === 'start') {
      startOverlay.classList.remove('hidden');
    } else if (shopReturnState === 'gameover') {
      gameOverOverlay.classList.remove('hidden');
    }
  }

  function startGame() {
    audio.unlockAndStartMusic();
    resetGame();
    gameState = 'playing';
    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    shopOverlay.classList.add('hidden');
  }

  function toggleMusic() {
    audio.musicEnabled = !audio.musicEnabled;
    localStorage.setItem(STORAGE_KEYS.MUSIC, String(audio.musicEnabled));
    if (audio.musicEnabled) {
      audio.unlockAndStartMusic();
    } else {
      audio.stopMusic();
    }
    updateHUD();
  }

  // --- Event Listeners ---
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);

  shopBtn.addEventListener('click', () => {
    if (gameState === 'playing') return;
    openShop(gameState);
  });
  openShopFromStartBtn.addEventListener('click', () => openShop('start'));
  openShopFromOverBtn.addEventListener('click', () => openShop('gameover'));
  closeShopBtn.addEventListener('click', closeShop);

  musicBtn.addEventListener('click', toggleMusic);
  menuMusicBtn.addEventListener('click', () => {
    if (!audio.musicUnlocked && audio.musicEnabled) {
      audio.unlockAndStartMusic();
    } else {
      toggleMusic();
    }
  });

  tabColorsBtn.addEventListener('click', () => {
    shopTab = 'colors';
    renderShop();
  });
  tabTypesBtn.addEventListener('click', () => {
    shopTab = 'types';
    renderShop();
  });

  soundBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    localStorage.setItem(STORAGE_KEYS.MUTED, String(audio.muted));
    updateHUD();
  });

  // Unlock theme music on first user interaction anywhere
  function handleFirstInteraction() {
    audio.unlockAndStartMusic();
    if (audio.musicUnlocked) {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    }
  }
  window.addEventListener('pointerdown', handleFirstInteraction);
  window.addEventListener('keydown', handleFirstInteraction);

  // Left / Right button controls
  function bindJumpButton(el, dir) {
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      el.classList.add('pressed');
      requestJump(dir);
    });
    const release = () => el.classList.remove('pressed');
    el.addEventListener('pointerup', release);
    el.addEventListener('pointerleave', release);
    el.addEventListener('pointercancel', release);
  }
  bindJumpButton(leftBtn, -1);
  bindJumpButton(rightBtn, 1);

  // Tap left/right half of canvas directly
  canvas.addEventListener('pointerdown', (e) => {
    if (gameState !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    requestJump(relX < rect.width / 2 ? -1 : 1);
  });

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      leftBtn.classList.add('pressed');
      requestJump(-1);
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      rightBtn.classList.add('pressed');
      requestJump(1);
    } else if (e.key === ' ' || e.key === 'Enter') {
      if (gameState === 'start' && shopOverlay.classList.contains('hidden')) {
        e.preventDefault();
        startGame();
      } else if (gameState === 'gameover' && shopOverlay.classList.contains('hidden')) {
        e.preventDefault();
        startGame();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      leftBtn.classList.remove('pressed');
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      rightBtn.classList.remove('pressed');
    }
  });

  // --- Main Animation Loop ---
  let lastTime = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  resetGame();
  updateHUD();
  requestAnimationFrame(loop);
})();
