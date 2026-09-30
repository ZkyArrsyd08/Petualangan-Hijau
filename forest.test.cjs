const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

const game=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const ui=fs.readFileSync('ui.css','utf8');

assert.match(game,/let forestTime = 150;/);
assert.match(html,/id="forest-timer">02:30</);
assert.match(html,/id="forest-opening"[^>]*awaiting-dialog-tap/,'Level 3 must wait for a tap before its first dialogue');
assert.match(game,/forestDialogMode==='entrance-intro'/);
assert.match(game,/forestEntranceActive=true/);
assert.match(html,/id="forest-npc-dialog"/);
assert.match(game,/forestEntranceStage='gate'/);
assert.match(game,/async function enterForestFromGate\(\)[\s\S]*forest-entry-loading[\s\S]*mission-intro/);
assert.match(html,/id="forest-ready-start"/);

for(const asset of ['forest-entrance','forest-wooded','forest-cleared','forest-holes','forest-planted','forest-restored','seedling','wood-sprites-transparent','watering-animation-transparent','watering-can-transparent']){
  assert.ok(fs.existsSync(path.join('assets','level3','new',asset+'.png')),`missing Level 3 asset ${asset}`);
}
const forestWoodDefinitions=game.slice(game.indexOf('const forestWoodItems='),game.indexOf('const forestPlantSpots='));
const forestPlantDefinitions=game.slice(game.indexOf('const forestPlantSpots='),game.indexOf('const forestObstacles='));
assert.equal((forestWoodDefinitions.match(/collected:false/g)||[]).length,6,'six wood pickups are required');
assert.equal((forestPlantDefinitions.match(/dug:false,seeded:false,watered:false/g)||[]).length,3,'three planting sites are required');
for(const coordinate of ['x:35.5,y:28','x:39,y:62','x:61,y:70'])assert.ok(forestPlantDefinitions.includes(coordinate),`missing aligned planting point ${coordinate}`);
assert.match(game,/plantHoldProgress\+dt\/3/,'digging must require a three-second hold');
assert.match(game,/forestStage===3[\s\S]*site\.seeded=true/,'seed placement must be interactive');
assert.match(html,/id="forest-watering-game"[\s\S]*id="forest-water-pour"/,'watering must open a dedicated timing minigame');
assert.match(game,/function openForestWateringGame[\s\S]*type:'watering'/,'watering interaction must enter minigame state');
assert.match(game,/function attemptForestWatering[\s\S]*needle>=38&&game\.needle<=62/,'watering must require timing inside the green zone');
assert.match(game,/function completeForestWateringGame[\s\S]*site\.watered=true[\s\S]*forestWateredCount===3[\s\S]*setForestWorldStage\('restored'\)/,'watering minigame must complete each seedling and reveal the wood-free restored background');
assert.match(ui,/cleared-after-watering[\s\S]*opacity:0/,'interaction artwork must disappear after the final watering');
for(const stage of ['cleared','holes','planted','restored'])assert.ok(ui.includes(`data-stage='${stage}'`),`missing ${stage} visual state`);
assert.match(game,/forestCompletedActions\(\)\/15\*100/,'progress must cover all 15 actions');
assert.match(html,/id="forest-restoration-bar"[^>]*value="0"/);
assert.match(game,/function isForestWalkable[\s\S]*forestObstacles/,'forest movement must respect collision obstacles');
assert.match(game,/enterEnvironmentCamera\('#forest-camera'/);
assert.match(game,/function getForestOutcome\(\)[\s\S]*'clean'[\s\S]*'partial'[\s\S]*'dirty'/);
assert.match(game,/function gameOverLevelThree\(\)\{finishLevelThree\('timeout'\);\}/);
const forestFinish=game.slice(game.indexOf("async function finishLevelThree(reason='complete')"),game.indexOf('function gameOverLevelThree'));
assert.doesNotMatch(forestFinish,/completeLevel\(3\)/);
assert.match(forestFinish,/showForestDialog\(true\)/);
assert.match(game,/beginReturnToNpc\(3\)/);
console.log('PASS: Level 3 tap dialogue, NPC gate flow, staged restoration, collision, progress, timer, outcomes, and supplied artwork.');
