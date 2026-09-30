const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

class Classes{
  constructor(){this.values=new Set()}
  add(...names){names.forEach(name=>this.values.add(name))}
  remove(...names){names.forEach(name=>this.values.delete(name))}
  toggle(name,force){if(force===undefined)force=!this.values.has(name);force?this.values.add(name):this.values.delete(name);return force}
  contains(name){return this.values.has(name)}
}
function makeNode(){
  return {hidden:false,textContent:'',innerHTML:'',className:'',dataset:{},style:{},children:[],classList:new Classes(),handlers:{},
    addEventListener(type,handler){this.handlers[type]=handler},append(child){this.children.push(child)},replaceChildren(){this.children=[]},
    remove(){this.removed=true},querySelector(){return makeNode()},setAttribute(){}};
}
const nodes=new Map();const $=selector=>{if(!nodes.has(selector))nodes.set(selector,makeNode());return nodes.get(selector)};
const scheduled=[];
const context=vm.createContext({$,document:{createElement:makeNode,querySelectorAll(selector){return selector==='.forest-site:not(.done)'?$('#forest-sites').children.filter(node=>!node.classList.contains('done')):[]},addEventListener(){}},
  window:{addEventListener(){}},requestAnimationFrame(){},performance:{now:()=>0},setTimeout(){},movementKeys:new Set(),paused:false,flowVersion:0,
  playerName:'Test',playerSprites:{up:'up',down:'down',left:'left',right:'right'},forestStage:1,forestProgress:0,forestTime:150,
  forestPlayer:{x:50,y:82},forestDirection:'up',forestInteractionHeld:false,plantHoldProgress:0,activePlantSite:null,forestMiniGame:null,
  forestEnding:false,forestOutcome:'dirty',forestGameplay:false,forestStarting:false,levelThreeActive:false,unsavedChanges:false,
  resetInteractionState(){},resetTimerAlert(){},showScreen(){},leaveEnvironmentCamera(){},enterEnvironmentCamera(){},updateEnvironmentCamera(){},
  setGameplaySprite(){},showGlobalToast(){},primeGameplayAudio(){},runLevelCountdown:async()=>true,startGameplaySoundtrack(){},stopGameplaySoundtrack(){},
  updateTimerAlert(){},formatTime:value=>String(value),playAudio(){},pointInPolygon(){return false},runInteraction(name,fn){fn()},
  scheduleLevelCallback(fn){scheduled.push(fn)},pausableSleep:()=>new Promise(()=>{}),enablePostLevelExit(){}});

const game=fs.readFileSync('game.js','utf8');
const source=game.slice(game.indexOf('const forestWoodItems='),game.indexOf('const pakRudiLines ='));
vm.runInContext(source,context);
const run=code=>vm.runInContext(code,context);

run("levelThreeActive=true;forestGameplay=true;forestStage=4;forestPlantSpots.forEach(site=>site.seeded=true);forestPlantSpots[0].watered=true;forestPlantSpots[1].watered=true;forestWateredCount=2;renderForestSites();openForestWateringGame(2)");
assert.equal(run("forestMiniGame.type"),'watering');
assert.equal($('#forest-watering-game').hidden,false);
for(let attempt=0;attempt<3;attempt++){
  run('forestMiniGame.needle=50;attemptForestWatering()');
  assert.ok(scheduled.length,'watering attempt must schedule its result');scheduled.shift()();
}
assert.equal(run('forestPlantSpots[2].watered'),true);
assert.equal(run('forestWateredCount'),3);
assert.equal(run("$('#forest-world').dataset.stage"),'restored');
assert.equal($('#forest-sites').classList.contains('cleared-after-watering'),true);
assert.equal($('#forest-watering-game').hidden,true);
assert.equal(run('forestEnding'),true);

console.log('PASS: Level 3 watering timing minigame completes the last seedling, removes the remaining wood layer, and enters the restored stage.');
