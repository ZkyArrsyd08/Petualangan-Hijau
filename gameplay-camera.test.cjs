const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('index.html', 'utf8');
const game = fs.readFileSync('game.js', 'utf8');
const styles = fs.readFileSync('styles.css', 'utf8');
const ui = fs.readFileSync('ui.css', 'utf8');

for (const id of ['park-camera','river-camera','forest-camera','factory-camera']) {
  assert.match(html, new RegExp(`id="${id}"`), `${id} is missing`);
}
assert.match(game, /id="city-camera" class="environment-camera city-camera overview"/);
assert.match(game, /function updateEnvironmentCamera\(/);
assert.match(game, /enterEnvironmentCamera\('#forest-camera'/);
assert.match(game, /enterEnvironmentCamera\('#factory-camera'/);
assert.match(game, /enterEnvironmentCamera\('#city-camera'/);
assert.match(game, /leaveEnvironmentCamera\('#forest-camera'/);
assert.match(game, /leaveEnvironmentCamera\('#factory-camera'/);
assert.match(game, /leaveEnvironmentCamera\('#city-camera'/);
assert.match(ui, /\.environment-camera\{[^}]*width:160%;height:160%/);
assert.match(ui, /level4\/rework\/factory-dirty\.png/);
assert.match(ui, /level4\/rework\/factory-clean\.png/);
assert.match(ui, /level5\/new\/city-dirty\.png/);
assert.match(ui, /level5\/new\/city-clean\.png/);
assert.doesNotMatch(`${styles}\n${ui}`, /bg_kota_(?:kotor|bersih)\.png/);

console.log('PASS: Levels 1-5 have gameplay cameras and final environment artwork references.');
