/**
 * Aditi Ingale Portfolio — Sakura Makeover Main Script
 * Canvas Petals · GSAP · Lenis · Vanilla TS
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// TYPES & GLOBALS
// ============================================================
declare global {
  interface Window {
    konamiTriggered?: boolean;
    idleTimeout?: number;
    isIdle?: boolean;
  }
}

const mouse = { x: -1000, y: -1000 };

// 🌸 Replace these URLs with your own images if needed
const IMAGES = {
  profile: "./profile.jpg",
  projects: {
    catCode: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop", 
    spectacles: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=800&auto=format&fit=crop", 
    donation: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=800&auto=format&fit=crop", 
    stockApp: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop",
    speechSign: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800&auto=format&fit=crop"
  }
};

// ============================================================
// LOADER
// ============================================================
function initLoader(): Promise<void> {
  return new Promise((resolve) => {
    const loader = document.getElementById('loader')!;
    const name = document.getElementById('loader-name')!;
    const wrap = document.getElementById('loader-petals')!;

    // Spawn swirl petals
    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.className = 'load-petal';
      p.style.animationDelay = `${i * 0.15}s`;
      wrap.appendChild(p);
    }

    setTimeout(() => {
      name.style.opacity = '1';
    }, 2000);

    setTimeout(() => {
      loader.classList.add('hidden');
      resolve();
    }, 4500);
  });
}

// ============================================================
// CURSOR & IDLE TRACKER
// ============================================================
function initCursor() {
  const flower = document.getElementById('cursor-flower')!;
  const container = document.getElementById('cursor-trail-container')!;
  
  // Track idle
  function resetIdle() {
    window.isIdle = false;
    clearTimeout(window.idleTimeout);
    window.idleTimeout = window.setTimeout(() => {
      window.isIdle = true;
    }, 5000);
  }

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    flower.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    resetIdle();

    // Spawn trail
    if (Math.random() > 0.7) {
      const trail = document.createElement('div');
      trail.className = 'trail-petal';
      trail.style.left = `${e.clientX + (Math.random() * 20 - 10)}px`;
      trail.style.top = `${e.clientY + (Math.random() * 20 - 10)}px`;
      container.appendChild(trail);
      setTimeout(() => trail.remove(), 800);
    }
  });

  document.addEventListener('keydown', resetIdle);
  document.addEventListener('scroll', resetIdle);
  resetIdle();
}

// ============================================================
// CANVAS FALLING PETALS
// ============================================================
function initPetalCanvas() {
  const canvas = document.getElementById('petals-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  let W = window.innerWidth;
  let H = window.innerHeight;
  canvas.width = W; canvas.height = H;

  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W; canvas.height = H;
  });

  const isMobile = W < 768;
  const petalCount = isMobile ? 20 : 60; // 30% on mobile

  interface Petal {
    x: number; y: number; s: number;
    op: number; rot: number; rotSpeed: number;
    vx: number; vy: number; sway: number; swayOffset: number;
  }
  const petals: Petal[] = [];

  // SVG Path for 5-petal sakura (scale it down natively in drawing)
  const p = new Path2D("M50,15 C40,0 20,10 25,30 C10,20 0,40 20,50 C0,60 10,80 25,70 C20,90 40,100 50,85 C60,100 80,90 75,70 C90,80 100,60 80,50 C100,40 90,20 75,30 C80,10 60,0 50,15 Z");

  for (let i = 0; i < petalCount; i++) {
    petals.push({
      x: Math.random() * W,
      y: Math.random() * H - H,
      s: Math.random() * 0.12 + 0.05, // Scale down 100x100 path to ~5-12px
      op: Math.random() * 0.6 + 0.3,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      vx: (Math.random() - 0.5) * 0.5,
      vy: Math.random() * 1 + 0.5,
      sway: Math.random() * 0.5 + 0.5,
      swayOffset: Math.random() * Math.PI * 2,
    });
  }

  let time = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    time += 0.01;

    const speedMult = window.isIdle ? 2.5 : 1;

    petals.forEach(pt => {
      // Repel from mouse
      const dx = mouse.x - pt.x;
      const dy = mouse.y - pt.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        pt.x -= (dx / dist) * 2;
        pt.y -= (dy / dist) * 2;
      }

      pt.x += pt.vx + Math.sin(time * pt.sway + pt.swayOffset) * 0.8;
      pt.y += pt.vy * speedMult;
      pt.rot += pt.rotSpeed * speedMult;

      if (pt.y > H + 50) {
        pt.y = -50;
        pt.x = Math.random() * W;
      }
      if (pt.x > W + 50) pt.x = -50;
      if (pt.x < -50) pt.x = W + 50;

      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.rot);
      ctx.scale(pt.s, pt.s);
      
      // Draw SVG path
      ctx.fillStyle = `rgba(255, 183, 197, ${pt.op})`;
      ctx.fill(p);
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ============================================================
// NAVIGATION & OVERLAY
// ============================================================
function initNav() {
  const toriiBtn = document.getElementById('torii-btn')!;
  const overlay = document.getElementById('torii-overlay')!;
  const closeBtn = document.getElementById('torii-close')!;
  const menuLinks = document.querySelectorAll('.menu-petal');

  toriiBtn.addEventListener('click', () => overlay.classList.add('open'));
  closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
  menuLinks.forEach(l => l.addEventListener('click', () => overlay.classList.remove('open')));

  // Right Dot Nav
  const dots = document.querySelectorAll('.dot');
  const sections = document.querySelectorAll('.section');
  
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        dots.forEach(d => {
          if (d.getAttribute('data-section') === id) d.classList.add('active');
          else d.classList.remove('active');
        });
      }
    });
  }, { threshold: 0.3 });
  
  sections.forEach(s => obs.observe(s));
}

// ============================================================
// SCROLL SAKURA BRANCH (Left Side) & PARALLAX BACKGROUND
// ============================================================
function initScrollBranch() {
  const container = document.getElementById('scroll-blossoms')!;
  const path = document.getElementById('scroll-branch-path') as unknown as SVGPathElement;
  
  // Parallax elements
  const tFar = document.getElementById('town-far')!;
  const tMid = document.getElementById('town-mid')!;
  const tNear = document.getElementById('town-near')!;
  
  const len = path ? path.getTotalLength() : 0;
  
  // Create 15 blossoms along path
  const blossoms: HTMLElement[] = [];
  if (path) {
    for (let i = 0; i < 15; i++) {
      const pt = path.getPointAtLength((i / 15) * len);
      const flower = document.createElement('div');
      flower.className = 'scroll-flower';
      flower.textContent = '🌸';
      flower.style.left = `${pt.x - 7}px`;
      flower.style.top = `${pt.y - 7}px`;
      container.appendChild(flower);
      blossoms.push(flower);
    }
  }

  window.addEventListener('scroll', () => {
    const s = window.scrollY;
    
    // Parallax logic
    if (tFar) tFar.style.transform = `translateY(${s * 0.05}px)`;
    if (tMid) tMid.style.transform = `translateY(${s * 0.15}px)`;
    if (tNear) tNear.style.transform = `translateY(${s * 0.3}px)`;

    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.min(Math.max(s / scrollMax, 0), 1);
    
    // Bloom based on scroll %
    blossoms.forEach((fl, idx) => {
      const threshold = idx / 15;
      if (pct > threshold) fl.classList.add('bloomed');
      else fl.classList.remove('bloomed');
    });

    // Background moon rising
    const moon = document.getElementById('bg-moon')!;
    if (pct > 0.5) {
      moon.style.transform = `translateX(-50%) translateY(-${(pct - 0.5) * 60}vh)`;
      moon.style.opacity = String(Math.min((pct - 0.5) * 2, 0.8));
    } else {
      moon.style.opacity = '0';
    }
  });
}

// ============================================================
// WANDERING CATS
// ============================================================
function initCats() {
  const container = document.getElementById('cats-container')!;
  if (!container) return;

  const isMobile = window.innerWidth < 768;
  const numCats = isMobile ? 1 : 3;
  const catTypes = ['cat-white', 'cat-orange', 'cat-black'];

  class Cat {
    el: HTMLElement;
    x: number;
    speed: number;
    dir: number; // 1 = right, -1 = left
    state: 'walk' | 'idle' | 'startled';
    type: string;
    
    constructor(type: string, startX: number) {
      this.type = type;
      this.el = document.createElement('div');
      this.el.className = `wandering-cat ${type} cat-walk cat-facing-right`;
      this.x = startX;
      this.speed = Math.random() * 0.5 + 0.3;
      this.dir = 1;
      this.state = 'walk';
      
      container.appendChild(this.el);
      this.updatePos();
      this.loop();
    }

    updatePos() {
      this.el.style.left = `${this.x}px`;
    }

    setDir(d: number) {
      this.dir = d;
      this.el.classList.remove('cat-facing-right', 'cat-facing-left');
      this.el.classList.add(d === 1 ? 'cat-facing-right' : 'cat-facing-left');
    }

    setState(s: 'walk' | 'idle' | 'startled') {
      this.state = s;
      if (s === 'walk') {
        this.el.classList.add('cat-walk');
        this.el.classList.remove('cat-tilt', 'cat-jump');
      } else if (s === 'idle') {
        this.el.classList.remove('cat-walk', 'cat-jump');
      } else if (s === 'startled') {
        this.el.classList.remove('cat-walk', 'cat-tilt');
        this.el.classList.add('cat-jump');
        setTimeout(() => this.el.classList.remove('cat-jump'), 500);
      }
    }

    loop() {
      if (this.state === 'walk') {
        this.x += this.speed * this.dir;
        
        // Edge bouncing
        if (this.x > window.innerWidth - 50) this.setDir(-1);
        if (this.x < 10) this.setDir(1);
        
        // Random idle
        if (Math.random() < 0.002) {
          this.setState('idle');
          setTimeout(() => {
            if (this.state !== 'startled') this.setState('walk');
          }, Math.random() * 3000 + 1000);
        }
      }

      // Cursor Interaction (desktop only)
      if (!isMobile && this.state !== 'startled') {
        const catRect = this.el.getBoundingClientRect();
        // roughly the center of the cat
        const catCX = catRect.left + catRect.width / 2;
        const catCY = catRect.top + catRect.height / 2;
        
        const dx = mouse.x - catCX;
        const dy = mouse.y - catCY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 40) {
          // Jump and run!
          this.setState('startled');
          this.setDir(dx > 0 ? -1 : 1); // run away from cursor
          this.speed = 2.5; // sprint
          setTimeout(() => {
            this.speed = Math.random() * 0.5 + 0.3; // back to normal
            this.setState('idle'); // stop and groom
            setTimeout(() => this.setState('walk'), 2000);
          }, 1500);
        } else if (dist < 100 && this.state !== 'idle') {
          // Look at cursor curiously
          this.setState('idle');
          this.setDir(dx > 0 ? 1 : -1); // face cursor
          this.el.classList.add('cat-tilt');
          setTimeout(() => {
            if (this.state === 'idle') {
              this.el.classList.remove('cat-tilt');
              this.setState('walk');
            }
          }, 1500);
        }
      }

      this.updatePos();
      requestAnimationFrame(() => this.loop());
    }
  }

  // Init cats
  for (let i = 0; i < numCats; i++) {
    new Cat(catTypes[i], Math.random() * window.innerWidth);
  }
}

// ============================================================
// SVG INK HEADINGS & SECTION DIVIDERS
// ============================================================
function initInkDraws() {
  const inkWraps = document.querySelectorAll('.ink-heading-wrap');
  const lineObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        lineObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  inkWraps.forEach(w => lineObs.observe(w));

  const dividers = document.querySelectorAll('.branch-line');
  const divObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('drawn');
        divObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  dividers.forEach(d => divObs.observe(d));
}

// ============================================================
// EXPERIENCE LANTERNS
// ============================================================
function initLanterns() {
  const lanterns = document.querySelectorAll('.lantern');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // slight delay based on row
        setTimeout(() => {
          entry.target.classList.add('bloomed');
        }, 300);
      }
    });
  }, { threshold: 0.5, rootMargin: '0px 0px -100px 0px' });
  lanterns.forEach(l => obs.observe(l));
}

// ============================================================
// SKILLS BONSAI TOOLTIPS
// ============================================================
function initBonsaiTooltips() {
  const tooltip = document.getElementById('skill-tooltip')!;
  const nodes = document.querySelectorAll('.flower-node');
  
  nodes.forEach(node => {
    node.addEventListener('mouseenter', () => {
      tooltip.textContent = (node as HTMLElement).dataset.tip || '';
      tooltip.classList.add('visible');
    });
    node.addEventListener('mousemove', (e: Event) => {
      const mouseEvent = e as MouseEvent;
      tooltip.style.left = (mouseEvent.clientX + 15) + 'px';
      tooltip.style.top = (mouseEvent.clientY - 25) + 'px';
    });
    node.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
    // Randomize initial tilt
    (node as HTMLElement).style.rotate = `${Math.random() * 360}deg`;
  });
}

// ============================================================
// DYNAMIC IMAGE LOADING
// ============================================================
function initImages() {
  const imageEls = document.querySelectorAll<HTMLElement>('[data-image-key]');
  
  // Quick path lookup helper
  const resolvePath = (key: string): string => {
    return key.split('.').reduce((obj: any, prop: string) => obj?.[prop], IMAGES) || '';
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target as HTMLElement;
        const key = el.getAttribute('data-image-key')!;
        const src = resolvePath(key);

        if (src) {
          const img = new Image();
          img.src = src;
          // When loaded, apply to the element (we use background-image for easier styling fits, or append an img element)
          img.onload = () => {
            el.classList.remove('placeholder-skeleton');
            // If it's an img tag
            if (el.tagName.toLowerCase() === 'img') {
              (el as HTMLImageElement).src = src;
            } else {
              // Create div for the image to support mix-blend-mode and fading gracefully
              const imgDiv = document.createElement('div');
              imgDiv.className = 'loaded-image';
              imgDiv.style.backgroundImage = `url(${src})`;
              el.appendChild(imgDiv);
            }
          };
          img.onerror = () => {
             // Fallback: don't show a broken image, just leave skeleton or generic error style
             el.classList.remove('placeholder-skeleton');
             el.classList.add('image-fallback');
             el.innerHTML = '<span class="fallback-icon">🌸</span>';
          };
        }
        observer.unobserve(el);
      }
    });
  }, { rootMargin: '200px' });

  imageEls.forEach(el => observer.observe(el));
}

// ============================================================
// MINOR COMPONENTS (Typewriter, Reveals, etc)
// ============================================================
function initMinorPieces() {
  // Lenis Smooth Scroll
  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
  function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);

  // Typewriter
  const phrases = ['Software Engineer', 'Cloud Architect', 'Web Dreamer'];
  const el = document.getElementById('typewriter-text')!;
  let pi = 0, ci = 0, deleting = false;
  function type() {
    const current = phrases[pi];
    if (!deleting) {
      el.textContent = current.slice(0, ci + 1);
      ci++;
      if (ci >= current.length) { deleting = true; setTimeout(type, 2000); return; }
    } else {
      el.textContent = current.slice(0, ci - 1);
      ci--;
      if (ci <= 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(type, deleting ? 50 : 80);
  }
  type();

  // Scroll reveals
  const revealEls = document.querySelectorAll('.fade-up, .reveal-up, .reveal-text, .reveal-left, .reveal-right, .reveal-glow');
  const rObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target as HTMLElement;
        const delay = parseFloat(el.dataset.delay || '0');
        setTimeout(() => el.classList.add('visible'), delay * 1000 + 100);
        rObs.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  revealEls.forEach(r => rObs.observe(r));

  // Form mock
  document.getElementById('contact-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = (e.target as HTMLFormElement).querySelector('button')!;
    btn.textContent = 'Wish Sent ✨';
    setTimeout(() => { btn.textContent = 'Send a Wish 🌟'; }, 3000);
  });
}

// ============================================================
// EASTER EGGS (Shooting Star & Konami)
// ============================================================
function initEasterEggs() {
  // 1. Shooting Star
  const moon = document.getElementById('hero-center-moon')!;
  const starCanvas = document.getElementById('star-canvas') as HTMLCanvasElement;
  const ctx = starCanvas.getContext('2d')!;
  let moonClicks = 0;
  
  window.addEventListener('resize', () => {
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
  });
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;

  function runShootingStar() {
    let t = 0;
    function drawStar() {
      ctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
      t += 0.05;
      const x = starCanvas.width - (t * 800);
      const y = t * 600;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI*2);
      ctx.fillStyle = '#FFF';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#FFB7C5';
      ctx.fill();

      // tail
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 100, y - 80);
      ctx.strokeStyle = 'rgba(255,183,197,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (x > -100) requestAnimationFrame(drawStar);
      else ctx.clearRect(0,0,starCanvas.width, starCanvas.height);
    }
    drawStar();
  }

  moon.addEventListener('click', () => {
    moonClicks++;
    if (moonClicks === 3) {
      runShootingStar();
      moonClicks = 0;
    }
  });

  // 2. Konami Confetti
  const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;
  document.addEventListener('keydown', (e) => {
    if (e.key === code[idx]) {
      idx++;
      if (idx === code.length) {
        triggerKonami();
        idx = 0;
      }
    } else idx = 0;
  });

  function triggerKonami() {
    if (window.konamiTriggered) return;
    window.konamiTriggered = true;
    const overlay = document.getElementById('konami-overlay')!;
    overlay.classList.add('active');
    
    const conf = document.getElementById('confetti-canvas') as HTMLCanvasElement;
    conf.width = window.innerWidth; conf.height = window.innerHeight;
    const cctx = conf.getContext('2d')!;
    
    interface Confetti { x: number; y: number; w: number; h: number; color: string; vy: number; vx: number; rot: number; }
    const pieces: Confetti[] = [];
    const colors = ['#FFB7C5', '#FFF0F5', '#FF6B9D', '#A8E6CF', '#C9A0DC'];
    for(let i=0; i<150; i++) pieces.push({
      x: Math.random() * conf.width, y: -Math.random()*conf.height,
      w: Math.random()*10+5, h: Math.random()*15+5, color: colors[i%colors.length],
      vy: Math.random()*5+2, vx: Math.random()*2-1, rot: Math.random()*360
    });
    
    let running = true;
    function draw() {
      if(!running) return;
      cctx.clearRect(0,0,conf.width, conf.height);
      pieces.forEach(p => {
        p.y += p.vy; p.x += p.vx; p.rot += 5;
        cctx.save();
        cctx.translate(p.x, p.y); cctx.rotate(p.rot * Math.PI/180);
        cctx.fillStyle = p.color; cctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        cctx.restore();
      });
      requestAnimationFrame(draw);
    }
    draw();
    setTimeout(() => {
      overlay.classList.remove('active');
      running = false; cctx.clearRect(0,0,conf.width,conf.height);
      window.konamiTriggered = false;
    }, 5000);
  }
}

// ============================================================
// MAIN BOOTSTRAP
// ============================================================
async function main() {
  await initLoader();
  initCursor();
  initPetalCanvas();
  initNav();
  initScrollBranch();
  initCats();
  initInkDraws();
  initLanterns();
  initBonsaiTooltips();
  initImages();
  initMinorPieces();
  initEasterEggs();
}

main();
