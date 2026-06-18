const canvas = document.getElementById("universe");
const ctx = canvas.getContext("2d");

let width, height, dpr;
let stars = [];
let galaxies = [];
let shootingStars = [];
let pointer = { x: 0, y: 0, tx: 0, ty: 0 };

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  buildScene();
}

function buildScene() {
  const area = width * height;
  const count = Math.min(520, Math.max(160, Math.floor(area / 3300)));

  stars = Array.from({ length: count }, (_, i) => {
    const layer = Math.random() < 0.58 ? 0.32 : Math.random() < 0.86 ? 0.65 : 1;
    return {
      x: rand(0, width),
      y: rand(0, height),
      r: rand(0.35, layer === 1 ? 1.55 : 1.1),
      layer,
      alpha: rand(0.24, 0.86),
      phase: rand(0, Math.PI * 2),
      drift: rand(0.000006, 0.000026)
    };
  });

  galaxies = [
    { x: width * 0.20, y: height * 0.22, radius: Math.min(width, height) * 0.19, tilt: -0.38, speed: 0.000018, arms: 2, density: 520, alpha: 0.55 },
    { x: width * 0.81, y: height * 0.73, radius: Math.min(width, height) * 0.23, tilt: -0.28, speed: -0.000014, arms: 2, density: 650, alpha: 0.48 },
    { x: width * 0.78, y: height * 0.23, radius: Math.min(width, height) * 0.10, tilt: 0.46, speed: 0.000020, arms: 2, density: 260, alpha: 0.34 }
  ];

  shootingStars = Array.from({ length: 5 }, () => ({
    x: rand(-width * 0.2, width * 0.9),
    y: rand(height * 0.02, height * 0.62),
    length: rand(90, 170),
    period: rand(11000, 19000),
    delay: rand(0, 19000),
    speedX: rand(width * 0.20, width * 0.38),
    speedY: rand(height * 0.10, height * 0.20),
    opacity: rand(0.24, 0.58)
  }));
}

function background() {
  const g = ctx.createRadialGradient(width * 0.5, height * 0.42, 0, width * 0.5, height * 0.48, Math.max(width, height) * 0.86);
  g.addColorStop(0, "#0b0317");
  g.addColorStop(0.45, "#04030c");
  g.addColorStop(1, "#010104");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  haze(width * 0.26 + pointer.x * 10, height * 0.28 + pointer.y * 8, width * 0.34, "rgba(117, 52, 203, 0.080)");
  haze(width * 0.77 + pointer.x * -12, height * 0.72 + pointer.y * -8, width * 0.39, "rgba(157, 88, 255, 0.070)");
  haze(width * 0.55, height * 0.52, width * 0.52, "rgba(82, 37, 149, 0.046)");
  ctx.restore();
}

function haze(x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawStars(t) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const s of stars) {
    const parallaxX = pointer.x * s.layer * 22;
    const parallaxY = pointer.y * s.layer * 16;
    const orbit = reducedMotion ? 0 : Math.sin(t * s.drift + s.phase) * 9 * s.layer;
    const twinkle = 0.68 + Math.sin(t * 0.0012 + s.phase) * 0.22;

    const x = (s.x + parallaxX + orbit + width) % width;
    const y = (s.y + parallaxY + orbit * 0.36 + height) % height;

    ctx.shadowColor = "rgba(177, 132, 255, 0.8)";
    ctx.shadowBlur = s.r * 6;
    ctx.fillStyle = `rgba(240, 229, 255, ${s.alpha * twinkle})`;
    ctx.beginPath();
    ctx.arc(x, y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawGalaxy(g, t) {
  const rotation = g.tilt + (reducedMotion ? 0 : t * g.speed);
  const px = pointer.x * -16;
  const py = pointer.y * -10;

  ctx.save();
  ctx.translate(g.x + px, g.y + py);
  ctx.rotate(rotation);
  ctx.scale(1, 0.42);
  ctx.globalCompositeOperation = "lighter";

  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, g.radius * 0.32);
  core.addColorStop(0, `rgba(255, 255, 255, ${0.44 * g.alpha})`);
  core.addColorStop(0.22, `rgba(224, 197, 255, ${0.40 * g.alpha})`);
  core.addColorStop(1, "rgba(120, 54, 209, 0)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, 0, g.radius * 0.42, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < g.density; i++) {
    const arm = i % g.arms;
    const p = i / g.density;
    const noise = Math.sin(i * 12.9898) * 43758.5453 % 1;
    const angle = p * Math.PI * 7.2 + arm * Math.PI + noise * 0.85;
    const radius = Math.pow(p, 0.72) * g.radius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const size = Math.max(0.35, (1.4 - p) * 1.2);
    const alpha = (1 - p) * 0.16 * g.alpha + 0.018;

    ctx.fillStyle = `rgba(178, 111, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = `rgba(170, 105, 255, ${0.08 * g.alpha})`;
  ctx.lineWidth = 1;
  for (let ring = 0.42; ring <= 1; ring += 0.18) {
    ctx.beginPath();
    ctx.arc(0, 0, g.radius * ring, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawShootingStars(t) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const s of shootingStars) {
    const cycle = ((t + s.delay) % s.period) / s.period;
    if (cycle > 0.12) continue;

    const p = cycle / 0.12;
    const eased = 1 - Math.pow(1 - p, 3);
    const x = s.x + eased * s.speedX;
    const y = s.y + eased * s.speedY;
    const opacity = Math.sin(p * Math.PI) * s.opacity;

    const gradient = ctx.createLinearGradient(x, y, x - s.length, y - s.length * 0.42);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    gradient.addColorStop(0.24, `rgba(197, 156, 255, ${opacity * 0.55})`);
    gradient.addColorStop(1, "rgba(119, 64, 220, 0)");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - s.length, y - s.length * 0.42);
    ctx.stroke();
  }

  ctx.restore();
}

function vignette() {
  const g = ctx.createRadialGradient(width * 0.5, height * 0.5, Math.min(width, height) * 0.2, width * 0.5, height * 0.5, Math.max(width, height) * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.68)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}

function animate(t) {
  pointer.x += (pointer.tx - pointer.x) * 0.035;
  pointer.y += (pointer.ty - pointer.y) * 0.035;

  background();
  galaxies.forEach(g => drawGalaxy(g, t));
  drawStars(t);
  drawShootingStars(t);
  vignette();

  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", event => {
  pointer.tx = (event.clientX / width - 0.5);
  pointer.ty = (event.clientY / height - 0.5);
});

resize();
requestAnimationFrame(animate);
