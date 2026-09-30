const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const game = fs.readFileSync('game.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');

const assetRoot = path.join('assets', 'level1', 'new');
const npcRoot = path.join('assets', 'level1', 'npc');
for (const portrait of ['pak-rudi-explain.png','pak-rudi-present.png','pak-rudi-open.png']) {
  const file = path.join(npcRoot, portrait);
  assert.ok(fs.existsSync(file), `Missing transparent Pak Rudi portrait: ${file}`);
  assert.ok(fs.statSync(file).size > 0, `Empty Pak Rudi portrait: ${file}`);
}
const expectedAssets = [
  ...['apple-core','banana-peel','leaf-pile','rotten-fruit','branch'].map(name => `trash/organic/${name}.png`),
  ...['plastic-bottle','red-can','plastic-bag','snack-wrapper','glass-bottle','tin-can','foam-box'].map(name => `trash/inorganic/${name}.png`),
  ...['crumpled-paper','newspaper','cardboard','drink-carton','brown-paper','paper-stack'].map(name => `trash/paper/${name}.png`),
  ...['organic','inorganic','paper'].map(name => `bins/${name}.png`),
  ...['debris','tools','sparkles'].map(name => `repair/${name}.png`),
  'ui/interact-e.png'
];

assert.equal(expectedAssets.length, 25);
for (const asset of expectedAssets) {
  const file = path.join(assetRoot, ...asset.split('/'));
  assert.ok(fs.existsSync(file), `Missing split Level 1 asset: ${file}`);
  assert.ok(fs.statSync(file).size > 0, `Empty split Level 1 asset: ${file}`);
}

const activeTrashBlock = game.slice(game.indexOf('const levelOneTrashV2'), game.indexOf('const levelOneRepairs'));
assert.equal((activeTrashBlock.match(/assets\/level1\/new\/trash\//g) || []).length, 10, 'Level 1 must use exactly ten new trash assets');
assert.match(activeTrashBlock, /'organic'/);
assert.match(activeTrashBlock, /'inorganic'/);
assert.match(activeTrashBlock, /'paper'/);
assert.doesNotMatch(game, /assets\/level1\/(?:trash-v2|trash\/|bins\/)/);
assert.match(html, /assets\/level1\/new\/bins\/organic\.png/);
assert.match(html, /assets\/level1\/new\/bins\/inorganic\.png/);
assert.match(html, /assets\/level1\/new\/bins\/paper\.png/);
assert.match(html, /id="repair-hold"/);
assert.match(game, /const REPAIR_HOLD_DURATION = 5/);
assert.match(game, /function updateRepairHold\(dt\)/);
assert.match(game, /repairInteractionHeld=true/);
assert.doesNotMatch(game, /target\.remove\(\); repairCount\+\+/);

assert.match(css, /city-dirty-v2\.png/);
assert.match(css, /city-clean-v2\.png/);
assert.ok(fs.existsSync(path.join('assets','level5','city-dirty-v2.png')));
assert.ok(fs.existsSync(path.join('assets','level5','city-clean-v2.png')));
for (const oldBackground of [
  path.join('assets','level5','city-dirty-new.png'),
  path.join('assets','level5','city-clean-new.png'),
  path.join('assets','level5','extracted','bg_kota_kotor.png'),
  path.join('assets','level5','extracted','bg_kota_bersih.png')
]) assert.equal(fs.existsSync(oldBackground), false, `Old Level 5 background still exists: ${oldBackground}`);

console.log('PASS: Level 1 split assets, classification, hold repair UI, and final Level 5 backgrounds.');
