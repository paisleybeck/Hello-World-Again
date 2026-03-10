// ── Aurora background ──────────────────────────────────────────────
const aurora = document.getElementById('aurora');
const actx   = aurora.getContext('2d');

let W, H, t = 0;

function resizeAurora() {
    W = aurora.width  = window.innerWidth;
    H = aurora.height = window.innerHeight;
}
window.addEventListener('resize', resizeAurora);
resizeAurora();

const BLOBS = [
    { x: 0.2, y: 0.3, r: 0.55, h: 260, s: 0.55, speed: 0.0004 },
    { x: 0.6, y: 0.5, r: 0.65, h: 200, s: 0.45, speed: 0.0003 },
    { x: 0.8, y: 0.2, r: 0.45, h: 180, s: 0.35, speed: 0.0005 },
    { x: 0.4, y: 0.7, r: 0.50, h: 300, s: 0.40, speed: 0.00035 },
];

function hsl(h, s, l, a) {
    return `hsla(${h},${s}%,${l}%,${a})`;
}

function drawAurora() {
    actx.clearRect(0, 0, W, H);
    actx.fillStyle = '#000010';
    actx.fillRect(0, 0, W, H);

    BLOBS.forEach((b, i) => {
        const cx = (b.x + 0.12 * Math.sin(t * b.speed * 1000 + i)) * W;
        const cy = (b.y + 0.10 * Math.cos(t * b.speed * 800  + i)) * H;
        const r  = b.r * Math.max(W, H);
        const g  = actx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const hue = (b.h + t * 0.02 + i * 30) % 360;
        g.addColorStop(0,   hsl(hue, 80, 60, b.s));
        g.addColorStop(0.5, hsl((hue + 40) % 360, 70, 40, b.s * 0.4));
        g.addColorStop(1,   hsl(hue, 60, 20, 0));
        actx.globalCompositeOperation = 'screen';
        actx.fillStyle = g;
        actx.beginPath();
        actx.ellipse(cx, cy, r, r * 0.55, t * b.speed * 200, 0, Math.PI * 2);
        actx.fill();
    });

    t++;
    requestAnimationFrame(drawAurora);
}
drawAurora();


// ── Particle system (mouse-interactive) ───────────────────────────
const pc   = document.getElementById('particles');
const pctx = pc.getContext('2d');

let mouse = { x: W / 2, y: H / 2 };

function resizeParticles() {
    pc.width  = window.innerWidth;
    pc.height = window.innerHeight;
}
window.addEventListener('resize', resizeParticles);
resizeParticles();

window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
        this.x  = Math.random() * pc.width;
        this.y  = initial ? Math.random() * pc.height : pc.height + 10;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = -(Math.random() * 0.8 + 0.3);
        this.size   = Math.random() * 2.5 + 0.5;
        this.life   = 0;
        this.maxLife = Math.random() * 300 + 150;
        this.hue    = Math.random() * 80 + 200;
    }

    update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
            this.vx += (dx / dist) * 0.03;
            this.vy += (dy / dist) * 0.03;
        }

        this.vx *= 0.98;
        this.vy *= 0.98;
        this.x += this.vx;
        this.y += this.vy;
        this.life++;

        if (this.life > this.maxLife || this.y < -10) this.reset();
    }

    draw() {
        const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.8;
        pctx.beginPath();
        pctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        pctx.fillStyle = `hsla(${this.hue}, 90%, 75%, ${alpha})`;
        pctx.fill();
    }
}

const PARTICLE_COUNT = 180;
const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

function animateParticles() {
    pctx.clearRect(0, 0, pc.width, pc.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();


// ── Reveal text ────────────────────────────────────────────────────
window.addEventListener('load', () => {
    setTimeout(() => document.querySelector('h1').classList.add('visible'), 200);
    setTimeout(() => document.querySelector('.sub').classList.add('visible'), 400);
});
