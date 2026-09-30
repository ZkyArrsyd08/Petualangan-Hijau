// State-flow tests without a browser; visual/input hit-testing still needs manual QA.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
function node(){return {hidden:false,style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},handlers:{},children:[],addEventListener(k,fn){this.handlers[k]=fn},setAttribute(){},append(...items){this.children.push(...items)},replaceChildren(...items){this.children=[...items]},textContent:'',innerHTML:''};}
const nodes=new Map();const $=key=>{if(!nodes.has(key))nodes.set(key,node());return nodes.get(key)};
let resolveTransition;
const context=vm.createContext({$,document:{createElement:node,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},performance:{now:()=>0},requestAnimationFrame(){},movementKeys:new Set(),paused:false,flowVersion:0,playerName:'Test',playerSprites:{up:'up',down:'down',left:'left',right:'right'},formatTime:t=>String(t),pointInPolygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;}return inside;},playAudio(){},playDisposeSound(){},setGameplaySprite(){},showScreen(){},resetInteractionState(){},resetTimerAlert(){},updateTimerAlert(){},primeGameplayAudio(){},runLevelCountdown:async()=>true,startGameplaySoundtrack(){},stopGameplaySoundtrack(){},completeLevel:n=>{context.completed=n},startEnding:()=>{context.ending=true},pausableSleep:()=>new Promise(r=>resolveTransition=r),setTimeout:()=>1,clearTimeout(){}});
const source=fs.readFileSync('game.js','utf8');
const moduleStart=source.indexOf('// MODULE TERGABUNG: city.js');
const moduleEnd=source.indexOf('// MODULE TERGABUNG: ending.js',moduleStart+1);
vm.runInContext(source.slice(moduleStart,moduleEnd),context);
const run=code=>vm.runInContext(code,context);
async function cleanSite(index,seconds=3.1){
  run(`{const s=city.sites[${index}];city.x=s.x;city.y=s.y;cityInteractionHeld=true;interactCity('pickup');updateCityHold(${seconds})}`);
  await new Promise(setImmediate);
}
async function main(){
  run('startLevelFive()');
  assert.equal(run('city.phase'),'ready');
  assert.equal(run('city.time'),150);
  assert.equal(run('city.y'),80);
  assert.equal(run('city.sites.length'),23);
  assert.equal(run("city.sites.filter(s=>s.type==='dirt').length"),5);
  assert.equal(run("city.sites.filter(s=>s.type==='trash').length"),15);
  assert.equal(run("city.sites.filter(s=>s.type==='bin').length"),3);
  assert.equal(run("city.sites.every(s=>s.type!=='green')"),true);
  assert.equal(run("city.sites.filter(s=>s.type==='trash').every(s=>s.path.startsWith('assets/level5/new/trash-'))"),true);
  assert.equal(run("city.sites.filter(s=>s.type==='bin').every(s=>s.path.startsWith('assets/level1/new/bins/'))"),true);
  assert.equal(run('city.sites.every(s=>isCityWalkable(s.x,s.y))'),true,'all Level 5 targets must stay inside the collision polygon');
  assert.equal(run("city.sites.filter(s=>s.type==='dirt').every(s=>s.y>=48&&s.y<=60)"),true,'floor markers must stay on the road');
  assert.equal(run("Math.max(...city.sites.filter(s=>s.type==='trash').map(s=>s.x))-Math.min(...city.sites.filter(s=>s.type==='trash').map(s=>s.x))>=85"),true,'trash must span the wide map');
  assert.equal(run("Math.max(...city.sites.filter(s=>s.type==='bin').map(s=>s.x))-Math.min(...city.sites.filter(s=>s.type==='bin').map(s=>s.x))>=70"),true,'bins must be separated across the map');
  await $('#city-start').onclick();
  assert.equal(run('city.phase'),'play');
  assert.equal(run('city.stage'),'trash');
  assert.equal($('#city-sites').innerHTML.includes('LANTAI KOTOR'),false,'floor markers must stay hidden while trash remains');

  for(let i=5;i<20;i++){
    run(`{const s=city.sites[${i}];city.x=s.x;city.y=s.y;cityInteractionHeld=true;interactCity('pickup')}`);
    assert.equal(run('city.carried'),i);
    run(`{const trash=city.sites[city.carried],bin=city.sites.find(s=>s.type==='bin'&&s.category===trash.category);city.x=bin.x;city.y=bin.y;cityInteractionHeld=false;interactCity('dispose')}`);
    assert.equal(run('city.carried'),null);
  }
  assert.equal(run("cityCount('trash')"),15);
  assert.equal($('#city-clean-reveal').children.length,15,'each pickup must progressively reveal the clean background');
  assert.equal(run('city.stage'),'dirt');
  assert.equal($('#city-sites').innerHTML.includes('LANTAI KOTOR'),true,'floor markers must appear only after all trash is disposed');

  await cleanSite(0,.5);
  assert.equal(run('city.sites[0].done'),false,'a short tap must not clean the target');
  run('cityInteractionHeld=false;resetCityHold()');
  await cleanSite(0);
  assert.equal(run('city.sites[0].done'),true,'holding E must clean the target');

  for(let i=1;i<5;i++)await cleanSite(i);
  assert.equal(run("cityCount('dirt')"),5);
  assert.equal($('#city-clean-reveal').children.length,20,'cleaning floor areas must continue the gradual background reveal');
  assert.equal(run('city.phase'),'transition');
  const remaining=run('city.time');run('cityLoop(100)');assert.equal(run('city.time'),remaining);
  resolveTransition(true);await new Promise(setImmediate);
  assert.equal(run('city.phase'),'success');
  assert.equal(context.ending,undefined,'ending must wait for the success dialogue');
  assert.equal($('#city-success-text').textContent,'Berhasil! Kota ini akhirnya kembali bersih.');
  $('#city-success-dialog').onclick();
  assert.equal($('#city-success-text').textContent,'Perjalananku selesai, tapi menjaga lingkungan harus terus kita lakukan.');
  $('#city-success-dialog').onclick();
  assert.equal(run('city.endingTransition'),true);
  resolveTransition(true);await new Promise(setImmediate);
  assert.equal(run('city.phase'),'won');
  assert.equal(context.completed,5);
  assert.equal(context.ending,true);

  run("startLevelFive();city.phase='play';city.time=.01;cityLoop(150)");
  assert.equal(run('city.phase'),'lost');
  assert.equal($('#city-result').hidden,false);
  run('startLevelFive()');
  assert.equal(run('city.phase'),'ready');
  assert.equal(run('cityProgressUnits()'),0);
  assert.equal($('#city-clean-reveal').children.length,0,'restarting Level 5 must reset all clean-background reveals');
  const css=fs.readFileSync('styles.css','utf8')+fs.readFileSync('ui.css','utf8');
  assert.match(css,/\.city-site\.dirt\{width:0;height:0;[^}]*background:transparent/);
  assert.match(css,/\.city-site\.dirt::before\{[^}]*background:transparent[^}]*font:1000 30px/);
  assert.match(css,/#city-player\{width:clamp\(54px,6\.5vw,105px\);height:clamp\(100px,13vw,205px\)\}/);
  assert.match(source,/city\.x\+dx\/length\*15\*dt/,'Level 5 movement must be slightly faster without returning to its original excessive speed');
  assert.match(source,/kind==='dirt'\?'7\.5%':'5\.5%'/,'partial clean reveals must stay small until the whole mission is complete');
  assert.match(source,/key==='e'[^\n]+interactCity\('pickup'\)/,'E must pick up trash and start floor cleaning');
  assert.match(source,/key==='f'[^\n]+interactCity\('dispose'\)/,'F must dispose carried trash');
  assert.match(css,/\.city-ending-fade\{[^}]*transition:opacity 2\.2s ease/,'ending must fade out slowly after the success dialogue');
  console.log('PASS: Level 5 staged trash/floor flow, progressive clean reveal, E/F controls, success dialogue, slow ending fade, timeout, and reset.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
