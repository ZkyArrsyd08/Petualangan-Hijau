const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

const game=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8');

for(const asset of ['countdown-321.mp3','intense.mp3','button-click.mp3','time-warning.mp3']){
  const file=path.join('assets','audio','gameplay',asset);
  assert.ok(fs.existsSync(file),`missing supplied audio asset ${asset}`);
  assert.ok(fs.statSync(file).size>1000,`${asset} must not be empty`);
}

assert.match(html,/id="level-countdown-sfx"[^>]*countdown-321\.mp3/);
assert.match(html,/id="gameplay-intense"[^>]*intense\.mp3" loop/);
assert.match(html,/id="gameplay-time-warning"[^>]*time-warning\.mp3" loop/);
assert.match(html,/id="click-sfx"[^>]*button-click\.mp3/);
assert.match(game,/\[\['3',1900\],\['2',1900\],\['1',1900\],\['MULAI!',850\]\]/,'visual countdown must advance in sync with the spoken 3-2-1 track');
assert.match(game,/function updateGameplaySoundtrack\(remaining\)[\s\S]*remaining>60[\s\S]*gameplay-intense'\),0,950,true[\s\S]*gameplay-time-warning'\),\.3,950,false,true/,'one-minute warning must crossfade from intense music to the looping warning');
assert.match(game,/button,\.opening-dialog,\.pak-rudi-dialog/,'shared click sound must cover buttons and dialogue taps');
assert.match(game,/function primeGameplayAudio\(\)[\s\S]*level-countdown-sfx[\s\S]*gameplay-intense[\s\S]*gameplay-time-warning/,'gameplay audio must be primed during the user gesture');

for(const start of ['beginLevelOneGameplay','beginRiverGameplay','beginForestGameplay','beginFactoryGameplay','beginCityGameplay']){
  const at=game.indexOf(`function ${start}`);
  assert.ok(at>=0,`missing ${start}`);
  assert.match(game.slice(at,at+1800),/primeGameplayAudio\(\)/,`${start} must unlock supplied audio before awaiting transitions`);
  assert.match(game.slice(at,at+1800),/runLevelCountdown[\s\S]*startGameplaySoundtrack\(\)/,`${start} must count down before starting its soundtrack`);
}

for(const finish of ['finishLevelOne','finishRiverLevel','finishLevelThree','finishLevelFour','cityResult']){
  const at=game.indexOf(`function ${finish}`);
  assert.ok(at>=0,`missing ${finish}`);
  assert.match(game.slice(at,at+1000),/stopGameplaySoundtrack\(\)/,`${finish} must stop gameplay music`);
}

console.log('PASS: supplied click/countdown/gameplay/warning audio, all-level starts, one-minute crossfade, pause safety, and finish cleanup.');
