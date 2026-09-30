const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),styles=fs.readFileSync('styles.css','utf8'),ui=fs.readFileSync('ui.css','utf8');

assert.equal((html.match(/class="route-line route-segment"/g)||[]).length,4,'five levels need four route segments');
for(let level=2;level<=5;level++)assert.ok(html.includes(`data-to-level="${level}"`),`route segment to level ${level} is missing`);

const context=vm.createContext({completedLevels:[]});
vm.runInContext(game.split('\n').find(line=>line.startsWith('function isLevelUnlocked(')),context);
const unlocked=(level,levels)=>vm.runInContext(`isLevelUnlocked(${level},${JSON.stringify(levels)})`,context);
assert.equal(unlocked(1,[]),true);assert.equal(unlocked(2,[]),false);assert.equal(unlocked(2,[1]),true);
assert.equal(unlocked(4,[1,3]),false,'a gap in completed levels must keep later levels locked');
assert.equal(unlocked(5,[1,2,3,4]),true);

assert.match(game,/async function enterMapLevel\(level\)[\s\S]*map\.classList\.add\('map-exiting'\)[\s\S]*levelStarters\[level-1\]\(\)/);
assert.match(game,/class="map-lock"/);assert.match(ui,/@keyframes mapShackleOpen/);
for(let level=2;level<=5;level++)assert.ok(game.includes(`data-cloud-level="${level}"`),`missing cloud cover for Level ${level}`);
assert.match(game,/function finishJourneyCheckpoint\(\)[\s\S]*completeLevel\(level\)[\s\S]*showScreen\('#map'\)/,'level completion must happen after the final NPC checkpoint');
assert.match(game,/function revealPendingUnlock\(\)[\s\S]*cloud\.classList\.add\('clearing'\)/,'returning to the map must slide the next cloud away');
assert.match(ui,/\.map-cloud\.clearing\{[^}]*translate\(55vw,-22vh\)/,'cloud clearing needs a visible sliding transition');
assert.match(styles,/\.map-screen\.map-exiting \{ opacity: 0;/);assert.match(styles,/\.route-line\.route-locked/);
assert.match(game,/'#prologue', '#map', '#level-1-screen'/,'pause must remain available on the map');
console.log('PASS: sequential locks, aligned route segments, NPC-gated completion, sliding cloud reveal, shared map pause, and fade-to-level transition.');
