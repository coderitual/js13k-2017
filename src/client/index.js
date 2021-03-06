import {
  assetsReady,
  clear,
  drawWorld,
  drawPlayer,
  drawOtherPlayers,
  drawHoles,
  drawTrees,
  drawProjectiles,
  drawPointer,
  drawPlayerHealth,
  drawPlayerProjectiles,
  drawPlayerList,
  drawDebugInfo,
  drawGameInfo,
} from './graphics';
import { version } from '../../package.json';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const pointer = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

const initGfx = () => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  pointer.x = 0;
  pointer.y = 0;
};

window.addEventListener('resize', initGfx);
initGfx();

let socket;
if(window.location.port === '8080') {
  socket = io(`${window.location.hostname}:3000`, {
    upgrade: false,
    transports: ['websocket'],
    query: `${(new URL(window.location)).searchParams}`,
  });
} else {
  socket = io({
    upgrade: false,
    transports: ['websocket'],
    query: `${(new URL(window.location)).searchParams}`,
  });
}

const debugInfo = {
  version,
  ping: 0,
  fps: 0,
  players: 1,
  projectiles: 0,
  trees: 0,
  holes: 0,
};

socket.on('pong', (ms) => {
  debugInfo.ping = ms;
});

const createPlayer = ({
  id,
  username = '',
  me = false,
  kills = 0,
  deaths = 0,
  points = 0,
  position = 0,
  health = 0,
  projectiles = 0,
}) => ({
  id,
  username,
  me,
  x: 0,
  y: 0,
  r: 0,
  scale: 1,
  sx: 0,
  sy: 0,
  kills,
  deaths,
  points,
  position,
  health,
  projectiles,
});

const createProjectile = ({ id, x, y }) => ({
  id,
  x,
  y,
  sx: 0,
  sy: 0,
});

const players = {
  me: null,
  others: new Map(),
  sorted: new Set(),
};

const projectiles = new Map();

const world = {
  width: 0,
  height: 0,
  holes: new Set(),
  trees: new Set(),
};

const scene = {
  pointer,
  players,
  projectiles,
  world,
};

const render = (scene, dt, time) => {
  clear(ctx, canvas.width, canvas.height);

  if(!assetsReady()) {
    return;
  }

  // Move the world to mimic camera
  const { x, y, scale } = scene.players.me;
  ctx.save();
  ctx.translate(-x / scale + canvas.width / 2, -y / scale + canvas.height / 2);
  ctx.scale(1 / scale, 1 / scale);
  drawHoles(ctx, scene.world.holes);
  drawProjectiles(ctx, scene.projectiles);
  drawOtherPlayers(ctx, scene.players.others);
  drawWorld(ctx, scene.world);
  ctx.restore();

  drawPlayer(ctx, canvas.width / 2, canvas.height / 2, time);

  ctx.save();
  ctx.translate(-x / scale + canvas.width / 2, -y / scale + canvas.height / 2);
  ctx.scale(1 / scale, 1 / scale);
  drawTrees(ctx, scene.world.trees);
  ctx.restore();

  drawPointer(ctx, scene.pointer.x + canvas.width / 2, scene.pointer.y + canvas.height / 2);
  drawPlayerHealth(ctx, 10, canvas.height - 50, scene.players.me.health);
  drawPlayerProjectiles(ctx, 10, canvas.height - 30, scene.players.me.projectiles);
  drawPlayerList(ctx, canvas.width - 10, canvas.height - 10, scene.players.sorted);
  drawDebugInfo(ctx, 10, 10, debugInfo);
  drawGameInfo(ctx, canvas.width / 2, 25, {
    'position': scene.players.me.position,
    'points': scene.players.me.points,
    'kills': scene.players.me.kills,
    'deaths': scene.players.me.deaths,
  });
};

let frames = 0;
let timeAccu = 0;
const update = (scene, dt) => {
  const { players, projectiles } = scene;
  // Add easing to compensate lag
  const MOVE_STRENGTH = 2;
  const SCALE_STRENGTH = 10;
  players.me.x += (players.me.sx - players.me.x) / MOVE_STRENGTH;
  players.me.y += (players.me.sy - players.me.y) / MOVE_STRENGTH;
  players.me.scale += (players.me.sscale - players.me.scale) / SCALE_STRENGTH;

  players.others.forEach(player => {
    player.x += (player.sx - player.x) / MOVE_STRENGTH;
    player.y += (player.sy - player.y) / MOVE_STRENGTH;
  });

  projectiles.forEach(projectile => {
    projectile.x += (projectile.sx - projectile.x) / MOVE_STRENGTH;
    projectile.y += (projectile.sy - projectile.y) / MOVE_STRENGTH;
  });

  timeAccu += dt;
  frames++;
  if (timeAccu > 1000) {
    debugInfo.fps = frames / timeAccu * 1000 | 0;
    frames = 0;
    timeAccu = 0;
  }
  debugInfo.players = scene.players.others.size + 1;
  debugInfo.projectiles = scene.projectiles.size;

  scene.players.sorted = new Set(
    [scene.players.me, ...[...scene.players.others].map(([key, value]) => value)].sort((a, b) => a.position - b.position)
  );
};

let oldTime = 0;
const loop = time => {
  requestAnimationFrame(loop);
  if (!scene.players.me) {
    return;
  }
  const dt = time - oldTime;
  update(scene, dt, time);
  render(scene, dt, time);
  oldTime = time;
};

let origin;
window.addEventListener('deviceorientation', event => {
  if (!origin) {
    origin = {
      beta: event.beta,
      gamma: event.gamma,
    };
  }

  let x = event.beta - origin.beta;
  let y = event.gamma - origin.gamma;

  if (x > 90) {
    x = 90;
  }
  if (x < -90) {
    x = -90;
  }

  pointer.x = canvas.width / 2 * y / 90 * 1.5;
  pointer.y = canvas.height / 2 * x / 90 * 1.5;
  socket.emit('c:pointer:update', pointer);
});

canvas.addEventListener('mousemove', (event) => {
  if(device.mobile()) {
    return;
  }
  pointer.x = event.clientX - canvas.offsetLeft - canvas.width / 2;
  pointer.y = event.clientY - canvas.offsetTop - canvas.height / 2;
  socket.emit('c:pointer:update', pointer);
});

document.addEventListener('mousedown', () => {
  if(device.mobile()) {
    return;
  }
  socket.emit('c:fire:press');
});

document.addEventListener('touchstart', (event) => {
  const { clientX, clientY } = event.touches[0];
  if(clientX < 90 && clientY < 90) {
    origin = null;
    return;
  }
  socket.emit('c:fire:press');
});

socket.on('s:players:update', ({ me, others }) => {
  // Filter out removed players
  scene.players.others = new Map([...scene.players.others].filter(([id]) => {
    return others.find(playerData => playerData.id === id) != null;
  }));
  // Update players data and add already joined players
  others.forEach((playerData) => {
    let player = scene.players.others.get(playerData.id);
    if(!player) {
      player = createPlayer(playerData);
      scene.players.others.set(playerData.id, player);
    }
    player.sx = playerData.x;
    player.sy = playerData.y;
    player.r = playerData.r;
    player.sscale = playerData.scale;
    player.kills = playerData.kills;
    player.deaths = playerData.deaths;
    player.points = playerData.points;
    player.position = playerData.position;
    player.health = playerData.health;
    player.projectiles = playerData.projectiles;
  });

  if (!scene.players.me) {
    scene.players.me = createPlayer(me);
  }

  scene.players.me.sx = me.x;
  scene.players.me.sy = me.y;
  scene.players.me.r = me.r;
  scene.players.me.sscale = me.scale;
  scene.players.me.kills = me.kills;
  scene.players.me.deaths = me.deaths;
  scene.players.me.points = me.points;
  scene.players.me.position = me.position;
  scene.players.me.health = me.health;
  scene.players.me.projectiles = me.projectiles;
});

socket.on('s:projectiles:update', (projectiles) => {
  // Filter out removed projectiles
  scene.projectiles = new Map([...scene.projectiles].filter(([id]) => {
    return projectiles.find(projectileData => projectileData.id === id) != null;
  }));
  // Update projectiles data and add new projectiles
  projectiles.forEach((projectileData) => {
    let projectile = scene.projectiles.get(projectileData.id);
    if(!projectile) {
      projectile = createProjectile(projectileData);
      scene.projectiles.set(projectileData.id, projectile);
    }
    projectile.sx = projectileData.x;
    projectile.sy = projectileData.y;
  });
});

socket.on('s:world:create', ({ width, height, trees, holes }) => {
  scene.world.width = width;
  scene.world.height = height;
  scene.world.trees = new Set(trees);
  scene.world.holes = new Set(holes);
  debugInfo.trees = trees.length;
  debugInfo.holes = holes.length;
});

loop(0);
