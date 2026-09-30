const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map();function node(){return {style:{},classList:{add(){},remove(){},toggle(){}},append(){},setAttribute(){}}}const $=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};
let scenes=[],menu=0,waits=0,cancelAt=Infinity;
const context=vm.createContext({$,document:{createElement:node,body:node()},Image:class{},movementKeys:new Set(),flowVersion:0,stopLevelOneAudio(){},fadeAudio(){},playAudio(){},showScreen:id=>scenes.push(id),showMenu:()=>{menu++;context.stopEnding()},pausableSleep:async()=>{waits++;if(waits===cancelAt)context.stopEnding();return true;}});
const combinedSource=fs.readFileSync('game.js','utf8');
const moduleStart=combinedSource.indexOf('// MODULE TERGABUNG: ending.js');
const moduleEnd=combinedSource.indexOf('// MODULE TERGABUNG: ui.js',moduleStart+1);
const moduleSource=combinedSource.slice(moduleStart,moduleEnd);
vm.runInContext(moduleSource,context);
async function main(){
 await context.startEnding();assert.equal(menu,1);assert.deepEqual(scenes,['#ending-screen']);assert.equal($('#ending-logo').hidden,false);
 const cards=vm.runInContext('endingCards',context);assert.deepEqual([...new Set(cards.filter(c=>c.image).map(c=>c.image))],['park','river','forest','factory','city','world']);assert.equal(cards.at(-2).endTitle,true);assert.equal(cards.at(-2).title,'END OF JOURNEY');assert.equal(cards.at(-1).logo,true);assert.equal($('#ending-end-title').hidden,true);
 assert.match(moduleSource,/keepsBackdrop=Boolean\(card\.image&&next\?\.image===card\.image\)/,'repeated ending backgrounds must be detected');
 assert.match(moduleSource,/if\(keepsBackdrop\)\{\$\('#ending-narration'\)\.classList\.add\('changing'\)[\s\S]*?else\{\$\('#ending-fade'\)\.classList\.add\('covered'\)/,'same-background cards must change only narration while real scene changes use the full fade');
 for(const name of ['park','river','forest','factory','city','world'])assert.ok(fs.existsSync(`assets/epilogue/${name}.png`));
 scenes=[];waits=0;cancelAt=3;await context.startEnding();assert.equal(menu,1);assert.equal(vm.runInContext('endingIndex',context),-1);
 console.log('PASS: automatic full epilogue, all six images, title finale, automatic menu return, cancelled run guard.');
}main().catch(e=>{console.error(e);process.exitCode=1});
