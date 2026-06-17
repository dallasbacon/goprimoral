const canvas = document.getElementById("universe");
const ctx = canvas.getContext("2d");

let width;
let height;
let dpr;
let stars = [];
let galaxies = [];
let planets = [];
let meteors = [];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  createScene();
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function createScene() {
  const starCount = Math.floor((width * height) / 4200);

  stars = Array.from({ length: starCount }, () => ({
    baseX: rand(-width * 0.1, width * 1.1),
    baseY: rand(-height * 0.1, height * 1.1),
    r: rand(0.45, 1.75),
    glow: rand(0.25, 1),
    orbit: rand(8, Math.min(width, height) * 0.065),
    speed: rand(0.000025, 0.00012),
    phase: rand(0, Math.PI * 2),
    twinkle: rand(0.002, 0.01)
  }));

  galaxies = [
    { x: width * 0.16, y: height * 0.20, rx: width * 0.125, ry: height * 0.045, angle: -0.35, speed: 0.00007, size: 1.2 },
    { x: width * 0.78, y: height * 0.19, rx: width * 0.075, ry: height * 0.027, angle: -0.55, speed: -0.000055, size: 0.78 },
    { x: width * 0.79, y: height * 0.76, rx: width * 0.145, ry: height * 0.055, angle: -0.35, speed: 0.00005, size: 1.25 },
    { x: width * 0.14, y: height * 0.86, rx: width * 0.075, ry: height * 0.028, angle: 0.12, speed: -0.000065, size: 0.72 }
  ];

  planets = [
    { x: width * 0.10, y: height * 0.68, r: Math.max(34, width * 0.035), orbit: 22, phase: 1.2, speed: 0.000045 },
    { x: width * 0.90, y: height * 0.43, r: Math.max(38, width * 0.038), orbit: 18, phase: 0.4, speed: -0.00004 },
    { x: width * 0.52, y: height * 0.79, r: Math.max(10, width * 0.008), orbit: 12, phase: 3.3, speed: 0.00006 },
    { x: width * 0.39, y: height * 0.27, r: Math.max(12, width * 0.009), orbit: 10, phase: 2.1, speed: -0.00005 }
  ];

  meteors = Array.from({ length: 7 }, () => ({
    x: rand(0, width),
    y: rand(0, height),
    length: rand(50, 120),
    speed: rand(0.12, 0.32),
    delay: rand(0, 9000),
    opacity: rand(0.25, 0.7)
  }));
}

function drawBackground() {
  const gradient = ctx.createRadialGradient(width * 0.5, height * 0.45, 0, width * 0.5, height * 0.45, Math.max(width, height));
  gradient.addColorStop(0, "#090014");
  gradient.addColorStop(0.45, "#04030d");
  gradient.addColorStop(1, "#010105");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  nebula(width * 0.18, height * 0.25, width * 0.34, "rgba(117, 48, 190, 0.10)");
  nebula(width * 0.82, height * 0.66, width * 0.38, "rgba(143, 67, 224, 0.09)");
  nebula(width * 0.63, height * 0.18, width * 0.28, "rgba(88, 31, 154, 0.08)");
  ctx.restore();
}

function nebula(x, y, radius, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawStars(t) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const s of stars) {
    const x = s.baseX + Math.cos(t * s.speed + s.phase) * s.orbit;
    const y = s.baseY + Math.sin(t * s.speed + s.phase) * s.orbit * 0.55;
    const pulse = 0.52 + Math.sin(t * s.twinkle + s.phase) * 0.38;

    ctx.beginPath();
    ctx.fillStyle = `rgba(236, 221, 255, ${Math.max(0.15, s.glow * pulse)})`;
    ctx.shadowColor = "rgba(188, 128, 255, 0.9)";
    ctx.shadowBlur = s.r * 7;
    ctx.arc(x, y, s.r, 0, Math.PI * 2);
    ctx.fill();

    if (s.r > 1.35 && pulse > 0.7) {
      ctx.strokeStyle = `rgba(218, 190, 255, ${pulse * 0.45})`;
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(x - s.r * 4, y);
      ctx.lineTo(x + s.r * 4, y);
      ctx.moveTo(x, y - s.r * 4);
      ctx.lineTo(x, y + s.r * 4);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawGalaxy(galaxy, t) {
  const rotation = galaxy.angle + t * galaxy.speed;

  ctx.save();
  ctx.translate(galaxy.x, galaxy.y);
  ctx.rotate(rotation);
  ctx.globalCompositeOperation = "lighter";

  for (let arm = 0; arm < 2; arm++) {
    for (let i = 0; i < 230; i++) {
      const p = i / 230;
      const theta = p * Math.PI * 6 + arm * Math.PI + t * galaxy.speed * 10;
      const spread = rand(-0.5, 0.5);
      const x = Math.cos(theta + spread) * galaxy.rx * p;
      const y = Math.sin(theta + spread) * galaxy.ry * p;
      const alpha = (1 - p) * 0.15 + 0.02;

      ctx.fillStyle = `rgba(175, 98, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.45, 1.8 * galaxy.size * (1 - p)), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.rx * 0.38);
  core.addColorStop(0, "rgba(255,255,255,0.85)");
  core.addColorStop(0.28, "rgba(220,185,255,0.5)");
  core.addColorStop(1, "rgba(111,46,192,0)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.ellipse(0, 0, galaxy.rx * 0.38, galaxy.ry * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(153, 78, 238, 0.16)";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, galaxy.rx * (0.35 + i * 0.2), galaxy.ry * (0.42 + i * 0.17), 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawPlanet(p, t, hasRing = false) {
  const x = p.x + Math.cos(t * p.speed + p.phase) * p.orbit;
  const y = p.y + Math.sin(t * p.speed + p.phase) * p.orbit * 0.7;

  ctx.save();
  ctx.globalCompositeOperation = "source-over";

  if (hasRing) {
    ctx.strokeStyle = "rgba(151, 83, 227, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, p.r * 1.85, p.r * 0.42, -0.2, 0, Math.PI * 2);
    ctx.stroke();
  }

  const grad = ctx.createRadialGradient(x - p.r * 0.35, y - p.r * 0.4, 0, x, y, p.r * 1.2);
  grad.addColorStop(0, "rgba(213, 178, 255, 0.95)");
  grad.addColorStop(0.32, "rgba(104, 49, 169, 0.85)");
  grad.addColorStop(1, "rgba(4, 2, 15, 0.95)");

  ctx.shadowColor = "rgba(151, 83, 227, 0.65)";
  ctx.shadowBlur = p.r * 0.65;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, p.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawOrbitLines(t) {
  ctx.save();
  ctx.strokeStyle = "rgba(143, 82, 221, 0.14)";
  ctx.lineWidth = 1;
  for (const p of planets) {
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.orbit * 5 + p.r * 2.5, p.orbit * 2.2 + p.r, Math.sin(t * 0.00004 + p.phase) * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMeteors(t) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const m of meteors) {
    const active = ((t + m.delay) % 14000) / 14000;
    if (active < 0.18) {
      const progress = active / 0.18;
      const x = m.x + progress * width * 0.35;
      const y = m.y + progress * height * 0.22;
      const grad = ctx.createLinearGradient(x, y, x - m.length, y - m.length * 0.45);
      grad.addColorStop(0, `rgba(239, 222, 255, ${m.opacity})`);
      grad.addColorStop(1, "rgba(143, 82, 221, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - m.length, y - m.length * 0.45);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function animate(t) {
  drawBackground();
  drawOrbitLines(t);

  for (const galaxy of galaxies) {
    drawGalaxy(galaxy, prefersReducedMotion ? 0 : t);
  }

  planets.forEach((p, index) => drawPlanet(p, prefersReducedMotion ? 0 : t, index === 1));
  drawStars(prefersReducedMotion ? 0 : t);
  drawMeteors(prefersReducedMotion ? 0 : t);

  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
resize();
requestAnimationFrame(animate);
