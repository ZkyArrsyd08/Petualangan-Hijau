const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8');
function node(){return {style:{},dataset:{},events:{},classList:{add(){},remove(){}},remove(){this.removed=true},animate(){},addEventListener(k,fn){this.events[k]=fn},removeEventListener(k){delete this.events[k]},setPointerCapture(){},getBoundingClientRect:()=>({left:0,top:0,right:100,bottom:100,width:100,height:100})};}
const nodes=new Map();const $=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};
const context=vm.createContext({$,riverNetGoal:10,riverNetX:50,riverNetCaught:0,riverFloating:[],riverTime:50,riverRun:1,riverMiniGame:'net',riverClogCleared:0,paused:false,movementKeys:new Set(),playAudio(){},playDisposeSound(){},updateRiverTimer(){},showGlobalToast(){},spawnFloatingTrash:()=>context.riverFloating.push({}),finishNetGame:()=>context.won=true,riverGameOver:()=>context.lost=true,finishRiverLevel:()=>context.restored=true});
function load(name){const start=source.indexOf(`function ${name}(`);const tail=source.slice(start);const end=tail.search(/\n(?:async )?function /);vm.runInContext(tail.slice(0,end),context);}
load('updateNetGame');load('enableClogDrag');
context.riverNetCaught=9;context.riverFloating=Array.from({length:3},()=>({x:50,y:82,speed:0,el:node()}));context.updateNetGame(0);assert.equal(context.riverNetCaught,10);assert.equal(context.won,true);
context.won=false;context.riverNetCaught=0;context.riverFloating=[{x:107,y:82,speed:0,el:node()}];context.updateNetGame(0);assert.equal(context.riverTime,47);assert.equal(context.riverFloating.length,3);
context.riverTime=2;context.riverFloating=[{x:107,y:82,speed:0,el:node()}];context.updateNetGame(0);assert.equal(context.riverTime,0);assert.equal(context.lost,true);
context.riverMiniGame='clog';const item=node();item.style={left:'8%',top:'20%'};context.enableClogDrag(item);
const down={pointerId:1,preventDefault(){}};
context.paused=true;item.events.pointerdown(down);assert.equal(item.events.pointerup,undefined);context.paused=false;
item.events.pointerdown(down);item.events.pointermove({clientX:30,clientY:30});item.events.pointercancel({type:'pointercancel'});assert.equal(item.style.left,'8%');assert.equal(context.riverClogCleared,0);
item.events.pointerdown(down);item.events.pointerup({type:'pointerup',clientX:150,clientY:150});assert.equal(item.style.top,'20%');assert.equal(context.riverClogCleared,0);
item.events.pointerdown(down);context.paused=true;item.events.pointerup({type:'pointerup',clientX:50,clientY:50});assert.equal(context.riverClogCleared,0);context.paused=false;
context.riverClogCleared=5;item.events.pointerdown(down);item.events.pointerup({type:'pointerup',clientX:50,clientY:50});assert.equal(context.riverClogCleared,6);assert.equal(context.restored,true);item.events.pointerdown(down);assert.equal(item.events.pointerup,undefined);
console.log('PASS: catch limit, missed-trash penalty/replacement, immediate timeout, paused/cancelled/invalid drops, sixth obstruction completion, duplicate-drop guard.');
