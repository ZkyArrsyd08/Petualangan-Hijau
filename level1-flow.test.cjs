const fs = require('node:fs');
const assert = require('node:assert/strict');

const game = fs.readFileSync('game.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const styles = fs.readFileSync('styles.css', 'utf8');

assert.match(game, /let levelTime = 150;/, 'Level 1 timer must start at two minutes thirty seconds');
assert.match(html, /id="level-timer">02:30</, 'initial timer display must match two minutes thirty seconds');
assert.match(game, /const REPAIR_HOLD_DURATION = 5;/, 'facility repair must require a five-second hold');
assert.match(html, /id="park-entrance"[\s\S]*id="entrance-gate"[\s\S]*id="pak-rudi-dialog"/, 'Level 1 needs the Pak Rudi entrance scene');
assert.match(html, /id="pak-rudi-dialog-portrait"[\s\S]*assets\/level1\/npc\/pak-rudi-present\.png/, 'Pak Rudi dialogue must use the new transparent portrait');
assert.match(game, /const pakRudiPortraits = \[[\s\S]*pak-rudi-present\.png[\s\S]*pak-rudi-explain\.png[\s\S]*pak-rudi-open\.png/, 'Pak Rudi dialogue must cycle the three new poses');
assert.doesNotMatch(styles, /pak-rudi-sheet\.png/, 'the old Pak Rudi sheet must no longer be used');
assert.match(game, /function interactParkEntrance\(\)[\s\S]*openPakRudiDialog\(\)[\s\S]*enterParkFromGate\(\)/, 'E interaction must route from Pak Rudi to the opened gate');
assert.match(game, /async function enterParkFromGate\(\)[\s\S]*park-entry-loading[\s\S]*dialogMode='mission-intro'[\s\S]*showOpeningLine\(\)/, 'the opened gate must show a short loading screen and mission dialogue');
assert.match(game, /dialogMode = 'entrance-intro'[\s\S]*showOpeningLine\(\)/, 'Level 1 must introduce the location before movement starts');
assert.match(game, /awaiting-dialog-tap[\s\S]*TAP UNTUK MEMULAI DIALOG/, 'Level 1 dialogue must wait for an initial tap');
assert.match(game, /awaiting-dialog-tap'[\s\S]*showOpeningLine\(\)/, 'the initial tap must begin the Level 1 dialogue');
assert.match(game, /\$\('#trash-layer'\)\.replaceChildren\(\)/, 'Level 1 objects must be absent before the mission starts');
assert.match(game, /async function beginLevelOneGameplay\(\)[\s\S]*createTrash\(levelOneTrashV2\)/, 'trash must spawn only after the player confirms ready');
assert.match(game, /level-ready-start[^\n]*beginLevelOneGameplay/, 'gameplay must wait for the ready button');
assert.match(game, /if\(key==='f'&&\(levelOneGameplay\|\|riverGameplay\|\|forestGameplay\|\|factoryGameplay\)\)[\s\S]*interactLevelOne\('dispose'\)/, 'F must dispose carried trash');
assert.match(game, /function interactLevelOne\(action = 'pickup'\)/, 'E pickup and F disposal must use distinct actions');
assert.match(game, /levelTime=Math\.max\(0,levelTime-5\)/, 'wrong sorting must remove five seconds');
assert.match(game, /function gameOverLevelOne\(\)\{finishLevelOne\('timeout'\)\}/, 'timeout must continue to the ending flow');
const levelOneFinish=game.slice(game.indexOf("function finishLevelOne(reason='complete')"),game.indexOf('function gameOverLevelOne'));
assert.doesNotMatch(levelOneFinish,/completeLevel\(1\)/,'Level 1 must not unlock the next level before the return NPC');
assert.match(levelOneFinish,/dialogMode='closing'/,'all outcomes must show the closing dialogue');
assert.match(game,/enablePostLevelExit\(1\)/,'Level 1 success must restore movement and require the player to reach the exit');
assert.match(game,/function interactPostLevelExit\(\)[\s\S]*beginReturnToNpc\(level\)/,'the exit must load the initial area before the return NPC');
assert.match(game, /getLevelOneOutcome\(\)[\s\S]*\?'good':'bad'/, 'Level 1 must use good and bad endings only');
assert.match(styles, /park-clean-reveal>i[^}]*clip-path:circle/, 'clean areas must be revealed locally as tasks are handled');
assert.match(styles, /\.park-camera \{[^}]*width:175%; height:175%/, 'Level 1 must use the zoomed exploration camera');
assert.doesNotMatch(game, /if\(completedLevels\.includes\(level\)\)return;/, 'completed map levels should remain replayable');
assert.match(styles, /\.level-button\.completed \{[^}]*grayscale\(1\)/, 'completed levels must appear gray');

console.log('PASS: Level 1 dialogue flow, zoom camera, controls, timer, repair hold, outcomes, return route, and replayable map state.');
