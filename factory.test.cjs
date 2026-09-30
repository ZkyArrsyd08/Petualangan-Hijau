const fs = require('node:fs');
const assert = require('node:assert/strict');

const game = fs.readFileSync('game.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const ui = fs.readFileSync('ui.css', 'utf8');

assert.match(game, /let factoryTime = 150;/, 'Level 4 must use a 2:30 timer');
assert.match(html, /id="factory-timer">02:30</, 'Level 4 timer HUD must start at 02:30');
assert.match(game, /runLevelCountdown\('#shared-level-countdown'/, 'Level 4 must run the shared 3-2-1 countdown');
assert.match(game, /factoryFloorTasks=\[[\s\S]*floor-a[\s\S]*floor-b[\s\S]*floor-c[\s\S]*floor-d/, 'Level 4 needs the four marked floor-cleaning targets');
assert.equal((game.slice(game.indexOf('const factoryFloorTasks'), game.indexOf('const factoryActionPoints')).match(/key:'floor-/g) || []).length, 4, 'floor cleanup must have four targets');
for (const coordinate of ["x:33,y:31", "x:42,y:51", "x:57,y:68", "x:39,y:82"]) assert.match(game, new RegExp(coordinate), `missing marked stain coordinate ${coordinate}`);
assert.match(game, /factoryHoldProgress\+dt\/1\.8/, 'floor stains must use hold-E progress');
assert.match(game, /factoryActionPoints=\{[\s\S]*sorting[\s\S]*filter/, 'sorting and filter interaction points are required');
assert.match(game, /node\.dataset\.key==='sorting'\)openFactorySorting\(\)/, 'E must open the sorting minigame');
assert.match(game, /node\.dataset\.key==='filter'\)openFactoryFilter\(\)/, 'E must open the filter minigame');

assert.equal((game.slice(game.indexOf('const factorySortingItems'), game.indexOf('const factoryOpeningLines')).match(/type:'/g) || []).length, 12, 'sorting needs 12 waste items');
for (const type of ['metal','plastic','b3']) assert.match(game, new RegExp(`type:'${type}'`), `sorting needs ${type} waste`);
assert.match(game, /factoryTime=Math\.max\(0,factoryTime-penalty\)/, 'wrong sorting must remove time');
assert.match(game, /factoryMiniWrong\(\$\('#minigame-content \.sorting-bin\.selected'\),5\)/, 'wrong bin must remove five seconds inside the factory minigame only');
assert.match(game, /function enableFactoryWasteDrag\(/, 'waste assets must support direct pointer drag and drop');
assert.match(game, /document\.elementsFromPoint/, 'drop handling must detect the bin beneath the dragged asset');
assert.match(game, /sorting-guide-line/, 'sorting needs a visible guide line above the raised bins');
assert.match(ui, /\.level-four \.sorting-item\{[^}]*border:0[^}]*background:transparent/, 'waste assets must not be shown inside visual grid boxes');
assert.match(ui, /\.level-four \.sorting-scene \.sorting-bins\{[^}]*transform:translateY\(-8px\)/, 'sorting bins must be raised from the table edge');
assert.match(game, /function removeFactoryFilterDebris\(/, 'filter minigame must remove debris first');
assert.match(game, /function selectFactorySponge\(/, 'filter minigame must let the player select a sponge');
assert.match(game, /function scrubFactoryFilter\(/, 'filter minigame must scrub dirty spots');
assert.match(game, /if\(kind==='filter'&&!factoryFilterDone\)\{factoryFilterDebris=0;factoryFilterScrubbed=0;\}/, 'closing an unfinished filter must reset it cleanly before reopening');
assert.match(game, /function isFactoryWalkable\(/, 'factory movement needs collision bounds');
assert.match(game, /setFactoryReveal\(\.68\)/, 'factory must progressively reveal the clean background');
assert.match(game, /setFactoryReveal\(1\)/, 'completed factory must reveal the clean background');

for (const asset of ['factory-dirty.png','factory-clean.png','sorting-table.png','filter-room.png','factory-sorting-sprites.png','factory-entrance.png']) {
  assert.ok(fs.existsSync(`assets/level4/rework/${asset}`), `missing Level 4 asset ${asset}`);
}
assert.match(ui, /factory-dirty\.png/, 'dirty background must be wired into Level 4');
assert.match(ui, /factory-clean\.png/, 'clean background must be wired into Level 4');
assert.match(ui, /sorting-table\.png/, 'sorting table background must be wired into the minigame');
assert.match(ui, /filter-room\.png/, 'filter-room background must be wired into the minigame');
assert.match(ui, /factory-sorting-sprites\.png/, 'transparent sorting sprites must be used');
assert.match(ui, /factory-entrance\.png/, 'Level 4 checkpoint must use the outside-factory scene');
assert.doesNotMatch(game, /const factorySystems=/, 'the previous four-machine Level 4 flow must be removed');
assert.match(game, /beginReturnToNpc\(4\)/, 'completion must return the player to the outside NPC');

console.log('PASS: Level 4 rework covers floor cleanup, waste sorting, filter cleaning, collisions, clean reveal, and NPC return.');
