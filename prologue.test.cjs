const fs=require('node:fs'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('styles.css','utf8');

assert.equal(new Set(js.match(/assets\/scenes\/scene-\d+\.jpeg/g)||[]).size,7,'prologue must use all seven supplied backgrounds');
assert.match(js,/Promise\.all\(\[\s*typewrite\(scene\.text, version\),\s*pausableSleep\(timing\.sceneDuration, version\)/s,'text acceleration must not shorten the fixed slide duration');
const tapHandler=js.match(/\$\('#prologue'\)\.addEventListener\('pointerdown',[\s\S]*?\n\}\);/)?.[0]||'';
assert.match(tapHandler,/finishTyping = true/);assert.doesNotMatch(tapHandler,/showScreen|advance|flowVersion\+\+/,'tap may complete text but may not skip the slide');
for(const step of ["showScreen('#title-card')","showScreen('#loading')","showScreen('#map')"]){assert.ok(js.includes(step),`missing prologue transition: ${step}`);}
assert.ok(js.indexOf("showScreen('#title-card')")<js.indexOf("showScreen('#loading')"));
assert.ok(js.indexOf("showScreen('#loading')")<js.indexOf("showScreen('#map')"));
assert.match(css,/\.title-card \{ background: #000; \}/);assert.match(css,/titleReveal 5s/);
assert.match(html,/id="prologue-skip"[\s\S]*SKIP PROLOG/);
assert.match(js,/function skipPrologueSlides\(\)[\s\S]*flowVersion[\s\S]*playPrologueEnding\(version\)/);
assert.match(js,/async function playPrologueEnding\(version\)[\s\S]*showScreen\('#title-card'\)[\s\S]*showScreen\('#loading'\)[\s\S]*showScreen\('#map'\)/);
assert.match(js,/function showMenu\(\) \{[\s\S]*stopPrologueAudio\(\)[\s\S]*showScreen\('#menu'\)/,'returning to the main menu must hard-stop prologue music');
const audio={paused:false,currentTime:12,volume:.5,dataset:{baseVolume:'.5'},pause(){this.paused=true}};
let cancelled=0;
const audioContext=require('node:vm').createContext({$:()=>audio,audioFades:new WeakMap(),cancelAnimationFrame(){cancelled++}});
audioContext.audioFades.set(audio,123);
const audioStopSource=js.slice(js.indexOf('function stopPrologueAudio()'),js.indexOf('function startLevelOneAudio()'));
require('node:vm').runInContext(audioStopSource,audioContext);
require('node:vm').runInContext('stopPrologueAudio()',audioContext);
assert.equal(cancelled,1);assert.equal(audio.paused,true);assert.equal(audio.currentTime,0);assert.equal(audio.volume,0);assert.equal(audio.dataset.baseVolume,'0');
assert.match(html,/id="pause-button"[\s\S]*id="pause-overlay"/);
console.log('PASS: seven automatic slides, text-only tap acceleration, skip-to-title, title zoom, loading, map transition, and hard BGM cleanup.');
