const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const game = fs.readFileSync('game.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');

function readConst(name, nextName) {
  const start = game.indexOf(`const ${name}`);
  const end = game.indexOf(`const ${nextName}`, start);
  assert.ok(start >= 0 && end > start, `Unable to find ${name}`);
  const source = `${game.slice(start, end)}; ${name}`;
  return vm.runInNewContext(source);
}

const walkable = readConst('parkWalkableArea', 'levelOneTrashV2');
const trash = readConst('levelOneTrashV2', 'levelOneRepairs');
const repairs = readConst('levelOneRepairs', 'parkObstacles');
const obstacles = readConst('parkObstacles', 'collisionPadding');
const padding = { x: 1.05, y: 1.25 };

function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i], [xj, yj] = points[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function isWalkable(x, y) {
  if (!pointInPolygon(x, y, walkable)) return false;
  return !obstacles.some(obstacle => {
    if (obstacle.type === 'rect') return x > obstacle.x1 - padding.x && x < obstacle.x2 + padding.x && y > obstacle.y1 - padding.y && y < obstacle.y2 + padding.y;
    const nx = (x - obstacle.x) / (obstacle.rx + padding.x);
    const ny = (y - obstacle.y) / (obstacle.ry + padding.y);
    return nx * nx + ny * ny < 1;
  });
}

const queue = [[50, 82]];
const reachable = new Set(['50,82']);
while (queue.length) {
  const [x, y] = queue.shift();
  for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    const nx = x + dx, ny = y + dy, key = `${nx},${ny}`;
    if (!reachable.has(key) && isWalkable(nx, ny)) { reachable.add(key); queue.push([nx, ny]); }
  }
}

function distanceFromReachable(x, y) {
  let nearest = Infinity;
  for (const key of reachable) {
    const [px, py] = key.split(',').map(Number);
    nearest = Math.min(nearest, Math.hypot(px - x, py - y));
  }
  return nearest;
}

assert.equal(trash.length, 10);
for (const [, , name, x, y] of trash) {
  assert.ok(isWalkable(x, y), `${name} is placed inside a collision`);
  assert.ok(distanceFromReachable(x, y) <= 5.5, `${name} cannot be reached from the player spawn`);
}

const bins = [...html.matchAll(/class="sorting-bin (?:organic|paper|inorganic)"[^>]*data-x="([\d.]+)" data-y="([\d.]+)"/g)].slice(0, 3);
assert.equal(bins.length, 3);
for (const bin of bins) assert.ok(isWalkable(Number(bin[1]), Number(bin[2])), 'A Level 1 sorting bin is inside a collision');
for (const repair of repairs) {
  assert.ok(isWalkable(repair.interactionX, repair.interactionY), `${repair.name} interaction point is inside a collision`);
  assert.ok(distanceFromReachable(repair.interactionX, repair.interactionY) <= 1.5, `${repair.name} interaction point cannot be reached`);
}

assert.equal(Array.from(repairs, repair => repair.name).join('|'), 'Air mancur tersumbat|Bangku taman rusak|Ayunan rusak');
assert.match(game, /let parkCleanliness = 0;/);
assert.match(game, /parkCleanliness=Math\.min\(100,parkCleanliness\+8\)/);
assert.match(game, /parkCleanliness=Math\.min\(100,parkCleanliness\+\(repairCount===levelOneRepairs\.length\?6:7\)\)/);
assert.match(game, /value>=100&&cleanCount===10&&repairCount===levelOneRepairs\.length[\s\S]*'CLEAN'/);
assert.match(game, /function addParkCleanReveal\(x,y,kind='trash'/);
assert.match(game, /addParkCleanReveal\(Number\(target\.dataset\.x\),Number\(target\.dataset\.y\),'facility'/);
assert.match(game, /dataset\.sorted==='true'/, 'trash scoring needs a duplicate guard');
assert.match(css, /park-partial\.png/);
assert.match(css, /park-clean-progression\.png/);
assert.doesNotMatch(css, /park-damaged\.png/);
assert.equal(fs.existsSync('assets/level1/park-damaged.png'), false, 'the old very dirty background must be removed');
assert.match(html, /sorting-bin paper[^>]*data-x="31" data-y="82"/, 'paper bin must not block the park entrance');

console.log('PASS: Level 1 environment progression and all interactive placements are reachable.');
