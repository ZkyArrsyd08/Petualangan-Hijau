const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const game = fs.readFileSync('game.js', 'utf8');
function functionSource(name, nextName) {
  const start = game.indexOf(`function ${name}(`);
  const end = game.indexOf(`function ${nextName}(`, start + 1);
  assert.ok(start >= 0 && end > start, `cannot extract ${name}`);
  return game.slice(start, end);
}

function classList() {
  const values = new Set();
  return {
    add: (...names) => names.forEach(name => values.add(name)),
    remove: (...names) => names.forEach(name => values.delete(name)),
    contains: name => values.has(name),
    toggle: (name, force) => force ? values.add(name) : values.delete(name)
  };
}
function node() {
  return { hidden: true, disabled: false, textContent: '', classList: classList(), addEventListener() {} };
}

const nodes = new Map([
  ['#filter-status', node()], ['#filter-grime-layer', node()], ['#filter-sponge', node()],
  ['#factory-minigame', node()], ['#factory-minigame .factory-panel', node()]
]);
const $ = selector => {
  if (!nodes.has(selector)) nodes.set(selector, node());
  return nodes.get(selector);
};
let wrong = 0;
let completed = 0;
const context = vm.createContext({
  $, paused: false, movementKeys: new Set(),
  playDisposeSound() {}, playAudio() {}, updateFactoryHud() {},
  factoryMiniWrong() { wrong++; },
  scheduleLevelCallback(callback) { callback(); },
  completeFactoryFilter() { completed++; }
});

vm.runInContext(`
let factoryMiniGame={type:'filter',phase:'debris',spongeSelected:false};
let factoryFilterDebris=0,factoryFilterScrubbed=0,factoryFilterDone=false;
let factoryWasteSorted=0,factorySortingDone=false;
${functionSource('closeFactoryMinigame', 'openFactorySorting')}
${functionSource('removeFactoryFilterDebris', 'selectFactorySponge')}
${functionSource('selectFactorySponge', 'scrubFactoryFilter')}
${functionSource('scrubFactoryFilter', 'completeFactoryFilter')}
`, context);

for (let i = 0; i < 5; i++) context.removeFactoryFilterDebris(node());
assert.equal(vm.runInContext('factoryFilterDebris', context), 5);
assert.equal(vm.runInContext('factoryMiniGame.phase', context), 'scrub');
assert.equal($('#filter-grime-layer').hidden, false);
assert.equal($('#filter-sponge').hidden, false);

const grime = [node(), node(), node(), node()];
context.scrubFactoryFilter(grime[0]);
assert.equal(wrong, 1, 'filter grime must reject cleaning before the sponge is selected');
assert.equal(vm.runInContext('factoryFilterScrubbed', context), 0);
context.selectFactorySponge();
grime.forEach(item => context.scrubFactoryFilter(item));
assert.equal(vm.runInContext('factoryFilterScrubbed', context), 4);
assert.equal(completed, 1, 'the filter must complete after five debris and four scrub spots');

vm.runInContext("factoryMiniGame={type:'filter'};factoryFilterDebris=2;factoryFilterScrubbed=1;factoryFilterDone=false", context);
context.closeFactoryMinigame();
assert.equal(vm.runInContext('factoryFilterDebris', context), 0);
assert.equal(vm.runInContext('factoryFilterScrubbed', context), 0);
assert.equal($('#factory-minigame').hidden, true);

console.log('PASS: filter debris, sponge gate, four scrub spots, completion, and safe reopen reset.');
