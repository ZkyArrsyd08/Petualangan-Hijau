const scenes = [
  { image: 'assets/scenes/scene-1.jpeg', text: 'Dunia yang dahulu hijau dan penuh kehidupan, kini perlahan berubah. Sampah, polusi, dan pencemaran telah mengambil alih setiap sudut kota.' },
  { image: 'assets/scenes/scene-2.jpeg', text: 'Kalau semua orang hanya diam… keadaan ini tidak akan pernah berubah. Mungkin, semuanya harus dimulai dari satu langkah kecil.' },
  { image: 'assets/scenes/scene-3.jpeg', text: 'Tempat yang seharusnya menjadi ruang hijau, kini dipenuhi sampah dan kehilangan keindahannya. Saatnya mengembalikan kehidupan ke taman ini.' },
  { image: 'assets/scenes/scene-4.jpeg', text: 'Sungai yang dahulu mengalir jernih, kini tercemar oleh sampah dan limbah. Bersihkan alirannya, sebelum semuanya terlambat.' },
  { image: 'assets/scenes/scene-5.jpeg', text: 'Hutan perlahan kehilangan kehidupannya. Pohon-pohon tumbang, dan habitat mulai menghilang. Alam membutuhkan bantuanmu untuk kembali pulih.' },
  { image: 'assets/scenes/scene-6.jpeg', text: 'Di balik kemajuan, lingkungan mulai menanggung akibatnya. Polusi terus menyebar. Saatnya menghentikan pencemaran yang semakin parah.' },
  { image: 'assets/scenes/scene-7.jpeg', text: 'Kota ini semakin kehilangan kepedulian. Sampah dibiarkan, lingkungan terbengkalai, dan tidak ada yang mau memulai perubahan. Namun, satu langkah kecil dapat menjadi awal dari perubahan besar.' }
];

const timing = { menuFadeOut: 2200, fadeIn: 1400, typeDelay: 27, sceneDuration: 6800, fadeOut: 1100, titleDuration: 5000, mapLoading: 5000 };
const $ = selector => document.querySelector(selector);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const StartupState = Object.freeze({
  SPLASH: 'STARTUP_SPLASH',
  LOADING: 'STARTUP_LOADING',
  READY: 'STARTUP_READY'
});
const startupTiming = Object.freeze({
  initialBlack: 200,
  splashFade: 700,
  splashHold: 3600,
  loadingFade: 650,
  loadingMinimum: 7000,
  loadingReadyHold: 450,
  finalFade: 650,
  assetTimeout: 12000
});
let startupState = StartupState.SPLASH;
let fullscreenAttempted = false;
function tryFullscreenOnce() {
  if (fullscreenAttempted) return;
  fullscreenAttempted = true;
  document.removeEventListener('pointerdown', tryFullscreenOnce, true);
  document.removeEventListener('keydown', tryFullscreenOnce, true);
  if (document.fullscreenElement || !document.documentElement.requestFullscreen) return;
  try {
    const request = document.documentElement.requestFullscreen();
    if (request?.catch) request.catch(() => {});
  } catch {
    // Fullscreen is optional; immersive viewport remains active when the browser refuses it.
  }
}
document.addEventListener('pointerdown', tryFullscreenOnce, { once: true, capture: true });
document.addEventListener('keydown', tryFullscreenOnce, { once: true, capture: true });
let running = false;
let typing = false;
let finishTyping = false;
let soundEnabled = true;
let paused = false;
let flowVersion = 0;
let completedLevels = [];
const journeyKey='petualanganHijauSaveSlotsV3';
const legacyJourneyKey='petualanganHijauSave';
const JOURNEY_SLOT_COUNT=5;
let activeSaveSlot=null;
let journeyResumeLevel=1;
let journeyLastScreen='';
const journeyLastWrites=Array(JOURNEY_SLOT_COUNT).fill('');
let levelOneActive = false;
let levelOneGameplay = false;
let parkCleanliness = 0;
let parkEnvironmentState = 'DIRTY';
let parkRevealPoints = [];
let parkEntranceActive = false;
let parkEntranceStage = 'approach';
let parkEntrancePlayer = { x: 51, y: 88 };
let parkEntranceDirection = 'up';
let pakRudiDialogActive = false;
let pakRudiDialogIndex = 0;
let pakRudiDialogTyping = false;
let pakRudiDialogFinish = false;
let riverGameplay = false;
let levelThreeActive = false;
let forestGameplay = false;
let forestStarting = false;
let forestStage = 1;
let forestProgress = 0;
let forestTime = 150;
let forestPlayer = { x: 50, y: 82 };
let forestDirection = 'up';
let forestInteractionHeld = false;
let plantHoldProgress = 0;
let activePlantSite = null;
let forestMiniGame = null;
let forestEnding = false;
let forestOutcome = 'dirty';
let levelFourActive = false;
let factoryGameplay = false;
let factoryStarting = false;
let factoryStage = 1;
let factoryProgress = 0;
let factoryTime = 150;
let factoryPlayer = { x: 50, y: 84 };
let factoryDirection = 'up';
let factoryDialogIndex = 0;
let factoryDialogTyping = false;
let factoryDialogFinish = false;
let activeFactorySystem = null;
let factoryInteractionHeld = false;
let factoryHoldProgress = 0;
let activeFactorySite = null;
let factoryMiniGame = null;
let factoryEnding = false;
let factoryOutcome = 'dirty';
let cleanCount = 0;
let repairCount = 0;
let repairMode = false;
let repairInteractionHeld = false;
let repairHoldProgress = 0;
let activeRepairTarget = null;
const REPAIR_HOLD_DURATION = 5;
let carriedTrash = null;
let parkPlayer = { x: 50, y: 72 };
let levelTime = 150;
let levelOneEnding = false;
let levelOneOutcome = 'bad';
let warning60Shown = false;
let warning30Shown = false;
let playerName = localStorage.getItem('petualanganHijauPlayerName') || 'Pemain';
let unsavedChanges = false;
let musicVolume = Number(localStorage.getItem('petualanganHijauMusicVolume') ?? 1);
let sfxVolume = Number(localStorage.getItem('petualanganHijauSfxVolume') ?? 1);
const movementKeys = new Set();
const audioFades = new WeakMap();

const GamePhase = Object.freeze({
  MENU: 'MENU', DIALOG: 'DIALOG', GAMEPLAY: 'GAMEPLAY', MINIGAME: 'MINIGAME',
  PAUSED: 'PAUSED', LEVEL_COMPLETE: 'LEVEL_COMPLETE', GAME_OVER: 'GAME_OVER', ENDING: 'ENDING'
});
const interactionCooldowns = new Map();
const urgentTimerWarnings = new Set();
let pendingUnlockLevel = 0;
let gameplaySoundtrackActive = false;
let gameplayWarningSoundActive = false;
let gameplayCountdownActive = false;

function runInteraction(scope, action, cooldown = 240) {
  if (paused) return false;
  const now = performance.now();
  if (now < (interactionCooldowns.get(scope) || 0)) return false;
  interactionCooldowns.set(scope, now + cooldown);
  action();
  return true;
}

function resetInteractionState() { interactionCooldowns.clear(); movementKeys.clear(); }
function resetTimerAlert(key, hud) { urgentTimerWarnings.delete(key); hud?.classList.remove('urgent'); }
function updateTimerAlert(key, remaining, hud) {
  updateGameplaySoundtrack(remaining);
  hud?.classList.toggle('urgent', remaining > 0 && remaining <= 15);
  if (remaining > 0 && remaining <= 15 && !urgentTimerWarnings.has(key)) {
    urgentTimerWarnings.add(key);
    showGlobalToast('⚠ 15 DETIK TERSISA!');
  }
}
function movementInputAllowed() {
  const cityPlaying = typeof city !== 'undefined' && city.phase === 'play';
  const checkpointWalking=typeof journeyCheckpoint!=='undefined'&&journeyCheckpoint.active;
  const returning=typeof postLevelExit!=='undefined'&&postLevelExit.active;
  return !paused && (returning || checkpointWalking || parkEntranceActive || riverEntranceActive || forestEntranceActive || levelOneGameplay || riverGameplay || forestGameplay || factoryGameplay || riverMiniGame === 'net' || cityPlaying);
}
const legacyTrashData = [
  ['organic','🍌','Kulit Pisang',35,43],['paper','📄','Kertas Kusut',42,30],['inorganic','🥤','Botol Plastik',52,31],['organic','🍎','Sisa Apel',61,37],['paper','📰','Koran',72,43],
  ['inorganic','🥫','Kaleng',70,54],['organic','🍂','Daun Kering',51,60],['paper','📦','Kardus',48,76],['inorganic','🧴','Gelas Plastik',31,69],['inorganic','🛍️','Kantong Plastik',72,68]
];
const parkWalkableArea = [[4,39],[14,30],[29,16],[48,1],[68,8],[73,32],[81,20],[96,29],[100,35],[100,61],[79,82],[54,98],[32,84],[14,72],[0,61],[0,48]];
const levelOneTrashV2 = [
  ['organic','assets/level1/new/trash/organic/apple-core.png','Sisa Apel',14,37],
  ['paper','assets/level1/new/trash/paper/crumpled-paper.png','Kertas Kusut',35,27],
  ['inorganic','assets/level1/new/trash/inorganic/plastic-bottle.png','Botol Plastik',43,31],
  ['inorganic','assets/level1/new/trash/inorganic/red-can.png','Kaleng Minuman',66,27],
  ['organic','assets/level1/new/trash/organic/banana-peel.png','Kulit Pisang',78,34],
  ['organic','assets/level1/new/trash/organic/leaf-pile.png','Tumpukan Daun',16,72],
  ['paper','assets/level1/new/trash/paper/newspaper.png','Koran Bekas',51,76],
  ['inorganic','assets/level1/new/trash/inorganic/plastic-bag.png','Kantong Plastik',61,84],
  ['organic','assets/level1/new/trash/organic/branch.png','Ranting Kering',91,50],
  ['paper','assets/level1/new/trash/paper/cardboard.png','Kardus Bekas',79,78]
];
// Target perbaikan ditempel pada fasilitasnya; interaction range tetap bisa dicapai dari jalur aman.
const levelOneRepairs = [
  { name:'Air mancur tersumbat', x:49.1, y:45.2, interactionX:49.1, interactionY:56.5 },
  { name:'Bangku taman rusak', x:64, y:14, interactionX:69, interactionY:19 },
  { name:'Ayunan rusak', x:31.5, y:15.5, interactionX:39, interactionY:24 }
];
// Sampah dan tempat sampah tidak menjadi collision agar dapat ditembus pemain.
const parkObstacles = [
  { type:'ellipse', x:49.1, y:45.2, rx:7.4, ry:9.2 }, // air mancur
  { type:'rect', x1:13, y1:13, x2:21, y2:31 },        // perosotan
  { type:'rect', x1:26, y1:8, x2:37, y2:22 },         // ayunan
  { type:'ellipse', x:24.8, y:25, rx:3.7, ry:4.5 },   // permainan bundar
  { type:'rect', x1:20, y1:9, x2:25, y2:16 },         // bangku kiri atas
  { type:'rect', x1:27, y1:31, x2:33, y2:37 },        // bangku kiri tengah
  { type:'rect', x1:61, y1:10, x2:67, y2:17 },        // bangku kanan atas
  { type:'rect', x1:81, y1:19, x2:88, y2:28 },        // pergola kanan
  { type:'rect', x1:71, y1:37, x2:77, y2:44 },        // bangku kanan tengah
  { type:'rect', x1:88, y1:37, x2:95, y2:44 },        // bangku kanan luar
  { type:'rect', x1:7, y1:51, x2:13, y2:59 },         // bangku kiri bawah
  { type:'rect', x1:35, y1:69, x2:42, y2:77 },        // bangku bawah
  { type:'rect', x1:73, y1:55, x2:87, y2:69 },        // kotak pasir
  { type:'ellipse', x:20, y:62, rx:7.2, ry:7 },       // taman bunga bundar
  { type:'ellipse', x:21.2, y:44.5, rx:.75, ry:1 },   // lampu kiri
  { type:'ellipse', x:59.5, y:33, rx:.75, ry:1 },     // lampu tengah atas
  { type:'ellipse', x:59.5, y:22, rx:.75, ry:1 },     // lampu atas
  { type:'ellipse', x:84.8, y:34, rx:.75, ry:1 },     // lampu kanan
  { type:'ellipse', x:62, y:72, rx:.75, ry:1 },       // lampu bawah
  { type:'rect', x1:42, y1:21, x2:43.7, y2:25 },      // tong taman atas
  { type:'rect', x1:75, y1:17, x2:76.8, y2:21 },      // tong taman kanan atas
  { type:'rect', x1:63.5, y1:56, x2:65.3, y2:61 }     // tong taman bawah
];
const collisionPadding = { x: 1.05, y: 1.25 };
let collisionDebugVisible = false;

function renderCollisionDebug() {
  const overlay = $('#collision-debug');
  const walkablePoints = parkWalkableArea.map(([x,y]) => `${x},${y}`).join(' ');
  overlay.innerHTML = `<svg class="collision-safe-area" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="${walkablePoints}"/></svg><div class="collision-player-point"></div><div class="collision-debug-label">COLLISION DEBUG · F2</div>`;
  parkObstacles.forEach(obstacle => {
    const shape = document.createElement('div');
    shape.className = `collision-shape ${obstacle.type}`;
    if (obstacle.type === 'rect') {
      shape.style.left = `${obstacle.x1 - collisionPadding.x}%`;
      shape.style.top = `${obstacle.y1 - collisionPadding.y}%`;
      shape.style.width = `${obstacle.x2 - obstacle.x1 + collisionPadding.x * 2}%`;
      shape.style.height = `${obstacle.y2 - obstacle.y1 + collisionPadding.y * 2}%`;
    } else if (obstacle.type === 'ellipse') {
      const rx = obstacle.rx + collisionPadding.x;
      const ry = obstacle.ry + collisionPadding.y;
      shape.style.left = `${obstacle.x - rx}%`;
      shape.style.top = `${obstacle.y - ry}%`;
      shape.style.width = `${rx * 2}%`;
      shape.style.height = `${ry * 2}%`;
    } else {
      shape.style.inset = '0';
      shape.style.clipPath = `polygon(${obstacle.points.map(([x,y]) => `${x}% ${y}%`).join(',')})`;
    }
    overlay.appendChild(shape);
  });
}

function toggleCollisionDebug() {
  collisionDebugVisible = !collisionDebugVisible;
  $('#collision-debug').classList.toggle('visible', collisionDebugVisible);
  showGlobalToast(`Collision debug ${collisionDebugVisible ? 'AKTIF' : 'NONAKTIF'}`);
}

function isWalkable(x, y) {
  if (!pointInPolygon(x, y, parkWalkableArea)) return false;
  const paddingX = collisionPadding.x;
  const paddingY = collisionPadding.y;
  return !parkObstacles.some(obstacle => {
    if (obstacle.type === 'rect') {
      return x > obstacle.x1 - paddingX && x < obstacle.x2 + paddingX && y > obstacle.y1 - paddingY && y < obstacle.y2 + paddingY;
    }
    if (obstacle.type === 'ellipse') {
      const nx = (x - obstacle.x) / (obstacle.rx + paddingX);
      const ny = (y - obstacle.y) / (obstacle.ry + paddingY);
      return nx * nx + ny * ny < 1;
    }
    return pointInPolygon(x, y, obstacle.points);
  });
}

function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function showScreen(id) {
  if (typeof stopRiverSession === 'function' && id !== '#level-2-screen') stopRiverSession();
  if (typeof stopForestSession === 'function' && id !== '#level-3-screen') stopForestSession();
  if (typeof stopEnding === 'function' && id !== '#ending-screen') stopEnding();
  if (typeof stopCityLevel === 'function' && id !== '#level-5-screen') stopCityLevel();
  if (typeof postLevelExit !== 'undefined' && postLevelExit.active && !id.startsWith('#level-')) stopPostLevelExit();
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  $(id).classList.add('active');
  if (id === '#menu' && typeof stopPrologueAudio === 'function') stopPrologueAudio();
  $('#pause-button').hidden = !['#prologue', '#map', '#level-1-screen', '#level-2-screen', '#level-3-screen', '#level-4-screen', '#level-5-screen'].includes(id);
  if (id === '#map') {
    refreshLevelLocks();
    if (typeof revealPendingUnlock === 'function') revealPendingUnlock();
  }
  if (typeof syncGamePhase === 'function') syncGamePhase();
}

function waitForStartupImage(image, timeout = startupTiming.assetTimeout) {
  if (!image) return Promise.resolve(false);
  if (image.complete) {
    const ready = image.naturalWidth > 0;
    if (!ready) console.warn('[startup] Gambar gagal dimuat:', image.currentSrc || image.src);
    return Promise.resolve(ready);
  }
  return new Promise(resolve => {
    let settled = false;
    const finish = ready => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      image.removeEventListener('load', onLoad);
      image.removeEventListener('error', onError);
      if (!ready) console.warn('[startup] Gambar gagal dimuat:', image.currentSrc || image.src);
      resolve(ready);
    };
    const onLoad = () => finish(true);
    const onError = () => finish(false);
    const timer = setTimeout(() => finish(false), timeout);
    image.addEventListener('load', onLoad, { once: true });
    image.addEventListener('error', onError, { once: true });
  });
}

const preloadedImageCache = new Map();
function preloadImageAsset(src, timeout = startupTiming.assetTimeout) {
  const existing = [...document.images].find(image => image.getAttribute('src') === src);
  if (existing) {
    preloadedImageCache.set(src, existing);
    return waitForStartupImage(existing, timeout);
  }
  return new Promise(resolve => {
    const image = new Image();
    image.decoding = 'async';
    preloadedImageCache.set(src, image);
    let settled = false;
    const finish = ready => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      if (!ready) console.warn('[startup] Asset gambar dilewati:', src);
      resolve(ready);
    };
    const timer = setTimeout(() => finish(false), timeout);
    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.src = src;
  });
}

function waitForMediaAsset(media, timeout = startupTiming.assetTimeout) {
  if (!media) return Promise.resolve(false);
  if (media.readyState >= 3) return Promise.resolve(true);
  return new Promise(resolve => {
    let settled = false;
    const finish = ready => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      media.removeEventListener('canplay', onReady);
      media.removeEventListener('error', onError);
      if (!ready) console.warn('[startup] Asset media dilewati:', media.currentSrc || media.src);
      resolve(ready);
    };
    const onReady = () => finish(true);
    const onError = () => finish(false);
    const timer = setTimeout(() => finish(false), timeout);
    media.addEventListener('canplay', onReady, { once: true });
    media.addEventListener('error', onError, { once: true });
    media.load();
  });
}

let startupProgressActual = 0;
let startupProgressDisplayed = 0;
let startupProgressFrame = 0;

function paintStartupProgress(progress) {
  const fill = $('#startup-loading-fill');
  const percent = $('#startup-loading-percent');
  if (fill) fill.style.width = progress + '%';
  if (percent) percent.textContent = Math.round(progress) + '%';
}

function updateStartupProgress(completed, total) {
  startupProgressActual = total ? Math.round(completed / total * 100) : 100;
}

function resetStartupProgress() {
  if (startupProgressFrame) cancelAnimationFrame(startupProgressFrame);
  startupProgressFrame = 0;
  startupProgressActual = 0;
  startupProgressDisplayed = 0;
  paintStartupProgress(0);
}

function driveStartupProgress(assetPromise, minimumDuration) {
  let assetsDone = false;
  Promise.resolve(assetPromise).then(
    () => { assetsDone = true; },
    () => { assetsDone = true; }
  );
  return new Promise(resolve => {
    const startedAt = performance.now();
    const check = now => {
      const elapsed = now - startedAt;
      const timedTarget = Math.min(96, elapsed / minimumDuration * 96);
      const assetCap = startupProgressActual >= 100
        ? 96
        : Math.max(4, startupProgressActual * .96);
      const target = Math.min(timedTarget, assetCap);
      const remaining = target - startupProgressDisplayed;
      startupProgressDisplayed = Math.min(target, startupProgressDisplayed + Math.max(.12, remaining * .14));
      paintStartupProgress(startupProgressDisplayed);

      if (elapsed >= minimumDuration && assetsDone && startupProgressDisplayed >= 94.5) {
        startupProgressFrame = 0;
        resolve();
        return;
      }
      startupProgressFrame = requestAnimationFrame(check);
    };
    startupProgressFrame = requestAnimationFrame(check);
  });
}

async function finishStartupProgress() {
  if (startupProgressFrame) cancelAnimationFrame(startupProgressFrame);
  startupProgressFrame = 0;
  startupProgressActual = 100;
  startupProgressDisplayed = 100;
  paintStartupProgress(100);
  await sleep(300);
}

async function preloadImportantAssets(onProgress = updateStartupProgress) {
  const imageSources = [
    'assets/ui/title.png',
    'assets/ui/start.png',
    'assets/ui/load.png',
    'assets/ui/settings.png',
    'assets/ui/info-icon.jpeg',
    'assets/map/map.jpeg',
    ...['levels','levels-locked'].flatMap(folder => Array.from({length:5},(_,index)=>`assets/ui/${folder}/level-${index+1}.png`)),
    'assets/scenes/scene-1.jpeg',
    'assets/level1/characters/pose-1.png',
    'assets/level1/park-entrance.png',
    'assets/level1/npc/pak-rudi-explain.png',
    'assets/level1/npc/pak-rudi-present.png',
    'assets/level1/npc/pak-rudi-open.png',
    'assets/level1/park-partial.png',
    'assets/level1/park-clean-progression.png',
    'assets/level2/river-entrance.png',
    'assets/level2/river-dirty.png',
    'assets/level2/river-clean.png',
    ...['forest-entrance','forest-wooded','forest-cleared','forest-holes','forest-planted','forest-restored','seedling','wood-sprites-transparent','watering-animation-transparent','watering-can-transparent'].map(name => `assets/level3/new/${name}.png`),
    ...levelOneTrashV2.map(([,src]) => src),
    ...['organic','inorganic','paper'].map(type => `assets/level1/new/bins/${type}.png`),
    ...['debris','tools','sparkles'].map(name => `assets/level1/new/repair/${name}.png`),
    'assets/level1/new/ui/interact-e.png',
    'assets/level5/city-entrance-v2.png',
    'assets/level5/new/city-dirty.png',
    'assets/level5/new/city-clean.png',
    ...['bottle','plastic-bag','wrapper','paper','can','cardboard','leaves'].map(name => `assets/level5/new/trash-${name}.png`),
    'assets/level5/city-npc-warga.png',
    ...['down','up','left','right'].flatMap(direction => ['idle','walk-1','walk-2'].map(frame => `assets/player-motions/${direction}/${frame}.png`))
  ];
  const media = [
    $('#menu-video'),
    $('#menu-bgm'),
    $('#click-sfx'),
    $('#start-sfx'),
    $('#prologue-bgm'),
    $('#level-countdown-sfx'),
    $('#gameplay-intense'),
    $('#gameplay-time-warning')
  ];
  const fontReady = document.fonts
    ? Promise.race([
        document.fonts.ready.then(() => true).catch(() => false),
        sleep(startupTiming.assetTimeout).then(() => {
          console.warn('[startup] Font timeout; game tetap dilanjutkan.');
          return false;
        })
      ])
    : Promise.resolve(true);
  const tasks = [
    ...imageSources.map(src => preloadImageAsset(src)),
    ...media.map(item => waitForMediaAsset(item)),
    fontReady
  ];
  let completed = 0;
  onProgress(0, tasks.length);
  const results = await Promise.all(tasks.map(task => Promise.resolve(task)
    .catch(error => {
      console.warn('[startup] Asset gagal dimuat dan dilewati.', error);
      return false;
    })
    .then(ready => {
      completed++;
      onProgress(completed, tasks.length);
      return ready;
    })));
  const failedCount = results.filter(ready => !ready).length;
  if (failedCount) console.warn('[startup] '+failedCount+' asset utama tidak siap; game tetap dilanjutkan.');
  return { total: tasks.length, loaded: tasks.length - failedCount, failed: failedCount };
}

function finishStartup(overlay) {
  if (startupState === StartupState.READY) return;
  if (startupProgressFrame) cancelAnimationFrame(startupProgressFrame);
  startupProgressFrame = 0;
  startupState = StartupState.READY;
  if (overlay) {
    overlay.dataset.state = 'complete';
    overlay.hidden = true;
  }
  showMenu();
  overlay?.remove();
}

async function runStartupFlow() {
  const overlay = $('#startup-overlay');
  const splash = $('#startup-splash');
  const loading = $('#startup-loading');
  const status = $('#startup-loading-status');
  let dotsTimer = 0;
  if (!overlay || !splash || !loading || startupState !== StartupState.SPLASH) {
    finishStartup(overlay);
    return;
  }

  const splashReady = waitForStartupImage($('#startup-vitalcode-image'));
  const loadingReady = waitForStartupImage($('#startup-game-image'));

  try {
    $('#menu-video').pause();
    $('#menu-bgm').pause();
    resetStartupProgress();
    await sleep(startupTiming.initialBlack);

    if (await splashReady) {
      overlay.dataset.state = 'splash';
      splash.classList.add('is-visible');
      await sleep(startupTiming.splashFade + startupTiming.splashHold);
      splash.classList.remove('is-visible');
      await sleep(startupTiming.splashFade);
    }

    startupState = StartupState.LOADING;
    overlay.dataset.state = 'loading';
    await loadingReady;
    loading.classList.add('is-visible');
    let dotCount = 3;
    status.textContent = 'Memuat...';
    dotsTimer = setInterval(() => {
      dotCount = dotCount % 3 + 1;
      status.textContent = 'Memuat' + '.'.repeat(dotCount);
    }, 450);

    const importantAssetsReady = preloadImportantAssets(updateStartupProgress);
    await driveStartupProgress(importantAssetsReady, startupTiming.loadingMinimum);

    clearInterval(dotsTimer);
    dotsTimer = 0;
    await finishStartupProgress();
    status.textContent = 'Siap!';
    await sleep(startupTiming.loadingReadyHold);
    loading.classList.remove('is-visible');
    await sleep(startupTiming.finalFade);
    finishStartup(overlay);
  } catch (error) {
    console.warn('[startup] Intro dilewati karena terjadi kendala.', error);
    finishStartup(overlay);
  } finally {
    if (dotsTimer) clearInterval(dotsTimer);
  }
}

async function pausableSleep(ms, version = flowVersion) {
  let elapsed = 0;
  while (elapsed < ms) {
    if (version !== flowVersion) return false;
    await sleep(40);
    if (!paused) elapsed += 40;
  }
  return true;
}
async function scheduleLevelCallback(callback,ms){const version=flowVersion;if(await pausableSleep(ms,version))callback();}

async function typewrite(text, version) {
  const node = $('#narration');
  node.textContent = '';
  typing = true;
  finishTyping = false;
  for (const character of text) {
    if (finishTyping) {
      node.textContent = text;
      break;
    }
    node.textContent += character;
    if (!await pausableSleep(character === '.' || character === '…' ? timing.typeDelay * 5 : timing.typeDelay, version)) return false;
  }
  typing = false;
  return true;
}

async function playScene(scene, version) {
  const image = $('#scene-image');
  const narration = $('#narration-wrap');
  image.className = 'scene-image';
  narration.classList.remove('visible');
  $('#narration').textContent = '';
  image.style.backgroundImage = scene.image ? `url('${scene.image}')` : 'none';
  image.classList.toggle('placeholder', !scene.image);
  if (!await pausableSleep(90, version)) return false;
  image.classList.add('visible');
  if (!await pausableSleep(timing.fadeIn, version)) return false;
  narration.classList.add('visible');
  const [typed, stayed] = await Promise.all([
    typewrite(scene.text, version),
    pausableSleep(timing.sceneDuration, version)
  ]);
  if (!typed || !stayed || version !== flowVersion) return false;
  narration.classList.remove('visible');
  image.classList.add('leaving');
  return pausableSleep(timing.fadeOut, version);
}

async function startGame() {
  if (running) return;
  running = true;
  const version = ++flowVersion;
  playAudio($('#start-sfx'), false, .72);
  fadeAudio($('#menu-bgm'), 0, timing.menuFadeOut, true);
  $('#menu-video').pause();
  $('#menu').classList.add('exiting');
  $('#transition-curtain').classList.add('cover');
  if (!await pausableSleep(timing.menuFadeOut, version)) return;
  showScreen('#prologue');
  $('#prologue-skip').hidden = false;
  fadeAudio($('#prologue-bgm'), .5, timing.fadeIn, false, true);
  await sleep(100);
  $('#transition-curtain').classList.remove('cover');
  for (const scene of scenes) if (!await playScene(scene, version)) return;
  await playPrologueEnding(version);
}

async function playPrologueEnding(version) {
  $('#prologue-skip').hidden = true;
  showScreen('#title-card');
  fadeAudio($('#prologue-bgm'), 0, timing.titleDuration, true);
  if (!await pausableSleep(80, version)) return;
  $('#title-card').classList.add('reveal');
  if (!await pausableSleep(timing.titleDuration, version)) return;
  const prologueLoadingScreen = $('#loading');
  prologueLoadingScreen.classList.remove('prologue-leaving');
  prologueLoadingScreen.classList.add('prologue-entering');
  showScreen('#loading');
  if (!await pausableSleep(80, version)) return;
  prologueLoadingScreen.classList.remove('prologue-entering');
  if (!await pausableSleep(720, version)) return;
  const prologueLoadingBar = $('#loading-bar');
  prologueLoadingBar.style.transition = 'none';
  prologueLoadingBar.style.width = '0';
  void prologueLoadingBar.offsetWidth;
  prologueLoadingBar.style.transition = 'width 4.5s cubic-bezier(.2,.8,.2,1)';
  $('#loading-text').textContent = 'Menyiapkan peta perjalanan...';
  prologueLoadingBar.style.width = '100%';
  if (!await pausableSleep(timing.mapLoading, version)) return;
  prologueLoadingScreen.classList.add('prologue-leaving');
  if (!await pausableSleep(800, version)) return;
  showScreen('#map');
  prologueLoadingScreen.classList.remove('prologue-leaving');
  localStorage.setItem('petualanganHijauStarted', 'true');
}

function skipPrologueSlides() {
  if (!running || !$('#prologue').classList.contains('active')) return;
  finishTyping = true;
  typing = false;
  const version = ++flowVersion;
  $('#scene-image').classList.add('leaving');
  $('#narration-wrap').classList.remove('visible');
  $('#prologue-skip').hidden = true;
  playPrologueEnding(version);
}

$('#start-button').addEventListener('click', () => {
  const hasSave = typeof hasJourneySlots === 'function' ? hasJourneySlots() : Boolean(localStorage.getItem('petualanganHijauSave'));
  $('#new-game-question').textContent = hasSave ? 'Main dari awal?' : 'Main game baru?';
  $('#new-game-confirm').hidden = false;
  $('#name-form').hidden = true;
  $('#new-game-modal').hidden = false;
});
$('#new-game-cancel').addEventListener('click', () => { $('#new-game-modal').hidden = true; });
$('#new-game-ok').addEventListener('click', () => {
  $('#new-game-confirm').hidden = true;
  $('#name-form').hidden = false;
  $('#player-name-input').value = playerName === 'Pemain' ? '' : playerName;
  $('#player-name-input').focus();
});
$('#name-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#player-name-input').value.trim();
  if (!name) return;
  playerName = name.slice(0, 16);
  localStorage.setItem('petualanganHijauPlayerName', playerName);
  completedLevels = [];
  if (typeof activeSaveSlot !== 'undefined') activeSaveSlot = null;
  if (typeof journeyResumeLevel !== 'undefined') journeyResumeLevel = 1;
  unsavedChanges = true;
  refreshLevelLocks();
  $('#new-game-modal').hidden = true;
  startGame();
});
$('#prologue').addEventListener('pointerdown', () => {
  if (typing) {
    finishTyping = true;
    typing = false;
  }
});
$('#prologue-skip').addEventListener('pointerdown', event => {
  event.preventDefault();
  event.stopPropagation();
  skipPrologueSlides();
});

function playAudio(audio, restart = false, volume = .5) {
  if (!soundEnabled) return;
  audio.dataset.baseVolume = volume;
  audio.volume = volume * audioVolumeMultiplier(audio);
  if (restart) audio.currentTime = 0;
  audio.play().catch(() => {});
}

function audioVolumeMultiplier(audio) {
  return ['menu-bgm','prologue-bgm','level1-ambient','pause-idle','gameplay-intense','gameplay-time-warning'].includes(audio.id) ? musicVolume : sfxVolume;
}

document.addEventListener('pointerdown', event => {
  if (event.target.closest('button,.opening-dialog,.pak-rudi-dialog,[role="button"]')) playAudio($('#click-sfx'), true, .55);
}, true);

function fadeAudio(audio, targetVolume, duration, pauseAtEnd = false, restart = false) {
  const previousFade = audioFades.get(audio);
  if (previousFade) cancelAnimationFrame(previousFade);

  if (restart) audio.currentTime = 0;
  if (targetVolume > 0 && soundEnabled) {
    if (audio.paused) {
      audio.volume = 0;
      audio.play().catch(() => {});
    }
  }

  audio.dataset.baseVolume = targetVolume;
  targetVolume *= audioVolumeMultiplier(audio);
  const startVolume = audio.volume;
  const startedAt = performance.now();
  const tick = now => {
    const progress = Math.max(0, Math.min((now - startedAt) / duration, 1));
    audio.volume = Math.max(0, Math.min(1, startVolume + (targetVolume - startVolume) * progress));
    if (progress < 1) {
      audioFades.set(audio, requestAnimationFrame(tick));
    } else {
      audioFades.delete(audio);
      if (pauseAtEnd) audio.pause();
    }
  };
  audioFades.set(audio, requestAnimationFrame(tick));
}

function stopPrologueAudio() {
  const audio=$('#prologue-bgm');
  const fade=audioFades.get(audio);
  if(fade)cancelAnimationFrame(fade);
  audioFades.delete(audio);
  audio.pause();
  audio.currentTime=0;
  audio.volume=0;
  audio.dataset.baseVolume='0';
}

async function runLevelCountdown(selector='#shared-level-countdown',version=flowVersion,isValid=()=>true) {
  const countdown=$(selector),audio=$('#level-countdown-sfx');
  movementKeys.clear();
  gameplayCountdownActive=true;
  countdown.hidden=false;
  // Keep the supplied cue aligned with a shorter visual countdown.
  audio.playbackRate=1.55;
  playAudio(audio,true,.82);
  for(const [value,duration] of [['3',760],['2',760],['1',760],['MULAI!',420]]){
    countdown.innerHTML=`<strong>${value}</strong>`;
    if(!await pausableSleep(duration,version)||!isValid()){
      gameplayCountdownActive=false;countdown.hidden=true;audio.pause();audio.currentTime=0;audio.playbackRate=1;return false;
    }
  }
  gameplayCountdownActive=false;countdown.hidden=true;audio.pause();audio.currentTime=0;audio.playbackRate=1;
  return true;
}

// Prime supplied tracks inside the user's click so later camera/loading awaits
// cannot make the browser reject gameplay audio as autoplay.
function primeGameplayAudio(){
  if(!soundEnabled)return;
  ['#level-countdown-sfx','#gameplay-intense','#gameplay-time-warning'].forEach(selector=>{
    const audio=$(selector),fade=audioFades.get(audio);if(fade)cancelAnimationFrame(fade);audioFades.delete(audio);audio.currentTime=0;audio.volume=0;audio.play().catch(()=>{});
  });
}

function startGameplaySoundtrack(){
  gameplaySoundtrackActive=true;gameplayWarningSoundActive=false;
  const warning=$('#gameplay-time-warning');warning.pause();warning.currentTime=0;
  fadeAudio($('#gameplay-intense'),.16,900,false,true);
}
function updateGameplaySoundtrack(remaining){
  if(!gameplaySoundtrackActive||gameplayWarningSoundActive||remaining>60||remaining<=0)return;
  gameplayWarningSoundActive=true;
  fadeAudio($('#gameplay-intense'),0,950,true);
  fadeAudio($('#gameplay-time-warning'),.3,950,false,true);
}
function pauseGameplaySoundtrack(){
  if(gameplayCountdownActive)$('#level-countdown-sfx').pause();
  if(!gameplaySoundtrackActive)return;
  fadeAudio($(gameplayWarningSoundActive?'#gameplay-time-warning':'#gameplay-intense'),0,300,true);
}
function resumeGameplaySoundtrack(){
  if(gameplayCountdownActive&&soundEnabled)$('#level-countdown-sfx').play().catch(()=>{});
  if(!gameplaySoundtrackActive||paused||!soundEnabled)return;
  fadeAudio($(gameplayWarningSoundActive?'#gameplay-time-warning':'#gameplay-intense'),gameplayWarningSoundActive ? .3 : .16,450);
}
function stopGameplaySoundtrack(duration=500){
  gameplaySoundtrackActive=false;gameplayWarningSoundActive=false;gameplayCountdownActive=false;
  ['#shared-level-countdown','#level-countdown','#river-countdown'].forEach(selector=>{const node=$(selector);if(node)node.hidden=true;});
  const countdown=$('#level-countdown-sfx');countdown.pause();countdown.currentTime=0;
  fadeAudio($('#gameplay-intense'),0,duration,true);
  fadeAudio($('#gameplay-time-warning'),0,duration,true);
}

function startLevelOneAudio() {
  ['#level1-pickup','#level1-dispose','#level1-success','#level1-fail'].forEach(selector => {
    const audio = $(selector); audio.pause(); audio.currentTime = 0;
  });
  const steps = $('#level1-steps'); steps.pause(); steps.currentTime = 0;
  fadeAudio($('#level1-ambient'), .24, 1400, false, true);
}

function stopLevelOneAudio(duration = 900) {
  const steps = $('#level1-steps'); steps.pause(); steps.currentTime = 0;
  fadeAudio($('#level1-ambient'), 0, duration, true);
}

function setLevelFootsteps(moving) {
  const steps = $('#level1-steps');
  if (moving && (parkEntranceActive || levelOneGameplay) && !paused && soundEnabled) {
    steps.dataset.baseVolume = .42;
    steps.volume = .42 * sfxVolume;
    if (steps.paused) steps.play().catch(() => {});
  } else if (!steps.paused) {
    steps.pause();
  }
}

function playDisposeSound() {
  const audio = $('#level1-dispose');
  playAudio(audio, true, .68);
}

function showGlobalToast(message) {
  const toast = $('#global-toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showGlobalToast.timer);
  showGlobalToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  document.querySelectorAll('audio').forEach(audio => { audio.muted = !soundEnabled; });
  if(enabled&&gameplaySoundtrackActive&&!paused)resumeGameplaySoundtrack();
  ['#audio-toggle','#settings-audio-toggle'].forEach(selector => {
    const button = $(selector);
    if (!button) return;
    button.classList.toggle('active', soundEnabled);
    button.setAttribute('aria-label', soundEnabled ? 'Audio aktif' : 'Audio mati');
  });
}

function applyVolumeSettings() {
  document.querySelectorAll('audio').forEach(audio => {
    const base = Number(audio.dataset.baseVolume);
    if (Number.isFinite(base)) audio.volume = Math.min(1, base * audioVolumeMultiplier(audio));
  });
}

function showMenu() {
  stopJourneyCheckpoint();
  if (typeof stopPostLevelExit === 'function') stopPostLevelExit();
  stopGameplaySoundtrack(250);
  running = false;
  levelOneActive = false;
  levelOneGameplay = false;
  parkEntranceActive = false;
  pakRudiDialogActive = false;
  movementKeys.clear();
  riverGameplay = false;
  levelThreeActive = false;
  forestGameplay = false;
  forestInteractionHeld = false;
  levelFourActive = false;
  factoryGameplay = false;
  activeFactorySystem = null;
  flowVersion++;
  paused = false;
  closePause();
  $('#title-card').classList.remove('reveal');
  $('#loading-bar').style.width = '0';
  $('#loading').classList.remove('prologue-entering','prologue-leaving');
  $('#menu').classList.remove('exiting');
  stopPrologueAudio();
  stopLevelOneAudio(500);
  showScreen('#menu');
  $('#menu-video').play().catch(() => {});
  playAudio($('#menu-bgm'), false, .42);
}

function openSavedMap() {
  if (typeof readJourneySave==='function' ? !readJourneySave() : !localStorage.getItem('petualanganHijauSave')) {
    showGlobalToast('Belum ada data permainan yang tersimpan.');
    return;
  }
  loadProgress();
  unsavedChanges = false;
  $('#menu-bgm').pause();
  $('#menu-video').pause();
  showScreen('#map');
}

$('#load-button').addEventListener('click', () => openContinuePopup());

function saveProgress() {
  if(typeof writeJourneySave==='function')return writeJourneySave(true);
  if ($('#menu').classList.contains('active')) {
    showGlobalToast('Mulai permainan dahulu sebelum menyimpan.');
    return;
  }
  localStorage.setItem('petualanganHijauSave', JSON.stringify({ screen: 'map', savedAt: Date.now(), levels: completedLevels, playerName }));
  if (typeof refreshSaveUI === 'function') refreshSaveUI();
  showGlobalToast('✓ Progres perjalanan tersimpan');
  unsavedChanges = false;
  $('#save-toast').textContent = 'Perjalanan tersimpan';
  $('#save-toast').classList.add('show');
  setTimeout(() => $('#save-toast').classList.remove('show'), 1800);
}

function loadProgress() {
  if(typeof readJourneySave==='function'){const save=readJourneySave();completedLevels=save?.levels||[];if(save?.playerName)playerName=save.playerName;return;}
  try {
    const save = JSON.parse(localStorage.getItem('petualanganHijauSave'));
    completedLevels = Array.isArray(save?.levels) ? save.levels : [];
    if (save?.playerName) playerName = save.playerName;
  } catch {
    completedLevels = [];
  }
}

function refreshLevelLocks() {
  document.querySelectorAll('.level-button').forEach(button => {
    const level = Number(button.dataset.level);
    const unlocked = isLevelUnlocked(level);
    const completed = completedLevels.includes(level);
    button.classList.toggle('locked', !unlocked);
    button.classList.toggle('completed', completed);
    button.setAttribute('aria-disabled', String(!unlocked));
    button.querySelector('img').src = unlocked
      ? `assets/ui/levels/level-${level}.png`
      : `assets/ui/levels-locked/level-${level}.png`;
  });
  document.querySelectorAll('.route-segment').forEach(segment => {
    segment.classList.toggle('route-locked', !isLevelUnlocked(Number(segment.dataset.toLevel)));
  });
  if(typeof refreshMapClouds==='function')refreshMapClouds();
}

function isLevelUnlocked(level, levels=completedLevels){return level===1||Array.from({length:level-1},(_,index)=>index+1).every(previous=>levels.includes(previous));}

// Panggil dari gameplay ketika sebuah level berhasil diselesaikan.
function completeLevel(level) {
  if (!completedLevels.includes(level)) completedLevels.push(level);
  saveProgress();
  refreshLevelLocks();
}

let pauseCloseTimer = 0;
function openPause() {
  clearTimeout(pauseCloseTimer);
  paused = true;
  resetInteractionState();
  setLevelFootsteps(false);
  pauseGameplaySoundtrack();
  if ($('#prologue').classList.contains('active')) fadeAudio($('#prologue-bgm'), 0, 500, true);
  if ($('#level-1-screen').classList.contains('active')) fadeAudio($('#level1-ambient'), 0, 500, true);
  fadeAudio($('#pause-idle'), .34, 700, false, true);
  $('#pause-overlay').hidden = false;
  requestAnimationFrame(() => {
    $('#pause-overlay').classList.add('open');
    syncGamePhase();
  });
}

function closePause() {
  if ($('#pause-overlay').hidden) {
    paused = false;
    syncGamePhase();
    return;
  }
  clearTimeout(pauseCloseTimer);
  $('#pause-overlay').classList.remove('open');
  fadeAudio($('#pause-idle'), 0, 450, true);
  pauseCloseTimer = setTimeout(() => {
    if ($('#pause-overlay').classList.contains('open')) return;
    $('#pause-overlay').hidden = true;
    paused = false;
    resumeGameplaySoundtrack();
    if ($('#prologue').classList.contains('active')) fadeAudio($('#prologue-bgm'), .5, 650);
    if ($('#level-1-screen').classList.contains('active') && levelOneActive) fadeAudio($('#level1-ambient'), .24, 650);
    syncGamePhase();
  }, 450);
}

$('#pause-button').addEventListener('click', openPause);
$('#resume-button').addEventListener('click', closePause);
$('#pause-save').addEventListener('click', () => saveProgress());
$('#exit-button').addEventListener('click', () => {
  $('#exit-confirm-modal').hidden = false;
});
$('#exit-confirm-no').addEventListener('click', () => { $('#exit-confirm-modal').hidden = true; });
$('#exit-confirm-yes').addEventListener('click', () => {
  $('#exit-confirm-modal').hidden = true;
  unsavedChanges = false;
  levelOneActive = false;
  parkEntranceActive = false;
  pakRudiDialogActive = false;
  riverGameplay = false;
  levelThreeActive = false;
  forestGameplay = false;
  forestInteractionHeld = false;
  levelFourActive = false;
  factoryGameplay = false;
  movementKeys.clear();
  showMenu();
});
$('#audio-toggle')?.addEventListener('click', () => {
  setSoundEnabled(!soundEnabled);
  if (soundEnabled && levelOneActive) {
    playAudio($('#level1-ambient'), false, .24);
  }
});
let mapTransitioning=false;
async function enterMapLevel(level){
  if(mapTransitioning||paused||!isLevelUnlocked(level))return;
  mapTransitioning=true;movementKeys.clear();
  const map=$('#map'),curtain=$('#transition-curtain');
  $('#pause-button').hidden=true;
  map.classList.add('map-exiting');
  curtain.classList.add('level-transition','cover');
  await sleep(850);
  try{
    levelStarters[level-1]();
    $('#pause-button').hidden=true;
    await sleep(100);
    curtain.classList.remove('cover');
    await sleep(850);
  }finally{
    map.classList.remove('map-exiting');
    curtain.classList.remove('cover','level-transition');
    mapTransitioning=false;
    $('#pause-button').hidden=!document.querySelector('.screen.active')?.id.startsWith('level-');
  }
}
document.querySelectorAll('.level-button').forEach(button => {
  button.addEventListener('click', () => {
    if (button.classList.contains('locked')) {
      $('#save-toast').textContent = `Selesaikan Level ${Number(button.dataset.level) - 1} terlebih dahulu`;
      $('#save-toast').classList.add('show');
      setTimeout(() => $('#save-toast').classList.remove('show'), 1800);
      return;
    }
    enterMapLevel(Number(button.dataset.level));
  });
});
loadProgress();
refreshLevelLocks();

const entranceIntroLines = [
  ['assets/level1/characters/pose-1.png','Jadi ini Taman Kota... salah satu ruang hijau yang seharusnya menjadi tempat warga beristirahat.'],
  ['assets/level1/characters/pose-2.png','Dari luar saja kondisinya sudah terlihat kurang terawat. Aku harus mencari tahu apa yang terjadi.'],
  ['assets/level1/characters/pose-3.png','Sepertinya ada petugas taman di dekat gerbang. Aku akan bicara dengannya lebih dulu.']
];
const openingLines = [
  ['assets/level1/characters/pose-1.png','Taman ini seharusnya menjadi tempat yang nyaman…'],
  ['assets/level1/characters/pose-2.png','Tapi sekarang malah dipenuhi sampah.'],
  ['assets/level1/characters/pose-3.png','Aku harus membersihkannya sebelum hari semakin sore.']
];
const closingLinesByOutcome = {
  good: [
    ['assets/level1/characters/pose-1.png','Akhirnya... taman ini kembali bersih dan fasilitasnya sudah berfungsi.'],
    ['assets/level1/characters/pose-2.png','Memilah sampah dengan benar dan merawat fasilitas bisa membuat perubahan besar.'],
    ['assets/level1/characters/pose-3.png','Masih banyak tempat lain yang membutuhkan perhatian.']
  ],
  bad: [
    ['assets/level1/characters/pose-1.png','Waktunya habis, sementara taman ini masih terlihat kotor.'],
    ['assets/level1/characters/pose-2.png','Aku belajar bahwa kebersihan membutuhkan tindakan yang cepat dan tepat.'],
    ['assets/level1/characters/pose-3.png','Di tempat berikutnya aku harus berusaha lebih baik.']
  ]
};
function getLevelOneClosingLines(){return closingLinesByOutcome[levelOneOutcome] || closingLinesByOutcome.bad;}
const PLAYER_WALK_FRAME_MS = 110;
const PLAYER_WALK_FRAME_COUNT = 2;
const playerSprites = Object.fromEntries(['down','up','left','right'].map(direction => [
  direction,
  ['idle','walk-1','walk-2'].map(frame => `assets/player-motions/${direction}/${frame}.png`)
]));

function setGameplaySprite(target, direction, moving = false, now = performance.now()) {
  const image = typeof target === 'string' ? $(target) : target;
  if (!image) return;
  const safeDirection = playerSprites[direction] ? direction : 'down';
  const directionChanged = image.dataset.walkDirection !== safeDirection;
  const startedMoving = image.dataset.walking !== 'true';
  if (!moving) {
    delete image.dataset.walkStarted;
  } else if (directionChanged || startedMoving || !image.dataset.walkStarted) {
    image.dataset.walkStarted = String(now);
  }
  const elapsed = moving ? Math.max(0, now - Number(image.dataset.walkStarted || now)) : 0;
  const frameIndex = moving ? 1 + Math.floor(elapsed / PLAYER_WALK_FRAME_MS) % PLAYER_WALK_FRAME_COUNT : 0;
  const source = playerSprites[safeDirection][frameIndex];
  if (image.getAttribute('src') !== source) image.setAttribute('src', source);
  image.dataset.walkDirection = safeDirection;
  image.dataset.walking = String(moving);
}
let playerDirection = 'down';
let openingIndex = 0;
let dialogTyping = false;
let dialogFinish = false;
let dialogMode = 'entrance-intro';
let riverPlayerPosition = { x:50, y:70 };
let riverDialogIndex = 0;
let riverDialogTyping = false;
let riverDialogFinish = false;
let riverDialogMode = 'entrance-intro';
let riverStage=1,riverTime=150,riverShoreCleaned=0,riverNetCaught=0,riverClogCleared=0,riverMiniGame=null,riverNetX=50,riverFloating=[];
let riverCarriedTrash=null,riverEnding=false,riverOutcome='dirty';
let riverEntranceActive=false,riverEntranceStage='approach',riverEntrancePlayer={x:50,y:84},riverEntranceDirection='up';
let riverNpcDialogActive=false,riverNpcDialogIndex=0,riverNpcDialogTyping=false,riverNpcDialogFinish=false;
let riverRun=0;
function stopRiverSession(){riverRun++;riverGameplay=false;riverEntranceActive=false;riverNpcDialogActive=false;riverMiniGame=null;movementKeys.clear();$('#river-steps').pause();$('#river-player').classList.remove('walking');$('#river-entrance-player')?.classList.remove('walking');}
let riverDirection='down';
function updateRiverMotion(dx, dy, now = performance.now()) {
  const moving = (dx !== 0 || dy !== 0) && riverGameplay && !paused;
  $('#river-player').classList.toggle('walking', moving);
  const steps = $('#river-steps');
  if (moving && soundEnabled) {
    steps.dataset.baseVolume = .42;
    steps.volume = .42 * sfxVolume;
    if (steps.paused) steps.play().catch(() => {});
  } else if (!steps.paused) steps.pause();
  if (moving) riverDirection = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  setGameplaySprite('#river-player img', riverDirection, moving, now);
}
const riverEntranceIntroLines = [
  ['assets/level1/characters/pose-1.png','Ini pasti sungai yang disebut Pak Rudi. Dari sini saja airnya sudah terlihat keruh.'],
  ['assets/level1/characters/pose-2.png','Aku perlu mencari petugas yang menjaga area ini sebelum masuk lebih jauh.']
];
const riverNpcLines = [
  'Kamu datang tepat waktu. Sungai ini dipenuhi sampah dari bantaran sampai ke aliran utama.',
  'Pilah sampah di tepi sungai, lalu gunakan jaring tanpa mengenai ikan yang masih hidup di sana.',
  'Terakhir, angkat sumbatan agar air bisa mengalir kembali. Aku akan membuka jalannya untukmu.'
];
const riverNpcPortraits = ['assets/level1/npc/pak-rudi-present.png','assets/level1/npc/pak-rudi-explain.png','assets/level1/npc/pak-rudi-open.png'];
const riverOpeningLines = [
  ['assets/level1/characters/pose-1.png','Air sungai ini kelihatan jauh lebih keruh…'],
  ['assets/level1/characters/pose-2.png','Banyak sampah tersangkut di alirannya.'],
  ['assets/level1/characters/pose-3.png','Kalau dibiarkan, aliran sungainya bisa semakin tersumbat.']
];
const riverClosingLinesByOutcome = {
  clean: [
    ['assets/level1/characters/pose-1.png','Air sungai kembali mengalir jernih dan semua sampah sudah tertangani.'],
    ['assets/level1/characters/pose-2.png','Menjaga bantaran, melindungi ikan, dan membuka sumbatan sama pentingnya.'],
    ['assets/level1/characters/pose-3.png','Sungai yang bersih menjaga kehidupan di sepanjang alirannya.']
  ],
  partial: [
    ['assets/level1/characters/pose-1.png','Waktunya habis, tetapi sebagian aliran sungai sudah berhasil dipulihkan.'],
    ['assets/level1/characters/pose-2.png','Sampah yang terangkat tetap membuat sungai lebih aman bagi ikan.'],
    ['assets/level1/characters/pose-3.png','Aku akan membawa pelajaran ini ke wilayah berikutnya.']
  ],
  dirty: [
    ['assets/level1/characters/pose-1.png','Waktunya habis dan sungai ini masih membutuhkan banyak perhatian.'],
    ['assets/level1/characters/pose-2.png','Aku harus lebih cepat memilah sampah tanpa membahayakan ikan.'],
    ['assets/level1/characters/pose-3.png','Perjalanan tetap berlanjut, dan aku akan berusaha lebih baik.']
  ]
};
function getRiverClosingLines(){return riverClosingLinesByOutcome[riverOutcome] || riverClosingLinesByOutcome.dirty;}

function getRiverDialogLines(){
  if(riverDialogMode==='closing')return getRiverClosingLines();
  if(riverDialogMode==='entrance-intro')return riverEntranceIntroLines;
  return riverOpeningLines;
}
function updateRiverEntrancePlayer(){
  const player=$('#river-entrance-player');player.style.left=`${riverEntrancePlayer.x}%`;player.style.top=`${riverEntrancePlayer.y}%`;
}
function isRiverEntranceWalkable(x,y){return x>=8&&x<=92&&y>=47&&y<=92;}
function nearestRiverEntranceTarget(){
  const target=riverEntranceStage==='approach'?{type:'npc',x:29,y:55,label:'BICARA DENGAN PAK RUDI'}:riverEntranceStage==='gate'?{type:'gate',x:69,y:58,label:'MASUK KE AREA SUNGAI'}:null;
  const prompt=$('#river-entrance-prompt');if(!target||riverNpcDialogActive){prompt.classList.remove('show');return null;}
  const distance=Math.hypot(target.x-riverEntrancePlayer.x,target.y-riverEntrancePlayer.y);prompt.style.left=`${target.x}%`;prompt.style.top=`${target.y-6}%`;prompt.querySelector('span').textContent=target.label;prompt.classList.toggle('show',distance<9);
  return distance<9?target:null;
}
function updateRiverEntranceMotion(dx,dy,now=performance.now()){
  const moving=Boolean(dx||dy)&&riverEntranceActive&&!paused&&!riverNpcDialogActive;const player=$('#river-entrance-player');player.classList.toggle('walking',moving);
  if(moving)riverEntranceDirection=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');setGameplaySprite('#river-entrance-player-sprite',riverEntranceDirection,moving,now);
  const steps=$('#river-steps');if(moving&&soundEnabled){steps.dataset.baseVolume=.42;steps.volume=.42*sfxVolume;if(steps.paused)steps.play().catch(()=>{});}else if(!steps.paused)steps.pause();
}
async function typeRiverNpcLine(){
  const run=riverRun,version=flowVersion,text=riverNpcLines[riverNpcDialogIndex],node=$('#river-npc-text'),portrait=$('#river-npc-dialog-portrait');node.textContent='';riverNpcDialogTyping=true;riverNpcDialogFinish=false;portrait.src=riverNpcPortraits[riverNpcDialogIndex%riverNpcPortraits.length];portrait.classList.remove('pose-in');void portrait.offsetWidth;portrait.classList.add('pose-in');
  for(const char of text){if(run!==riverRun||!riverNpcDialogActive)return;if(riverNpcDialogFinish){node.textContent=text;break;}node.textContent+=char;if(!await pausableSleep(32,version))return;}if(run===riverRun)riverNpcDialogTyping=false;
}
function openRiverNpcDialog(){if(riverNpcDialogActive||riverEntranceStage!=='approach')return;riverNpcDialogActive=true;riverNpcDialogIndex=0;movementKeys.clear();updateRiverEntranceMotion(0,0);$('#river-entrance-prompt').classList.remove('show');$('#river-npc-dialog').hidden=false;typeRiverNpcLine();}
function advanceRiverNpcDialog(){
  if(!riverNpcDialogActive||paused)return;if(riverNpcDialogTyping){riverNpcDialogFinish=true;return;}riverNpcDialogIndex++;if(riverNpcDialogIndex<riverNpcLines.length){typeRiverNpcLine();return;}
  riverNpcDialogActive=false;riverEntranceStage='gate';$('#river-npc-dialog').hidden=true;$('#river-entrance-gate').classList.add('open');nearestRiverEntranceTarget();showGlobalToast('Jalur menuju sungai sudah dibuka.');
}
async function enterRiverFromGate(){
  if(riverEntranceStage!=='gate'||!riverEntranceActive)return;riverEntranceStage='transition';riverEntranceActive=false;movementKeys.clear();updateRiverEntranceMotion(0,0);$('#river-entrance-prompt').classList.remove('show');$('#river-entrance').classList.add('leaving');const run=riverRun,version=flowVersion;
  const loading=$('#river-entry-loading');loading.hidden=false;requestAnimationFrame(()=>loading.classList.add('visible'));if(!await pausableSleep(1450,version)||run!==riverRun)return;
  $('#river-entrance').hidden=true;loading.classList.remove('visible');if(!await pausableSleep(350,version)||run!==riverRun)return;loading.hidden=true;riverDialogMode='mission-intro';riverDialogIndex=0;riverDialogTyping=false;$('#river-dialog').className='opening-dialog mission-intro';showRiverDialogLine();
}
function interactRiverEntrance(){if(!riverEntranceActive||paused||riverNpcDialogActive)return;const target=nearestRiverEntranceTarget();if(!target)return;if(target.type==='npc')openRiverNpcDialog();else enterRiverFromGate();}
$('#river-npc-dialog').addEventListener('click',advanceRiverNpcDialog);
$('#river-entrance-interact').addEventListener('pointerdown',event=>{event.preventDefault();runInteraction('river-entrance',interactRiverEntrance);});

function updateRiverProgress(){
  const completed=riverShoreCleaned+riverNetCaught+riverClogCleared,percent=Math.min(100,Math.round(completed/23*100));$('#river-clean-progress').textContent=`${percent}%`;$('#river-cleanliness-bar').value=percent;$('#river-cleanliness-bar').textContent=`${percent}%`;
}
function resetRiverCleanReveals(){$('#river-clean-reveal').replaceChildren();}
function addRiverCleanReveal(x,y,radius=8,key=''){
  if(key&&$(`#river-clean-reveal [data-reveal-key="${key}"]`))return;const patch=document.createElement('i');patch.dataset.revealKey=key;patch.style.setProperty('--reveal-x',`${x}%`);patch.style.setProperty('--reveal-y',`${y}%`);patch.style.setProperty('--reveal-radius',`${radius}%`);$('#river-clean-reveal').append(patch);
}

async function enterLevelTwo(){
  const curtain=$('#transition-curtain'),bar=$('#loading-bar');
  curtain.classList.add('level-transition','cover');await sleep(900);
  $('#loading-text').textContent='Memuat Level 2: Sungai...';bar.style.transition='none';bar.style.width='0';showScreen('#loading');void bar.offsetWidth;bar.style.transition='width 2.2s cubic-bezier(.2,.8,.2,1)';curtain.classList.remove('cover');await sleep(120);bar.style.width='100%';await sleep(2400);curtain.classList.add('cover');await sleep(900);
  startLevelTwo();await sleep(100);curtain.classList.remove('cover');await sleep(900);curtain.classList.remove('level-transition');bar.style.transition='';$('#loading-text').textContent='Memuat perjalanan...';
}

function startLevelTwo(){
  riverDirection='down';riverEntranceDirection='up';setGameplaySprite('#river-player img','down',false);setGameplaySprite('#river-entrance-player-sprite','up',false);$('#river-player').classList.remove('walking');$('#river-entrance-player').classList.remove('walking');$('#river-steps').pause();
  riverRun++;resetInteractionState();resetTimerAlert('river', $('.river-timer'));riverFloating=[];riverDialogFinish=false;$('#net-stream').innerHTML='';$('#clog-items').innerHTML='';
  showScreen('#level-2-screen');riverGameplay=false;riverMiniGame=null;riverStage=1;riverTime=150;riverShoreCleaned=0;riverNetCaught=0;riverClogCleared=0;riverCarriedTrash=null;riverEnding=false;riverOutcome='dirty';riverPlayerPosition={x:50,y:70};riverEntrancePlayer={x:50,y:84};riverEntranceStage='approach';riverEntranceActive=false;riverNpcDialogActive=false;riverNpcDialogIndex=0;riverNpcDialogTyping=false;riverNpcDialogFinish=false;riverDialogIndex=0;riverDialogMode='entrance-intro';riverDialogTyping=false;
  $('#level-2-screen').className='screen level-two active intro-mode entrance-mode';$('#river-world').classList.remove('partial','restored');$('#river-camera').classList.remove('camera-live');$('#river-camera').classList.add('overview');
  $('#river-ready').hidden=true;$('#river-countdown').hidden=true;$('#river-net-game').hidden=true;$('#river-clog-game').hidden=true;$('#river-inspection').hidden=true;$('#river-complete').hidden=true;$('#river-game-over').hidden=true;$('#river-stage-point').hidden=true;
  $('#river-progress').textContent='0 / 3 Tahap';$('#river-subprogress').textContent='PILAH SAMPAH · 0 / 7';$('#river-sorting-bins').classList.add('hidden');$('#river-shore-trash').replaceChildren();$('#river-carry-hud').hidden=true;$('#river-carried-icon').replaceChildren();resetRiverCleanReveals();updateRiverProgress();updateRiverTimer();
  $('#river-entrance').hidden=false;$('#river-entrance').classList.remove('leaving');$('#river-entrance-gate').classList.remove('open');$('#river-npc-dialog').hidden=true;$('#river-entrance-prompt').classList.remove('show');$('#river-entry-loading').hidden=true;$('#river-entry-loading').classList.remove('visible');updateRiverEntrancePlayer();
  $('#river-player-name').textContent=playerName;$('#river-dialog-text').textContent='';$('#river-dialog').className='opening-dialog awaiting-dialog-tap';updateRiverPlayer();
}

async function showRiverDialogLine(){
  const run=riverRun,version=flowVersion;
  const lines=getRiverDialogLines();const [image,text]=lines[riverDialogIndex];
  $('#river-dialog-character').src=image;$('#river-dialog-text').textContent='';riverDialogTyping=true;riverDialogFinish=false;
  for(const char of text){if(run!==riverRun)return;if(riverDialogFinish){$('#river-dialog-text').textContent=text;break}$('#river-dialog-text').textContent+=char;if(!await pausableSleep(38,version))return}if(run===riverRun)riverDialogTyping=false;
}

$('#river-dialog').addEventListener('click',()=>{
  if(paused||!$('#level-2-screen').classList.contains('active')||$('#river-dialog').classList.contains('hidden'))return;
  const dialog=$('#river-dialog');if(dialog.classList.contains('awaiting-dialog-tap')){dialog.classList.remove('awaiting-dialog-tap');riverDialogIndex=0;showRiverDialogLine();return}
  if(dialog.classList.contains('awaiting-character')){dialog.classList.remove('awaiting-character');dialog.classList.add('character-only');return}
  if(dialog.classList.contains('character-only')){dialog.classList.remove('character-only');riverDialogIndex=0;showRiverDialogLine();return}
  if(riverDialogTyping){riverDialogFinish=true;return}riverDialogIndex++;const lines=getRiverDialogLines();
  if(riverDialogIndex<lines.length)showRiverDialogLine();else{dialog.classList.add('hidden');if(riverDialogMode==='closing'){if(riverOutcome==='clean')enablePostLevelExit(2);else $('#river-complete').hidden=false;}else if(riverDialogMode==='entrance-intro'){riverEntranceActive=true;nearestRiverEntranceTarget();showGlobalToast('Dekati Pak Rudi lalu tekan E.');}else $('#river-ready').hidden=false;}
});
async function beginRiverGameplay(){const run=riverRun,version=flowVersion;if(paused||riverGameplay||riverEnding)return;primeGameplayAudio();movementKeys.clear();$('#river-ready').hidden=true;createRiverShoreTrash();$('#river-sorting-bins').classList.remove('hidden');$('#level-2-screen').classList.remove('intro-mode','entrance-mode');$('#river-camera').classList.remove('overview');updateRiverCamera();if(!await pausableSleep(950,version)||run!==riverRun)return;if(!await runLevelCountdown('#river-countdown',version,()=>run===riverRun&&!riverEnding))return;$('#river-camera').classList.add('camera-live');updateRiverCamera();riverGameplay=true;unsavedChanges=true;startGameplaySoundtrack();showGlobalToast('PULIHKAN ALIRAN SUNGAI');}

$('#river-ready-start').addEventListener('click',()=>{if(!paused)beginRiverGameplay()});
$('#river-ready-back').addEventListener('click',()=>{riverGameplay=false;showScreen('#map')});
$('#river-continue').addEventListener('click',()=>{$('#river-complete').hidden=true;beginReturnToNpc(2)});
$('#river-retry').addEventListener('click',startLevelTwo);$('#river-fail-map').addEventListener('click',()=>{riverGameplay=false;showScreen('#map')});

function updateRiverPlayer(){
  const player=$('#river-player');player.style.left=`${riverPlayerPosition.x}%`;player.style.top=`${riverPlayerPosition.y}%`;$('#river-interact').style.left=`${riverPlayerPosition.x}%`;$('#river-interact').style.top=`${riverPlayerPosition.y}%`;updateRiverCamera();
}
function updateRiverCamera(){
  const viewport=$('#river-world'),camera=$('#river-camera');const vw=viewport.clientWidth,vh=viewport.clientHeight,cw=camera.offsetWidth,ch=camera.offsetHeight;
  const x=Math.max(vw-cw,Math.min(0,vw/2-riverPlayerPosition.x/100*cw));const y=Math.max(vh-ch,Math.min(0,vh/2-riverPlayerPosition.y/100*ch));camera.style.transform=`translate3d(${x}px,${y}px,0)`;
}
function updateRiverTimer(){const value=Math.max(0,Math.ceil(riverTime));$('#river-timer').textContent=String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');const hud=$('.river-timer');hud.classList.toggle('warning',riverTime<=60&&riverTime>30);hud.classList.toggle('critical',riverTime<=30);updateTimerAlert('river',riverTime,hud);if($('#river-mini-time'))$('#river-mini-time').textContent=formatTime(riverTime);if($('#river-clog-time'))$('#river-clog-time').textContent=formatTime(riverTime);}
const riverShoreTrashItems = [
  ['inorganic','shore-bag.png','Kantong plastik',16,70],
  ['inorganic','shore-bottle.png','Botol plastik',28,82],
  ['inorganic','shore-can.png','Kaleng minuman',42,88],
  ['inorganic','shore-wrapper.png','Bungkus makanan',22,52],
  ['paper','floating-cardboard.png','Kardus basah',12,42],
  ['paper','shore-cup.png','Gelas kertas',38,67],
  ['organic','clog-leaves.png','Tumpukan daun',55,91]
];
function createRiverShoreTrash(){
  const layer=$('#river-shore-trash');layer.innerHTML='';
  riverShoreTrashItems.forEach(([type,asset,name,x,y],index)=>{const button=document.createElement('button');button.className='river-trash';button.dataset.type=type;button.dataset.name=name;button.dataset.index=index;button.dataset.x=x;button.dataset.y=y;button.style.left=`${x}%`;button.style.top=`${y}%`;button.innerHTML=`<img src="assets/level2/${asset}" alt="${name}">`;layer.appendChild(button)});
}
function nearestRiverTarget(){
  let target=null,distance=999;
  if(riverStage===1){
    const selector=riverCarriedTrash?'.river-bin':'.river-trash:not(.collected):not([hidden])';
    document.querySelectorAll(selector).forEach(item=>{const x=Number(item.dataset.x??parseFloat(item.style.left)),y=Number(item.dataset.y??parseFloat(item.style.top));const d=Math.hypot(x-riverPlayerPosition.x,y-riverPlayerPosition.y);item.classList.toggle('near',d<5.5);if(d<distance){distance=d;target=item}});
  }else{
    const point=$('#river-stage-point');const d=Math.hypot(Number(point.dataset.x)-riverPlayerPosition.x,Number(point.dataset.y)-riverPlayerPosition.y);distance=d;target=point;
  }
  $('#river-interact').textContent=riverStage===1?(riverCarriedTrash?'[F] BUANG / PILAH':'[E] AMBIL'):riverStage===2?'[E] MULAI MENJARING':'[E] BERSIHKAN SUMBATAN';
  $('#river-interact').classList.toggle('show',distance<6);return distance<6?target:null;
}
function clearRiverCarry(){
  riverCarriedTrash=null;$('#river-carried-icon').replaceChildren();$('#river-carry-hud').hidden=true;$('#river-player').classList.remove('carrying');
}
function interactRiver(action='pickup'){
  if(!riverGameplay||paused)return;const target=nearestRiverTarget();if(!target)return;unsavedChanges=true;
  if(riverStage===1&&!riverCarriedTrash&&action==='pickup'&&target.classList.contains('river-trash')){
    riverCarriedTrash=target;target.hidden=true;$('#river-player').classList.add('carrying');const image=target.querySelector('img').cloneNode();$('#river-carried-icon').replaceChildren(image);$('#river-carry-name').textContent=target.dataset.name;$('#river-carry-hud').hidden=false;playAudio($('#level1-pickup'),true,.7);showGlobalToast('Sampah diambil. Tekan F di tempat sampah yang sesuai.');
  }else if(riverStage===1&&riverCarriedTrash&&action==='dispose'&&target.classList.contains('river-bin')){
    if(target.dataset.type===riverCarriedTrash.dataset.type){const cleaned=riverCarriedTrash,x=Number(cleaned.dataset.x),y=Number(cleaned.dataset.y);cleaned.remove();clearRiverCarry();riverShoreCleaned++;addRiverCleanReveal(x,y,9,`shore-${cleaned.dataset.index}`);updateRiverProgress();playDisposeSound();$('#river-subprogress').textContent=`PILAH SAMPAH · ${riverShoreCleaned} / 7`;if(riverShoreCleaned===7){riverStage=2;$('#river-progress').textContent='1 / 3 Tahap';$('#river-subprogress').textContent='SAMPAH MENGAMBANG · 0 / 10';$('#river-sorting-bins').classList.add('hidden');showGlobalToast('Bantaran bersih. Cari titik untuk mulai menjaring!');setRiverStagePoint(68,56)}}
    else{riverTime=Math.max(0,riverTime-5);updateRiverTimer();playAudio($('#level1-fail'),true,.5);showGlobalToast('Jenis tempat sampah salah · -5 DETIK');if(riverTime<=0)riverGameOver('time')}
  }else if(riverStage===1&&riverCarriedTrash&&action==='pickup')showGlobalToast('Tekan F di dekat tempat sampah untuk membuang.');
  else if(riverStage===2)startNetGame();else startClogGame();
}
function setRiverStagePoint(x,y){const point=$('#river-stage-point');point.dataset.x=x;point.dataset.y=y;point.style.left=`${x}%`;point.style.top=`${y}%`;point.hidden=false}
function startNetGame(){riverGameplay=false;riverMiniGame='net';$('#river-stage-point').hidden=true;$('#river-interact').classList.remove('show');$('#river-net-game').hidden=false;riverNetX=50;riverNetCaught=0;riverFloating=[];$('#net-progress').textContent=`0 / ${riverNetGoal}`;$('#net-stream').innerHTML='';for(let i=0;i<3;i++)spawnFloatingTrash(i*32)}
$('#river-touch-interact').addEventListener('click',()=>runInteraction('level-2',()=>interactRiver(riverCarriedTrash?'dispose':'pickup')));
const floatingAssets=['floating-bottle.png','floating-bag.png','shore-cup.png','floating-can.png','floating-wrapper.png'];
function spawnFloatingTrash(offset=0){const el=document.createElement('img');el.className='floating-trash';el.src=`assets/level2/${floatingAssets[Math.floor(Math.random()*floatingAssets.length)]}`;$('#net-stream').appendChild(el);riverFloating.push({el,x:-8-offset,y:18+Math.random()*18,speed:14+Math.random()*8,fallSpeed:12+Math.random()*8})}
function updateNetGame(dt){
  if(movementKeys.has('a')||movementKeys.has('arrowleft'))riverNetX-=42*dt;if(movementKeys.has('d')||movementKeys.has('arrowright'))riverNetX+=42*dt;riverNetX=Math.max(8,Math.min(92,riverNetX));$('#river-net').style.left=`${riverNetX}%`;
  for(const item of riverFloating){if(riverNetCaught>=riverNetGoal)break;item.x+=item.speed*dt;item.y+=(item.fallSpeed||0)*dt;item.el.style.left=`${item.x}%`;item.el.style.top=`${item.y}%`;if(Math.abs(item.x-riverNetX)<5.5&&Math.abs(item.y-82)<7){item.caught=true;item.el.remove();riverNetCaught++;if(typeof updateRiverProgress==='function')updateRiverProgress();if(typeof addRiverCleanReveal==='function')addRiverCleanReveal(61+(riverNetCaught%5)*6,18+Math.floor((riverNetCaught-1)/5)*11,7,`net-${riverNetCaught}`);$('#net-progress').textContent=`${riverNetCaught} / ${riverNetGoal}`;playDisposeSound();$('#river-net').animate([{filter:'brightness(1.8)'},{filter:'brightness(1)'}],{duration:250})}else if(item.x>106||item.y>106){item.missed=true;item.el.remove();riverTime=Math.max(0,riverTime-3);updateRiverTimer();showGlobalToast('Sampah terbawa arus!  -3 DETIK');if(riverTime<=0){riverGameOver();return}}}
  riverFloating=riverFloating.filter(item=>!item.caught&&!item.missed);while(riverFloating.length<3&&riverNetCaught<riverNetGoal)spawnFloatingTrash(Math.random()*25);if(riverNetCaught>=riverNetGoal)finishNetGame();
}
function finishNetGame(){riverMiniGame=null;riverFloating=[];$('#net-stream').innerHTML='';movementKeys.clear();$('#river-net-game').hidden=true;riverStage=3;if(typeof updateRiverProgress==='function')updateRiverProgress();$('#river-progress').textContent='2 / 3 Tahap';$('#river-subprogress').textContent='SUMBATAN · 0 / 6';showGlobalToast('Sampah yang mengambang berhasil dibersihkan!');setRiverStagePoint(76,35);riverGameplay=true}
function startRiverInspection(){riverGameplay=false;riverMiniGame='inspection';movementKeys.clear();$('#river-stage-point').hidden=true;$('#river-interact').classList.remove('show');const overlay=$('#river-inspection');overlay.hidden=false;overlay.dataset.line='0';$('#river-inspection-name').textContent=playerName;$('#river-inspection-text').textContent='Pantas saja alirannya lambat…'}
$('#river-inspection').addEventListener('click',()=>{const overlay=$('#river-inspection');if(paused||overlay.hidden||riverMiniGame!=='inspection')return;if(overlay.dataset.line==='0'){overlay.dataset.line='1';$('#river-inspection-text').textContent='Sampah dan ranting menumpuk di sini.'}else{overlay.hidden=true;startClogGame()}});
const clogAssets=['clog-branch-large.png','clog-branch-small.png','clog-leaves.png','clog-bag.png','clog-bottle.png','clog-trash-bundle.png'];
function startClogGame(){riverGameplay=false;riverMiniGame='clog';movementKeys.clear();$('#river-stage-point').hidden=true;$('#river-interact').classList.remove('show');riverClogCleared=0;$('#clog-progress').textContent='0 / 6';$('#river-clog-game').hidden=false;const layer=$('#clog-items');layer.innerHTML='';clogAssets.forEach((asset,i)=>{const img=document.createElement('img');img.className='clog-object';img.src=`assets/level2/${asset}`;img.style.left=`${8+(i%3)*16}%`;img.style.top=`${20+Math.floor(i/3)*30}%`;enableClogDrag(img);layer.appendChild(img)})}
function enableClogDrag(item){item.draggable=false;item.addEventListener('pointerdown',event=>{
  if(paused||riverMiniGame!=='clog'||item.dataset.dragging==='true'||item.dataset.cleared==='true')return;
  event.preventDefault();const run=riverRun,origin={left:item.style.left,top:item.style.top};item.dataset.dragging='true';item.setPointerCapture(event.pointerId);
  const move=e=>{if(paused||riverMiniGame!=='clog'||run!==riverRun)return;const bounds=$('#river-clog-game').getBoundingClientRect();item.style.left=`${Math.max(0,Math.min(90,(e.clientX-bounds.left)/bounds.width*100-5))}%`;item.style.top=`${Math.max(0,Math.min(85,(e.clientY-bounds.top)/bounds.height*100-5))}%`;};
  const end=e=>{item.removeEventListener('pointermove',move);item.removeEventListener('pointerup',end);item.removeEventListener('pointercancel',cancel);item.removeEventListener('lostpointercapture',cancel);item.dataset.dragging='false';const zone=$('#clog-drop-zone').getBoundingClientRect();if(e.type==='pointerup'&&!paused&&run===riverRun&&riverMiniGame==='clog'&&e.clientX>=zone.left&&e.clientX<=zone.right&&e.clientY>=zone.top&&e.clientY<=zone.bottom){item.dataset.cleared='true';item.remove();riverClogCleared++;if(typeof updateRiverProgress==='function')updateRiverProgress();if(typeof addRiverCleanReveal==='function')addRiverCleanReveal(68+(riverClogCleared%3)*8,29+Math.floor((riverClogCleared-1)/3)*11,8,`clog-${riverClogCleared}`);$('#clog-progress').textContent=`${riverClogCleared} / 6`;$('#river-subprogress').textContent=`SUMBATAN · ${riverClogCleared} / 6`;playAudio($('#level1-dispose'),true,.65);if(riverClogCleared===6)finishRiverLevel()}else{item.style.left=origin.left;item.style.top=origin.top}};
  const cancel=e=>end(e);item.addEventListener('pointermove',move);item.addEventListener('pointerup',end);item.addEventListener('pointercancel',cancel);item.addEventListener('lostpointercapture',cancel);
})}
function getRiverOutcome(){
  const completedTasks=riverShoreCleaned+riverNetCaught+riverClogCleared;
  if(riverShoreCleaned===7&&riverNetCaught===riverNetGoal&&riverClogCleared===6)return 'clean';
  return completedTasks>=7?'partial':'dirty';
}
async function finishRiverLevel(reason='complete'){
  if(riverEnding)return;riverEnding=true;riverMiniGame=null;riverGameplay=false;stopGameplaySoundtrack();clearRiverCarry();updateRiverMotion(0,0);movementKeys.clear();
  $('#river-inspection').hidden=true;$('#river-net-game').hidden=true;$('#river-clog-game').hidden=true;$('#river-stage-point').hidden=true;$('#river-sorting-bins').classList.add('hidden');
  riverOutcome=getRiverOutcome();playAudio(riverOutcome==='clean'?$('#level1-success'):$('#level1-fail'),true,riverOutcome==='clean'?.8:.55);
  $('#river-result-time').textContent=formatTime(riverTime);$('#river-result-shore').textContent=`${riverShoreCleaned} / 7`;$('#river-result-net').textContent=`${riverNetCaught} / ${riverNetGoal}`;$('#river-result-clog').textContent=`${riverClogCleared} / 6`;
  if(reason!=='complete'){
    const progress=riverStage===1?`Tahap 1 · ${riverShoreCleaned} / 7`:riverStage===2?`Tahap 2 · ${riverNetCaught} / ${riverNetGoal}`:`Tahap 3 · ${riverClogCleared} / 6`;
    $('#river-failed-progress').textContent=progress;
    $('#level-2-screen').classList.add('ending-mode');
    $('#river-game-over').hidden=false;
    return;
  }
  const copy={clean:['SUNGAI PULIH SEPENUHNYA!','Bantaran bersih, ikan terlindungi, dan aliran kembali lancar.'],partial:['SUNGAI MULAI MEMBAIK','Sebagian pencemaran berhasil ditangani sebelum permainan berakhir.'],dirty:['SUNGAI MASIH KOTOR','Hasilnya belum maksimal, tetapi pelajaran dari wilayah ini tetap dibawa.']}[riverOutcome];
  $('#river-result-title').textContent=copy[0];$('#river-result-copy').textContent=copy[1];
  $('#level-2-screen').classList.add('ending-mode');$('#river-camera').classList.remove('camera-live');$('#river-camera').classList.add('overview');$('#river-world').classList.toggle('partial',riverOutcome==='partial');$('#river-world').classList.toggle('restored',riverOutcome==='clean');
  showGlobalToast(reason==='hp'?'HP habis. Lihat hasil pemulihanmu.':reason==='time'?'Waktu habis. Lihat hasil pemulihanmu.':'Semua tahap selesai!');
  const run=riverRun,version=flowVersion;if(!await pausableSleep(1800,version)||run!==riverRun)return;riverDialogMode='closing';riverDialogIndex=0;$('#river-dialog').className='opening-dialog closing';showRiverDialogLine();
}
function riverGameOver(reason='time'){finishRiverLevel(reason)}
let riverLastFrame=performance.now();
function riverLoop(now){
  const dt=Math.min((now-riverLastFrame)/1000,.05);riverLastFrame=now;
  if(riverEntranceActive&&!paused&&!riverNpcDialogActive){
    let dx=0,dy=0;if(movementKeys.has('a')||movementKeys.has('arrowleft'))dx--;if(movementKeys.has('d')||movementKeys.has('arrowright'))dx++;if(movementKeys.has('w')||movementKeys.has('arrowup'))dy--;if(movementKeys.has('s')||movementKeys.has('arrowdown'))dy++;
    const length=Math.hypot(dx,dy)||1,step=16*dt,nextX=riverEntrancePlayer.x+dx/length*step,nextY=riverEntrancePlayer.y+dy/length*step;if(isRiverEntranceWalkable(nextX,riverEntrancePlayer.y))riverEntrancePlayer.x=nextX;if(isRiverEntranceWalkable(riverEntrancePlayer.x,nextY))riverEntrancePlayer.y=nextY;updateRiverEntranceMotion(dx,dy,now);updateRiverEntrancePlayer();nearestRiverEntranceTarget();
  }else updateRiverEntranceMotion(0,0,now);
  if(!riverGameplay||paused)updateRiverMotion(0,0);
  if((riverGameplay||riverMiniGame==='net'||riverMiniGame==='clog')&&!paused){riverTime=Math.max(0,riverTime-dt);updateRiverTimer();if(riverTime<=0)riverGameOver();else if(riverMiniGame==='net')updateNetGame(dt);else if(riverGameplay){let dx=0,dy=0;if(movementKeys.has('a')||movementKeys.has('arrowleft'))dx--;if(movementKeys.has('d')||movementKeys.has('arrowright'))dx++;if(movementKeys.has('w')||movementKeys.has('arrowup'))dy--;if(movementKeys.has('s')||movementKeys.has('arrowdown'))dy++;const length=Math.hypot(dx,dy)||1;riverPlayerPosition.x=Math.max(4,Math.min(96,riverPlayerPosition.x+dx/length*12.5*dt));riverPlayerPosition.y=Math.max(8,Math.min(92,riverPlayerPosition.y+dy/length*12.5*dt));updateRiverMotion(dx,dy);updateRiverPlayer();nearestRiverTarget();}}
  requestAnimationFrame(riverLoop);
}requestAnimationFrame(riverLoop);

async function enterLevelOne() {
  const curtain = $('#transition-curtain');
  const loadingBar = $('#loading-bar');
  curtain.classList.add('level-transition', 'cover');
  await sleep(900);
  $('#loading-text').textContent = 'Memuat Level 1: Taman...';
  loadingBar.style.transition = 'none';
  loadingBar.style.width = '0';
  showScreen('#loading');
  void loadingBar.offsetWidth;
  loadingBar.style.transition = 'width 2.2s cubic-bezier(.2,.8,.2,1)';
  curtain.classList.remove('cover');
  await sleep(120);
  loadingBar.style.width = '100%';
  await sleep(2400);
  curtain.classList.add('cover');
  await sleep(900);
  startLevelOne();
  await sleep(100);
  curtain.classList.remove('cover');
  await sleep(900);
  curtain.classList.remove('level-transition');
  loadingBar.style.transition = '';
  $('#loading-text').textContent = 'Memuat perjalanan...';
}

function getParkEnvironmentState(value=parkCleanliness){
  if(value>=100&&cleanCount===10&&repairCount===levelOneRepairs.length)return 'CLEAN';
  if(parkRevealPoints.length||value>0)return 'PARTIALLY_CLEAN';
  return 'DIRTY';
}

function resetParkCleanReveals(){
  parkRevealPoints=[];
  $('#park-clean-reveal')?.replaceChildren();
}

function addParkCleanReveal(x,y,kind='trash',key=`${kind}-${x}-${y}`){
  if(parkRevealPoints.some(point=>point.key===key))return;
  parkRevealPoints.push({x,y,kind,key});
  const patch=document.createElement('i');
  patch.className=kind==='facility'?'facility':'';
  patch.style.setProperty('--reveal-x',`${x}%`);
  patch.style.setProperty('--reveal-y',`${y}%`);
  patch.style.setProperty('--reveal-radius',kind==='facility'?'13%':'9%');
  $('#park-clean-reveal')?.append(patch);
  applyParkEnvironment();
}

function updateParkHud(){
  const detail=repairMode?`Fasilitas ${repairCount}/${levelOneRepairs.length}`:`${cleanCount}/10 Sampah`;
  $('#clean-progress').textContent=`${parkCleanliness}% · ${detail}`;
  $('#park-cleanliness-bar').value=parkCleanliness;
  $('#park-cleanliness-bar').textContent=`${parkCleanliness}%`;
}

function applyParkEnvironment(announce=false){
  const previous=parkEnvironmentState;
  parkEnvironmentState=getParkEnvironmentState();
  const world=$('#park-world');
  world.dataset.environmentState=parkEnvironmentState;
  world.classList.toggle('state-dirty',parkEnvironmentState==='DIRTY');
  world.classList.toggle('state-partially-clean',parkEnvironmentState==='PARTIALLY_CLEAN');
  world.classList.toggle('state-clean',parkEnvironmentState==='CLEAN');
  world.classList.toggle('partial',parkEnvironmentState==='PARTIALLY_CLEAN');
  world.classList.toggle('restored',parkEnvironmentState==='CLEAN');
  updateParkHud();
  if(announce&&previous!==parkEnvironmentState){
    feedback(parkEnvironmentState==='CLEAN'?'Taman terlihat bersih dan lebih hidup!':'Sebagian taman mulai terlihat lebih rapi.');
  }
}

function updateEntrancePlayer(){
  const player=$('#entrance-player');player.style.left=`${parkEntrancePlayer.x}%`;player.style.top=`${parkEntrancePlayer.y}%`;
}

function isParkEntranceWalkable(x,y){
  // Area jalan dan trotoar depan gerbang. Batas atas mencegah pemain menembus pagar/NPC.
  return x>=7&&x<=93&&y>=61&&y<=92;
}

function nearestParkEntranceTarget(){
  const target=parkEntranceStage==='approach'?{type:'npc',x:29,y:53,label:'BICARA DENGAN PAK RUDI'}:parkEntranceStage==='gate'?{type:'gate',x:57,y:58,label:'MASUK KE TAMAN'}:null;
  const prompt=$('#entrance-prompt');
  if(!target||pakRudiDialogActive){prompt.classList.remove('show');return null;}
  const distance=Math.hypot(target.x-parkEntrancePlayer.x,target.y-parkEntrancePlayer.y);
  prompt.style.left=`${target.x}%`;prompt.style.top=`${target.y-5}%`;prompt.querySelector('span').textContent=target.label;prompt.classList.toggle('show',distance<8.5);
  return distance<8.5?target:null;
}

async function typePakRudiLine(){
  const version=flowVersion,text=pakRudiLines[pakRudiDialogIndex],node=$('#pak-rudi-text'),portrait=$('#pak-rudi-dialog-portrait');node.textContent='';pakRudiDialogTyping=true;pakRudiDialogFinish=false;
  portrait.src=pakRudiPortraits[pakRudiDialogIndex%pakRudiPortraits.length];portrait.classList.remove('pose-in');void portrait.offsetWidth;portrait.classList.add('pose-in');
  for(const char of text){if(version!==flowVersion||!pakRudiDialogActive)return;if(pakRudiDialogFinish){node.textContent=text;break;}node.textContent+=char;if(!await pausableSleep(32,version))return;}
  pakRudiDialogTyping=false;
}

function openPakRudiDialog(){
  if(pakRudiDialogActive||parkEntranceStage!=='approach')return;pakRudiDialogActive=true;pakRudiDialogIndex=0;movementKeys.clear();$('#entrance-prompt').classList.remove('show');$('#pak-rudi-dialog').hidden=false;typePakRudiLine();
}

function advancePakRudiDialog(){
  if(!pakRudiDialogActive||paused)return;if(pakRudiDialogTyping){pakRudiDialogFinish=true;return;}pakRudiDialogIndex++;
  if(pakRudiDialogIndex<pakRudiLines.length){typePakRudiLine();return;}
  pakRudiDialogActive=false;parkEntranceStage='gate';$('#pak-rudi-dialog').hidden=true;$('#entrance-gate').classList.add('open');nearestParkEntranceTarget();showGlobalToast('Pak Rudi membuka gerbang taman.');
}

async function enterParkFromGate(){
  if(parkEntranceStage!=='gate'||!parkEntranceActive)return;parkEntranceStage='transition';parkEntranceActive=false;movementKeys.clear();setLevelFootsteps(false);$('#entrance-prompt').classList.remove('show');$('#park-entrance').classList.add('leaving');const version=flowVersion;
  const loading=$('#park-entry-loading');loading.hidden=false;requestAnimationFrame(()=>loading.classList.add('visible'));
  if(!await pausableSleep(1450,version))return;$('#park-entrance').hidden=true;$('#level-1-screen').classList.remove('entrance-mode');$('#level-1-screen').classList.add('intro-mode');parkPlayer={x:50,y:82};playerDirection='up';setGameplaySprite('#player-sprite','up',false);updatePlayer();loading.classList.remove('visible');
  if(!await pausableSleep(380,version))return;loading.hidden=true;dialogMode='mission-intro';openingIndex=0;dialogTyping=false;$('#opening-dialog').className='opening-dialog mission-intro';showOpeningLine();
}

function interactParkEntrance(){
  if(!parkEntranceActive||paused||pakRudiDialogActive)return;const target=nearestParkEntranceTarget();if(!target)return;if(target.type==='npc')openPakRudiDialog();else enterParkFromGate();
}

$('#pak-rudi-dialog').addEventListener('click',advancePakRudiDialog);
$('#entrance-interact').addEventListener('pointerdown',event=>{event.preventDefault();runInteraction('park-entrance',interactParkEntrance);});

function startLevelOne() {
  showScreen('#level-1-screen');
  $('#park-camera').classList.remove('camera-live');
  $('#park-camera').classList.add('overview');
  $('#level-countdown').hidden = true;
  startLevelOneAudio();
  $('#level-1-screen').classList.add('entrance-mode');
  $('#level-1-screen').classList.remove('intro-mode','ending-mode');
  levelOneActive = true;
  levelOneGameplay = false;
  parkEntranceActive=false;parkEntranceStage='approach';parkEntrancePlayer={x:51,y:88};parkEntranceDirection='up';pakRudiDialogActive=false;pakRudiDialogIndex=0;pakRudiDialogTyping=false;pakRudiDialogFinish=false;
  cleanCount = 0;parkCleanliness=0;parkEnvironmentState='DIRTY';
  repairCount = 0; repairMode = false; repairInteractionHeld = false; resetRepairHold();
  levelTime = 150;
  levelOneEnding = false;
  levelOneOutcome = 'bad';
  warning60Shown = false; warning30Shown = false; resetTimerAlert('park', $('#timer-hud')); resetInteractionState();
  carriedTrash = null;
  $('#carried-icon').replaceChildren();
  $('#carry-hud').hidden = true;
  parkPlayer = { x: 50, y: 82 };
  playerDirection = 'up';
  setGameplaySprite('#player-sprite', 'up', false);setGameplaySprite('#entrance-player-sprite','up',false);
  $('#park-world').className='park-world state-dirty';
  resetParkCleanReveals();
  $('#park-entrance').hidden=false;$('#park-entrance').classList.remove('leaving');$('#entrance-gate').classList.remove('open');$('#pak-rudi-dialog').hidden=true;$('#entrance-prompt').classList.remove('show');
  $('#park-entry-loading').hidden=true;$('#park-entry-loading').classList.remove('visible');
  $('#level-complete').hidden = true;
  $('#game-over').hidden = true;
  $('#level-ready').hidden = true;
  $('#timer-hud').classList.remove('warning','critical');
  updateTimerHud();applyParkEnvironment();
  $('#trash-layer').replaceChildren();
  updatePlayer();updateEntrancePlayer();nearestParkEntranceTarget();
  openingIndex = 0;
  dialogMode = 'entrance-intro';
  dialogTyping = false;
  $('#dialog-player-name').textContent = playerName;
  $('#opening-dialog').className = 'opening-dialog entrance-intro awaiting-dialog-tap';
  $('#opening-tap-hint').textContent = 'TAP UNTUK MEMULAI DIALOG';
  $('#dialog-text').textContent = '';
}

function getActiveLevelOneDialogLines(){
  if(dialogMode==='closing')return getLevelOneClosingLines();
  if(dialogMode==='entrance-intro')return entranceIntroLines;
  return openingLines;
}

async function showOpeningLine() {
  const version=flowVersion;
  const lines = getActiveLevelOneDialogLines();
  const [image,text] = lines[openingIndex];
  $('#dialog-character').src = image;
  $('#dialog-text').textContent = '';
  dialogTyping = true; dialogFinish = false;
  for (const char of text) {
    if(version!==flowVersion)return;
    if (dialogFinish) { $('#dialog-text').textContent = text; break; }
    $('#dialog-text').textContent += char;
    if(!await pausableSleep(38,version))return;
  }
  dialogTyping = false;
}

$('#opening-dialog').addEventListener('click', () => {
  if (paused || !levelOneActive) return;
  if ($('#opening-dialog').classList.contains('awaiting-dialog-tap')) {
    $('#opening-dialog').classList.remove('awaiting-dialog-tap');
    $('#opening-tap-hint').textContent = 'TAP UNTUK MELANJUTKAN';
    openingIndex = 0;
    showOpeningLine();
    return;
  }
  if ($('#opening-dialog').classList.contains('awaiting-character')) {
    $('#opening-dialog').classList.remove('awaiting-character');
    $('#opening-dialog').classList.add('character-only');
    return;
  }
  if ($('#opening-dialog').classList.contains('character-only')) {
    $('#opening-dialog').classList.remove('character-only');
    openingIndex = 0;
    showOpeningLine();
    return;
  }
  if (dialogTyping) { dialogFinish = true; return; }
  openingIndex++;
  const lines = getActiveLevelOneDialogLines();
  if (openingIndex < lines.length) showOpeningLine();
  else {
    $('#opening-dialog').classList.add('hidden');
    if (dialogMode === 'closing') {
      if(levelOneOutcome==='good')enablePostLevelExit(1);
      else $('#level-complete').hidden = false;
    }
    else if(dialogMode==='entrance-intro'){
      parkEntranceActive=true;
      nearestParkEntranceTarget();
      showGlobalToast('Dekati Pak Rudi lalu tekan E.');
    } else {
      $('#level-ready').hidden=false;
    }
  }
});

async function beginLevelOneGameplay() {
  if(paused||levelOneGameplay||levelOneEnding)return;const version=flowVersion;
  primeGameplayAudio();
  parkEntranceActive=false;pakRudiDialogActive=false;$('#park-entrance').hidden=true;
  $('#level-ready').hidden = true;
  createTrash(levelOneTrashV2);
  $('#level-1-screen').classList.remove('intro-mode','entrance-mode');
  unsavedChanges = true;
  $('#park-camera').classList.remove('overview');
  requestAnimationFrame(updateParkCamera);
  if(!await pausableSleep(950,version))return;
  if(!await runLevelCountdown('#level-countdown',version,()=>levelOneActive&&!levelOneEnding))return;
  $('#park-camera').classList.add('camera-live');
  levelOneGameplay = true;
  startGameplaySoundtrack();
}

$('#level-ready-start').addEventListener('click', beginLevelOneGameplay);

$('#level-ready-back').addEventListener('click', () => {
  $('#level-ready').hidden = true;
  levelOneActive = false;
  movementKeys.clear();
  stopLevelOneAudio();
  showScreen('#map');
});

function createTrash(items = levelOneTrashV2) {
  $('#trash-layer').innerHTML = '';
  items.forEach(([type,icon,name,x,y],index) => {
    const item = document.createElement('button');
    item.className = 'trash-item';
    const image = document.createElement('img'); image.src = icon; image.alt = name; item.append(image);
    item.dataset.type = type; item.dataset.name = name; item.dataset.index = index;item.dataset.x=x;item.dataset.y=y;
    item.style.left = `${x}%`; item.style.top = `${y}%`;
    $('#trash-layer').append(item);
  });
}
function createRepairTargets(){
  $('#trash-layer').innerHTML='';
  levelOneRepairs.forEach((repair,index)=>{
    const {name,x,y,interactionX,interactionY}=repair;
    const item=document.createElement('button');
    item.className='repair-target';
    item.dataset.name=name;
    item.dataset.index=index;
    item.dataset.x=x;item.dataset.y=y;item.dataset.interactionX=interactionX;item.dataset.interactionY=interactionY;
    item.setAttribute('aria-label',name);
    item.style.left=`${x}%`;
    item.style.top=`${y}%`;
    item.innerHTML='<img class="repair-debris" src="assets/level1/new/repair/debris.png" alt=""><img class="repair-tools" src="assets/level1/new/repair/tools.png" alt="">';
    $('#trash-layer').append(item);
  });
}

function updatePlayer() {
  $('#park-player').style.left = `${parkPlayer.x}%`;
  $('#park-player').style.top = `${parkPlayer.y}%`;
  $('#interaction-prompt').style.left = `${parkPlayer.x}%`;
  $('#interaction-prompt').style.top = `${parkPlayer.y}%`;
  const collisionPoint = $('.collision-player-point');
  if (collisionPoint) {
    collisionPoint.style.left = `${parkPlayer.x}%`;
    collisionPoint.style.top = `${parkPlayer.y}%`;
  }
  updateParkCamera();
}

function updateParkCamera() {
  const viewport = $('#park-world');
  const camera = $('#park-camera');
  const viewportWidth = viewport.clientWidth;
  const viewportHeight = viewport.clientHeight;
  const cameraWidth = camera.offsetWidth;
  const cameraHeight = camera.offsetHeight;
  const playerX = parkPlayer.x / 100 * cameraWidth;
  const playerY = parkPlayer.y / 100 * cameraHeight;
  const x = Math.max(viewportWidth - cameraWidth, Math.min(0, viewportWidth / 2 - playerX));
  const y = Math.max(viewportHeight - cameraHeight, Math.min(0, viewportHeight / 2 - playerY));
  camera.style.transform = `translate3d(${x}px,${y}px,0)`;
}

function updateEnvironmentCamera(viewportSelector,cameraSelector,playerX,playerY){
  const viewport=$(viewportSelector),camera=$(cameraSelector);
  if(!viewport||!camera)return;
  const viewportWidth=viewport.clientWidth,viewportHeight=viewport.clientHeight;
  const cameraWidth=camera.offsetWidth,cameraHeight=camera.offsetHeight;
  const x=Math.max(viewportWidth-cameraWidth,Math.min(0,viewportWidth/2-playerX/100*cameraWidth));
  const y=Math.max(viewportHeight-cameraHeight,Math.min(0,viewportHeight/2-playerY/100*cameraHeight));
  camera.style.transform=`translate3d(${x}px,${y}px,0)`;
}

function enterEnvironmentCamera(cameraSelector,update){
  const camera=$(cameraSelector);if(!camera)return;
  clearTimeout(camera.zoomTimer);
  camera.classList.remove('camera-live','overview');
  update();
  camera.zoomTimer=setTimeout(()=>{camera.classList.add('camera-live');update()},920);
}

function leaveEnvironmentCamera(cameraSelector){
  const camera=$(cameraSelector);if(!camera)return;
  clearTimeout(camera.zoomTimer);
  camera.classList.remove('camera-live');
  camera.classList.add('overview');
  camera.style.transform='translate3d(0,0,0)';
}

function updatePlayerMotion(dx, dy, now = performance.now()) {
  const moving = dx !== 0 || dy !== 0;
  $('#park-player').classList.toggle('walking', moving);
  setLevelFootsteps(moving);
  if (moving) playerDirection = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  setGameplaySprite('#player-sprite', playerDirection, moving, now);
}

function nearestTarget() {
  let nearest = null, distance = 999;
  if (!carriedTrash) {
    document.querySelectorAll(repairMode ? '.repair-target:not(.repaired)' : '.trash-item:not([hidden])').forEach(item => {
      const targetX=Number(item.dataset.interactionX??parseFloat(item.style.left));
      const targetY=Number(item.dataset.interactionY??parseFloat(item.style.top));
      const d = Math.hypot(targetX-parkPlayer.x,targetY-parkPlayer.y);
      item.classList.toggle('near', d < 4.5);
      if (d < distance) { distance=d; nearest=item; }
    });
  } else {
    document.querySelectorAll('#park-camera .sorting-bin').forEach(bin => {
      const x=Number(bin.dataset.x);
      const y=Number(bin.dataset.y);
      const d=Math.hypot(x-parkPlayer.x,y-parkPlayer.y);
      if(d<distance){distance=d;nearest=bin;}
    });
  }
  const promptText = $('#interaction-prompt span');
  const promptKey = $('#interaction-key');
  const promptImage = $('#interaction-prompt img');
  const key = carriedTrash && !repairMode ? 'F' : 'E';
  if (promptKey) { promptKey.textContent = key; promptKey.hidden = key === 'E'; }
  if (promptImage) promptImage.hidden = key !== 'E';
  if (promptText) promptText.textContent = repairMode ? 'TAHAN 5 DETIK UNTUK MEMPERBAIKI' : carriedTrash ? 'BUANG / PILAH' : 'AMBIL';
  $('#interaction-prompt').classList.toggle('show', distance < 5.5);
  return distance < 5.5 ? nearest : null;
}

function resetRepairHold() {
  activeRepairTarget?.classList.remove('holding');
  activeRepairTarget = null;
  repairHoldProgress = 0;
  const hold = $('#repair-hold');
  const fill = $('#repair-hold-fill');
  if (hold) hold.hidden = true;
  if (fill) fill.style.width = '0%';
}

function completeRepairTarget(target) {
  if (!target || target.classList.contains('repaired')) return;
  repairInteractionHeld = false;
  target.classList.remove('holding','near');
  target.classList.add('repaired');
  target.innerHTML = '<img class="repair-sparkles" src="assets/level1/new/repair/sparkles.png" alt="Fasilitas selesai diperbaiki">';
  repairCount++;
  parkCleanliness=Math.min(100,parkCleanliness+(repairCount===levelOneRepairs.length?6:7));
  addParkCleanReveal(Number(target.dataset.x),Number(target.dataset.y),'facility',`repair-${target.dataset.index}`);
  playDisposeSound();
  applyParkEnvironment(true);
  feedback(`${target.dataset.name} berhasil diperbaiki!`);
  setTimeout(() => target.remove(), 520);
  resetRepairHold();
  if(repairCount===levelOneRepairs.length) finishLevelOne();
}

function updateRepairHold(dt) {
  if (!levelOneGameplay || paused || !repairMode || !repairInteractionHeld) {
    resetRepairHold();
    return;
  }
  const target = nearestTarget();
  if (!target || !target.classList.contains('repair-target')) {
    resetRepairHold();
    return;
  }
  if (activeRepairTarget !== target) {
    resetRepairHold();
    activeRepairTarget = target;
  }
  target.classList.add('holding');
  $('#repair-hold').hidden = false;
  repairHoldProgress = Math.min(1, repairHoldProgress + dt / REPAIR_HOLD_DURATION);
  $('#repair-hold-fill').style.width = `${repairHoldProgress * 100}%`;
  if (repairHoldProgress >= 1) completeRepairTarget(target);
}

function interactLevelOne(action = 'pickup') {
  if (!levelOneGameplay || paused) return;
  const target = nearestTarget(); if (!target) return;
  unsavedChanges = true;
  if (repairMode && target.classList.contains('repair-target')) {
    feedback('Tahan tombol E sampai perbaikan selesai.');
  } else if (!carriedTrash && action === 'pickup' && target.classList.contains('trash-item')) {
    playAudio($('#level1-pickup'), true, .72);
    if(target.dataset.revealed!=='true'){
      target.dataset.revealed='true';
      addParkCleanReveal(Number(target.dataset.x),Number(target.dataset.y),'trash',`trash-${target.dataset.index}`);
    }
    carriedTrash = target; target.hidden = true; $('#park-player').classList.add('carrying');
    const carriedImage = target.querySelector('img').cloneNode(); carriedImage.alt = target.dataset.name; $('#carried-icon').replaceChildren(carriedImage);
    $('#carry-hud').hidden=false; $('#carry-name').textContent=target.dataset.name;
    feedback('Sampah diambil. Bawa ke tempat yang benar!');
  } else if (carriedTrash && action === 'dispose' && target.classList.contains('sorting-bin')) {
    if (target.dataset.type === carriedTrash.dataset.type) {
      if(carriedTrash.dataset.sorted==='true')return;
      carriedTrash.dataset.sorted='true';
      playDisposeSound();
      const previousEnvironment=parkEnvironmentState;carriedTrash.remove(); carriedTrash=null; cleanCount++;parkCleanliness=Math.min(100,parkCleanliness+8); $('#park-player').classList.remove('carrying'); $('#carried-icon').replaceChildren(); $('#carry-hud').hidden=true;
      applyParkEnvironment(true);if(previousEnvironment===parkEnvironmentState)feedback('Sampah berhasil dipilah!');
      if(cleanCount===10){ repairMode=true; createRepairTargets(); updateParkHud(); feedback('Semua sampah selesai! Perbaiki fasilitas taman.'); }
    } else { playAudio($('#level1-fail'),true,.5); levelTime=Math.max(0,levelTime-5); updateTimerHud(); feedback('SALAH JENIS! −5 DETIK'); if(levelTime<=0) gameOverLevelOne(); }
  } else if (carriedTrash && action === 'pickup') {
    feedback('Tekan F di dekat tempat sampah untuk membuang.');
  }
}

function feedback(text){const el=$('#level-feedback');el.textContent=text;el.classList.add('show');clearTimeout(feedback.timer);feedback.timer=setTimeout(()=>el.classList.remove('show'),1500)}

function formatTime(seconds){const value=Math.max(0,Math.ceil(seconds));return `${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`}
function updateTimerHud(){const text=formatTime(levelTime);$('#level-timer').textContent=text;const hud=$('#timer-hud');hud.classList.toggle('warning',levelTime<=60&&levelTime>30);hud.classList.toggle('critical',levelTime<=30);updateTimerAlert('park',levelTime,hud)}
function getLevelOneOutcome(){
  return cleanCount===10&&repairCount===levelOneRepairs.length?'good':'bad';
}
function finishLevelOne(reason='complete'){
  if(levelOneEnding)return;
  levelOneEnding=true;
  parkEntranceActive=false;pakRudiDialogActive=false;
  levelOneGameplay=false;
  stopGameplaySoundtrack();
  repairInteractionHeld=false;
  resetRepairHold();
  movementKeys.clear();
  stopLevelOneAudio(1100);
  $('#level1-dispose').pause();
  levelOneOutcome=getLevelOneOutcome();
  playAudio(levelOneOutcome==='good'?$('#level1-success'):$('#level1-fail'), true, levelOneOutcome==='good'?.8:.55);
  $('#result-time').textContent=formatTime(levelTime);
  $('#level-result-cleanliness').textContent=`${parkCleanliness}%`;
  $('#level-result-trash').textContent=`${cleanCount} / 10`;
  $('#level-result-repairs').textContent=`${repairCount} / ${levelOneRepairs.length}`;
  if(reason!=='complete'){
    $('#failed-progress').textContent=`${cleanCount} / 10`;
    $('#level-1-screen').classList.add('ending-mode');
    $('#game-over').hidden=false;
    return;
  }
  const resultCopy={
    good:['GOOD END · TAMAN PULIH!',`${parkCleanliness}% · Semua sampah berhasil dipilah dan seluruh fasilitas kembali berfungsi.`],
    bad:['BAD END · PEMULIHAN BELUM SELESAI',`${parkCleanliness}% · ${cleanCount}/10 sampah dipilah dan ${repairCount}/${levelOneRepairs.length} fasilitas diperbaiki sebelum waktu habis.`]
  }[levelOneOutcome];
  $('#level-result-title').textContent=resultCopy[0];
  $('#level-result-copy').textContent=resultCopy[1];
  $('#level-1-screen').classList.add('ending-mode');
  $('#park-camera').classList.remove('camera-live');
  $('#park-camera').classList.add('overview');
  applyParkEnvironment();
  feedback(reason==='timeout'?'Waktu habis. Lihat perubahan tamanmu.':'Semua tugas selesai!');
  scheduleLevelCallback(()=>{
    dialogMode='closing';
    openingIndex=0;
    dialogTyping=false;
    $('#dialog-player-name').textContent=playerName;
    $('#opening-dialog').className='opening-dialog closing';
    showOpeningLine();
  },1800);
}
function gameOverLevelOne(){finishLevelOne('timeout')}
$('#continue-level').addEventListener('click',()=>{$('#level-complete').hidden=true;beginReturnToNpc(1)});
$('#retry-level').addEventListener('click',startLevelOne);
$('#choose-level').addEventListener('click',()=>{levelOneActive=false;showScreen('#map')});
document.addEventListener('keydown',event=>{
  if(event.code==='F2'||event.key==='F2'||event.keyCode===113){
    event.preventDefault();
    if(!event.repeat)toggleCollisionDebug();
    return;
  }
  const key = event.key.toLowerCase();
  const movementKey=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key);
  if(movementKey){
    if(!movementInputAllowed())return;
    movementKeys.add(key);
  }
  if(key==='e'){
    if(event.repeat||!movementInputAllowed())return;
    movementKeys.add(key);
    if(typeof postLevelExit!=='undefined'&&postLevelExit.active){runInteraction('post-level-exit',interactPostLevelExit);return;}
    if(typeof journeyCheckpoint!=='undefined'&&journeyCheckpoint.active){runInteraction('journey-checkpoint',interactJourneyCheckpoint);return;}
    const activeScreen=document.querySelector('.screen.active')?.id;
    if(activeScreen==='level-1-screen'){
      if(parkEntranceActive)runInteraction('park-entrance',interactParkEntrance);
      else if(levelOneGameplay&&repairMode)repairInteractionHeld=true;
      else runInteraction('level-1',interactLevelOne);
    }else if(activeScreen==='level-2-screen'){
      if(riverEntranceActive)runInteraction('river-entrance',interactRiverEntrance);
      else runInteraction('level-2',interactRiver);
    }else if(activeScreen==='level-3-screen'){
      if(forestEntranceActive)runInteraction('forest-entrance',interactForestEntrance);
      else{forestInteractionHeld=true;runInteraction('level-3',interactForest);}
    }else if(activeScreen==='level-4-screen'){
      factoryInteractionHeld=true;
      if(factoryGameplay&&factoryMiniGame?.type==='waste')runInteraction('level-4-pickup',()=>interactFactoryTask('pickup'));
      else runInteraction('level-4',interactFactory);
    }
  }
  if(key==='f'&&(levelOneGameplay||riverGameplay||forestGameplay||factoryGameplay)){
    if(event.repeat||!movementInputAllowed())return;
    event.preventDefault();
    if(levelOneGameplay)runInteraction('level-1-dispose',()=>interactLevelOne('dispose'));
    if(riverGameplay)runInteraction('level-2-dispose',()=>interactRiver('dispose'));
    if(factoryGameplay&&factoryMiniGame?.type==='waste')runInteraction('level-4-dispose',()=>interactFactoryTask('dispose'));
  }
});
document.addEventListener('keyup',event=>{
  const key = event.key.toLowerCase();
  movementKeys.delete(key);
  if(key==='e') { forestInteractionHeld = false; factoryInteractionHeld = false; repairInteractionHeld = false; resetRepairHold(); resetForestHold(); resetFactoryHold(); }
});
document.querySelectorAll('.touch-controls [data-key]').forEach(button=>{
  const key=button.dataset.key;
  button.addEventListener('pointerdown',event=>{event.preventDefault();movementKeys.add(key)});
  button.addEventListener('pointerup',()=>movementKeys.delete(key));
  button.addEventListener('pointercancel',()=>movementKeys.delete(key));
});
$('#touch-interact').addEventListener('pointerdown',event=>{
  event.preventDefault();
  if(levelOneGameplay&&repairMode) repairInteractionHeld=true;
  else runInteraction('level-1',()=>interactLevelOne(carriedTrash?'dispose':'pickup'));
});
['pointerup','pointercancel','lostpointercapture'].forEach(type=>$('#touch-interact').addEventListener(type,()=>{
  repairInteractionHeld=false;
  resetRepairHold();
}));
let lastFrame=performance.now();
function levelLoop(now){
  const dt=Math.min((now-lastFrame)/1000,.05);
  lastFrame=now;
  if(parkEntranceActive&&!paused&&!pakRudiDialogActive){
    let dx=0,dy=0;if(movementKeys.has('a')||movementKeys.has('arrowleft'))dx--;if(movementKeys.has('d')||movementKeys.has('arrowright'))dx++;if(movementKeys.has('w')||movementKeys.has('arrowup'))dy--;if(movementKeys.has('s')||movementKeys.has('arrowdown'))dy++;
    const moving=Boolean(dx||dy),length=Math.hypot(dx,dy)||1;if(moving)parkEntranceDirection=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');const entranceStep=16*dt,nextEntranceX=parkEntrancePlayer.x+dx/length*entranceStep,nextEntranceY=parkEntrancePlayer.y+dy/length*entranceStep;if(isParkEntranceWalkable(nextEntranceX,parkEntrancePlayer.y))parkEntrancePlayer.x=nextEntranceX;if(isParkEntranceWalkable(parkEntrancePlayer.x,nextEntranceY))parkEntrancePlayer.y=nextEntranceY;$('#entrance-player').classList.toggle('walking',moving);setGameplaySprite('#entrance-player-sprite',parkEntranceDirection,moving,now);setLevelFootsteps(moving);updateEntrancePlayer();nearestParkEntranceTarget();
  } else if(levelOneGameplay&&!paused){
    levelTime=Math.max(0,levelTime-dt);
    updateTimerHud();
    if(levelTime<=60&&!warning60Shown){warning60Shown=true;feedback('⚠️ Waktu hampir habis!')}
    if(levelTime<=30&&!warning30Shown){warning30Shown=true;feedback('⚠️ 30 detik tersisa!')}
    if(levelTime<=0){
      finishLevelOne('timeout');
    } else {
      let dx=0,dy=0;
      if(movementKeys.has('a')||movementKeys.has('arrowleft'))dx--;
      if(movementKeys.has('d')||movementKeys.has('arrowright'))dx++;
      if(movementKeys.has('w')||movementKeys.has('arrowup'))dy--;
      if(movementKeys.has('s')||movementKeys.has('arrowdown'))dy++;
      updatePlayerMotion(dx,dy,now);
      const length=Math.hypot(dx,dy)||1;
      const step=12.5*dt;
      const nextX=parkPlayer.x+dx/length*step;
      const nextY=parkPlayer.y+dy/length*step;
      // Cek sumbu secara terpisah supaya karakter tetap bisa meluncur halus di tepi objek.
      if(isWalkable(nextX,parkPlayer.y))parkPlayer.x=nextX;
      if(isWalkable(parkPlayer.x,nextY))parkPlayer.y=nextY;
      updatePlayer();
      nearestTarget();
      updateRepairHold(dt);
    }
  } else {
    $('#park-player').classList.remove('walking');
    $('#entrance-player').classList.remove('walking');
    setGameplaySprite('#player-sprite',playerDirection,false,now);
    setGameplaySprite('#entrance-player-sprite',parkEntranceDirection,false,now);setLevelFootsteps(false);
  }
  requestAnimationFrame(levelLoop);
}
requestAnimationFrame(levelLoop);
renderCollisionDebug();
window.addEventListener('resize', updateParkCamera);
window.addEventListener('resize', updateRiverCamera);
window.addEventListener('resize',()=>{
  if(forestGameplay)updateForestCamera();
  if(factoryGameplay)updateFactoryCamera();
  if(typeof city!=='undefined'&&city.phase==='play')updateCityCamera();
});


// ==========================================================
// SINKRONISASI DARI VERSI CODEX: LEVEL 3 — HUTAN & LEVEL 4 — PABRIK
// Baseline Level 1–2 tetap dipertahankan.
// ==========================================================
// LEVEL 3 — HUTAN
const forestWoodItems=[
  {x:18,y:38,variant:0,collected:false},{x:36,y:29,variant:1,collected:false},{x:67,y:31,variant:2,collected:false},
  {x:82,y:53,variant:1,collected:false},{x:58,y:72,variant:0,collected:false},{x:27,y:76,variant:2,collected:false}
];
const forestPlantSpots=[{x:35.5,y:28,dug:false,seeded:false,watered:false},{x:39,y:62,dug:false,seeded:false,watered:false},{x:61,y:70,dug:false,seeded:false,watered:false}];
const forestObstacles=[
  {type:'ellipse',x:7,y:47,rx:6,ry:20},{type:'ellipse',x:20,y:89,rx:13,ry:8},
  {type:'ellipse',x:60,y:9,rx:9,ry:7},{type:'polygon',points:[[84,5],[100,5],[100,73],[92,71],[89,62],[88,48],[82,34]]}
];
const forestEntranceIntroLines=['Jalur ini menuju Hutan Hijau. Kondisinya tampak lebih gersang dari yang kubayangkan.','Aku harus menemui petugas di depan sebelum masuk dan memulai pemulihan.'];
const forestMissionLines=['Banyak kayu bekas tebangan masih berserakan dan menutup lahan tanam.','Aku akan memungut semuanya, menggali tiga lubang, lalu menaruh benih.','Setelah itu setiap bibit harus disiram agar hutan mulai tumbuh kembali.'];
const forestNpcLines=['Area di dalam hutan baru saja dibersihkan dari penebangan, tetapi kayunya masih berserakan.','Kumpulkan kayu terlebih dahulu. Setelah lahannya lapang, gali tiga lubang di titik yang sudah ditandai.','Tanam benih dan siram setiap titik. Jalurnya sudah kubuka, hati-hati di dalam.'];
const forestNpcPortraits=['assets/level1/npc/pak-rudi-present.png','assets/level1/npc/pak-rudi-explain.png','assets/level1/npc/pak-rudi-open.png'];
const forestClosingLinesByOutcome={
  clean:['Semua kayu sudah dipungut dan tiga bibit berhasil ditanam serta disiram.','Lahan yang tadinya gersang kini mulai hijau kembali.','Pohon-pohon kecil ini akan tumbuh jika terus dijaga bersama.'],
  partial:['Sebagian pekerjaan penghijauan berhasil diselesaikan sebelum waktu habis.','Setiap kayu yang disingkirkan dan setiap bibit yang ditanam tetap membantu hutan ini.','Pemulihan harus diteruskan agar seluruh lahan kembali hijau.'],
  dirty:['Waktunya habis ketika pemulihan baru dimulai.','Hutan ini masih memerlukan banyak pekerjaan dan perhatian.','Aku harus lebih teliti pada perjalanan berikutnya.']
};
let forestDialogIndex=0,forestDialogTyping=false,forestDialogFinish=false,forestDialogMode='entrance-intro';
let forestEntranceActive=false,forestEntranceStage='approach',forestEntrancePlayer={x:50,y:86},forestEntranceDirection='up';
let forestNpcDialogActive=false,forestNpcDialogIndex=0,forestNpcDialogTyping=false,forestNpcDialogFinish=false;
let forestWoodCollected=0,forestDugCount=0,forestSeededCount=0,forestWateredCount=0;
let forestRun=0;
function stopForestSession(){forestRun++;forestEntranceActive=false;forestNpcDialogActive=false;forestGameplay=false;forestStarting=false;forestInteractionHeld=false;levelThreeActive=false;movementKeys.clear();resetForestHold();closeForestWateringGame();}
function getForestClosingLines(){return forestClosingLinesByOutcome[forestOutcome]||forestClosingLinesByOutcome.dirty;}
function getForestDialogLines(closing=false){if(closing)return getForestClosingLines();return forestDialogMode==='entrance-intro'?forestEntranceIntroLines:forestMissionLines;}
function forestCompletedActions(){return forestWoodCollected+forestDugCount+forestSeededCount+forestWateredCount;}
function updateForestHud(){
  const labels=[['TAHAP 1 / 4','PUNGUT KAYU BERSERAKAN',forestWoodCollected,6],['TAHAP 2 / 4','GALI TIGA LUBANG',forestDugCount,3],['TAHAP 3 / 4','TARUH BENIH',forestSeededCount,3],['TAHAP 4 / 4','SIRAM SEMUA BIBIT',forestWateredCount,3]];const [stage,objective,value,total]=labels[forestStage-1];
  $('#forest-stage-label').textContent=stage;$('#forest-objective').textContent=objective;$('#forest-progress').textContent=`${value} / ${total}`;const percent=Math.round(forestCompletedActions()/15*100);$('#forest-restoration-bar').value=percent;$('#forest-restoration-bar').textContent=`${percent}%`;
}
function setForestWorldStage(stage){$('#forest-world').dataset.stage=stage;}
function startLevelThree(){
  forestRun++;resetInteractionState();resetTimerAlert('forest',$('#forest-timer-hud'));showScreen('#level-3-screen');levelThreeActive=true;forestGameplay=false;forestStage=1;forestProgress=0;forestTime=150;forestPlayer={x:50,y:82};forestDirection='up';forestInteractionHeld=false;plantHoldProgress=0;activePlantSite=null;forestMiniGame=null;forestEnding=false;forestOutcome='dirty';
  forestStarting=false;forestEntranceActive=false;forestEntranceStage='approach';forestEntrancePlayer={x:50,y:86};forestEntranceDirection='up';forestNpcDialogActive=false;forestNpcDialogIndex=0;forestWoodCollected=0;forestDugCount=0;forestSeededCount=0;forestWateredCount=0;forestWoodItems.forEach(item=>item.collected=false);forestPlantSpots.forEach(site=>{site.dug=false;site.seeded=false;site.watered=false});
  $('#level-3-screen').className='screen level-three active intro-mode entrance-mode';leaveEnvironmentCamera('#forest-camera');setForestWorldStage('wood');$('#forest-sites').classList.remove('cleared-after-watering');$('#forest-sites').replaceChildren();$('#forest-watering-game').hidden=true;$('#forest-complete').hidden=true;$('#forest-game-over').hidden=true;$('#forest-ready').hidden=true;resetForestHold();$('#forest-timer-hud').classList.remove('warning','critical');
  $('#forest-entrance').hidden=false;$('#forest-entrance').classList.remove('leaving');$('#forest-entrance-gate').classList.remove('open');$('#forest-npc-dialog').hidden=true;$('#forest-entrance-prompt').classList.remove('show');$('#forest-entry-loading').hidden=true;$('#forest-entry-loading').classList.remove('visible');
  setGameplaySprite('#forest-player-sprite','up',false);setGameplaySprite('#forest-entrance-player-sprite','up',false);updateForestPlayer();updateForestEntrancePlayer();updateForestHud();updateForestTimer();
  forestDialogIndex=0;forestDialogMode='entrance-intro';forestDialogTyping=false;forestDialogFinish=false;$('#forest-opening-name').textContent=playerName;$('#forest-closing-name').textContent=playerName;$('#forest-dialog-text').textContent='';$('#forest-opening').className='opening-dialog forest-dialog entrance-intro awaiting-dialog-tap';$('#forest-closing').classList.add('hidden');
}
async function typeForestLine(node,text){const run=forestRun,version=flowVersion;node.textContent='';forestDialogTyping=true;forestDialogFinish=false;for(const char of text){if(run!==forestRun||!levelThreeActive)return;if(forestDialogFinish){node.textContent=text;break;}node.textContent+=char;if(!await pausableSleep(34,version))return;}if(run===forestRun)forestDialogTyping=false;}
function showForestDialog(closing=false){const lines=getForestDialogLines(closing),poses=closing?[2,3,1]:[1,2,3];$(closing?'#forest-closing-character':'#forest-opening-character').src=`assets/level1/characters/pose-${poses[forestDialogIndex%poses.length]}.png`;typeForestLine(closing?$('#forest-closing-text'):$('#forest-dialog-text'),lines[forestDialogIndex]);}
function advanceForestDialog(closing=false){
  if(paused||!levelThreeActive)return;const dialog=$(closing?'#forest-closing':'#forest-opening');if(dialog.classList.contains('hidden'))return;
  if(!closing&&dialog.classList.contains('awaiting-dialog-tap')){dialog.classList.remove('awaiting-dialog-tap');forestDialogIndex=0;showForestDialog(false);return;}
  if(forestDialogTyping){forestDialogFinish=true;return;}const lines=getForestDialogLines(closing);forestDialogIndex++;if(forestDialogIndex<lines.length){showForestDialog(closing);return;}
  dialog.classList.add('hidden');if(closing){if(forestOutcome==='clean')enablePostLevelExit(3);else $('#forest-complete').hidden=false;return;}if(forestDialogMode==='entrance-intro'){forestEntranceActive=true;nearestForestEntranceTarget();showGlobalToast('Dekati Pak Rudi lalu tekan E.');}else $('#forest-ready').hidden=false;
}
function updateForestEntrancePlayer(){const player=$('#forest-entrance-player');player.style.left=`${forestEntrancePlayer.x}%`;player.style.top=`${forestEntrancePlayer.y}%`;}
function isForestEntranceWalkable(x,y){return x>=9&&x<=91&&y>=42&&y<=92;}
function nearestForestEntranceTarget(){
  const target=forestEntranceStage==='approach'?{type:'npc',x:25,y:58,label:'BICARA DENGAN PAK RUDI'}:forestEntranceStage==='gate'?{type:'gate',x:51,y:37,label:'MASUK KE HUTAN'}:null;const prompt=$('#forest-entrance-prompt');if(!target||forestNpcDialogActive){prompt.classList.remove('show');return null;}const distance=Math.hypot(target.x-forestEntrancePlayer.x,target.y-forestEntrancePlayer.y);prompt.style.left=`${target.x}%`;prompt.style.top=`${target.y-6}%`;prompt.querySelector('span').textContent=target.label;prompt.classList.toggle('show',distance<9);return distance<9?target:null;
}
function updateForestEntranceMotion(dx,dy,now=performance.now()){const moving=Boolean(dx||dy)&&forestEntranceActive&&!paused&&!forestNpcDialogActive;$('#forest-entrance-player').classList.toggle('walking',moving);if(moving)forestEntranceDirection=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');setGameplaySprite('#forest-entrance-player-sprite',forestEntranceDirection,moving,now);}
async function typeForestNpcLine(){const run=forestRun,version=flowVersion,text=forestNpcLines[forestNpcDialogIndex],node=$('#forest-npc-text'),portrait=$('#forest-npc-portrait');node.textContent='';forestNpcDialogTyping=true;forestNpcDialogFinish=false;portrait.src=forestNpcPortraits[forestNpcDialogIndex%forestNpcPortraits.length];portrait.classList.remove('pose-in');void portrait.offsetWidth;portrait.classList.add('pose-in');for(const char of text){if(run!==forestRun||!forestNpcDialogActive)return;if(forestNpcDialogFinish){node.textContent=text;break;}node.textContent+=char;if(!await pausableSleep(32,version))return;}if(run===forestRun)forestNpcDialogTyping=false;}
function openForestNpcDialog(){if(forestNpcDialogActive||forestEntranceStage!=='approach')return;forestNpcDialogActive=true;forestNpcDialogIndex=0;movementKeys.clear();$('#forest-entrance-prompt').classList.remove('show');$('#forest-npc-dialog').hidden=false;typeForestNpcLine();}
function advanceForestNpcDialog(){if(!forestNpcDialogActive||paused)return;if(forestNpcDialogTyping){forestNpcDialogFinish=true;return;}forestNpcDialogIndex++;if(forestNpcDialogIndex<forestNpcLines.length){typeForestNpcLine();return;}forestNpcDialogActive=false;forestEntranceStage='gate';$('#forest-npc-dialog').hidden=true;$('#forest-entrance-gate').classList.add('open');nearestForestEntranceTarget();showGlobalToast('Jalur menuju Hutan Hijau sudah dibuka.');}
async function enterForestFromGate(){
  if(forestEntranceStage!=='gate'||!forestEntranceActive)return;forestEntranceStage='transition';forestEntranceActive=false;movementKeys.clear();$('#forest-entrance-prompt').classList.remove('show');$('#forest-entrance').classList.add('leaving');const run=forestRun,version=flowVersion;const loading=$('#forest-entry-loading');loading.hidden=false;requestAnimationFrame(()=>loading.classList.add('visible'));if(!await pausableSleep(1450,version)||run!==forestRun)return;$('#forest-entrance').hidden=true;loading.classList.remove('visible');if(!await pausableSleep(350,version)||run!==forestRun)return;loading.hidden=true;forestDialogMode='mission-intro';forestDialogIndex=0;$('#forest-opening').className='opening-dialog forest-dialog mission-intro';showForestDialog(false);
}
function interactForestEntrance(){if(!forestEntranceActive||paused||forestNpcDialogActive)return;const target=nearestForestEntranceTarget();if(!target)return;if(target.type==='npc')openForestNpcDialog();else enterForestFromGate();}
$('#forest-npc-dialog').addEventListener('click',advanceForestNpcDialog);$('#forest-entrance-interact').addEventListener('pointerdown',event=>{event.preventDefault();runInteraction('forest-entrance',interactForestEntrance);});
$('#forest-opening').addEventListener('click',()=>advanceForestDialog(false));$('#forest-closing').addEventListener('click',()=>advanceForestDialog(true));
async function beginForestGameplay(){const run=forestRun,version=flowVersion;if(paused||forestGameplay||forestStarting||forestEnding)return;primeGameplayAudio();forestStarting=true;movementKeys.clear();$('#forest-ready').hidden=true;renderForestSites();$('#level-3-screen').classList.remove('intro-mode','entrance-mode');enterEnvironmentCamera('#forest-camera',updateForestCamera);if(!await pausableSleep(950,version)||run!==forestRun||!levelThreeActive){forestStarting=false;return;}if(!await runLevelCountdown('#shared-level-countdown',version,()=>run===forestRun&&levelThreeActive&&!forestEnding)){forestStarting=false;return;}forestStarting=false;forestGameplay=true;unsavedChanges=true;startGameplaySoundtrack();forestFeedback('PUNGUT ENAM KAYU BERSERAKAN');}
$('#forest-ready-start').addEventListener('click',()=>{if(!paused&&levelThreeActive)beginForestGameplay();});
function updateForestCamera(){updateEnvironmentCamera('#forest-world','#forest-camera',forestPlayer.x,forestPlayer.y);}
function updateForestPlayer(){const node=$('#forest-player');node.style.left=`${forestPlayer.x}%`;node.style.top=`${forestPlayer.y}%`;const prompt=$('#forest-prompt');prompt.style.left=`${forestPlayer.x}%`;prompt.style.top=`${forestPlayer.y}%`;updateForestCamera();}
function isForestWalkable(x,y){
  if(x<7||x>93||y<10||y>90)return false;
  return !forestObstacles.some(obstacle=>{
    if(obstacle.type==='ellipse'){const nx=(x-obstacle.x)/(obstacle.rx+1),ny=(y-obstacle.y)/(obstacle.ry+1.2);return nx*nx+ny*ny<1;}
    return pointInPolygon(x,y,obstacle.points);
  });
}
function forestSiteComplete(item){if(forestStage===1)return item.collected;if(forestStage===2)return item.dug;if(forestStage===3)return item.seeded;return item.watered;}
function renderForestSites(){
  const layer=$('#forest-sites');layer.innerHTML='';const items=forestStage===1?forestWoodItems:forestPlantSpots;items.forEach((item,index)=>{if(forestStage===1&&item.collected)return;const node=document.createElement('button');node.type='button';node.className=`forest-site forest-stage-${forestStage}`;node.dataset.index=index;node.style.left=`${item.x}%`;node.style.top=`${item.y}%`;if(forestStage===1)node.innerHTML=`<i class="forest-wood-sprite variant-${item.variant}"></i>`;else if(forestStage===2)node.innerHTML='<i class="forest-ground-marker"></i>';else if(forestStage===3)node.innerHTML=item.seeded?'<img class="forest-seedling" src="assets/level3/new/seedling.png" alt="Bibit tertanam">':'<i class="forest-seed-marker">+</i>';else node.innerHTML='<img class="forest-water-can" src="assets/level3/new/watering-can-transparent.png" alt="Siram bibit"><i class="forest-watering-animation"></i>';if(forestSiteComplete(item))node.classList.add('done');if(item.dug)node.classList.add('dug');if(item.seeded)node.classList.add('seeded');if(item.watered)node.classList.add('watered');layer.append(node);});
}
function nearestForestSite(){let nearest=null,distance=999;if(forestMiniGame){$('#forest-prompt').classList.remove('show');return null;}document.querySelectorAll('.forest-site:not(.done)').forEach(node=>{const item=(forestStage===1?forestWoodItems:forestPlantSpots)[Number(node.dataset.index)],d=Math.hypot(item.x-forestPlayer.x,item.y-forestPlayer.y);node.classList.toggle('near',d<8);if(d<distance){distance=d;nearest=node;}});const valid=distance<9&&!forestEnding;$('#forest-prompt').classList.toggle('show',valid);if(valid)$('#forest-prompt').textContent=forestStage===1?'[E] AMBIL KAYU':forestStage===2?'TAHAN [E] GALI LUBANG':forestStage===3?'[E] TARUH BENIH':'[E] MINIGAME SIRAM';return valid?nearest:null;}
function resetForestHold(){plantHoldProgress=0;activePlantSite?.classList.remove('watering-active');activePlantSite=null;$('#plant-hold').hidden=true;$('#plant-hold-fill').style.width='0%';}
function forestFeedback(text){const node=$('#forest-feedback');node.textContent=text;node.classList.remove('show');void node.offsetWidth;node.classList.add('show');setTimeout(()=>node.classList.remove('show'),1800);}
function advanceForestStage(){
  resetForestHold();if(forestStage===1){forestStage=2;setForestWorldStage('cleared');forestFeedback('Lahan terbuka. Gali tiga lubang pada lingkaran!');}else if(forestStage===2){forestStage=3;setForestWorldStage('holes');forestFeedback('Lubang siap. Taruh satu benih di setiap titik!');}else if(forestStage===3){forestStage=4;setForestWorldStage('planted');forestFeedback('Semua benih tertanam. Siram satu per satu!');}renderForestSites();updateForestHud();
}
function updateForestWateringGame(){
  if(!forestMiniGame||forestMiniGame.type!=='watering')return;
  $('#forest-water-needle').style.left=`${forestMiniGame.needle}%`;
  $('#forest-water-hits').textContent=`${forestMiniGame.hits} / 3 TEPAT`;
}
function openForestWateringGame(index){
  if(forestMiniGame||forestStage!==4||forestPlantSpots[index]?.watered)return;
  forestMiniGame={type:'watering',siteIndex:index,hits:0,needle:8,direction:1,locked:false};
  movementKeys.clear();forestInteractionHeld=false;resetForestHold();$('#forest-prompt').classList.remove('show');
  $('#forest-water-feedback').textContent='Tekan saat jarum berada di zona hijau.';$('#forest-watering-game').hidden=false;updateForestWateringGame();
}
function closeForestWateringGame(){
  forestMiniGame=null;const game=$('#forest-watering-game');if(game)game.hidden=true;const visual=$('#forest-watering-visual');if(visual)visual.classList.remove('pouring','miss');
}
function completeForestWateringGame(){
  if(!forestMiniGame||forestMiniGame.type!=='watering')return;
  const index=forestMiniGame.siteIndex,site=forestPlantSpots[index];if(!site||site.watered){closeForestWateringGame();return;}
  site.watered=true;forestWateredCount++;closeForestWateringGame();playAudio($('#level1-success'),true,.58);renderForestSites();updateForestHud();forestFeedback(`Bibit disiram lewat minigame · ${forestWateredCount} / 3`);
  if(forestWateredCount===3){$('#forest-sites').classList.add('cleared-after-watering');setForestWorldStage('restored');finishLevelThree('complete');}
}
function attemptForestWatering(){
  if(!forestMiniGame||forestMiniGame.type!=='watering'||forestMiniGame.locked||paused)return;
  const game=forestMiniGame,visual=$('#forest-watering-visual'),hit=game.needle>=38&&game.needle<=62;game.locked=true;visual.classList.remove('pouring','miss');void visual.offsetWidth;visual.classList.add(hit?'pouring':'miss');
  if(hit){game.hits++;$('#forest-water-feedback').textContent=game.hits===3?'Aliran pas! Bibit selesai disiram.':'Tepat! Ulangi sampai tiga kali.';playAudio($('#level1-dispose'),true,.48);}else{$('#forest-water-feedback').textContent='Belum tepat. Tunggu jarum masuk zona hijau.';playAudio($('#level1-fail'),true,.32);}
  updateForestWateringGame();const run=forestRun,version=flowVersion;scheduleLevelCallback(()=>{if(run!==forestRun||version!==flowVersion||forestMiniGame!==game)return;if(game.hits>=3)completeForestWateringGame();else{game.locked=false;visual.classList.remove('pouring','miss');}},420);
}
function interactForest(){
  if(!forestGameplay||paused||forestEnding||forestMiniGame)return;const node=nearestForestSite();if(!node)return;const index=Number(node.dataset.index);if(forestStage===1){const item=forestWoodItems[index];if(item.collected)return;item.collected=true;forestWoodCollected++;node.remove();playAudio($('#level1-pickup'),true,.65);forestFeedback(`Kayu dipungut · ${forestWoodCollected} / 6`);updateForestHud();if(forestWoodCollected===6)advanceForestStage();return;}if(forestStage===3){const site=forestPlantSpots[index];if(site.seeded)return;site.seeded=true;forestSeededCount++;playAudio($('#level1-dispose'),true,.58);renderForestSites();updateForestHud();forestFeedback(`Benih ditanam · ${forestSeededCount} / 3`);if(forestSeededCount===3)advanceForestStage();return;}if(forestStage===4){openForestWateringGame(index);return;}activePlantSite=node;plantHoldProgress=0;
}
function completeForestHold(node){
  const index=Number(node.dataset.index),site=forestPlantSpots[index];if(forestStage===2&&!site.dug){site.dug=true;forestDugCount++;playAudio($('#level1-dispose'),true,.58);forestFeedback(`Lubang digali · ${forestDugCount} / 3`);}resetForestHold();renderForestSites();updateForestHud();if(forestStage===2&&forestDugCount===3)advanceForestStage();
}
function updateForestHold(dt,near){
  if(forestStage!==2||!forestInteractionHeld||!near){if(activePlantSite&&!forestInteractionHeld)resetForestHold();return;}if(activePlantSite!==near){activePlantSite=near;plantHoldProgress=0;}$('#forest-hold-label').textContent='TAHAN E UNTUK MENGGALI';$('#plant-hold').hidden=false;plantHoldProgress=Math.min(1,plantHoldProgress+dt/3);$('#plant-hold-fill').style.width=`${plantHoldProgress*100}%`;if(plantHoldProgress>=1)completeForestHold(near);
}
function updateForestTimer(){const value=Math.max(0,Math.ceil(forestTime));$('#forest-timer').textContent=formatTime(value);updateTimerAlert('forest',forestTime,$('#forest-timer-hud'));}
function getForestOutcome(){const progress=forestCompletedActions();if(forestWateredCount===3)return 'clean';return progress>=6?'partial':'dirty';}
async function finishLevelThree(reason='complete'){
  if(forestEnding)return;forestEnding=true;forestGameplay=false;stopGameplaySoundtrack();forestInteractionHeld=false;movementKeys.clear();closeForestWateringGame();resetForestHold();$('#forest-prompt').classList.remove('show');$('#forest-player').classList.remove('walking');leaveEnvironmentCamera('#forest-camera');forestOutcome=getForestOutcome();const title={clean:'HUTAN BERHASIL DIHIJAUKAN',partial:'HUTAN MULAI PULIH',dirty:'HUTAN MASIH GERSANG'}[forestOutcome],copy={clean:'Tiga bibit tertanam, tersiram, dan lahan kembali hijau.',partial:'Sebagian tahapan penghijauan berhasil diselesaikan sebelum waktu habis.',dirty:'Waktu habis sebelum lahan siap dihijaukan.'}[forestOutcome];$('#forest-result-title').textContent=title;$('#forest-result-copy').textContent=copy;$('#forest-result-wood').textContent=`${forestWoodCollected} / 6`;$('#forest-result-dug').textContent=`${forestDugCount} / 3`;$('#forest-result-seeded').textContent=`${forestSeededCount} / 3`;$('#forest-result-watered').textContent=`${forestWateredCount} / 3`;$('#forest-result-time').textContent=formatTime(forestTime);playAudio(forestOutcome==='dirty'?$('#level1-fail'):$('#level1-success'),true,.72);
  if(reason!=='complete'){
    $('#forest-failed-stage').textContent=`Tahap terakhir: ${forestCompletedActions()} / 15 tindakan penghijauan selesai.`;
    $('#forest-game-over').hidden=false;
    return;
  }
  forestDialogIndex=0;const run=forestRun,version=flowVersion;if(!await pausableSleep(1800,version)||run!==forestRun||!levelThreeActive)return;$('#forest-closing').classList.remove('hidden');showForestDialog(true);
}
function gameOverLevelThree(){finishLevelThree('timeout');}
$('#forest-continue').addEventListener('click',()=>{$('#forest-complete').hidden=true;beginReturnToNpc(3);});$('#forest-retry').addEventListener('click',startLevelThree);$('#forest-map').addEventListener('click',()=>{levelThreeActive=false;showScreen('#map');});
document.querySelectorAll('[data-forest-key]').forEach(button=>{const key=button.dataset.forestKey;button.addEventListener('pointerdown',event=>{event.preventDefault();movementKeys.add(key);});button.addEventListener('pointerup',()=>movementKeys.delete(key));button.addEventListener('pointercancel',()=>movementKeys.delete(key));});
$('#forest-touch-interact').addEventListener('pointerdown',event=>{event.preventDefault();forestInteractionHeld=true;runInteraction('level-3',interactForest);});['pointerup','pointercancel','lostpointercapture'].forEach(type=>$('#forest-touch-interact').addEventListener(type,()=>{forestInteractionHeld=false;resetForestHold();}));
$('#forest-water-pour').addEventListener('click',attemptForestWatering);$('#forest-water-cancel').addEventListener('click',closeForestWateringGame);
document.addEventListener('keydown',event=>{if(forestMiniGame?.type==='watering'&&(event.code==='Space'||event.key==='Enter')){event.preventDefault();if(!event.repeat)attemptForestWatering();}});
let forestLastFrame=performance.now();
function forestLoop(now){
  const dt=Math.min((now-forestLastFrame)/1000,.05);forestLastFrame=now;let moving=false;
  if(forestEntranceActive&&!paused&&!forestNpcDialogActive){let dx=0,dy=0;if(movementKeys.has('a')||movementKeys.has('arrowleft'))dx--;if(movementKeys.has('d')||movementKeys.has('arrowright'))dx++;if(movementKeys.has('w')||movementKeys.has('arrowup'))dy--;if(movementKeys.has('s')||movementKeys.has('arrowdown'))dy++;const length=Math.hypot(dx,dy)||1,step=16*dt,nextX=forestEntrancePlayer.x+dx/length*step,nextY=forestEntrancePlayer.y+dy/length*step;if(isForestEntranceWalkable(nextX,forestEntrancePlayer.y))forestEntrancePlayer.x=nextX;if(isForestEntranceWalkable(forestEntrancePlayer.x,nextY))forestEntrancePlayer.y=nextY;updateForestEntranceMotion(dx,dy,now);updateForestEntrancePlayer();nearestForestEntranceTarget();}else updateForestEntranceMotion(0,0,now);
  if(forestGameplay&&!paused&&!forestEnding){forestTime=Math.max(0,forestTime-dt);updateForestTimer();if(forestTime<=0)finishLevelThree('timeout');else if(forestMiniGame?.type==='watering'){if(!forestMiniGame.locked){forestMiniGame.needle+=forestMiniGame.direction*56*dt;if(forestMiniGame.needle>=96){forestMiniGame.needle=96;forestMiniGame.direction=-1}else if(forestMiniGame.needle<=4){forestMiniGame.needle=4;forestMiniGame.direction=1}updateForestWateringGame();}}else{let dx=0,dy=0;if(movementKeys.has('a')||movementKeys.has('arrowleft'))dx--;if(movementKeys.has('d')||movementKeys.has('arrowright'))dx++;if(movementKeys.has('w')||movementKeys.has('arrowup'))dy--;if(movementKeys.has('s')||movementKeys.has('arrowdown'))dy++;moving=Boolean(dx||dy);if(moving){forestDirection=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');const length=Math.hypot(dx,dy)||1,nextX=forestPlayer.x+dx/length*18*dt,nextY=forestPlayer.y+dy/length*18*dt;if(isForestWalkable(nextX,forestPlayer.y))forestPlayer.x=nextX;if(isForestWalkable(forestPlayer.x,nextY))forestPlayer.y=nextY;updateForestPlayer();}const near=nearestForestSite();updateForestHold(dt,near);}}
  $('#forest-player').classList.toggle('walking',moving);setGameplaySprite('#forest-player-sprite',forestDirection,moving,now);requestAnimationFrame(forestLoop);
}
requestAnimationFrame(forestLoop);
const pakRudiLines = [
  'Oh, kamu datang? Taman ini sedang dalam kondisi yang kurang baik akhir-akhir ini.',
  'Banyak sampah berserakan dan beberapa fasilitas taman mulai rusak.',
  'Kalau kamu mau, kamu bisa membantu membersihkannya. Taman ini akan kembali indah jika kita jaga bersama.',
  'Tekan tombol E di depan gerbang taman untuk mulai membersihkan. Aku yakin kamu bisa!'
];
const pakRudiPortraits = [
  'assets/level1/npc/pak-rudi-present.png',
  'assets/level1/npc/pak-rudi-explain.png',
  'assets/level1/npc/pak-rudi-open.png',
  'assets/level1/npc/pak-rudi-explain.png'
];
// LEVEL 4 — PABRIK
const factoryFloorTasks=[
  {key:'floor-a',x:33,y:31,name:'Noda oli kiri atas',icon:'?',done:false},
  {key:'floor-b',x:42,y:51,name:'Noda oli tengah',icon:'?',done:false},
  {key:'floor-c',x:57,y:68,name:'Noda oli kanan',icon:'?',done:false},
  {key:'floor-d',x:39,y:82,name:'Noda oli bawah',icon:'?',done:false}
];
const factoryActionPoints={
  sorting:{key:'sorting',x:27,y:53,name:'Tempat pemilahan sampah',icon:'♻'},
  filter:{key:'filter',x:72,y:34,name:'Filter udara pabrik',icon:'◉'}
};
const factorySortingItems=[
  {type:'metal',label:'Roda gigi',row:1,col:0},{type:'metal',label:'Baut',row:1,col:1},{type:'metal',label:'Pipa',row:1,col:2},{type:'metal',label:'Kunci',row:1,col:3},
  {type:'plastic',label:'Botol',row:2,col:0},{type:'plastic',label:'Kantong',row:2,col:1},{type:'plastic',label:'Kemasan',row:2,col:2},{type:'plastic',label:'Gelas',row:2,col:3},
  {type:'b3',label:'Oli bekas',row:3,col:0},{type:'b3',label:'Baterai',row:3,col:1},{type:'b3',label:'Cat kimia',row:3,col:2},{type:'b3',label:'Elektronik',row:3,col:3}
];
const factoryOpeningLines=['Aku sudah mendapat arahan dari petugas di luar pabrik.','Pertama, bersihkan empat noda yang ditandai di lantai agar area kerja aman.','Sesudah itu pilah limbah di meja, lalu bersihkan filter udara.'];
const factoryClosingLines=['Lantai pabrik sudah bersih, limbah sudah dipilah, dan aliran udaranya kembali aman.','Setiap jenis limbah wajib masuk ke wadah yang tepat agar tidak menimbulkan pencemaran baru.','Aku harus kembali menemui petugas di depan pabrik untuk menerima tujuan berikutnya.'];
let factoryWasteSorted=0;
let factoryFilterDebris=0;
let factoryFilterScrubbed=0;
let factorySortingDone=false;
let factoryFilterDone=false;

function factoryFloorCount(){return factoryFloorTasks.filter(task=>task.done).length;}
function factorySprite(row,col,label=''){return `<span class="factory-sprite" style="--sprite-row:${row};--sprite-col:${col}" role="img" aria-label="${label}"></span>`;}
function setFactoryReveal(value){$('#factory-world').style.setProperty('--factory-clean',String(value));}
function startLevelFour(){
  resetInteractionState();resetTimerAlert('factory',$('#factory-timer-hud'));showScreen('#level-4-screen');
  levelFourActive=true;factoryGameplay=false;factoryStarting=false;factoryStage=1;factoryProgress=0;factoryTime=150;factoryPlayer={x:50,y:84};factoryDirection='up';activeFactorySystem=null;factoryMiniGame=null;factoryInteractionHeld=false;factoryHoldProgress=0;activeFactorySite=null;factoryEnding=false;factoryOutcome='dirty';
  factoryFloorTasks.forEach(task=>task.done=false);factoryWasteSorted=0;factoryFilterDebris=0;factoryFilterScrubbed=0;factorySortingDone=false;factoryFilterDone=false;
  $('#factory-world').className='factory-world';setFactoryReveal(0);leaveEnvironmentCamera('#factory-camera');$('#factory-complete').hidden=true;$('#factory-game-over').hidden=true;$('#factory-minigame').hidden=true;$('#factory-site-dialog').hidden=true;$('#factory-hold').hidden=true;$('#factory-timer-hud').classList.remove('warning','critical');
  setGameplaySprite('#factory-player-sprite','up',false);renderFactorySites();updateFactoryPlayer();updateFactoryHud();updateFactoryTimer();factoryDialogIndex=0;$('#factory-opening-name').textContent=playerName;$('#factory-closing-name').textContent=playerName;$('#factory-opening').classList.remove('hidden');$('#factory-closing').classList.add('hidden');showFactoryDialog(false);
}
function activeFactorySites(){
  if(factoryStage===1)return factoryFloorTasks.filter(task=>!task.done);
  if(factoryStage===2&&!factorySortingDone)return [factoryActionPoints.sorting];
  if(factoryStage===3&&!factoryFilterDone)return [factoryActionPoints.filter];
  return [];
}
function renderFactorySites(){
  const layer=$('#factory-sites');layer.innerHTML='';activeFactorySites().forEach(site=>{const node=document.createElement('button');node.type='button';node.className=`factory-site damage-state ${site.key.startsWith('floor')?'floor-damage':'action-point'}`;node.dataset.key=site.key;node.dataset.x=site.x;node.dataset.y=site.y;node.style.left=`${site.x}%`;node.style.top=`${site.y}%`;node.setAttribute('aria-label',site.name);node.innerHTML=`<span class="factory-site-icon">${site.icon}</span><small>${site.name}</small>`;layer.append(node);});
}
async function typeFactoryLine(node,text){const version=flowVersion;node.textContent='';factoryDialogTyping=true;factoryDialogFinish=false;for(const char of text){if(version!==flowVersion)return;if(factoryDialogFinish){node.textContent=text;break;}node.textContent+=char;if(!await pausableSleep(34,version))return;}factoryDialogTyping=false;}
function showFactoryDialog(closing){typeFactoryLine(closing?$('#factory-closing-text'):$('#factory-dialog-text'),(closing?factoryClosingLines:factoryOpeningLines)[factoryDialogIndex]);}
async function beginFactoryGameplay(){if(factoryStarting||factoryGameplay||factoryEnding)return;primeGameplayAudio();factoryStarting=true;const version=flowVersion;$('#factory-opening').classList.add('hidden');enterEnvironmentCamera('#factory-camera',updateFactoryCamera);if(!await runLevelCountdown('#shared-level-countdown',version,()=>levelFourActive&&!factoryEnding)){factoryStarting=false;return;}factoryStarting=false;factoryGameplay=true;startGameplaySoundtrack();}
function advanceFactoryDialog(closing){if(paused)return;if(factoryDialogTyping){factoryDialogFinish=true;return;}const lines=closing?factoryClosingLines:factoryOpeningLines;factoryDialogIndex++;if(factoryDialogIndex<lines.length){showFactoryDialog(closing);return;}if(closing){$('#factory-closing').classList.add('hidden');if(factoryOutcome==='clean')enablePostLevelExit(4);else $('#factory-complete').hidden=false;}else beginFactoryGameplay();}
$('#factory-opening').addEventListener('click',()=>advanceFactoryDialog(false));$('#factory-closing').addEventListener('click',()=>advanceFactoryDialog(true));
function updateFactoryCamera(){updateEnvironmentCamera('#factory-world','#factory-camera',factoryPlayer.x,factoryPlayer.y);}
function updateFactoryPlayer(){const node=$('#factory-player');node.style.left=`${factoryPlayer.x}%`;node.style.top=`${factoryPlayer.y}%`;const prompt=$('#factory-prompt');prompt.style.left=`${factoryPlayer.x}%`;prompt.style.top=`${factoryPlayer.y}%`;updateFactoryCamera();}
function isFactoryWalkable(x,y){
  if(x<18||x>82||y<28||y>91)return false;
  if(x<24&&y<63)return false;
  if(x>76&&y>42)return false;
  return true;
}
function nearestFactorySite(){
  let nearest=null,distance=999;document.querySelectorAll('.factory-site').forEach(node=>{const d=Math.hypot(Number(node.dataset.x)-factoryPlayer.x,Number(node.dataset.y)-factoryPlayer.y);node.classList.toggle('near',d<9);if(d<distance){distance=d;nearest=node;}});
  const valid=distance<10&&!isFactoryMinigameOpen();$('#factory-prompt').classList.toggle('show',valid);$('#factory-prompt').textContent=factoryStage===1?'TAHAN [E] BERSIHKAN':factoryStage===2?'[E] BUKA MEJA PEMILAHAN':'[E] PERIKSA FILTER UDARA';return valid?nearest:null;
}
function updateFactoryHud(){
  const labels={1:['TAHAP 1 / 3','BERSIHKAN 4 NODA LANTAI'],2:['TAHAP 2 / 3','PILAH LIMBAH SESUAI JENIS'],3:['TAHAP 3 / 3','BERSIHKAN FILTER UDARA']}[factoryStage];
  const totals={1:4,2:12,3:9};const values={1:factoryFloorCount(),2:factoryWasteSorted,3:factoryFilterDebris+factoryFilterScrubbed};factoryProgress=values[factoryStage];$('#factory-stage-label').textContent=labels[0];$('#factory-objective').textContent=labels[1];$('#factory-progress').textContent=`${factoryProgress} / ${totals[factoryStage]}`;const bar=$('.factory-hud progress');if(bar){bar.max=totals[factoryStage];bar.value=factoryProgress;}
}
function updateFactoryTimer(){const time=formatTime(factoryTime);$('#factory-timer').textContent=time;$('#factory-task-time').textContent=time;const hud=$('#factory-timer-hud');hud.classList.toggle('warning',factoryTime<=60&&factoryTime>30);hud.classList.toggle('critical',factoryTime<=30);updateTimerAlert('factory',factoryTime,hud);}
function factoryFeedback(text){const node=$('#factory-feedback');node.textContent=text;node.classList.add('show');clearTimeout(factoryFeedback.timer);factoryFeedback.timer=setTimeout(()=>node.classList.remove('show'),1700);}
function isFactoryMinigameOpen(){return !$('#factory-minigame').hidden;}
function resetFactoryHold(){factoryHoldProgress=0;activeFactorySite=null;$('#factory-hold').hidden=true;$('#factory-hold-fill').style.width='0%';}
function interactFactory(){
  if(!factoryGameplay||paused||factoryEnding||isFactoryMinigameOpen())return;const node=nearestFactorySite();if(!node)return;
  if(node.dataset.key==='sorting')openFactorySorting();
  if(node.dataset.key==='filter')openFactoryFilter();
}
function completeFactoryFloor(node){
  const task=factoryFloorTasks.find(item=>item.key===node.dataset.key);if(!task||task.done)return;task.done=true;playAudio($('#level1-success'),true,.5);resetFactoryHold();setFactoryReveal(factoryFloorCount()*.095);renderFactorySites();updateFactoryHud();factoryFeedback(`${task.name} sudah dibersihkan.`);
  if(factoryFloorCount()===4){factoryStage=2;setFactoryReveal(.38);renderFactorySites();updateFactoryHud();factoryFeedback('Lantai aman. Datangi tempat pemilahan yang ditandai lalu tekan E.');}
}
function updateFactoryHold(dt,near){
  if(factoryStage!==1||isFactoryMinigameOpen()){resetFactoryHold();return;}
  if(factoryInteractionHeld&&near){if(activeFactorySite!==near){activeFactorySite=near;factoryHoldProgress=0;}$('#factory-hold-label').textContent='TAHAN E UNTUK MEMBERSIHKAN NODA';$('#factory-hold').hidden=false;factoryHoldProgress=Math.min(1,factoryHoldProgress+dt/1.8);$('#factory-hold-fill').style.width=`${factoryHoldProgress*100}%`;if(factoryHoldProgress>=1)completeFactoryFloor(near);}else resetFactoryHold();
}
function openFactoryShell(kind,title,help){
  factoryMiniGame={type:kind,score:0};const panel=$('#factory-minigame .factory-panel');panel.classList.remove('sorting-panel','filter-panel');panel.classList.add(kind==='waste'?'sorting-panel':'filter-panel');$('#factory-minigame').hidden=false;$('#minigame-counter').textContent=kind==='waste'?'TAHAP 2 / 3 · PEMILAHAN':'TAHAP 3 / 3 · FILTER UDARA';$('#minigame-title').textContent=title;$('#minigame-help').textContent=help;movementKeys.clear();
}
function closeFactoryMinigame(){
  const kind=factoryMiniGame?.type;
  if(kind==='waste'&&!factorySortingDone)factoryWasteSorted=0;
  if(kind==='filter'&&!factoryFilterDone){factoryFilterDebris=0;factoryFilterScrubbed=0;}
  factoryMiniGame=null;$('#factory-minigame').hidden=true;$('#factory-minigame .factory-panel').classList.remove('sorting-panel','filter-panel');movementKeys.clear();updateFactoryHud();
}
$('#close-minigame').addEventListener('click',closeFactoryMinigame);
function openFactorySorting(){
  factoryWasteSorted=0;openFactoryShell('waste','PILAH LIMBAH PABRIK','Geser setiap benda langsung ke tempat sampah sesuai jenisnya. Salah wadah mengurangi waktu 5 detik.');
  $('#minigame-content').innerHTML=`<div class="sorting-scene"><div class="sorting-items">${factorySortingItems.map((item,index)=>`<button class="sorting-item waste-piece" data-index="${index}" data-type="${item.type}" aria-label="${item.label}">${factorySprite(item.row,item.col,item.label)}<small>${item.label}</small></button>`).join('')}</div><div class="sorting-guide-line"><span>GESER LIMBAH KE WADAH YANG SESUAI</span></div><div class="sorting-bins"><button class="sorting-bin waste-zone" data-type="metal">${factorySprite(0,0,'Tempat sampah logam')}<strong>ALAT &amp; LOGAM</strong></button><button class="sorting-bin waste-zone" data-type="plastic">${factorySprite(0,1,'Tempat sampah plastik')}<strong>PLASTIK</strong></button><button class="sorting-bin waste-zone" data-type="b3">${factorySprite(0,2,'Tempat sampah B3')}<strong>LIMBAH B3</strong></button></div><p id="factory-waste-status">Terpilah 0 / 12 ? drag benda ke wadah.</p></div>`;
  factoryMiniGame.total=12;factoryMiniGame.carried=null;factoryMiniGame.selectedBin='metal';document.querySelectorAll('#minigame-content .sorting-item').forEach(enableFactoryWasteDrag);document.querySelectorAll('#minigame-content .sorting-bin').forEach(bin=>bin.addEventListener('click',()=>{setFactoryWasteBin(bin.dataset.type);if(factoryMiniGame?.carried)interactFactoryTask('dispose');}));updateFactoryHud();
}
function pickupFactoryWaste(piece){if(!factoryMiniGame||factoryMiniGame.carried||piece.classList.contains('sorted'))return;factoryMiniGame.carried=piece;piece.classList.add('carried');$('#factory-waste-status').textContent=`Dibawa: ${piece.getAttribute('aria-label')}. Geser ke wadah yang tepat.`;}
function resetFactoryWasteDrag(piece){piece.classList.remove('dragging');for(const property of ['left','top','width','height'])piece.style.removeProperty(property);}
function enableFactoryWasteDrag(piece){
  piece.addEventListener('pointerdown',event=>{
    if(paused||piece.classList.contains('sorted')||(factoryMiniGame?.carried&&factoryMiniGame.carried!==piece))return;
    event.preventDefault();pickupFactoryWaste(piece);const rect=piece.getBoundingClientRect();factoryMiniGame.drag={piece,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,moved:false,offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top};piece.setPointerCapture?.(event.pointerId);
  });
  piece.addEventListener('pointermove',event=>{
    const drag=factoryMiniGame?.drag;if(!drag||drag.piece!==piece||drag.pointerId!==event.pointerId)return;
    if(Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>5)drag.moved=true;if(!drag.moved)return;
    if(!piece.classList.contains('dragging')){const rect=piece.getBoundingClientRect();piece.style.width=`${rect.width}px`;piece.style.height=`${rect.height}px`;piece.classList.add('dragging');}
    piece.style.left=`${event.clientX-drag.offsetX}px`;piece.style.top=`${event.clientY-drag.offsetY}px`;
  });
  const finish=event=>{
    const drag=factoryMiniGame?.drag;if(!drag||drag.piece!==piece||drag.pointerId!==event.pointerId)return;
    const bin=(document.elementsFromPoint?.(event.clientX,event.clientY)||[]).map(node=>node.closest?.('#minigame-content .sorting-bin')).find(Boolean);factoryMiniGame.drag=null;resetFactoryWasteDrag(piece);
    if(!drag.moved)return;
    if(bin){setFactoryWasteBin(bin.dataset.type);interactFactoryTask('dispose');return;}
    piece.classList.remove('carried');factoryMiniGame.carried=null;$('#factory-waste-status').textContent='Letakkan benda tepat di atas salah satu tempat sampah.';
  };
  piece.addEventListener('pointerup',finish);piece.addEventListener('pointercancel',()=>{if(factoryMiniGame?.drag?.piece===piece){factoryMiniGame.drag=null;resetFactoryWasteDrag(piece);piece.classList.remove('carried');factoryMiniGame.carried=null;}});
}
function setFactoryWasteBin(type){if(!factoryMiniGame||factoryMiniGame.type!=='waste')return;factoryMiniGame.selectedBin=type;document.querySelectorAll('#minigame-content .sorting-bin').forEach(bin=>bin.classList.toggle('selected',bin.dataset.type===type));}
function interactFactoryTask(action='pickup'){
  if(!factoryMiniGame||paused||factoryMiniGame.type!=='waste')return;const task=factoryMiniGame;
  if(action==='pickup'&&!task.carried){const piece=$('.sorting-item:not(.sorted)');if(piece)pickupFactoryWaste(piece);return;}
  if(action==='dispose'&&task.carried){if(task.carried.dataset.type===task.selectedBin){task.carried.classList.add('sorted');task.carried.disabled=true;task.carried=null;task.score++;factoryWasteSorted=task.score;playDisposeSound();$('#factory-waste-status').textContent=`Limbah terpilah ${task.score} / ${task.total}.`;updateFactoryHud();if(task.score===task.total)scheduleLevelCallback(completeFactorySorting,450);}else{const rejected=task.carried;factoryMiniWrong($('#minigame-content .sorting-bin.selected'),5);rejected.classList.remove('carried');task.carried=null;$('#factory-waste-status').textContent='Jenis wadah salah. Benda dikembalikan ? waktu berkurang 5 detik.';}}
}
function factoryMiniWrong(node,penalty=0){playAudio($('#level1-fail'),true,.45);node?.classList.add('wrong');if(penalty){factoryTime=Math.max(0,factoryTime-penalty);updateFactoryTimer();factoryFeedback(`WADAH SALAH · −${penalty} DETIK`);}setTimeout(()=>node?.classList.remove('wrong'),380);}
function completeFactorySorting(){factorySortingDone=true;factoryStage=3;closeFactoryMinigame();setFactoryReveal(.68);renderFactorySites();updateFactoryHud();playAudio($('#level1-success'),true,.6);factoryFeedback('Semua limbah terpilah. Sekarang bersihkan filter udara.');}
function openFactoryFilter(){
  factoryFilterDebris=0;factoryFilterScrubbed=0;openFactoryShell('filter','BERSIHKAN FILTER UDARA','Ambil semua benda yang tersangkut. Setelah itu pilih spons dan bersihkan empat noda filter.');
  const debris=[[1,1,'Baut'],[1,2,'Pipa'],[2,1,'Kantong'],[2,2,'Kemasan'],[3,3,'Elektronik']];
  $('#minigame-content').innerHTML=`<div class="filter-cleaning-scene"><div class="filter-debris-layer">${debris.map(([row,col,label],index)=>`<button class="filter-debris debris-${index+1}" data-debris="${index}" aria-label="Ambil ${label}">${factorySprite(row,col,label)}</button>`).join('')}</div><div id="filter-grime-layer" class="filter-grime-layer" hidden>${[1,2,3,4].map(index=>`<button class="filter-grime grime-${index}" data-grime="${index}" aria-label="Bersihkan noda ${index}"></button>`).join('')}</div><button id="filter-sponge" class="filter-sponge" hidden>${factorySprite(0,3,'Spons')}<strong>PILIH SPONS</strong></button><p id="filter-status">Benda tersangkut: 0 / 5 diambil.</p></div>`;
  factoryMiniGame.phase='debris';factoryMiniGame.spongeSelected=false;document.querySelectorAll('.filter-debris').forEach(button=>button.addEventListener('click',()=>removeFactoryFilterDebris(button)));$('#filter-sponge').addEventListener('click',selectFactorySponge);document.querySelectorAll('.filter-grime').forEach(button=>button.addEventListener('click',()=>scrubFactoryFilter(button)));
}
function removeFactoryFilterDebris(button){if(!factoryMiniGame||factoryMiniGame.type!=='filter'||factoryMiniGame.phase!=='debris'||button.classList.contains('removed'))return;button.classList.add('removed');factoryFilterDebris++;playDisposeSound();$('#filter-status').textContent=`Benda tersangkut: ${factoryFilterDebris} / 5 diambil.`;updateFactoryHud();if(factoryFilterDebris===5){factoryMiniGame.phase='scrub';$('#filter-grime-layer').hidden=false;$('#filter-sponge').hidden=false;$('#filter-status').textContent='Pilih spons, lalu bersihkan 4 noda pada filter.';}}
function selectFactorySponge(){if(!factoryMiniGame||factoryMiniGame.type!=='filter')return;factoryMiniGame.spongeSelected=true;$('#filter-sponge').classList.add('selected');$('#filter-status').textContent='Spons siap. Tekan setiap noda sampai filter bersih.';}
function scrubFactoryFilter(button){if(!factoryMiniGame||factoryMiniGame.type!=='filter'||factoryMiniGame.phase!=='scrub'||button.classList.contains('cleaned'))return;if(!factoryMiniGame.spongeSelected){factoryMiniWrong($('#filter-sponge'));$('#filter-status').textContent='Pilih spons terlebih dahulu.';return;}button.classList.add('cleaned');factoryFilterScrubbed++;playAudio($('#level1-success'),true,.35);$('#filter-status').textContent=`Noda filter dibersihkan ${factoryFilterScrubbed} / 4.`;updateFactoryHud();if(factoryFilterScrubbed===4)scheduleLevelCallback(completeFactoryFilter,500);}
function completeFactoryFilter(){factoryFilterDone=true;setFactoryReveal(1);$('#factory-world').classList.add('controlled');closeFactoryMinigame();renderFactorySites();playAudio($('#level1-success'),true,.65);factoryFeedback('Filter udara bersih dan kembali berfungsi.');scheduleLevelCallback(()=>finishLevelFour('complete'),900);}
function getFactoryOutcome(){if(factoryFloorCount()===4&&factorySortingDone&&factoryFilterDone)return 'clean';const work=factoryFloorCount()/4+factoryWasteSorted/12+(factoryFilterDebris+factoryFilterScrubbed)/9;return work>=1.5?'partial':'dirty';}
async function finishLevelFour(reason='complete'){
  if(factoryEnding)return;factoryEnding=true;factoryGameplay=false;stopGameplaySoundtrack();factoryInteractionHeld=false;movementKeys.clear();closeFactoryMinigame();resetFactoryHold();$('#factory-prompt').classList.remove('show');$('#factory-player').classList.remove('walking');leaveEnvironmentCamera('#factory-camera');factoryOutcome=getFactoryOutcome();
  if(reason!=='complete'){
    $('#factory-failed-progress').textContent=`Noda ${factoryFloorCount()} / 4 · Limbah ${factoryWasteSorted} / 12 · Filter ${factoryFilterDebris+factoryFilterScrubbed} / 9`;
    $('#factory-game-over').hidden=false;
    return;
  }
  const world=$('#factory-world');world.classList.toggle('controlled',factoryOutcome==='clean');world.classList.toggle('partial',factoryOutcome==='partial');if(factoryOutcome==='partial')setFactoryReveal(Math.max(.45,Number(world.style.getPropertyValue('--factory-clean'))||0));const title={clean:'PABRIK PULIH DAN AMAN',partial:'PABRIK MULAI TERKENDALI',dirty:'PABRIK MASIH MEMBUTUHKAN PERBAIKAN'}[factoryOutcome];const copy={clean:'Lantai bersih, limbah terpilah, dan filter udara pabrik kembali bekerja dengan aman.',partial:'Sebagian pekerjaan selesai dan risiko pencemaran mulai berkurang.',dirty:'Waktu habis sebelum sumber pencemaran dapat ditangani.'}[factoryOutcome];$('#factory-result-title').textContent=title;$('#factory-result-copy').textContent=copy;$('#factory-result-floor').textContent=`${factoryFloorCount()} / 4`;$('#factory-result-waste').textContent=`${factoryWasteSorted} / 12`;$('#factory-result-filter').textContent=`${Math.round((factoryFilterDebris+factoryFilterScrubbed)/9*100)}%`;$('#factory-result-time').textContent=formatTime(factoryTime);playAudio(factoryOutcome==='dirty'?$('#level1-fail'):$('#level1-success'),true,.7);factoryDialogIndex=0;const version=flowVersion;if(!await pausableSleep(1400,version)||!levelFourActive)return;$('#factory-closing').classList.remove('hidden');showFactoryDialog(true);
}
function gameOverLevelFour(){finishLevelFour('timeout');}
$('#factory-continue').addEventListener('click',()=>{$('#factory-complete').hidden=true;beginReturnToNpc(4);});$('#factory-retry').addEventListener('click',startLevelFour);$('#factory-map').addEventListener('click',()=>{levelFourActive=false;showScreen('#map');});
document.querySelectorAll('[data-factory-key]').forEach(button=>{const key=button.dataset.factoryKey;button.addEventListener('pointerdown',event=>{event.preventDefault();movementKeys.add(key);});button.addEventListener('pointerup',()=>movementKeys.delete(key));button.addEventListener('pointercancel',()=>movementKeys.delete(key));});
$('#factory-touch-interact').addEventListener('pointerdown',event=>{event.preventDefault();factoryInteractionHeld=true;runInteraction('level-4',interactFactory);});['pointerup','pointercancel','lostpointercapture'].forEach(type=>$('#factory-touch-interact').addEventListener(type,()=>{factoryInteractionHeld=false;resetFactoryHold();}));
let factoryLastFrame=performance.now();
function factoryLoop(now){
  const dt=Math.min((now-factoryLastFrame)/1000,.05);factoryLastFrame=now;let moving=false;
  if(factoryGameplay&&!paused&&!factoryEnding){factoryTime=Math.max(0,factoryTime-dt);updateFactoryTimer();if(factoryTime<=0)finishLevelFour('timeout');else if(!isFactoryMinigameOpen()){let dx=0,dy=0;if(movementKeys.has('a')||movementKeys.has('arrowleft'))dx--;if(movementKeys.has('d')||movementKeys.has('arrowright'))dx++;if(movementKeys.has('w')||movementKeys.has('arrowup'))dy--;if(movementKeys.has('s')||movementKeys.has('arrowdown'))dy++;moving=Boolean(dx||dy);if(moving){factoryDirection=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');const length=Math.hypot(dx,dy)||1,nextX=factoryPlayer.x+dx/length*18*dt,nextY=factoryPlayer.y+dy/length*18*dt;if(isFactoryWalkable(nextX,factoryPlayer.y))factoryPlayer.x=nextX;if(isFactoryWalkable(factoryPlayer.x,nextY))factoryPlayer.y=nextY;updateFactoryPlayer();}const near=nearestFactorySite();updateFactoryHold(dt,near);}}
  $('#factory-player').classList.toggle('walking',moving);setGameplaySprite('#factory-player-sprite',factoryDirection,moving,now);requestAnimationFrame(factoryLoop);
}
requestAnimationFrame(factoryLoop);

function syncSettingsSliderVisual(slider) {
  const min = Number(slider.min || 0);
  const max = Number(slider.max || 100);
  const value = Number(slider.value);
  const progress = max === min ? 0 : ((value - min) / (max - min)) * 100;
  slider.style.setProperty('--slider-progress', progress + '%');
}

$('#settings-button').addEventListener('click', () => {
  const musicSlider = $('#music-volume');
  const sfxSlider = $('#sfx-volume');
  musicSlider.value = Math.round(musicVolume * 100);
  sfxSlider.value = Math.round(sfxVolume * 100);
  syncSettingsSliderVisual(musicSlider);
  syncSettingsSliderVisual(sfxSlider);
  $('#settings-panel').hidden = false;
});
$('#info-button').addEventListener('click', () => { $('#info-panel').hidden = false; $('#info-close').focus(); });
$('#info-close').addEventListener('click', () => { $('#info-panel').hidden = true; $('#info-button').focus(); });
$('#settings-close').addEventListener('click', () => { $('#settings-panel').hidden = true; });
$('#settings-audio-toggle').addEventListener('click', () => {
  setSoundEnabled(!soundEnabled);
  if (soundEnabled && $('#menu').classList.contains('active')) playAudio($('#menu-bgm'), false, .42);
});
$('#music-volume').addEventListener('input', event => {
  musicVolume = Number(event.target.value) / 100;
  localStorage.setItem('petualanganHijauMusicVolume', musicVolume);
  syncSettingsSliderVisual(event.target);
  applyVolumeSettings();
});
$('#sfx-volume').addEventListener('input', event => {
  sfxVolume = Number(event.target.value) / 100;
  localStorage.setItem('petualanganHijauSfxVolume', sfxVolume);
  syncSettingsSliderVisual(event.target);
  applyVolumeSettings();
});

function unlockMenuAudioOnInteraction() {
  if (!$('#menu').classList.contains('active')) return;
  playAudio($('#menu-bgm'), false, .42);
  document.removeEventListener('pointerdown', unlockMenuAudioOnInteraction, true);
}
document.addEventListener('pointerdown', unlockMenuAudioOnInteraction, true);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && $('#menu').classList.contains('active')) {
    $('#menu-video').play().catch(() => {});
    playAudio($('#menu-bgm'), false, .42);
  }
});


// ==========================================================
// MODULE TERGABUNG: river-net.js
// ==========================================================
// Net minigame: free movement, five pieces of trash, and three hearts.
const riverNetGoal=10;
let riverNetY=55,riverNetHP=3,riverNetAim=null;
function updateNetHud(){
 $('#net-progress').textContent=`${riverNetCaught} / ${riverNetGoal}`;
 $('#net-hp').textContent='♥'.repeat(riverNetHP)+'♡'.repeat(3-riverNetHP);
 $('#net-hp').setAttribute('aria-label',`${riverNetHP} dari 3 HP`);
 $('#river-subprogress').textContent=`SAMPAH MENGAMBANG · ${riverNetCaught} / ${riverNetGoal}`;
}
startNetGame=function(){
 riverGameplay=false;updateRiverMotion(0,0);riverMiniGame='net';movementKeys.clear();
 $('#river-stage-point').hidden=true;$('#river-interact').classList.remove('show');$('#river-net-game').hidden=false;
 riverNetX=50;riverNetY=55;riverNetHP=3;riverNetCaught=0;riverNetAim=null;riverFloating=[];
 $('#net-stream').innerHTML='';$('#river-net').style.left='50%';$('#river-net').style.top='55%';updateNetHud();
 refillRiverObjects();showGlobalToast('Tangkap 10 sampah. Hindari ikan! Salah tangkap: −1 HP.');
};
function aimRiverNet(event){
 if(paused||riverMiniGame!=='net')return;
 const bounds=$('#river-net-game').getBoundingClientRect();
 riverNetAim={x:Math.max(5,Math.min(95,(event.clientX-bounds.left)/bounds.width*100)),y:Math.max(18,Math.min(88,(event.clientY-bounds.top)/bounds.height*100))};
}
$('#river-net-game').addEventListener('pointerdown',event=>{if(paused||riverMiniGame!=='net')return;event.preventDefault();$('#river-net-game').setPointerCapture(event.pointerId);aimRiverNet(event);});
$('#river-net-game').addEventListener('pointermove',event=>{if(event.buttons)aimRiverNet(event);});
$('#river-net-game').addEventListener('pointercancel',()=>riverNetAim=null);
function spawnRiverObject(kind){
 const el=document.createElement(kind==='fish'?'span':'img');
 el.className=kind==='fish'?'river-fish':'floating-trash';
 if(kind==='fish'){el.textContent='🐟';el.setAttribute('role','img');el.setAttribute('aria-label','Ikan — hindari');}
 else{el.src=`assets/level2/${floatingAssets[Math.floor(Math.random()*floatingAssets.length)]}`;el.alt='Sampah — tangkap';el.draggable=false;}
 const side=Math.floor(Math.random()*4);
 const start=side===0?{x:-8,y:22+Math.random()*58}:side===1?{x:108,y:22+Math.random()*58}:side===2?{x:15+Math.random()*70,y:-8}:{x:15+Math.random()*70,y:108};
 const target={x:25+Math.random()*50,y:30+Math.random()*45};
 const angle=Math.atan2(target.y-start.y,target.x-start.x),speed=kind==='fish'?17+Math.random()*7:11+Math.random()*6;
 const item={el,kind,...start,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,age:0};
 el.style.left=start.x+'%';el.style.top=start.y+'%';if(kind==='fish'&&item.vx>0)el.style.transform='scaleX(-1)';
 $('#net-stream').appendChild(el);riverFloating.push(item);
}
function refillRiverObjects(){
 for(const [kind,total] of [['trash',3],['fish',2]]){
  let count=riverFloating.filter(item=>item.kind===kind).length;
  while(count++<total)spawnRiverObject(kind);
 }
}
function netObjectsTouch(item){
 const bounds=$('#river-net-game').getBoundingClientRect();
 const distance=Math.hypot((item.x-riverNetX)*bounds.width/100,(item.y-riverNetY)*bounds.height/100);
 const radius=Math.min(40,Math.max(24,bounds.width*.023));return distance<radius;
}
updateNetGame=function(dt){
 if(paused||riverMiniGame!=='net')return;
 let dx=Number(movementKeys.has('d')||movementKeys.has('arrowright'))-Number(movementKeys.has('a')||movementKeys.has('arrowleft'));
 let dy=Number(movementKeys.has('s')||movementKeys.has('arrowdown'))-Number(movementKeys.has('w')||movementKeys.has('arrowup'));
 const bounds=$('#river-net-game').getBoundingClientRect(),aspect=bounds.height/bounds.width;
 if(dx||dy){riverNetAim=null;const length=Math.hypot(dx,dy);dx/=length;dy/=length;}
 else if(riverNetAim){dx=(riverNetAim.x-riverNetX)/aspect;dy=riverNetAim.y-riverNetY;const length=Math.hypot(dx,dy);if(length<1){riverNetAim=null;dx=dy=0;}else{const step=Math.min(1,length/(48*dt||1));dx=dx/length*step;dy=dy/length*step;}}
 riverNetX=Math.max(5,Math.min(95,riverNetX+dx*48*aspect*dt));riverNetY=Math.max(18,Math.min(88,riverNetY+dy*48*dt));
 $('#river-net').style.left=riverNetX+'%';$('#river-net').style.top=riverNetY+'%';
 for(const item of riverFloating){
  item.x+=item.vx*dt;item.y+=item.vy*dt;item.age+=dt;
  item.el.style.left=item.x+'%';item.el.style.top=item.y+'%';
  if(netObjectsTouch(item)){
   item.removed=true;item.el.remove();
   if(item.kind==='fish'){
    riverNetHP=Math.max(0,riverNetHP-1);updateNetHud();playAudio($('#level1-fail'),true,.4);showGlobalToast('Itu ikan! Lepaskan dan hindari. −1 HP');
    if(riverNetHP===0){riverNetAim=null;riverGameOver('hp');return;}
   }else{
    riverNetCaught++;updateNetHud();if(typeof updateRiverProgress==='function')updateRiverProgress();if(typeof addRiverCleanReveal==='function')addRiverCleanReveal(61+(riverNetCaught%5)*6,18+Math.floor((riverNetCaught-1)/5)*11,7,`net-${riverNetCaught}`);playDisposeSound();
    if(riverNetCaught===riverNetGoal){riverNetAim=null;finishNetGame();return;}
   }
  }else if(item.x<-12||item.x>112||item.y<-12||item.y>112||item.age>22){
   item.removed=true;item.el.remove();
   if(item.kind==='trash'){riverTime=Math.max(0,riverTime-3);updateRiverTimer();showGlobalToast('Sampah terbawa arus! −3 DETIK');if(riverTime===0){riverGameOver();return;}}
  }
 }
 riverFloating=riverFloating.filter(item=>!item.removed);refillRiverObjects();
};


// ==========================================================
// MODULE TERGABUNG: factory-assets.js
// The previous Level 4 crop decorator was retired by the factory rework.

// ==========================================================
// MODULE TERGABUNG: city.js
// ==========================================================
// Level 5: clean the supplied dirty city before the shared timer expires.
let city = { phase: 'off', run: 0 };
let cityInteractionHeld=false;
const cityTrashCatalog=[
  ['plastic','assets/level5/new/trash-bottle.png','Botol plastik',7,44],
  ['plastic','assets/level5/new/trash-plastic-bag.png','Kantong plastik',24,52],
  ['plastic','assets/level5/new/trash-wrapper.png','Bungkus makanan',41,42],
  ['plastic','assets/level5/new/trash-can.png','Kaleng minuman',58,57],
  ['plastic','assets/level5/new/trash-bottle.png','Botol plastik',74,45],
  ['plastic','assets/level5/new/trash-plastic-bag.png','Kantong plastik',91,54],
  ['paper','assets/level5/new/trash-paper.png','Kertas kusut',13,68],
  ['paper','assets/level5/new/trash-cardboard.png','Kardus',31,76],
  ['paper','assets/level5/new/trash-paper.png','Kertas kusut',48,66],
  ['paper','assets/level5/new/trash-cardboard.png','Kardus',66,78],
  ['paper','assets/level5/new/trash-paper.png','Kertas kusut',84,68],
  ['organic','assets/level5/new/trash-leaves.png','Daun kering',9,79],
  ['organic','assets/level5/new/trash-leaves.png','Daun kering',37,61],
  ['organic','assets/level5/new/trash-leaves.png','Daun kering',70,63],
  ['organic','assets/level5/new/trash-leaves.png','Daun kering',93,78]
];
// Floor-cleaning markers stay on the asphalt; no artificial stain sprite is added.
const cityDirtPoints=[[17,56],[35,48],[52,60],[69,52],[86,59]];
const cityBinData=[
  ['organic','assets/level1/new/bins/organic.png','ORGANIK',12,40],
  ['plastic','assets/level1/new/bins/inorganic.png','PLASTIK',50,40],
  ['paper','assets/level1/new/bins/paper.png','KERTAS',88,40]
];
const cityWalkableArea=[[4,38],[96,38],[97,76],[94,82],[83,84],[70,83],[57,84],[44,84],[31,83],[18,84],[7,82],[3,76]];
const cityCategoryNames={organic:'Organik',plastic:'Plastik',paper:'Kertas'};
function cityAsset(name,label=''){return `<img class="city-asset" src="assets/level5/extracted/${name}.png" alt="${label}" draggable="false">`;}
function cityPathAsset(path,label=''){return `<img class="city-asset" src="${path}" alt="${label}" draggable="false">`;}
const cityScreen = document.createElement('section');
cityScreen.id = 'level-5-screen';
cityScreen.className = 'screen level-five';
cityScreen.setAttribute('aria-label', 'Level 5 Kota');
cityScreen.innerHTML = `
  <div id="city-world" class="city-world">
    <div id="city-camera" class="environment-camera city-camera overview">
      <div class="city-backdrop" aria-hidden="true"></div><div id="city-clean-reveal" class="city-clean-reveal" aria-hidden="true"></div><div class="city-clean-backdrop" aria-hidden="true"></div>
      <div id="city-sites" class="city-sites"></div>
      <div id="city-player" class="park-player"><img src="assets/player-motions/up/idle.png" alt="Karakter pemain"><b id="city-carried-icon" aria-hidden="true"></b></div>
      <div class="city-haze" aria-hidden="true"></div>
    </div>
  </div>
  <div class="city-hud"><strong>KEBERSIHAN KOTA</strong><b id="city-progress">0%</b><span id="city-road"></span><span id="city-trash"></span><span id="city-carry"></span></div>
  <div id="city-timer-hud" class="timer-hud"><strong>WAKTU</strong><span id="city-timer">02:30</span></div>
  <div id="city-prompt" class="city-prompt"></div><div id="city-feedback" class="level-feedback"></div>
  <div class="touch-controls city-touch" aria-label="Kontrol sentuh Level 5"><button data-city-key="w">▲</button><button data-city-key="a">◀</button><button data-city-key="s">▼</button><button data-city-key="d">▶</button><button id="city-interact">E</button></div>
  <div id="city-ready" class="level-ready" hidden><div><span>LEVEL 5 · KOTA</span><h2>BERSIHKAN KOTA</h2><p>Selesaikan semuanya sebelum 2 menit 30 detik habis.</p><ul><li>Tekan E untuk memungut satu dari 15 sampah, lalu tekan F di tempat sampah yang sesuai.</li><li>Setelah semua sampah dibuang, tanda seru lantai kotor akan muncul.</li><li>Dekati tanda seru lalu tahan E sampai indikator penuh.</li></ul><button id="city-start">SIAP</button><button id="city-back">KEMBALI KE PETA</button></div></div>
  <div id="city-success-dialog" class="opening-dialog city-success-dialog hidden" role="dialog" aria-modal="true" aria-labelledby="city-success-name"><img src="assets/level1/characters/pose-1.png" alt="Karakter utama"><div class="dialog-box"><div class="dialog-nameplate"><img src="assets/level1/ui/nameplate.png" alt=""><strong id="city-success-name">Pemain</strong></div><img src="assets/level1/ui/dialog.png" alt=""><p id="city-success-text"></p><small>TAP UNTUK LANJUT</small></div></div>
  <div id="city-hold" class="city-hold" hidden><strong id="city-hold-label">TAHAN E UNTUK MEMBERSIHKAN</strong><span><i id="city-hold-fill"></i></span></div>
  <div id="city-result" class="level-complete" hidden><div><h2 id="city-result-title"></h2><p id="city-result-copy"></p><div class="result-stats"><span>Sisa Waktu <b id="city-result-time"></b></span></div><button id="city-retry">COBA LAGI</button><button id="city-map">KEMBALI KE PETA</button></div></div>
  <div id="city-ending-fade" class="city-ending-fade" aria-hidden="true"></div>`;
$('#game').append(cityScreen);

const citySuccessLines=[
  'Berhasil! Kota ini akhirnya kembali bersih.',
  'Perjalananku selesai, tapi menjaga lingkungan harus terus kita lakukan.'
];

function stopCityLevel() {
  city.run++;
  city.phase = 'off';
  cityInteractionHeld=false;
  movementKeys.clear();
}
function startLevelFive() {
  resetInteractionState(); resetTimerAlert('city', $('#city-timer-hud'));
  cityInteractionHeld=false;
  city = { run: city.run + 1, phase: 'ready', stage:'trash', time: 150, x: 50, y: 80, direction: 'up', holdSite:-1, holdProgress:0, carried:null, sites: [
    ...cityDirtPoints.map(([x,y],i)=>({x,y,type:'dirt',label:`Bersihkan area kotor ${i+1}`,done:false})),
    ...cityTrashCatalog.map(([category,path,name,x,y])=>({x,y,type:'trash',category,path,name,label:`Pungut ${name}`,collected:false,done:false})),
    ...cityBinData.map(([category,path,name,x,y])=>({x,y,type:'bin',category,path,name,label:`Tempat sampah ${name}`}))
  ]};
  showScreen('#level-5-screen');
  movementKeys.clear();
  setGameplaySprite('#city-player img','up',false);
  $('#city-world').className = 'city-world';
  if(typeof leaveEnvironmentCamera==='function')leaveEnvironmentCamera('#city-camera');
  ['city-result','city-hold'].forEach(id=>$('#'+id).hidden=true);
  $('#city-ready').hidden=false;
  $('#city-success-dialog').classList.add('hidden');
  $('#city-ending-fade').classList.remove('show');
  $('#city-feedback').classList.remove('show');
  $('#city-prompt').textContent='';
  resetCityCleanReveals();
  $('#city-carried-icon').replaceChildren();$('#city-player').classList.remove('carrying');
  renderCity(); updateCityHud();
}
function renderCity() {
  $('#city-sites').innerHTML=city.sites.map((site,i)=>{
    if(site.type==='dirt'&&city.stage!=='dirt')return '';
    if(site.done||(site.type==='trash'&&site.collected))return '';
    let visual='',caption='';
    if(site.type==='dirt'){caption='LANTAI KOTOR';}
    if(site.type==='trash'){visual=cityPathAsset(site.path,site.name);caption=site.name.toUpperCase();}
    if(site.type==='bin'){visual=cityPathAsset(site.path,site.name);caption=site.name;}
    return `<div class="city-site ${site.type}" data-city-site="${i}" style="left:${site.x}%;top:${site.y}%">${visual}<small>${caption}</small></div>`;
  }).join('');
  $('#city-player').style.left=city.x+'%'; $('#city-player').style.top=city.y+'%';updateCityCamera();
}
function updateCityCamera(){if(typeof updateEnvironmentCamera==='function')updateEnvironmentCamera('#city-world','#city-camera',city.x,city.y)}
function resetCityCleanReveals(){$('#city-clean-reveal').replaceChildren();}
function addCityCleanReveal(x,y,kind='trash'){
  const patch=document.createElement('i');patch.className=kind;patch.style.setProperty('--reveal-x',`${x}%`);patch.style.setProperty('--reveal-y',`${y}%`);patch.style.setProperty('--reveal-radius',kind==='dirt'?'7.5%':'5.5%');$('#city-clean-reveal').append(patch);
}
function cityCount(type) { return city.sites.filter(s=>s.type===type&&s.done).length; }
function cityProgressUnits(){return city.sites.filter(site=>site.type!=='bin'&&site.done).length;}
function cityMissionComplete(){return cityCount('dirt')===cityDirtPoints.length&&cityCount('trash')===cityTrashCatalog.length;}
function updateCityHud() {
  const percent=Math.round(cityProgressUnits()/(cityDirtPoints.length+cityTrashCatalog.length)*100);
  $('#city-progress').textContent=`${percent}%`;
  $('#city-road').textContent=city.stage==='trash'?'Lantai: selesaikan sampah dahulu':`Area kotor: ${cityCount('dirt')} / ${cityDirtPoints.length}`;
  $('#city-trash').textContent=`Sampah: ${cityCount('trash')} / ${cityTrashCatalog.length}`;
  $('#city-carry').textContent=city.carried===null?'Dibawa: —':`Dibawa: ${city.sites[city.carried].name}`;
  $('#city-interact').textContent=city.carried===null?'E':'F';
  const progress=$('.city-hud progress');if(progress)progress.value=cityProgressUnits();
  $('#city-timer').textContent=formatTime(city.time);
  const hud=$('#city-timer-hud');
  hud.classList.toggle('warning',city.time<=60&&city.time>30);
  hud.classList.toggle('critical',city.time<=30);
  updateTimerAlert('city',city.time,hud);
}
async function beginCityGameplay(){if(paused||city.phase!=='ready')return;primeGameplayAudio();const run=city.run,version=flowVersion;$('#city-ready').hidden=true;movementKeys.clear();city.phase='countdown';if(typeof enterEnvironmentCamera==='function')enterEnvironmentCamera('#city-camera',updateCityCamera);if(!await runLevelCountdown('#shared-level-countdown',version,()=>city.run===run&&city.phase==='countdown'))return;city.phase='play';startGameplaySoundtrack();}
$('#city-start').onclick=beginCityGameplay;
function nearestCitySite() {
  let closest=null, distance=8.5;
  city.sites.forEach(site=>{const available=site.type==='bin'||(site.type==='trash'?!site.collected&&!site.done:city.stage==='dirt'&&!site.done);if(!available)return;const d=Math.hypot(site.x-city.x,site.y-city.y);if(d<distance){distance=d;closest=site;}});
  document.querySelectorAll('[data-city-site]').forEach(node=>node.classList.toggle('near',city.sites[Number(node.dataset.citySite)]===closest));
  $('#city-prompt').textContent=!closest?'WASD / arah · Dekati target untuk berinteraksi':closest.type==='dirt'?'[TAHAN E] '+closest.label:closest.type==='bin'?'[F] '+closest.label:'[E] '+closest.label;
  return closest;
}
function cityFeedback(message) {
  $('#city-feedback').textContent=message;$('#city-feedback').classList.add('show');
  clearTimeout(cityFeedback.timeout);cityFeedback.timeout=setTimeout(()=>$('#city-feedback').classList.remove('show'),3200);
}
function interactCity(action='pickup') {
  if(paused||city.phase!=='play')return;
  const site=nearestCitySite();if(!site)return;
  if(site.type==='trash'){
    if(action!=='pickup')return;
    if(city.carried!==null){cityFeedback('Buang sampah yang sedang dibawa terlebih dahulu.');return;}
    site.collected=true;city.carried=city.sites.indexOf(site);cityInteractionHeld=false;addCityCleanReveal(site.x,site.y,'trash');$('#city-carried-icon').innerHTML=cityPathAsset(site.path,site.name);$('#city-player').classList.add('carrying');playAudio($('#level1-pickup'),true,.55);renderCity();updateCityHud();cityFeedback(`${site.name} dipungut. Tekan F di tempat sampah ${cityCategoryNames[site.category]}.`);return;
  }
  if(site.type==='bin'){
    if(action!=='dispose'){cityInteractionHeld=false;cityFeedback('Tekan F untuk membuang sampah.');return;}
    if(city.carried===null){cityInteractionHeld=false;cityFeedback('Belum ada sampah yang dibawa.');return;}
    const trash=city.sites[city.carried];
    if(trash.category!==site.category){cityInteractionHeld=false;city.time=Math.max(0,city.time-5);updateCityHud();playAudio($('#level1-wrong'),true,.45);cityFeedback('Jenis tempat sampah salah. −5 detik.');if(city.time<=0)cityResult(false);return;}
    trash.done=true;city.carried=null;cityInteractionHeld=false;$('#city-carried-icon').replaceChildren();$('#city-player').classList.remove('carrying');playDisposeSound();renderCity();updateCityHud();cityFeedback(`${trash.name} berhasil dibuang ke tempat ${site.name}.`);cityActionDone();return;
  }
  if(action!=='pickup'||city.stage!=='dirt')return;
  const index=city.sites.indexOf(site);
  if(city.holdSite!==index){city.holdSite=index;city.holdProgress=0;}
  $('#city-hold-label').textContent='TAHAN E UNTUK MEMBERSIHKAN LANTAI';
  $('#city-hold').hidden=false;
}
function resetCityHold(){
  city.holdSite=-1;city.holdProgress=0;
  $('#city-hold').hidden=true;$('#city-hold-fill').style.width='0%';
}
function updateCityHold(dt){
  if(!cityInteractionHeld||city.phase!=='play'||city.holdSite<0)return;
  const site=city.sites[city.holdSite],nearest=nearestCitySite();
  if(!site||site.type!=='dirt'||site.done||nearest!==site){resetCityHold();return;}
  city.holdProgress=Math.min(1,city.holdProgress+dt/3);$('#city-hold-fill').style.width=`${city.holdProgress*100}%`;
  if(city.holdProgress<1)return;
  site.done=true;const message='Area lantai berhasil dibersihkan!';
  addCityCleanReveal(site.x,site.y,'dirt');cityInteractionHeld=false;resetCityHold();playDisposeSound();renderCity();cityFeedback(message);cityActionDone();
}
async function cityActionDone() {
  renderCity();updateCityHud();
  if(city.stage==='trash'&&cityCount('trash')===cityTrashCatalog.length){city.stage='dirt';resetCityHold();renderCity();updateCityHud();cityFeedback('Semua sampah selesai. Sekarang bersihkan lima tanda di jalan dengan menahan E.');return;}
  if(!cityMissionComplete())return;
  city.phase='transition';movementKeys.clear();playAudio($('#level1-success'),true,.8);$('#city-prompt').textContent='';
  $('#city-world').classList.add('restored');
  if(typeof leaveEnvironmentCamera==='function')leaveEnvironmentCamera('#city-camera');
  const run=city.run, version=flowVersion;
  if(!await pausableSleep(2200,version)||city.run!==run||city.phase!=='transition')return;
  city.phase='success';city.successLine=0;city.endingTransition=false;stopGameplaySoundtrack();
  $('#city-success-name').textContent=playerName;
  $('#city-success-text').textContent=citySuccessLines[0];
  $('#city-success-dialog').classList.remove('hidden');
}
async function finishCitySuccessDialog(){
  if(city.phase!=='success'||city.endingTransition)return;
  city.endingTransition=true;$('#city-success-dialog').classList.add('hidden');$('#city-ending-fade').classList.add('show');
  const run=city.run,version=flowVersion;
  if(!await pausableSleep(2200,version)||city.run!==run||city.phase!=='success')return;
  city.phase='won';completeLevel(5);startEnding({skipIntroFade:true});
}
$('#city-success-dialog').onclick=()=>{
  if(paused||city.phase!=='success'||city.endingTransition)return;
  if(city.successLine<citySuccessLines.length-1){city.successLine++;$('#city-success-text').textContent=citySuccessLines[city.successLine];return;}
  finishCitySuccessDialog();
};
function cityResult(won) {
  if(!won)$('#city-result .completion-actions')?.remove?.();
  $('#city-map').textContent=won?'LANJUT KE ENDING':'KEMBALI KE PETA';
  $('#city-map').hidden=false;
  city.phase=won?'won':'lost';cityInteractionHeld=false;resetCityHold();stopGameplaySoundtrack();movementKeys.clear();if(typeof leaveEnvironmentCamera==='function')leaveEnvironmentCamera('#city-camera');$('#city-prompt').textContent='';
  $('#city-result-title').textContent=won?'LEVEL 5 SELESAI!':'WAKTU HABIS!';
  $('#city-result-copy').textContent=won?'Kota kembali bersih.':`Kota belum selesai dibersihkan. Area kotor ${cityCount('dirt')}/${cityDirtPoints.length} · Sampah ${cityCount('trash')}/${cityTrashCatalog.length}.`;
  $('#city-result-time').textContent=formatTime(city.time);$('#city-retry').hidden=won;$('#city-result').hidden=false;
}
$('#city-retry').onclick=()=>{if(!paused)startLevelFive();};
$('#city-back').onclick=()=>{if(!paused)showScreen('#map');};
$('#city-map').onclick=()=>{if(!paused)showScreen('#map');};
$('#city-interact').onpointerdown=event=>{event.preventDefault();if(paused||city.phase!=='play')return;const action=city.carried===null?'pickup':'dispose';cityInteractionHeld=action==='pickup';runInteraction(action==='dispose'?'level-5-dispose':'level-5',()=>interactCity(action));};
$('#city-interact').onpointerup=$('#city-interact').onpointercancel=$('#city-interact').onlostpointercapture=()=>{cityInteractionHeld=false;resetCityHold();};
document.addEventListener('keydown',event=>{
  if(city.phase==='off'||paused)return;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(event.key))event.preventDefault();
  const key=event.key.toLowerCase();
  if(key==='e'&&!event.repeat){event.preventDefault();cityInteractionHeld=true;runInteraction('level-5',()=>interactCity('pickup'));}
  if(key==='f'&&!event.repeat){event.preventDefault();cityInteractionHeld=false;runInteraction('level-5-dispose',()=>interactCity('dispose'));}
});
document.addEventListener('keyup',event=>{if(event.key.toLowerCase()==='e'){cityInteractionHeld=false;resetCityHold();}});
document.querySelectorAll('[data-city-key]').forEach(button=>{
  button.onpointerdown=e=>{e.preventDefault();if(paused||(city.phase!=='play'&&!isPostLevelExit(5)))return;button.setPointerCapture(e.pointerId);movementKeys.add(button.dataset.cityKey);};
  button.onpointerup=button.onpointercancel=button.onlostpointercapture=()=>movementKeys.delete(button.dataset.cityKey);
});
window.addEventListener('blur',()=>{movementKeys.clear();cityInteractionHeld=false;resetCityHold();});
let cityLastFrame=performance.now();
function cityLoop(now) {
  const dt=Math.min((now-cityLastFrame)/1000,.05); cityLastFrame=now;
  let moving=false;
  if(!paused&&city.phase==='play'){
    city.time=Math.max(0,city.time-dt); updateCityHud();
    if(city.time<=0)cityResult(false);
    else {
      const dx=Number(movementKeys.has('d')||movementKeys.has('arrowright'))-Number(movementKeys.has('a')||movementKeys.has('arrowleft'));
      const dy=Number(movementKeys.has('s')||movementKeys.has('arrowdown'))-Number(movementKeys.has('w')||movementKeys.has('arrowup'));
      moving=!cityInteractionHeld&&(dx!==0||dy!==0);
      if(moving){
        const length=Math.hypot(dx,dy);
        const nextX=Math.max(3,Math.min(97,city.x+dx/length*15*dt));
        const nextY=Math.max(38,Math.min(84,city.y+dy/length*15*dt));
        if(isCityWalkable(nextX,city.y))city.x=nextX;
        if(isCityWalkable(city.x,nextY))city.y=nextY;
        city.direction=dx?(dx<0?'left':'right'):(dy<0?'up':'down');
        $('#city-player').style.left=city.x+'%';
        $('#city-player').style.top=city.y+'%';
        updateCityCamera();
      }
      nearestCitySite();
      updateCityHold(dt);
    }
  }
  $('#city-player').classList.toggle('walking',moving);
  setGameplaySprite('#city-player img',city.direction||'up',moving,now);
  requestAnimationFrame(cityLoop);
}
function isCityWalkable(x,y){return pointInPolygon(x,y,cityWalkableArea);}
requestAnimationFrame(cityLoop);


// ==========================================================
// MODULE TERGABUNG: ending.js
// ==========================================================
// Automatic epilogue with the six supplied scene paintings.
const endingCards=[
 {image:'park',title:'Taman bersih.',duration:4000},
 {image:'river',title:'Sungai mengalir.',duration:4000},
 {image:'forest',title:'Hutan mulai tumbuh kembali.',duration:4000},
 {image:'factory',title:'Pabrik lebih terkendali.',duration:4000},
 {image:'city',title:'Kota lebih bersih.',duration:4000},
 {image:'world',title:'Kerusakan lingkungan bukan hanya disebabkan oleh satu orang.',duration:5000},
 {image:'world',title:'Begitu juga dengan perubahan.',duration:3500},
 {image:'world',title:'Hal kecil yang dilakukan bersama dapat memberi dampak besar bagi bumi.',duration:5500},
 {image:'world',title:'Jaga lingkungan hari ini, untuk kehidupan esok hari.',duration:5000},
 {endTitle:true,title:'END OF JOURNEY',duration:3200},
 {logo:true,title:'PETUALANGAN HIJAU',duration:5000}
];
let endingIndex=-1,endingRun=0,endingPlaying=false;
const endingScreen=document.createElement('section');endingScreen.id='ending-screen';endingScreen.className='screen ending-screen cinematic-ending';
endingScreen.setAttribute('aria-label','Epilog Petualangan Hijau');
endingScreen.innerHTML='<div id="ending-visual" class="ending-visual" aria-hidden="true"></div><div class="ending-shade"></div><div class="ending-content"><h1 id="ending-end-title" hidden>END OF JOURNEY</h1><img id="ending-logo" src="assets/ui/title.png" alt="Petualangan Hijau" hidden><p id="ending-narration"></p></div><div id="ending-fade"></div>';
$('#game').append(endingScreen);
const endingImages=endingCards.filter(card=>card.image).map(card=>{const img=new Image();img.src=`assets/epilogue/${card.image}.png`;return img;});
function stopEnding(){endingRun++;endingIndex=-1;endingPlaying=false;document.body.classList.remove('epilogue-fading');}
async function startEnding({skipIntroFade=false}={}){
 if(endingPlaying)return;endingPlaying=true;
 const run=++endingRun,version=flowVersion;movementKeys.clear();
 $('#pause-button').hidden=true;
 if(!skipIntroFade){document.body.classList.add('epilogue-fading');if(!await pausableSleep(1200,version)||run!==endingRun)return;}
 showScreen('#ending-screen');$('#ending-fade').classList.add('covered');document.body.classList.remove('epilogue-fading');
 stopLevelOneAudio(400);fadeAudio($('#menu-bgm'),0,500,true);playAudio($('#prologue-bgm'),true,.4);
 let activeBackdrop='';
 for(let i=0;i<endingCards.length;i++){
  if(run!==endingRun)return;endingIndex=i;const card=endingCards[i],backdrop=card.image||'',sameBackdrop=Boolean(backdrop&&backdrop===activeBackdrop);
  if(!sameBackdrop)$('#ending-visual').style.backgroundImage=backdrop?`url("assets/epilogue/${backdrop}.png")`:'none';
  endingScreen.classList.toggle('ending-title-scene',Boolean(card.logo));endingScreen.classList.toggle('ending-end-scene',Boolean(card.endTitle));
  $('#ending-logo').hidden=!card.logo;$('#ending-end-title').hidden=!card.endTitle;$('#ending-narration').textContent='';$('#ending-narration').classList.remove('changing');
  if(!await pausableSleep(80,version)||run!==endingRun)return;
  if(!sameBackdrop)$('#ending-fade').classList.remove('covered');
  activeBackdrop=backdrop;
  if(!card.logo&&!card.endTitle)for(const char of card.title){if(run!==endingRun)return;$('#ending-narration').textContent+=char;if(!await pausableSleep(30,version))return;}
  if(!await pausableSleep(card.duration,version)||run!==endingRun)return;
  const next=endingCards[i+1],keepsBackdrop=Boolean(card.image&&next?.image===card.image);
  if(keepsBackdrop){$('#ending-narration').classList.add('changing');if(!await pausableSleep(350,version)||run!==endingRun)return;}
  else{$('#ending-fade').classList.add('covered');if(!await pausableSleep(1000,version)||run!==endingRun)return;}
 }
 if(run===endingRun){showMenu();}
}


// ==========================================================
// MODULE TERGABUNG: ui.js
// ==========================================================
// Shared interface layer. Saves are checkpoints between levels, not mid-level snapshots.
const regionNames=['Taman','Sungai','Hutan','Pabrik','Kota'];
const levelStarters=[startLevelOne,startLevelTwo,startLevelThree,startLevelFour,startLevelFive];
function uiButton(id,text,parent,action){const button=document.createElement('button');button.id=id;button.className='ui-button';button.textContent=text;button.onclick=action;parent.append(button);return button;}
// Main menu keeps the supplied START / LOAD / settings / info image buttons.
$('#menu').insertAdjacentHTML('beforeend','<p class="menu-tagline">Langkah kecilmu, harapan baru untuk bumi.</p>');
$('#game').insertAdjacentHTML('beforeend',`<div id="continue-modal" class="utility-modal" hidden><div><small>PERJALANAN TERSIMPAN</small><h2>LANJUTKAN PERMAINAN?</h2><p id="continue-summary"></p><p class="ui-note">Progres disimpan per level. Level yang belum selesai dimulai dari awal.</p><div id="continue-actions" class="ui-actions"></div></div></div><div id="quit-modal" class="utility-modal" hidden><div><h2>SAMPAI JUMPA!</h2><p>Untuk keluar dari game web, tutup tab ini. Progres level yang sudah disimpan tetap tersedia saat kembali.</p><div id="quit-actions"></div></div></div>`);
function savedCheckpoint(){try{const save=JSON.parse(localStorage.getItem('petualanganHijauSave'));return save&&Array.isArray(save.levels)?save:null;}catch{return null;}}
function nextSavedLevel(levels){let next=1;while(next<5&&levels.includes(next))next++;return next;}
function refreshSaveUI(){$('#load-button').hidden=false;}
function openContinuePopup(){const save=savedCheckpoint();if(!save){refreshSaveUI();return;}const level=nextSavedLevel(save.levels);$('#continue-summary').textContent=save.levels.includes(5)?'Petualangan sudah selesai. Kamu bisa menjelajahi kembali semua wilayah.':`Lanjut perjalanan: Level ${level} — ${regionNames[level-1]}`;$('#continue-modal').hidden=false;$('#continue-play').focus();}
uiButton('continue-play','LANJUT',$('#continue-actions'),()=>{$('#continue-modal').hidden=true;openSavedMap();const level=nextSavedLevel(completedLevels);if(!completedLevels.includes(5))levelStarters[level-1]();});
uiButton('continue-new','GAME BARU',$('#continue-actions'),()=>{$('#continue-modal').hidden=true;$('#start-button').click();});
uiButton('continue-cancel','BATAL',$('#continue-actions'),()=>{$('#continue-modal').hidden=true;$('#load-button').focus();});
uiButton('quit-back','KEMBALI',$('#quit-actions'),()=>{$('#quit-modal').hidden=true;});
new MutationObserver(refreshSaveUI).observe($('#menu'),{attributes:true,attributeFilter:['class']});
window.addEventListener('storage',refreshSaveUI);refreshSaveUI();

$('#map').insertAdjacentHTML('afterbegin','<header class="map-heading"><small>PETA PERJALANAN</small><h1>PILIH LEVEL</h1><p>Pulihkan satu wilayah untuk membuka langkah berikutnya.</p></header>');
$('#map').insertAdjacentHTML('beforeend','<div id="map-cloud-layer" class="map-cloud-layer" aria-hidden="true"><i class="map-cloud cloud-level-2" data-cloud-level="2"></i><i class="map-cloud cloud-level-3" data-cloud-level="3"></i><i class="map-cloud cloud-level-4" data-cloud-level="4"></i><i class="map-cloud cloud-level-5" data-cloud-level="5"></i></div>');
function refreshMapClouds(){
 document.querySelectorAll('[data-cloud-level]').forEach(cloud=>{const level=Number(cloud.dataset.cloudLevel),clear=isLevelUnlocked(level)&&level!==pendingUnlockLevel;cloud.classList.toggle('cleared',clear);if(!clear)cloud.classList.remove('clearing');});
}
document.querySelectorAll('.level-button').forEach((button,i)=>{button.insertAdjacentHTML('beforeend',`<span class="map-lock" aria-hidden="true"><i></i></span><span class="level-caption">${i+1} · ${regionNames[i]}<small class="level-status"></small></span>`);const sync=()=>{button.querySelector('.level-status').textContent=button.classList.contains('completed')?'✓ SELESAI':button.classList.contains('locked')?'🔒 TERKUNCI':'TERBUKA';};new MutationObserver(sync).observe(button,{attributes:true,attributeFilter:['class']});sync();});
refreshLevelLocks();

// Normalize the visible image bounds without modifying the original PNGs.
const levelArtBounds=[[290,8,4,276,349],[295,8,8,280,349],[290,4,68,286,349],[285,0,56,280,353],[288,4,4,276,353]];
document.querySelectorAll('.level-button').forEach((button,i)=>{
  const img=button.querySelector('img'),frame=document.createElement('span');frame.className='level-art';
  img.before(frame);frame.append(img);
  const [width,x,y,visibleWidth,visibleHeight]=levelArtBounds[i];
  frame.style.setProperty('--art-width',`${width/visibleWidth*100}%`);
  frame.style.setProperty('--art-left',`${-x/visibleWidth*100}%`);
  frame.style.setProperty('--art-top',`${-y/visibleHeight*100}%`);
});

function activeLevelNumber(){const match=document.querySelector('.screen.active')?.id.match(/^level-(\d)-screen$/);return match?Number(match[1]):0;}
function canRestartLevel(){const level=activeLevelNumber();return [false,levelOneGameplay,riverGameplay,forestGameplay&&forestProgress<4,factoryGameplay&&factoryProgress<4,['play','drain','lost'].includes(city.phase)][level]||false;}
uiButton('pause-restart','ULANG LEVEL',$('.pause-panel'),()=>{
  const level=activeLevelNumber();if(!level||!canRestartLevel())return;
  closePause();movementKeys.clear();flowVersion++;
  levelOneGameplay=false;riverGameplay=false;forestGameplay=false;factoryGameplay=false;forestInteractionHeld=false;factoryInteractionHeld=false;
  levelStarters[level-1]();
});
uiButton('pause-settings','PENGATURAN',$('.pause-panel'),()=>$('#settings-button').click());
$('.pause-panel').insertBefore($('#pause-restart'),$('#exit-button'));
$('.pause-panel').insertBefore($('#pause-settings'),$('#exit-button'));
$('#exit-button').textContent='MENU UTAMA';$('#pause-save').textContent='SIMPAN PROGRES';
$('#pause-save').insertAdjacentHTML('afterend','<small class="ui-note">Pilih satu dari lima slot. Setiap slot mencatat tanggal, waktu, dan checkpoint.</small>');
new MutationObserver(()=>{$('#pause-restart').hidden=!canRestartLevel();}).observe($('#pause-overlay'),{attributes:true,attributeFilter:['hidden']});
document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||event.repeat)return;
  event.preventDefault();
  for(const id of ['settings-panel','info-panel','continue-modal','quit-modal','new-game-modal','save-slots-modal','exit-confirm-modal']){if(!$('#'+id).hidden){$('#'+id).hidden=true;return;}}
  if(!$('#pause-button').hidden){movementKeys.clear();paused?closePause():openPause();}
});

$('#prologue').insertAdjacentHTML('beforeend','<span class="cutscene-label">PROLOG · AWAL PERJALANAN</span>');

const hudSpecs=[['.river-hud','#river-progress',3],['.forest-hud','#forest-progress',4],['.factory-hud','#factory-progress',4]];
hudSpecs.forEach(([panel,source,max])=>{const panelNode=$(panel);if(panelNode.querySelector('progress'))return;const bar=document.createElement('progress');bar.className='objective-bar';bar.max=max;bar.value=0;bar.setAttribute('aria-label','Progres objective');panelNode.append(bar);const update=()=>{bar.value=Number($(source).textContent.match(/\d+/)?.[0]||0);};new MutationObserver(update).observe($(source),{childList:true,characterData:true,subtree:true});update();});
const cityBar=document.createElement('progress');cityBar.className='objective-bar';cityBar.max=20;cityBar.value=0;cityBar.setAttribute('aria-label','Total kebersihan kota');$('.city-hud').append(cityBar);
const syncCityUI=()=>{cityBar.value=city.phase==='off'?0:cityProgressUnits();$('#city-result').classList.toggle('game-over',city.phase==='lost');};
new MutationObserver(syncCityUI).observe($('#city-trash'),{childList:true});
new MutationObserver(syncCityUI).observe($('#city-result'),{attributes:true,attributeFilter:['hidden']});

document.querySelectorAll('.opening-dialog').forEach(dialog=>{const hint=document.createElement('span');hint.className='dialog-next-hint';hint.textContent='KLIK UNTUK LANJUT ▸';dialog.append(hint);});
// Typewriter indicators read the existing dialogue state without rewriting its flow.
setInterval(()=>{const flags=[['opening-dialog',dialogTyping],['river-dialog',riverDialogTyping],['forest-opening',forestDialogTyping],['forest-closing',forestDialogTyping],['factory-opening',factoryDialogTyping],['factory-closing',factoryDialogTyping]];flags.forEach(([id,busy])=>{const hint=$('#'+id)?.querySelector('.dialog-next-hint');if(hint)hint.textContent=busy?'MENGETIK ···':'KLIK UNTUK LANJUT ▸';});},200);

// After a successful mission the player walks back to the region entrance
// before the outside NPC confirms completion and unlocks the next destination.
const postLevelExit={active:false,transitioning:false,level:0,near:false,marker:null};
const postLevelExitConfig={
  1:{screen:'#level-1-screen',camera:'#park-camera',x:50,y:90,label:'KEMBALI KE GERBANG TAMAN'},
  2:{screen:'#level-2-screen',camera:'#river-camera',x:50,y:89,label:'KEMBALI KE PINTU SUNGAI'},
  3:{screen:'#level-3-screen',camera:'#forest-camera',x:50,y:88,label:'KEMBALI KE PINTU HUTAN'},
  4:{screen:'#level-4-screen',camera:'#factory-camera',x:50,y:30,label:'KEMBALI KE PINTU PABRIK'},
  5:{screen:'#level-5-screen',camera:'#city-camera',x:50,y:90,label:'KEMBALI KE PINTU KOTA'}
};
$('#game').insertAdjacentHTML('beforeend','<div id="post-exit-loading" class="post-exit-loading" hidden><strong>KEMBALI KE <span></span></strong><i></i><small>Menyiapkan area petugas...</small></div>');
function isPostLevelExit(level){return postLevelExit.active&&postLevelExit.level===level;}
function currentPostLevelPosition(){
  if(postLevelExit.level===1)return parkPlayer;if(postLevelExit.level===2)return riverPlayerPosition;if(postLevelExit.level===3)return forestPlayer;if(postLevelExit.level===4)return factoryPlayer;if(postLevelExit.level===5)return city;return {x:0,y:0};
}
function stopPostLevelExit(){
  postLevelExit.active=false;postLevelExit.transitioning=false;postLevelExit.near=false;postLevelExit.marker?.remove();postLevelExit.marker=null;movementKeys.clear();document.querySelectorAll('.post-exit-mode').forEach(node=>node.classList.remove('post-exit-mode'));const loading=$('#post-exit-loading');if(loading)loading.hidden=true;
}
function enablePostLevelExit(level){
  stopPostLevelExit();const config=postLevelExitConfig[level],screen=$(config.screen),camera=$(config.camera);postLevelExit.active=true;postLevelExit.level=level;screen.classList.remove('ending-mode','intro-mode','entrance-mode');screen.classList.add('post-exit-mode');
  if(level===1){$('#park-world').classList.add('state-clean');enterEnvironmentCamera('#park-camera',updatePlayer);}
  if(level===2){$('#river-world').classList.add('restored');$('#river-camera').classList.remove('overview');$('#river-camera').classList.add('camera-live');updateRiverCamera();}
  if(level===3){setForestWorldStage('restored');enterEnvironmentCamera('#forest-camera',updateForestCamera);}
  if(level===4){setFactoryReveal(1);$('#factory-world').classList.add('controlled');enterEnvironmentCamera('#factory-camera',updateFactoryCamera);}
  if(level===5){city.phase='return';$('#city-world').classList.add('restored');enterEnvironmentCamera('#city-camera',updateCityCamera);}
  const marker=document.createElement('button');marker.type='button';marker.className='return-exit-marker';marker.style.left=config.x+'%';marker.style.top=config.y+'%';marker.innerHTML=`<span>⇧</span><strong>${config.label}</strong><small>DEKATI · TEKAN E</small>`;marker.addEventListener('click',()=>runInteraction('post-level-exit',interactPostLevelExit));camera.append(marker);postLevelExit.marker=marker;movementKeys.clear();updatePostLevelExitNear();showGlobalToast('Area sudah pulih. Kembali ke pintu masuk dan tekan E.');
}
function updatePostLevelExitNear(){
  if(!postLevelExit.active||!postLevelExit.marker)return false;const config=postLevelExitConfig[postLevelExit.level],position=currentPostLevelPosition();postLevelExit.near=Math.hypot(config.x-position.x,config.y-position.y)<10;postLevelExit.marker.classList.toggle('near',postLevelExit.near);return postLevelExit.near;
}
async function interactPostLevelExit(){
  if(paused||!postLevelExit.active||postLevelExit.transitioning||!updatePostLevelExitNear())return;postLevelExit.transitioning=true;movementKeys.clear();const level=postLevelExit.level,region=checkpointInfo[level]?.region||'AREA AWAL',loading=$('#post-exit-loading');loading.querySelector('span').textContent=region;loading.hidden=false;postLevelExit.marker?.classList.add('entering');const version=flowVersion;if(!await pausableSleep(900,version)||!postLevelExit.transitioning)return;stopPostLevelExit();beginReturnToNpc(level);
}
function movePostLevelPlayer(dt,now){
  if(!postLevelExit.active||paused||postLevelExit.transitioning)return;let dx=0,dy=0;if(movementKeys.has('a')||movementKeys.has('arrowleft'))dx--;if(movementKeys.has('d')||movementKeys.has('arrowright'))dx++;if(movementKeys.has('w')||movementKeys.has('arrowup'))dy--;if(movementKeys.has('s')||movementKeys.has('arrowdown'))dy++;const moving=Boolean(dx||dy),length=Math.hypot(dx,dy)||1,step=17*dt,level=postLevelExit.level;
  if(level===1){const nx=parkPlayer.x+dx/length*step,ny=parkPlayer.y+dy/length*step;if(isWalkable(nx,parkPlayer.y))parkPlayer.x=nx;if(isWalkable(parkPlayer.x,ny))parkPlayer.y=ny;if(moving)playerDirection=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');updatePlayer();$('#park-player').classList.toggle('walking',moving);setGameplaySprite('#player-sprite',playerDirection,moving,now);}
  if(level===2){riverPlayerPosition.x=Math.max(4,Math.min(96,riverPlayerPosition.x+dx/length*step));riverPlayerPosition.y=Math.max(8,Math.min(92,riverPlayerPosition.y+dy/length*step));if(moving)riverDirection=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');updateRiverPlayer();$('#river-player').classList.toggle('walking',moving);setGameplaySprite('#river-player img',riverDirection,moving,now);}
  if(level===3){const nx=forestPlayer.x+dx/length*step,ny=forestPlayer.y+dy/length*step;if(isForestWalkable(nx,forestPlayer.y))forestPlayer.x=nx;if(isForestWalkable(forestPlayer.x,ny))forestPlayer.y=ny;if(moving)forestDirection=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');updateForestPlayer();$('#forest-player').classList.toggle('walking',moving);setGameplaySprite('#forest-player-sprite',forestDirection,moving,now);}
  if(level===4){const nx=factoryPlayer.x+dx/length*step,ny=factoryPlayer.y+dy/length*step;if(isFactoryWalkable(nx,factoryPlayer.y))factoryPlayer.x=nx;if(isFactoryWalkable(factoryPlayer.x,ny))factoryPlayer.y=ny;if(moving)factoryDirection=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');updateFactoryPlayer();$('#factory-player').classList.toggle('walking',moving);setGameplaySprite('#factory-player-sprite',factoryDirection,moving,now);}
  if(level===5){city.x=Math.max(5,Math.min(95,city.x+dx/length*step));city.y=Math.max(54,Math.min(92,city.y+dy/length*step));if(moving)city.direction=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');$('#city-player').style.left=city.x+'%';$('#city-player').style.top=city.y+'%';updateCityCamera();$('#city-player').classList.toggle('walking',moving);setGameplaySprite('#city-player img',city.direction||'up',moving,now);}
  updatePostLevelExitNear();
}
let postExitLastFrame=performance.now();function postLevelExitLoop(now){const dt=Math.min((now-postExitLastFrame)/1000,.05);postExitLastFrame=now;movePostLevelPlayer(dt,now);requestAnimationFrame(postLevelExitLoop);}requestAnimationFrame(postLevelExitLoop);
document.addEventListener('pointerdown',event=>{if(!postLevelExit.active)return;if(event.target.closest('#touch-interact,#river-touch-interact,#forest-touch-interact,#factory-touch-interact,#city-interact')){event.preventDefault();event.stopImmediatePropagation();runInteraction('post-level-exit',interactPostLevelExit);}},true);

const checkpointInfo={
  1:{region:'TAMAN',next:'Sungai',returnLines:['Kerja bagus. Hasil tindakanmu sudah terlihat di seluruh taman.','Tujuan berikutnya adalah sungai. Temui petugas di sana sebelum mulai bekerja.']},
  2:{region:'SUNGAI',next:'Hutan',returnLines:['Aliran sungai mulai pulih. Data hasil pekerjaanmu sudah kucatat.','Lanjutkan perjalanan ke hutan dan cari petugas di pintu masuk.']},
  3:{region:'HUTAN',next:'Pabrik',returnLines:['Tahap penghijauan sudah selesai dan bibit-bibit itu akan terus dipantau.','Berikutnya pergilah ke pabrik. Cari tahu sumber pencemarannya bersama petugas.']},
  4:{region:'PABRIK',next:'Kota',introLines:['Bangunan pabrik itu berada tepat di depan. Aku harus memahami kondisinya sebelum masuk.','Seperti wilayah sebelumnya, aku akan menemui petugas lebih dahulu.'],briefLines:['Bersihkan empat noda lantai yang ditandai terlebih dahulu agar area kerja aman.','Setelah itu pilah limbah logam, plastik, dan B3 di meja, lalu bersihkan filter udaranya.'],returnLines:['Lantai, pemilahan limbah, dan filter udara pabrik sudah ditangani. Hasilnya akan terus diawasi.','Wilayah terakhir adalah kota. Bawa semua pelajaranmu ke sana.']},
  5:{region:'KOTA',next:'Akhir perjalanan',npcName:'Bu Maya',npcPortrait:'assets/level5/city-npc-warga.png',introLines:['Itu gerbang menuju kota, wilayah terakhir dalam perjalanan ini.','Aku harus berbicara dengan warga di dekat pintu masuk sebelum masuk.'],briefLines:['Selamat datang. Tekan E untuk memungut 15 sampah, lalu tekan F di tempat sampah yang sesuai.','Setelah semua sampah dibuang, tanda seru lantai kotor akan muncul. Dekati lalu tahan E sampai bersih.'],returnLines:[]}
};
$('#game').insertAdjacentHTML('beforeend',`<section id="journey-checkpoint" class="journey-checkpoint" data-level="1" hidden><div class="checkpoint-background"></div><div class="checkpoint-shade"></div><div class="checkpoint-npc" aria-label="Petugas lingkungan"><span>!</span></div><div id="checkpoint-player" class="park-player checkpoint-player"><img id="checkpoint-player-sprite" src="assets/player-motions/up/idle.png" alt="Karakter pemain"></div><div id="checkpoint-prompt" class="entrance-prompt checkpoint-prompt"><kbd>E</kbd><span>BICARA DENGAN PETUGAS</span></div><div class="touch-controls checkpoint-touch" aria-label="Kontrol area petugas"><button data-checkpoint-key="w">▲</button><button data-checkpoint-key="a">◀</button><button data-checkpoint-key="s">▼</button><button data-checkpoint-key="d">▶</button><button id="checkpoint-interact">E</button></div><div id="checkpoint-dialog" class="pak-rudi-dialog checkpoint-dialog" hidden><img id="checkpoint-portrait" class="pak-rudi-portrait" src="assets/level1/npc/pak-rudi-present.png" alt="Pembicara"><div class="dialog-box"><div class="dialog-nameplate"><img src="assets/level1/ui/nameplate.png" alt=""><strong id="checkpoint-name">Pak Rudi</strong></div><img src="assets/level1/ui/dialog.png" alt=""><p id="checkpoint-text"></p><small>TAP UNTUK LANJUT</small></div></div><div id="checkpoint-loading" class="checkpoint-loading" hidden><strong>MENUJU <span></span></strong><i></i><small>Menyiapkan wilayah...</small></div></section>`);
let journeyCheckpoint={active:false,mode:'return',level:1,x:50,y:86,direction:'up',phase:'off',line:0,typing:false,finish:false,run:0,start:null};
$('#journey-checkpoint').insertAdjacentHTML('beforeend','<div id="checkpoint-gate" class="checkpoint-gate" aria-hidden="true" hidden><span>MASUK</span></div>');
function checkpointLines(){const info=checkpointInfo[journeyCheckpoint.level];if(journeyCheckpoint.phase==='intro')return info.introLines||[];if(journeyCheckpoint.mode==='before')return info.briefLines||[];return info.returnLines;}
function setCheckpointPlayer(){const player=$('#checkpoint-player');player.style.left=journeyCheckpoint.x+'%';player.style.top=journeyCheckpoint.y+'%';}
function checkpointTarget(){if(journeyCheckpoint.phase==='gate')return journeyCheckpoint.level===5?{x:50,y:48,label:'MASUK KE KOTA'}:{x:74,y:48,label:'MASUK KE PABRIK'};return {x:25,y:55,label:'BICARA DENGAN PETUGAS'};}
function updateCheckpointPrompt(){const target=checkpointTarget(),distance=Math.hypot(journeyCheckpoint.x-target.x,journeyCheckpoint.y-target.y),visible=journeyCheckpoint.active&&['walking','gate'].includes(journeyCheckpoint.phase)&&distance<10;const prompt=$('#checkpoint-prompt');prompt.style.left=target.x+'%';prompt.style.top=(target.y-8)+'%';prompt.querySelector('span').textContent=target.label;prompt.classList.toggle('show',visible);return visible;}
async function typeCheckpointLine(){const run=journeyCheckpoint.run,lines=checkpointLines(),text=lines[journeyCheckpoint.line]||'',node=$('#checkpoint-text');node.textContent='';journeyCheckpoint.typing=true;journeyCheckpoint.finish=false;for(const char of text){if(run!==journeyCheckpoint.run)return;if(journeyCheckpoint.finish){node.textContent=text;break;}node.textContent+=char;if(!await pausableSleep(30,flowVersion))return;}if(run===journeyCheckpoint.run)journeyCheckpoint.typing=false;}
function showCheckpointDialog(speaker='Pak Rudi'){const info=checkpointInfo[journeyCheckpoint.level]||{};$('#checkpoint-name').textContent=speaker;$('#checkpoint-portrait').src=speaker===playerName?'assets/level1/characters/pose-1.png':(info.npcPortrait||'assets/level1/npc/pak-rudi-present.png');$('#checkpoint-dialog').hidden=false;typeCheckpointLine();}
function beginJourneyCheckpoint(level,mode,start=null){
  const node=$('#journey-checkpoint'),info=checkpointInfo[level];journeyCheckpoint={active:false,mode,level,x:50,y:86,direction:'up',phase:'off',line:0,typing:false,finish:false,run:journeyCheckpoint.run+1,start};movementKeys.clear();node.dataset.level=String(level);node.hidden=false;node.classList.remove('leaving');$('#checkpoint-dialog').hidden=true;$('#checkpoint-loading').hidden=true;$('#checkpoint-prompt').classList.remove('show');setGameplaySprite('#checkpoint-player-sprite','up',false);setCheckpointPlayer();$('#pause-button').hidden=true;
  $('#checkpoint-gate').hidden=![4,5].includes(level);$('#checkpoint-gate').classList.remove('open');$('#checkpoint-gate span').textContent=level===5?'MASUK KOTA':'MASUK PABRIK';
  if(mode==='before'){journeyCheckpoint.phase='intro';showCheckpointDialog(playerName);}else{journeyCheckpoint.phase='walking';journeyCheckpoint.active=true;showGlobalToast(`Kembali temui petugas ${info.region}, lalu tekan E.`);updateCheckpointPrompt();}
}
function beginReturnToNpc(level){
  levelOneGameplay=false;riverGameplay=false;forestGameplay=false;factoryGameplay=false;forestInteractionHeld=false;factoryInteractionHeld=false;movementKeys.clear();stopLevelOneAudio(250);beginJourneyCheckpoint(level,'return');
}
function stopJourneyCheckpoint(){
  if(typeof journeyCheckpoint==='undefined')return;
  journeyCheckpoint.run++;
  journeyCheckpoint.active=false;
  journeyCheckpoint.phase='off';
  journeyCheckpoint.start=null;
  movementKeys.clear();
  const node=$('#journey-checkpoint');
  if(node){node.hidden=true;node.classList.remove('leaving');}
  const dialog=$('#checkpoint-dialog'),loading=$('#checkpoint-loading'),prompt=$('#checkpoint-prompt');
  if(dialog)dialog.hidden=true;
  if(loading){loading.hidden=true;loading.querySelector('i')?.removeAttribute('style');}
  prompt?.classList.remove('show');
}
async function finishJourneyCheckpoint(){
  const run=journeyCheckpoint.run,level=journeyCheckpoint.level,mode=journeyCheckpoint.mode,start=journeyCheckpoint.start,node=$('#journey-checkpoint');journeyCheckpoint.active=false;journeyCheckpoint.phase='transition';movementKeys.clear();$('#checkpoint-dialog').hidden=true;$('#checkpoint-prompt').classList.remove('show');const loading=$('#checkpoint-loading');
  if(mode==='before'){loading.querySelector('span').textContent=checkpointInfo[level].region;loading.hidden=false;await pausableSleep(850,flowVersion);if(run!==journeyCheckpoint.run)return;}
  node.classList.add('leaving');await pausableSleep(500,flowVersion);if(run!==journeyCheckpoint.run)return;node.hidden=true;node.classList.remove('leaving');loading.hidden=true;journeyCheckpoint.phase='off';
  if(mode==='before'){start?.();return;}
  completeLevel(level);showLevelCompletionResult(level);
}
function advanceCheckpointDialog(){
  if(paused||$('#checkpoint-dialog').hidden)return;if(journeyCheckpoint.typing){journeyCheckpoint.finish=true;return;}const lines=checkpointLines();journeyCheckpoint.line++;if(journeyCheckpoint.line<lines.length){typeCheckpointLine();return;}$('#checkpoint-dialog').hidden=true;if(journeyCheckpoint.phase==='intro'){journeyCheckpoint.phase='walking';journeyCheckpoint.active=true;journeyCheckpoint.line=0;showGlobalToast('Dekati petugas lalu tekan E.');updateCheckpointPrompt();}else if(journeyCheckpoint.mode==='before'&&[4,5].includes(journeyCheckpoint.level)){journeyCheckpoint.phase='gate';journeyCheckpoint.active=true;$('#checkpoint-gate').classList.add('open');const region=journeyCheckpoint.level===5?'kota':'pabrik';showGlobalToast(`Jalan ke pintu ${region}, lalu tekan E untuk masuk.`);updateCheckpointPrompt();}else finishJourneyCheckpoint();
}
function interactJourneyCheckpoint(){if(!journeyCheckpoint.active||!['walking','gate'].includes(journeyCheckpoint.phase)||!updateCheckpointPrompt())return;if(journeyCheckpoint.phase==='gate'){finishJourneyCheckpoint();return;}journeyCheckpoint.active=false;journeyCheckpoint.phase='npc';journeyCheckpoint.line=0;movementKeys.clear();showCheckpointDialog(checkpointInfo[journeyCheckpoint.level]?.npcName||'Pak Rudi');}
$('#checkpoint-dialog').addEventListener('click',advanceCheckpointDialog);$('#checkpoint-interact').addEventListener('pointerdown',event=>{event.preventDefault();runInteraction('journey-checkpoint',interactJourneyCheckpoint);});
document.querySelectorAll('[data-checkpoint-key]').forEach(button=>{button.addEventListener('pointerdown',event=>{event.preventDefault();if(journeyCheckpoint.active)movementKeys.add(button.dataset.checkpointKey);});['pointerup','pointercancel','lostpointercapture'].forEach(type=>button.addEventListener(type,()=>movementKeys.delete(button.dataset.checkpointKey)));});
let checkpointLastFrame=performance.now();function journeyCheckpointLoop(now){const dt=Math.min((now-checkpointLastFrame)/1000,.05);checkpointLastFrame=now;let dx=0,dy=0;if(journeyCheckpoint.active&&!paused){if(movementKeys.has('a')||movementKeys.has('arrowleft'))dx--;if(movementKeys.has('d')||movementKeys.has('arrowright'))dx++;if(movementKeys.has('w')||movementKeys.has('arrowup'))dy--;if(movementKeys.has('s')||movementKeys.has('arrowdown'))dy++;const moving=Boolean(dx||dy);if(moving){journeyCheckpoint.direction=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');const length=Math.hypot(dx,dy)||1;journeyCheckpoint.x=Math.max(8,Math.min(92,journeyCheckpoint.x+dx/length*17*dt));journeyCheckpoint.y=Math.max(45,Math.min(92,journeyCheckpoint.y+dy/length*17*dt));setCheckpointPlayer();updateCheckpointPrompt();}setGameplaySprite('#checkpoint-player-sprite',journeyCheckpoint.direction,moving,now);$('#checkpoint-player').classList.toggle('walking',moving);}else{$('#checkpoint-player').classList.remove('walking');setGameplaySprite('#checkpoint-player-sprite',journeyCheckpoint.direction,false,now);}requestAnimationFrame(journeyCheckpointLoop);}requestAnimationFrame(journeyCheckpointLoop);

const completionResultIds={1:'level-complete',2:'river-complete',3:'forest-complete',4:'factory-complete',5:'city-result'};
function resetCompletionPanels(){
  Object.values(completionResultIds).forEach(id=>{const panel=$('#'+id)?.firstElementChild;if(!panel)return;panel.querySelector('.completion-actions')?.remove();Array.from(panel.children).filter(node=>node.tagName==='BUTTON').forEach(node=>node.hidden=false);});
}
function showLevelCompletionResult(level){
  if(level===5)cityResult(true);
  const result=$('#'+completionResultIds[level]);if(!result)return;
  const panel=result.firstElementChild;
  Array.from(panel.children).filter(node=>node.tagName==='BUTTON').forEach(node=>node.hidden=true);
  panel.querySelector('.completion-actions')?.remove();
  const actions=document.createElement('div');actions.className='completion-actions';
  const mapButton=document.createElement('button');mapButton.type='button';mapButton.textContent='KEMBALI KE MAP';mapButton.onclick=()=>{if(paused)return;result.hidden=true;showScreen('#map');};
  const menuButton=document.createElement('button');menuButton.type='button';menuButton.textContent='MENU UTAMA';menuButton.onclick=()=>{if(paused)return;result.hidden=true;showMenu();};
  actions.append(mapButton,menuButton);panel.append(actions);result.hidden=false;
}
document.querySelectorAll('.game-over').forEach((result,i)=>uiButton(`failed-menu-${i}`,'MENU UTAMA',result.firstElementChild,showMenu));
// Leaf click feedback is decorative and never intercepts game interactions.
document.addEventListener('click',event=>{if(!event.target.closest('button')||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const leaf=document.createElement('span');leaf.className='ui-click-leaf';leaf.textContent='🍃';leaf.style.left=event.clientX+'px';leaf.style.top=event.clientY+'px';document.body.append(leaf);setTimeout(()=>leaf.remove(),550);});



// Central phase is derived from the existing level controllers so legacy mechanics stay intact.
function currentGamePhase(){
 if(paused)return GamePhase.PAUSED;
 if(endingPlaying||$('#ending-screen').classList.contains('active'))return GamePhase.ENDING;
 if(typeof journeyCheckpoint!=='undefined'&&journeyCheckpoint.phase!=='off')return journeyCheckpoint.phase==='walking'?GamePhase.GAMEPLAY:GamePhase.DIALOG;
 if(typeof postLevelExit!=='undefined'&&postLevelExit.active)return GamePhase.GAMEPLAY;
 const active=document.querySelector('.screen.active');
 const result=active?.querySelector('.level-complete:not([hidden])');
 if(result)return result.classList.contains('game-over')||(result.id==='city-result'&&city.phase==='lost')?GamePhase.GAME_OVER:GamePhase.LEVEL_COMPLETE;
 const dialog=active?.querySelector('.opening-dialog:not(.hidden):not([hidden])');
 if(dialog)return GamePhase.DIALOG;
 if(pakRudiDialogActive||riverNpcDialogActive||forestNpcDialogActive)return GamePhase.DIALOG;
 if(riverMiniGame||forestMiniGame||isFactoryMinigameOpen()||city.phase==='watering')return GamePhase.MINIGAME;
 if(parkEntranceActive||riverEntranceActive||forestEntranceActive||levelOneGameplay||riverGameplay||forestGameplay||factoryGameplay||city.phase==='play')return GamePhase.GAMEPLAY;
 return active?.id==='menu'||active?.id==='map'?GamePhase.MENU:GamePhase.DIALOG;
}
function syncGamePhase(){document.body.dataset.gamePhase=currentGamePhase();}
function revealPendingUnlock(){
 if(!pendingUnlockLevel)return;
 const level=pendingUnlockLevel,button=document.querySelector('.level-button[data-level="'+level+'"]'),cloud=document.querySelector('[data-cloud-level="'+level+'"]');
 if(!button||button.classList.contains('locked'))return;
 pendingUnlockLevel=0;
 if(cloud){cloud.classList.remove('cleared');requestAnimationFrame(()=>cloud.classList.add('clearing'));setTimeout(()=>{cloud.classList.add('cleared');cloud.classList.remove('clearing');},1800);}
 button.classList.remove('unlock-reveal');
 setTimeout(()=>button.classList.add('unlock-reveal'),650);
 setTimeout(()=>showGlobalToast('AWAN BERGESER · LEVEL BARU TERBUKA!'),700);
 setTimeout(()=>button.classList.remove('unlock-reveal'),1800);
}
new MutationObserver(syncGamePhase).observe($('#game'),{subtree:true,attributes:true,attributeFilter:['class','hidden']});
syncGamePhase();
// ==========================================================
// MODULE TERGABUNG: persistence.js
// ==========================================================
// Five dated checkpoint slots. A prologue checkpoint always restarts the prologue.
function normalizeJourneySave(save){
 if(!save||!Array.isArray(save.levels))return null;
 const validLevels=new Set(save.levels.filter(n=>Number.isInteger(n)&&n>=1&&n<=5));
 const levels=[];for(let level=1;level<=5&&validLevels.has(level);level++)levels.push(level);
 let next=1;while(next<5&&levels.includes(next))next++;
 let resumeLevel=Number.isInteger(save.resumeLevel)?save.resumeLevel:next;
 if(resumeLevel<1||resumeLevel>5||(resumeLevel>1&&!levels.includes(resumeLevel-1)))resumeLevel=next;
 const checkpoint=save.checkpoint==='prologue'?'prologue':'level';
 return {version:3,checkpoint,levels,playerName:typeof save.playerName==='string'?save.playerName.slice(0,16):'Pemain',resumeLevel,savedAt:Number(save.savedAt)||0};
}
function validateJourneySave(raw){
 try{return normalizeJourneySave(typeof raw==='string'?JSON.parse(raw):raw);}catch{return null;}
}
function readJourneySlots(){
 let slots=[];
 try{
  const parsed=JSON.parse(localStorage.getItem(journeyKey)||'null');
  if(parsed?.version===3&&Array.isArray(parsed.slots))slots=parsed.slots.slice(0,JOURNEY_SLOT_COUNT).map(validateJourneySave);
 }catch{/* Corrupt slot data is replaced by empty slots. */}
 while(slots.length<JOURNEY_SLOT_COUNT)slots.push(null);
 if(slots.some(Boolean))return slots;
 try{
  const legacy=validateJourneySave(localStorage.getItem(legacyJourneyKey));
  if(legacy){slots[0]=legacy;localStorage.setItem(journeyKey,JSON.stringify({version:3,slots}));}
 }catch{/* Saving remains available even if legacy migration fails. */}
 return slots;
}
function storeJourneySlots(slots){localStorage.setItem(journeyKey,JSON.stringify({version:3,slots:slots.slice(0,JOURNEY_SLOT_COUNT)}));}
function hasJourneySlots(){return readJourneySlots().some(Boolean);}
function readJourneySave(slotIndex=activeSaveSlot){
 const slots=readJourneySlots();
 if(Number.isInteger(slotIndex)&&slots[slotIndex])return slots[slotIndex];
 return slots.filter(Boolean).sort((a,b)=>b.savedAt-a.savedAt)[0]||null;
}
function currentJourneyCheckpoint(){
 const screen=document.querySelector('.screen.active')?.id||'';
 if(screen==='prologue'||screen==='title-card'||(screen==='loading'&&running))return 'prologue';
 return 'level';
}
function writeJourneySave(manual=false,resumeLevel=journeyResumeLevel,slotIndex=activeSaveSlot,checkpoint=currentJourneyCheckpoint()){
 if(!Number.isInteger(slotIndex)||slotIndex<0||slotIndex>=JOURNEY_SLOT_COUNT)return false;
 const level=Number.isInteger(resumeLevel)&&resumeLevel>=1&&resumeLevel<=5?resumeLevel:1;
 const data={version:3,checkpoint:checkpoint==='prologue'?'prologue':'level',levels:[...completedLevels],playerName,resumeLevel:level};
 const fingerprint=JSON.stringify(data);
 if(!manual&&journeyLastWrites[slotIndex]===fingerprint)return true;
 try{
  const slots=readJourneySlots();
  slots[slotIndex]={...data,savedAt:Date.now()};
  storeJourneySlots(slots);
  activeSaveSlot=slotIndex;journeyLastWrites[slotIndex]=fingerprint;journeyResumeLevel=level;unsavedChanges=false;refreshSaveUI();
  showGlobalToast(manual?'✓ Progres tersimpan di Slot '+(slotIndex+1):'✓ Autosave Slot '+(slotIndex+1));return true;
 }catch{unsavedChanges=true;showGlobalToast('Penyimpanan gagal. Izinkan penyimpanan browser lalu coba lagi.');return false;}
}
completeLevel=function(level){
 const isNew=!completedLevels.includes(level);
 if(isNew)completedLevels.push(level);
 if(isNew&&level<5)pendingUnlockLevel=level+1;
 journeyResumeLevel=Math.min(level+1,5);
 writeJourneySave(false);
 refreshLevelLocks();
};
// Every new level run invalidates old dialog / transition work before resetting state.
function prepareLevelRun(){
 stopJourneyCheckpoint();stopPostLevelExit();resetCompletionPanels();stopGameplaySoundtrack(0);flowVersion++;movementKeys.clear();forestInteractionHeld=false;factoryInteractionHeld=false;
 levelOneGameplay=false;riverGameplay=false;forestGameplay=false;factoryGameplay=false;
 levelOneActive=false;parkEntranceActive=false;pakRudiDialogActive=false;riverEntranceActive=false;riverNpcDialogActive=false;levelThreeActive=false;levelFourActive=false;riverMiniGame=null;
 stopCityLevel();stopLevelOneAudio(0);$('#prologue-bgm').pause();$('#menu-bgm').pause();$('#menu-video').pause();
}
const originalLevelStarters=[startLevelOne,startLevelTwo,startLevelThree,startLevelFour,startLevelFive];
const checkpointStarters=originalLevelStarters.map((start,i)=>()=>{
 prepareLevelRun();start();journeyResumeLevel=i+1;writeJourneySave(false);
});
[startLevelOne,startLevelTwo,startLevelThree,startLevelFour,startLevelFive]=checkpointStarters;
levelStarters.splice(0,levelStarters.length,...checkpointStarters);
// Level 1-3 already have their own approach/NPC scenes. Level 4-5 use the
// shared checkpoint approach before their existing opening dialogue.
levelStarters[3]=()=>beginJourneyCheckpoint(4,'before',checkpointStarters[3]);
levelStarters[4]=()=>beginJourneyCheckpoint(5,'before',checkpointStarters[4]);
function restartCurrentLevel(){const level=activeLevelNumber();if(!level)return;closePause();$('#settings-panel').hidden=true;checkpointStarters[level-1]();}
canRestartLevel=function(){return activeLevelNumber()>0;};
$('#pause-restart').onclick=restartCurrentLevel;$('#pause-restart').textContent='RESTART LEVEL';
// Old retry listeners captured the original functions; replace those listeners.
['retry-level','river-retry','forest-retry','factory-retry','city-retry'].forEach((id,i)=>{
 const old=$('#'+id),button=old.cloneNode(true);old.replaceWith(button);button.onclick=()=>{if(paused)closePause();checkpointStarters[i]();};
});
function formatSaveDate(timestamp){
 if(!timestamp)return 'Belum pernah disimpan';
 try{return new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short'}).format(new Date(timestamp));}catch{return new Date(timestamp).toLocaleString();}
}
function checkpointLabel(save){
 if(!save)return 'Slot kosong';
 if(save.checkpoint==='prologue')return 'Prolog · mulai dari awal';
 if(save.levels.includes(5))return 'Petualangan selesai';
 return `Level ${save.resumeLevel} · ${regionNames[save.resumeLevel-1]}`;
}
let saveSlotsMode='load';
function renderSaveSlots(){
 const slots=readJourneySlots(),list=$('#save-slots-list');list.replaceChildren();
 slots.forEach((save,index)=>{
  const card=document.createElement('article');card.className='save-slot'+(activeSaveSlot===index?' active':'')+(save?'':' empty');
  card.innerHTML='<div class="save-slot-copy"><strong></strong><span class="save-slot-checkpoint"></span><small></small></div><button type="button"></button>';
  card.querySelector('strong').textContent=`SLOT ${index+1}`;
  card.querySelector('.save-slot-checkpoint').textContent=checkpointLabel(save);
  card.querySelector('small').textContent=save?`${save.playerName} · ${formatSaveDate(save.savedAt)}`:'Pilih slot ini untuk membuat penyimpanan baru.';
  const action=card.querySelector('button');
  if(saveSlotsMode==='save'){
   action.textContent=save?'TIMPA':'SIMPAN';
   action.onclick=()=>{const checkpoint=currentJourneyCheckpoint();if(checkpoint==='prologue')journeyResumeLevel=1;if(writeJourneySave(true,journeyResumeLevel,index,checkpoint)){$('#save-slots-modal').hidden=true;renderSaveSlots();}};
  }else{
   action.textContent='MUAT';action.disabled=!save;
   action.onclick=()=>save&&loadJourneySlot(index);
  }
  list.append(card);
 });
}
function openSaveSlots(mode='load'){
 saveSlotsMode=mode;
 $('#save-slots-kicker').textContent=mode==='save'?'SIMPAN PERJALANAN':'PERJALANAN TERSIMPAN';
 $('#save-slots-title').textContent=mode==='save'?'PILIH SLOT SIMPAN':'PILIH DATA PERMAINAN';
 $('#save-slots-description').textContent=mode==='save'?'Pilih slot kosong atau timpa progres lama.':'Pilih checkpoint yang ingin dilanjutkan.';
 renderSaveSlots();$('#save-slots-modal').hidden=false;
 $('#save-slots-list button:not([disabled])')?.focus();
}
function loadJourneySlot(index){
 const save=readJourneySlots()[index];if(!save)return;
 activeSaveSlot=index;completedLevels=[...save.levels];playerName=save.playerName;journeyResumeLevel=save.resumeLevel;unsavedChanges=false;
 journeyLastWrites[index]=JSON.stringify({version:3,checkpoint:save.checkpoint,levels:[...save.levels],playerName:save.playerName,resumeLevel:save.resumeLevel});
 localStorage.setItem('petualanganHijauPlayerName',playerName);refreshLevelLocks();$('#save-slots-modal').hidden=true;
 if(paused){$('#pause-overlay').classList.remove('open');$('#pause-overlay').hidden=true;paused=false;}
 running=false;
 if(save.checkpoint==='prologue'){showScreen('#menu');startGame();return;}
 $('#menu-bgm').pause();$('#menu-video').pause();
 showScreen('#map');
}
savedCheckpoint=readJourneySave;
refreshSaveUI=function(){const button=$('#load-button');button.hidden=false;button.style.display='block';};
openContinuePopup=function(){openSaveSlots('load');};
saveProgress=function(){openSaveSlots('save');};
$('#save-slots-cancel').onclick=()=>{$('#save-slots-modal').hidden=true;};
$('#continue-modal').hidden=true;
$('#pause-save + .ui-note').textContent='Pilih slot simpan. Prolog dimulai lagi dari awal; level dilanjutkan dari awal level berikutnya yang terbuka.';
new MutationObserver(()=>{
 const screen=document.querySelector('.screen.active')?.id;if(screen===journeyLastScreen)return;journeyLastScreen=screen;
 if(screen==='map')writeJourneySave(false);
}).observe($('#game'),{subtree:true,attributes:true,attributeFilter:['class']});
setInterval(()=>{if(activeLevelNumber()||$('#map').classList.contains('active'))writeJourneySave(false);},15000);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(activeLevelNumber()||$('#map').classList.contains('active')))writeJourneySave(false);});
window.addEventListener('pagehide',()=>{if(activeLevelNumber()||$('#map').classList.contains('active'))writeJourneySave(false);});
$('#name-form').addEventListener('submit',()=>{if(!$('#player-name-input').value.trim())return;activeSaveSlot=null;journeyResumeLevel=1;journeyLastWrites.fill('');});
refreshLevelLocks();refreshSaveUI();
runStartupFlow();
