const fs = require('node:fs');
const assert = require('node:assert/strict');

const game = fs.readFileSync('game.js', 'utf8');
const ui = fs.readFileSync('ui.css', 'utf8');

for (const level of [1, 2, 3, 4]) {
  assert.match(game, new RegExp(`enablePostLevelExit\\(${level}\\)`), `Level ${level} must return control after a successful closing dialogue`);
}
assert.match(game, /city\.phase='success';[\s\S]*?#city-success-dialog[\s\S]*?finishCitySuccessDialog[\s\S]*?city\.phase='won';completeLevel\(5\);startEnding\(\{skipIntroFade:true\}\)/, 'Level 5 must show its success dialogue and slow fade before entering the ending');
assert.match(game, /journeyCheckpoint\.mode==='before'&&\[4,5\]\.includes\(journeyCheckpoint\.level\)/, 'Level 5 must require walking to its gate after the NPC dialogue');
assert.doesNotMatch(game, /else \{enablePostLevelExit\(5\);\}/, 'Level 5 must not require another return checkpoint after its final dialogue');
assert.match(game, /function interactPostLevelExit\(\)[\s\S]*post-exit-loading[\s\S]*beginReturnToNpc\(level\)/, 'the clean area exit must load the original NPC area');
assert.match(game, /async function finishJourneyCheckpoint\(\)[\s\S]*completeLevel\(level\);showLevelCompletionResult\(level\)/, 'completion must be confirmed only after the return NPC dialogue');
assert.match(game, /function showLevelCompletionResult\(level\)[\s\S]*KEMBALI KE MAP[\s\S]*MENU UTAMA/, 'the final notice must offer Map and Main Menu');
assert.match(ui, /\.level-three \.forest-entrance\{[^}]*z-index:9/, 'the Level 3 entrance must stay below its opening dialogue');
assert.match(ui, /\.level-three \.forest-dialog\{z-index:24\}/, 'the Level 3 tap dialogue must be above the entrance scene');
assert.match(ui, /cloud-single\.png/, 'each locked map level must use one isolated transparent cloud');
assert.match(ui, /factory-entrance\.png/, 'the Level 4 checkpoint must use the supplied factory entrance');
assert.match(ui, /city-entrance-v2\.png/, 'the Level 5 checkpoint must use the supplied city entrance');

const cloud = fs.readFileSync('assets/map/cloud-single.png');
assert.equal(cloud.toString('ascii', 1, 4), 'PNG');
assert.equal(cloud[25], 6, 'cloud artwork must be an RGBA PNG with real transparency');
assert.ok(fs.statSync('assets/level4/rework/factory-entrance.png').size > 1_000_000, 'factory entrance artwork is missing or incomplete');
assert.doesNotMatch(ui, /^\.sorting-bins\{position:absolute;left:8%/m, 'the Level 4 minigame must not override sorting bins in other levels');
assert.match(ui, /\.level-four \.sorting-scene \.sorting-bins\{/, 'Level 4 sorting layout must stay scoped to its own minigame');
assert.match(game, /#minigame-content \.sorting-bin/, 'Level 4 bin queries must not mutate bins in other levels');

console.log('PASS: Level 1-4 return flow, Level 5 success dialogue and ending, city/factory entrances, result choices, and transparent map clouds.');
