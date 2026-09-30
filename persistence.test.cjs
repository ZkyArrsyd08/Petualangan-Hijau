const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const storage=new Map(),nodes=new Map();let active=0,starts=[],screen='menu',shown='',fail=false;
function node(){return {pause(){},value:'Test',hidden:false,textContent:'',style:{},classList:{contains:()=>false,remove(){},add(){}},cloneNode:()=>node(),replaceWith(){},replaceChildren(){},addEventListener(){},focus(){}}}
const $=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};
const starters=[1,2,3,4,5].map(n=>()=>{starts.push(n);active=n;screen=`level-${n}-screen`});
const context=vm.createContext({$,Intl,Date,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(fail)throw Error('quota');storage.set(k,v)},removeItem:k=>storage.delete(k)},document:{querySelector:()=>({id:screen}),addEventListener(){},hidden:false},window:{addEventListener(){}},MutationObserver:class{observe(){}},setInterval(){},completedLevels:[1,2],playerName:'Test',unsavedChanges:false,flowVersion:0,movementKeys:new Set(['e']),forestInteractionHeld:true,levelOneGameplay:true,riverGameplay:true,forestGameplay:true,factoryGameplay:true,levelOneActive:true,levelThreeActive:true,levelFourActive:true,riverMiniGame:'net',running:false,stopJourneyCheckpoint(){},stopPostLevelExit(){},resetCompletionPanels(){},stopGameplaySoundtrack(){},stopCityLevel(){},stopLevelOneAudio(){},refreshSaveUI(){},showGlobalToast(){},refreshLevelLocks(){},activeLevelNumber:()=>active,closePause:()=>context.paused=false,paused:true,regionNames:['Taman','Sungai','Hutan','Pabrik','Kota'],levelStarters:[...starters],loadProgress(){},openSavedMap(){},showScreen:id=>{shown=id},startGame(){},pendingUnlockLevel:0,runStartupFlow(){}});
Object.assign(context,{journeyKey:'petualanganHijauSaveSlotsV3',legacyJourneyKey:'petualanganHijauSave',JOURNEY_SLOT_COUNT:5,activeSaveSlot:null,journeyResumeLevel:1,journeyLastScreen:'',journeyLastWrites:Array(5).fill('')});
starters.forEach((fn,i)=>context[['startLevelOne','startLevelTwo','startLevelThree','startLevelFour','startLevelFive'][i]]=fn);
const combinedSource=fs.readFileSync('game.js','utf8');
const moduleStart=combinedSource.indexOf('// MODULE TERGABUNG: persistence.js');
vm.runInContext(combinedSource.slice(moduleStart),context);
const run=code=>vm.runInContext(code,context),key='petualanganHijauSaveSlotsV3';

assert.equal(run('hasJourneySlots()'),false,'new games must not silently occupy a slot');
assert.equal(run("writeJourneySave(true,3,0,'level')"),true);
let envelope=JSON.parse(storage.get(key));
assert.equal(envelope.version,3);assert.equal(envelope.slots.length,5);assert.equal(envelope.slots[0].resumeLevel,3);assert.deepEqual(envelope.slots[0].levels,[1,2]);
run('loadJourneySlot(0)');assert.equal(shown,'#map','loading a level checkpoint must return to the map with its unlock progress');

context.startLevelThree();assert.equal(context.flowVersion,1);context.restartCurrentLevel();assert.deepEqual(starts,[3,3]);assert.deepEqual([...context.completedLevels],[1,2]);assert.equal(context.paused,false);assert.equal(context.movementKeys.size,0);
context.completeLevel(3);assert.equal(run('readJourneySave(0).resumeLevel'),4);assert.deepEqual([...run('readJourneySave(0).levels')],[1,2,3]);

run("completedLevels=[];playerName='Raka';writeJourneySave(true,1,1,'prologue')");
assert.equal(run("readJourneySave(1).checkpoint"),'prologue');assert.equal(run("checkpointLabel(readJourneySave(1))"),'Prolog · mulai dari awal');
assert.match(run("formatSaveDate(readJourneySave(1).savedAt)"),/\d/);

storage.delete(key);storage.set('petualanganHijauSave',JSON.stringify({levels:[1],resumeLevel:2,playerName:'Legacy',savedAt:10}));
assert.equal(run('readJourneySlots()[0].playerName'),'Legacy');assert.equal(JSON.parse(storage.get(key)).version,3);
assert.equal(run("validateJourneySave('{}')"),null);assert.equal(run("validateJourneySave('{\"levels\":[1],\"resumeLevel\":5}').resumeLevel"),2);
assert.deepEqual([...run("validateJourneySave('{\"levels\":[1,1,7,\"2\"]}').levels")],[1]);

fail=true;assert.equal(run("writeJourneySave(true,2,2,'level')"),false);assert.equal(context.unsavedChanges,true);
console.log('PASS: five dated slots, map loading, level checkpoints, prologue restart checkpoint, retained unlocks, legacy migration, and storage failure handling.');
