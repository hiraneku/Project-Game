const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const status = document.querySelector('#status');
const keys = new Set();
const background = new Image();
background.src = 'assets/backgrounds/background-aesthetic.png';

const world = { width: 2400, height: 540 };
const player = { x: 150, y: 300, width: 34, height: 34, vx: 0, vy: 0, face: 1, grounded: false, coyote: 0, jumpBuffer: 0, dashTime: 0, dashCooldown: 0 };
const platforms = [
  { x: 0, y: 430, width: 900, height: 110 }, { x: 980, y: 430, width: 620, height: 110 }, { x: 1680, y: 430, width: 720, height: 110 },
  { x: 220, y: 350, width: 150, height: 18 }, { x: 470, y: 285, width: 170, height: 18 }, { x: 760, y: 365, width: 120, height: 18 },
  { x: 1040, y: 335, width: 180, height: 18 }, { x: 1320, y: 270, width: 170, height: 18 }, { x: 1510, y: 365, width: 120, height: 18 },
  { x: 1780, y: 325, width: 190, height: 18 }, { x: 2080, y: 260, width: 180, height: 18 }
];
const stars = Array.from({ length: 55 }, (_, i) => ({ x: (i * 137) % world.width, y: 30 + (i * 53) % 230, r: i % 3 ? 1 : 2 }));
let running = false, cameraX = 0, cameraVelocity = 0, dashFlash = 0;

function press(key) { keys.add(key); }
function release(key) { keys.delete(key); }
addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight', ' ', 'Shift'].includes(e.key)) e.preventDefault(); if (e.key === 'Shift' && !e.repeat) running = !running; press(e.key); });
addEventListener('keyup', e => release(e.key));
document.querySelectorAll('[data-key]').forEach(button => {
  const key = button.dataset.key;
  button.addEventListener('pointerdown', e => { e.preventDefault(); button.setPointerCapture?.(e.pointerId); press(key); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => button.addEventListener(type, e => { e.preventDefault(); release(key); }));
});
const runButton = document.querySelector('#runButton');
runButton.addEventListener('pointerdown', e => { e.preventDefault(); running = !running; runButton.textContent = running ? '⚡ LARI' : '⚡ JALAN'; runButton.classList.toggle('active', running); });

function held(name) { return keys.has(name) || keys.has(name === 'left' ? 'ArrowLeft' : name === 'right' ? 'ArrowRight' : name); }
function update() {
  const dt = 1 / 45;
  player.coyote = player.grounded ? 0.12 : Math.max(0, player.coyote - dt);
  if (held('jump') || keys.has(' ') || keys.has('Spacebar')) player.jumpBuffer = 0.12; else player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);
  if (player.dashCooldown > 0) player.dashCooldown -= dt;
  dashFlash = Math.max(0, dashFlash - dt * 4);
  if (keys.has('dash') && player.dashTime <= 0 && player.dashCooldown <= 0) { player.dashTime = 0.38; player.dashCooldown = 0.75; player.vx = player.face * (running ? 15 : 12); player.vy = 0; dashFlash = 1; release('dash'); }
  if (player.dashTime > 0) { player.dashTime -= dt; player.x += player.vx; status.textContent = 'DASH · BLINK'; return; }
  const left = held('left') || keys.has('a') || keys.has('A'), right = held('right') || keys.has('d') || keys.has('D');
  const maxSpeed = running ? 5.8 : 3.2, accel = player.grounded ? 0.22 : 0.12;
  if (left) { player.vx += (-maxSpeed - player.vx) * accel; player.face = -1; }
  else if (right) { player.vx += (maxSpeed - player.vx) * accel; player.face = 1; }
  else player.vx *= player.grounded ? 0.78 : 0.94;
  if (Math.abs(player.vx) < 0.04) player.vx = 0;
  if (player.jumpBuffer > 0 && player.coyote > 0) { player.vy = -11.5; player.grounded = false; player.coyote = 0; player.jumpBuffer = 0; release(' '); release('jump'); }
  player.vy = Math.min(player.vy + 0.82, 18);
  const oldBottom = player.y + player.height;
  player.x = Math.max(0, Math.min(world.width - player.width, player.x + player.vx));
  player.y += player.vy; player.grounded = false;
  for (const platform of platforms) if (player.x + player.width > platform.x && player.x < platform.x + platform.width && oldBottom <= platform.y && player.y + player.height >= platform.y && player.vy >= 0) { player.y = platform.y - player.height; player.vy = 0; player.grounded = true; }
  if (player.y > 650) { player.x = 150; player.y = 300; player.vy = 0; }
  status.textContent = `${running ? 'RUN' : 'WALK'} · ${Math.round(Math.abs(player.vx) * 10) / 10} speed`;
}
function draw() {
  const target = Math.max(0, Math.min(world.width - canvas.width, player.x - canvas.width * 0.35 + player.vx * 22));
  cameraVelocity += (target - cameraX) * 0.018; cameraVelocity *= 0.82; cameraX += cameraVelocity;
  const cam = cameraX, now = performance.now();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (background.complete && background.naturalWidth > 0) { const offset = ((cam * 0.12) % canvas.width + canvas.width) % canvas.width; ctx.drawImage(background, -offset, 0, canvas.width, canvas.height); ctx.drawImage(background, canvas.width - offset, 0, canvas.width, canvas.height); } else { ctx.fillStyle = '#151522'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.fillStyle = '#d7cdea'; for (const star of stars) { const x = star.x - cam * 0.2; if (x > 0 && x < canvas.width) { ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.arc(x, star.y, star.r, 0, Math.PI * 2); ctx.fill(); } } ctx.globalAlpha = 1;
  for (const p of platforms) { ctx.fillStyle = '#252435'; ctx.fillRect(p.x - cam, p.y, p.width, p.height); ctx.fillStyle = '#9a86ad'; ctx.fillRect(p.x - cam, p.y, p.width, 5); }
  if (player.dashTime > 0) { ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = '#ffd83d'; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.arc(player.x - cam + player.width / 2 - player.vx * i * 0.02, player.y + player.height / 2, 16, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
  const visible = player.dashTime <= 0.08 || player.dashTime > 0.28; ctx.save(); ctx.globalAlpha = visible ? 1 : 0; const bob = player.grounded ? Math.sin(now / 140) * 1.5 : 0; ctx.translate(player.x - cam + 17, player.y + 17 + bob); const ball = ctx.createRadialGradient(-5, -6, 2, 0, 0, 18); ball.addColorStop(0, '#fff7a8'); ball.addColorStop(0.45, '#ffd83d'); ball.addColorStop(1, '#e69b16'); ctx.fillStyle = ball; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#60461a'; ctx.beginPath(); ctx.arc(-5, -3, 2, 0, Math.PI * 2); ctx.arc(5, -3, 2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  if (dashFlash > 0) { ctx.fillStyle = `rgba(255,247,196,${dashFlash * 0.25})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
}
let last = 0;
function loop(now) { if (now - last >= 22) { last = now; update(); draw(); } requestAnimationFrame(loop); }
requestAnimationFrame(loop);
