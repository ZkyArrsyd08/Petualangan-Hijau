const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');

const source=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
const ui=fs.readFileSync('ui.css','utf8');
const directions=['down','up','left','right'];

for(const direction of directions){
  const folder=path.join('assets','player-motions',direction);
  const masters=['idle.png','walk-1.png','walk-2.png'];
  for(const name of masters){
    const png=fs.readFileSync(path.join(folder,name));
    assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
    assert.ok(png.readUInt32BE(16)>=1200,`${direction}/${name} must keep high-resolution art`);
    assert.ok(png.readUInt32BE(20)>=1200,`${direction}/${name} must keep high-resolution art`);
    assert.equal(png[25],6,`${direction}/${name} must preserve RGBA transparency`);
  }
}

for(const direction of directions){
  for(const name of ['idle.png','walk-1.png','walk-2.png']){
    const png=fs.readFileSync(path.join('assets','player-runtime',direction,name));
    assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16),640,`${direction}/${name} runtime width must be stable`);
    assert.equal(png.readUInt32BE(20),640,`${direction}/${name} runtime height must be stable`);
    assert.equal(png[25],6,`${direction}/${name} runtime asset must preserve alpha`);
  }
}

const image={dataset:{},src:'',getAttribute(name){return name==='src'?this.src:null},setAttribute(name,value){if(name==='src')this.src=value}};
const context=vm.createContext({$:()=>image,performance:{now:()=>0}});
const helperStart=source.indexOf('const PLAYER_WALK_FRAME_MS');
const helperEnd=source.indexOf('let playerDirection',helperStart);
vm.runInContext(source.slice(helperStart,helperEnd),context);
const run=code=>vm.runInContext(code,context);
run("setGameplaySprite('#sprite','down',false,0)");assert.equal(image.src,'assets/player-runtime/down/idle.png');
run("setGameplaySprite('#sprite','down',true,0)");
assert.equal(image.src,'assets/player-runtime/down/walk-1.png');
run("setGameplaySprite('#sprite','down',true,110)");assert.equal(image.src,'assets/player-runtime/down/walk-2.png');
run("setGameplaySprite('#sprite','right',true,220)");assert.equal(image.src,'assets/player-runtime/right/walk-1.png');
run("setGameplaySprite('#sprite','right',false,300)");assert.equal(image.src,'assets/player-runtime/right/idle.png');

for(const text of [source,html,css]) assert.doesNotMatch(text,/assets\/level1\/player|walk-(?:up|down|left|right)\.png/);
for(const id of ['player-sprite','river-player','forest-player-sprite','factory-player']) assert.ok(html.includes(id));
for(const selector of ['#player-sprite','#river-player img','#forest-player-sprite','#factory-player-sprite','#city-player img']) assert.ok(source.includes(selector),`missing animated gameplay sprite: ${selector}`);
assert.doesNotMatch(css,/playerStep/,'old fake bob animation must be removed');
assert.match(ui,/#entrance-player-sprite,[\s\S]*#forest-entrance-player-sprite,[\s\S]*#city-player img[\s\S]*width:175%/, 'large transparent canvases must be scaled consistently');
assert.match(source,/const preloadedImageCache = new Map\(\)/,'decoded runtime frames must remain cached to prevent blinking');
console.log('PASS: transparent motion masters, lightweight fixed canvases, cached two-frame walk sequencing without idle-frame flicker, and all-level integration.');
