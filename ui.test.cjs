const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8');
const context=vm.createContext({localStorage:{getItem:()=>context.save},document:{querySelector:()=>({id:context.screen})},levelOneGameplay:false,riverGameplay:false,forestGameplay:false,factoryGameplay:false,forestProgress:0,factoryProgress:0,city:{phase:'off'}});
// Exercise actual checkpoint parsing/routing and restart availability decisions.
for(const name of ['savedCheckpoint','nextSavedLevel','activeLevelNumber','canRestartLevel'])vm.runInContext(source.split('\n').find(line=>line.startsWith(`function ${name}(`)),context);
const run=code=>vm.runInContext(code,context);
for(const save of [null,'broken','{}','{"levels":null}']){context.save=save;assert.equal(run('savedCheckpoint()'),null);}
context.save='{"levels":[1,2],"playerName":"Test"}';assert.equal(run('nextSavedLevel(savedCheckpoint().levels)'),3);
assert.equal(run('nextSavedLevel([])'),1);assert.equal(run('nextSavedLevel([1,2,3,4,5])'),5);
context.screen='map';assert.equal(run('canRestartLevel()'),false);
context.screen='level-3-screen';context.forestGameplay=true;assert.equal(run('canRestartLevel()'),true);context.forestProgress=4;assert.equal(run('canRestartLevel()'),false);
context.screen='level-5-screen';context.city.phase='play';assert.equal(run('canRestartLevel()'),true);context.city.phase='transition';assert.equal(run('canRestartLevel()'),false);
const html=fs.readFileSync('index.html','utf8');assert.ok(html.includes('src="game.js"'));assert.ok(html.includes('href="ui.css"'));
assert.match(html,/id="load-button"/);assert.match(source,/refreshSaveUI=function\(\)\{const button=\$\('#load-button'\);button\.hidden=false/);
assert.match(html,/SPECIAL THANKS/);assert.match(html,/Cakrawala Project · Nexus Ananta/);
for(const id of ['pak-rudi-dialog','opening-dialog','river-dialog','forest-opening','factory-opening']){
  const start=html.indexOf(`id="${id}"`);assert.ok(start>=0,`missing dialogue ${id}`);const fragment=html.slice(start,start+900);assert.match(fragment,/class="dialog-nameplate"/);assert.match(fragment,/assets\/level1\/ui\/dialog\.png/);
}
assert.match(source,/id="city-hold"[\s\S]*TAHAN E UNTUK MEMBERSIHKAN/);
assert.match(source,/cityInteractionHeld=true;runInteraction\('level-5',\(\)=>interactCity\('pickup'\)\)/);
assert.match(source,/runInteraction\('level-5-dispose',\(\)=>interactCity\('dispose'\)\)/);
assert.match(source,/const hudSpecs=\[\['\.river-hud'[\s\S]*\['\.factory-hud','#factory-progress',4\]\]/);
assert.match(source,/bar\.max=max;bar\.value=0/);
console.log('PASS: saves, restart routing, unified dialogue UI, and zero-based progress bars.');
