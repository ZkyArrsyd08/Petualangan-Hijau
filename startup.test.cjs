const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('game.js', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const ui = fs.readFileSync('ui.css', 'utf8');

assert.ok(html.indexOf('id="startup-overlay"') < html.indexOf('id="game"'), 'startup overlay must precede the game UI');
assert.match(html, /id="startup-loading-status">Memuat\.\.\.<\/p>/);
assert.match(html, /id="startup-loading-fill"/);
assert.match(html, /id="startup-loading-percent">0%<\/small>/);
assert.doesNotMatch(html.match(/<video id="menu-video"[^>]*>/)?.[0] || '', /autoplay/);
assert.doesNotMatch(html.match(/<section id="menu"[^>]*>/)?.[0] || '', /\bactive\b/);

assert.match(css, /html, body \{[^}]*margin: 0;[^}]*overflow: hidden;/s);
assert.match(css, /#game \{[^}]*position: fixed;[^}]*width: 100vw;[^}]*height: 100dvh;/s);
assert.match(ui, /\.startup-overlay\{[^}]*position:fixed;[^}]*inset:0;[^}]*background:#000;/s);
assert.match(ui, /#startup-loading-fill\{[^}]*transition:width \.25s ease/);

const timing = name => Number(js.match(new RegExp(`${name}:\\s*(\\d+)`))?.[1]);
assert.equal(timing('initialBlack'), 200);
assert.equal(timing('splashFade'), 700);
assert.equal(timing('splashHold'), 3600);
assert.equal(timing('loadingFade'), 650);
assert.equal(timing('loadingMinimum'), 7000);
assert.equal(timing('assetTimeout'), 12000);
assert.equal(timing('splashFade') * 2 + timing('splashHold'), 5000);

const flow = js.slice(js.indexOf('async function runStartupFlow()'), js.indexOf('async function pausableSleep'));
const orderedSteps = [
  "startupState = StartupState.LOADING",
  "loading.classList.add('is-visible')",
  'preloadImportantAssets(updateStartupProgress)',
  'driveStartupProgress(importantAssetsReady, startupTiming.loadingMinimum)',
  'finishStartupProgress()',
  "status.textContent = 'Siap!'",
  "loading.classList.remove('is-visible')",
  'finishStartup(overlay)'
];
let cursor = -1;
for (const step of orderedSteps) {
  const next = flow.indexOf(step, cursor + 1);
  assert.ok(next > cursor, `startup step must be ordered: ${step}`);
  cursor = next;
}
assert.match(js, /const timedTarget = Math\.min\(96, elapsed \/ minimumDuration \* 96\)/);
assert.match(js, /elapsed >= minimumDuration && assetsDone && startupProgressDisplayed >= 94\.5/);
assert.equal((js.match(/runStartupFlow\(\);/g) || []).length, 1, 'startup must be invoked once per page lifecycle');
assert.match(js, /requestFullscreen\(\)/);
assert.match(js, /fullscreenAttempted = true/);
assert.match(js, /requestAnimationFrame\(check\)/);

for (const asset of [
  'assets/ui/title.png', 'assets/ui/start.png', 'assets/ui/load.png',
  'assets/ui/settings.png', 'assets/ui/info-icon.jpeg', 'assets/map/map.jpeg',
  'assets/scenes/scene-1.jpeg', 'assets/level1/characters/pose-1.png'
]) assert.ok(js.includes(`'${asset}'`), `missing startup preload: ${asset}`);
assert.ok(js.includes("...['down','up','left','right'].flatMap"), "all directional character frames must be preloaded");
assert.ok(js.includes("assets/player-runtime/${direction}/${frame}.png"), "startup preload must use the lightweight transparent runtime frames");

console.log('PASS: viewport, one-shot splash/loading/menu sequence, real preload progress, timeout fallback and delayed menu activation.');
