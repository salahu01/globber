'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/**
 * All the imperative motion from the original main.js: loader, number rain,
 * cursor, magnets, hero feed, burn list, reel autoplay and the GSAP scenes.
 * Runs once after hydration; everything it starts is torn down on unmount.
 */
export default function Effects() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T;
    const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll(s)] as T[];
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const digit = () => (Math.random() * 10) | 0;

    const cleanups: (() => void)[] = [];
    const on = <K extends keyof WindowEventMap>(t: EventTarget, ev: K | string, fn: (e: any) => void, opts?: AddEventListenerOptions) => {
      t.addEventListener(ev, fn, opts);
      cleanups.push(() => t.removeEventListener(ev, fn, opts));
    };
    const every = (fn: () => void, ms: number) => { const id = setInterval(fn, ms); cleanups.push(() => clearInterval(id)); return id; };
    const later = (fn: () => void, ms: number) => { const id = setTimeout(fn, ms); cleanups.push(() => clearTimeout(id)); };
    let alive = true;
    const raf = (fn: () => void) => { const loop = () => { if (!alive) return; fn(); requestAnimationFrame(loop); }; loop(); };
    const ctx = gsap.context(() => {});

    /* ---------- Loader ---------- */
    const loader = $('#loader'), ldNum = $('#ldNum'), ldBar = $('#ldBar');
    let ldT = 0, loaderDone = false;
    const ldTick = every(() => {
      ldT = Math.min(100, ldT + rnd(4, 14));
      ldNum.textContent = `+1 800 555 ${digit()}${digit()}${digit()}${digit()}`;
      ldBar.style.width = ldT + '%';
    }, 70);
    const dropLoader = () => { loader.style.display = 'none'; };
    function hideLoader() {
      if (loaderDone) return;
      loaderDone = true;
      clearInterval(ldTick);
      ldBar.style.width = '100%';
      ldNum.textContent = '+1 800 555 ****';
      ldNum.style.color = '#C6FF00';
      if (RM) { dropLoader(); return intro(); }
      ctx.add(() => gsap.timeline()
        .to('.ld-star', { scale: 18, rotate: 240, duration: 1, ease: 'expo.in', delay: 0.25 })
        .to(loader, { autoAlpha: 0, duration: 0.3 }, '-=.2')
        .add(() => { dropLoader(); intro(); }, '-=.15'));
    }
    if (document.readyState === 'complete') later(hideLoader, 500);
    else on(window, 'load', () => later(hideLoader, 500));
    later(hideLoader, 4500);

    /* ---------- Number rain canvas ---------- */
    const cv = $<HTMLCanvasElement>('#rain'), cx = cv.getContext('2d')!;
    const monoFont = getComputedStyle(document.body).getPropertyValue('--m') || 'monospace';
    let W = 0, H = 0, cols: { x: number; y: number; v: number; s: number }[] = [];
    const mouse = { x: -999, y: -999 };
    const FS = 15;
    function size() {
      const dpr = Math.min(devicePixelRatio, 2);
      W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
      const n = Math.floor(innerWidth / 26);
      cols = Array.from({ length: n }, (_, i) => ({ x: (i + 0.5) * (W / n), y: rnd(-H, 0), v: rnd(0.6, 2.2) * dpr, s: dpr }));
    }
    size(); on(window, 'resize', size);
    on(window, 'pointermove', (e: PointerEvent) => { mouse.x = e.clientX * (W / innerWidth); mouse.y = e.clientY * (H / innerHeight); });
    let scrollY0 = 0;
    function rain() {
      cx.fillStyle = 'rgba(10,12,7,.18)';
      cx.fillRect(0, 0, W, H);
      for (const c of cols) {
        const fs = FS * c.s;
        cx.font = `${fs}px ${monoFont}`;
        const near = Math.hypot(c.x - mouse.x, c.y - mouse.y) < 160 * c.s;
        cx.fillStyle = near ? '#C6FF00' : Math.random() < 0.015 ? '#ff4d3d' : '#2b3420';
        cx.fillText(near ? '*' : String(digit()), c.x, c.y);
        c.y += c.v * fs * 0.12 + scrollY0 * 0.02;
        if (c.y > H + 20) { c.y = rnd(-200, 0); c.v = rnd(0.6, 2.2) * c.s; }
      }
      scrollY0 *= 0.9;
    }
    if (RM) rain(); else raf(rain);

    /* ---------- Cursor ---------- */
    const cur = $('#cursor');
    let cxp = innerWidth / 2, cyp = innerHeight / 2, tx = cxp, ty = cyp;
    on(window, 'pointermove', (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; });
    raf(() => { cxp += (tx - cxp) * 0.2; cyp += (ty - cyp) * 0.2; cur.style.transform = `translate(${cxp}px,${cyp}px)`; });
    // Delegated so React-rendered elements (Lab buttons) count too.
    const hoverSel = 'a,button,input,video';
    on(document, 'pointerover', (e: PointerEvent) => cur.classList.toggle('big', !!(e.target as Element).closest?.(hoverSel)));

    /* ---------- Magnetic buttons ---------- */
    $$('.magnet').forEach(el => {
      on(el, 'pointermove', (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px,${y * 0.35}px)`;
      });
      on(el, 'pointerleave', () => {
        el.style.transition = 'transform .5s cubic-bezier(.2,1.6,.4,1)'; el.style.transform = '';
        later(() => { el.style.transition = ''; }, 500);
      });
    });

    /* ---------- Nav ---------- */
    const nav = $('.nav');
    on(window, 'scroll', () => nav.classList.toggle('solid', scrollY > 40), { passive: true });

    /* ---------- Hero terminal feed ---------- */
    const htBody = $('#htBody');
    const feed: [string, string | null, string?][] = [
      ['+1 800 555 0142', 'starts_with +1800555', 'REJECT'],
      ['+44 20 7946 0958', null],
      ['+91 1900 190 000', 'starts_with 1900', 'REJECT'],
      ['+1 415 555 0000', 'ends_with 0000', 'SILENCE'],
      ['+91 98812 34567', null],
      ['withheld', 'block unknown', 'REJECT'],
      ['+44 7911 123456', 'regex ^\\+447\\d{9}$', 'VOICEMAIL'],
      ['+1 212 867 5309', null],
    ];
    let fi = 0;
    function feedLine() {
      const [num, rule, act] = feed[fi++ % feed.length];
      const t = new Date().toTimeString().slice(0, 8);
      const d = document.createElement('div');
      d.innerHTML = rule
        ? `<span class="ok">${t}</span> ${num} <span class="r">✱ ${rule}</span> <span class="b">→ ${act}</span>`
        : `<span class="ok">${t}</span> ${num} <span class="ok">→ allow</span>`;
      htBody.appendChild(d);
      while (htBody.children.length > 8) htBody.firstChild!.remove();
      if (!RM) gsap.from(d, { x: -20, opacity: 0, duration: 0.4 });
    }
    for (let i = 0; i < 4; i++) feedLine();
    every(feedLine, 1600);
    cleanups.push(() => { htBody.innerHTML = ''; });

    /* ---------- Burn list (problem) ---------- */
    const burn = $('#burnList'), cntExact = $('#cntExact');
    let bn = 101, exactCount = 0;
    function burnLine() {
      const d = document.createElement('div');
      const isRange = Math.random() < 0.75;
      const num = isRange
        ? `+1 800 555 ${String(bn++).padStart(4, '0')}`
        : `+1 ${digit()}${digit()}${digit()} ${digit()}${digit()}${digit()} ${digit()}${digit()}${digit()}${digit()}`;
      d.innerHTML = `<span>${num}</span><span>${isRange ? '✱ +1 800 555*' : 'allowed'}</span>`;
      if (isRange) { d.className = 'hit'; cntExact.textContent = String(++exactCount); }
      burn.appendChild(d);
      while (burn.children.length > 14) burn.firstChild!.remove();
    }
    for (let i = 0; i < 10; i++) burnLine();
    every(burnLine, 900);
    cleanups.push(() => { burn.innerHTML = ''; });

    /* ---------- Reel autoplay when visible ---------- */
    const reel = $<HTMLVideoElement>('#reel');
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { reel.preload = 'auto'; reel.play().catch(() => {}); } else reel.pause();
    }, { threshold: 0.35 });
    io.observe(reel);
    cleanups.push(() => io.disconnect());
    on(reel, 'click', () => { reel.muted = !reel.muted; });

    /* ---------- GSAP scenes ---------- */
    function intro() {
      if (RM) { $('#zeroNum').textContent = '0'; return; }
      ctx.add(() => {
        gsap.from('.hero-title .w', { yPercent: 110, rotate: 6, duration: 1.1, stagger: 0.07, ease: 'expo.out' });
        gsap.from('.star', { rotate: -360, scale: 0, duration: 1.6, ease: 'expo.out', delay: 0.3 });
        gsap.to('.star', { rotate: '+=360', duration: 12, repeat: -1, ease: 'none', delay: 1.9 });
        gsap.from('.hero-meta,.hero-sub,.hero-term,.hero-cta>*', { y: 40, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', delay: 0.4 });
        gsap.from('.nav', { y: -80, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.2 });
      });
    }

    const teardown = () => {
      alive = false;
      ctx.revert();
      cleanups.forEach(f => f());
    };

    if (RM) {
      $$('.strike').forEach(s => s.style.setProperty('--s', '1'));
      $('#zeroNum').textContent = '0';
      return teardown;
    }

    ctx.add(() => {
      // Lenis smooth scroll
      const lenis = new Lenis({ lerp: 0.09 });
      lenis.on('scroll', (e: Lenis) => { ScrollTrigger.update(); scrollY0 += e.velocity; });
      const lenisTick = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(lenisTick); gsap.ticker.lagSmoothing(0);
      cleanups.push(() => { gsap.ticker.remove(lenisTick); lenis.destroy(); });
      $$<HTMLAnchorElement>('a[href^="#"]').forEach(a => on(a, 'click', (e: MouseEvent) => {
        const t = $(a.getAttribute('href')!);
        if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -60, duration: 1.6 }); }
      }));

      // hero parallax out
      gsap.to('.hero-title', { yPercent: -30, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.outline', { letterSpacing: '.1em', ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

      // marquee driven by time + scroll velocity
      const mq = $('.mq-track'); let mqx = 0, mqv = 1;
      ScrollTrigger.create({ onUpdate: s => { mqv = 1 + Math.abs(s.getVelocity()) / 300; } });
      const mqTick = () => { mqx -= mqv; mqv += (1 - mqv) * 0.05; const w = mq.scrollWidth / 2; if (-mqx > w) mqx += w; mq.style.transform = `translateX(${mqx}px)`; };
      gsap.ticker.add(mqTick);
      cleanups.push(() => gsap.ticker.remove(mqTick));

      // split headings into chars (originals restored on teardown)
      $$('.big-split').forEach(h => {
        const original = h.innerHTML;
        cleanups.push(() => { h.innerHTML = original; });
        const walk = (node: Node) => {
          [...node.childNodes].forEach(c => {
            if (c.nodeType === 3) {
              const frag = document.createDocumentFragment();
              (c.textContent ?? '').split(/(\s+)/).forEach(word => {
                if (!word || /^\s+$/.test(word)) { frag.append(word); return; }
                const w = document.createElement('span'); w.style.display = 'inline-block'; w.style.whiteSpace = 'nowrap';
                [...word].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; w.append(s); });
                frag.append(w);
              });
              (c as ChildNode).replaceWith(frag);
            } else if (c.nodeType === 1 && (c as Element).tagName !== 'BR') walk(c);
          });
        };
        walk(h);
        gsap.from($$('.ch', h), { yPercent: 100, opacity: 0, rotateX: -80, stagger: 0.012, duration: 0.8, ease: 'back.out(1.6)', scrollTrigger: { trigger: h, start: 'top 85%' } });
      });
      $$('.strike').forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 70%', onEnter: () => s.style.setProperty('--s', '1') }));

      // generic reveals
      gsap.utils.toArray<HTMLElement>('.lead,.pg-copy,.lab-box,.fg,.steps li,.priv-grid div,.stack-row span').forEach(el =>
        gsap.from(el, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));

      // pipeline: draw live path + travelling packet + node highlight
      const live = $<SVGPathElement>('#pipeLive');
      const svg = $<SVGSVGElement>('.pipe-svg');
      if (live && getComputedStyle(svg).display !== 'none') {
        const L = live.getTotalLength();
        gsap.set(live, { strokeDasharray: L, strokeDashoffset: L });
        const packet = document.createElement('div'); packet.className = 'packet'; $('.pipe').append(packet);
        cleanups.push(() => packet.remove());
        const nodes = $$('.pn');
        const tl = gsap.timeline({ scrollTrigger: { trigger: '.pipe', start: 'top 70%', end: 'bottom 40%', scrub: 1 } });
        tl.to(live, { strokeDashoffset: 0, ease: 'none', onUpdate() {
          const prog = this.progress();
          const pt = live.getPointAtLength(prog * L), b = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
          packet.style.transform = `translate(${pt.x / vb.width * b.width - 9}px,${pt.y / vb.height * b.height - 9}px)`;
          nodes.forEach((n, i) => n.classList.toggle('on', prog >= i / 4 + 0.02));
        } });
      } else {
        $$('.pn').forEach(n => ScrollTrigger.create({ trigger: n, start: 'top 70%', onEnter: () => n.classList.add('on') }));
      }

      // horizontal rules scroller (desktop)
      const mm = gsap.matchMedia();
      mm.add('(min-width: 861px)', () => {
        const track = $('.rules-track');
        const dist = () => Math.max(0, track.offsetLeft + track.scrollWidth - innerWidth * 0.94);
        const tw = gsap.to(track, { x: () => -dist(), ease: 'none',
          scrollTrigger: { trigger: '.rules', pin: '.rules-pin', start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true } });
        $$('.rc').forEach(c => gsap.from(c, { rotate: 6, y: 80, opacity: 0.3, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tw, start: 'left 100%', end: 'left 60%', scrub: true } }));
      });
      cleanups.push(() => mm.revert());

      // phones: 3D fan-in + parallax + mouse tilt
      gsap.from('.phone', { y: 200, rotateY: i => (i - 1.5) * 30, rotateX: 30, opacity: 0, stagger: 0.12, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.phones', start: 'top 80%' } });
      $$('.phone').forEach(p => gsap.to(p, { y: -120 * Number(p.dataset.depth), ease: 'none', scrollTrigger: { trigger: '.phones', start: 'top bottom', end: 'bottom top', scrub: true } }));
      const phones = $('.phones');
      on(phones, 'pointermove', (e: PointerEvent) => {
        const r = phones.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        $$('.phone img', phones).forEach((img, i) => gsap.to(img, { rotateY: x * 24, rotateX: -y * 18, z: 30 * (i % 2 + 1), duration: 0.6 }));
      });
      on(phones, 'pointerleave', () => gsap.to('.phone img', { rotateY: 0, rotateX: 0, z: 0, duration: 0.8 }));

      // reel: clip-path iris open
      gsap.to('.reel-wrap', { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none', scrollTrigger: { trigger: '.reel', start: 'top 85%', end: 'center center', scrub: true } });

      // privacy: count 100 → 0
      const z = { v: 100 }, zeroNum = $('#zeroNum');
      gsap.to(z, { v: 0, ease: 'power3.out', scrollTrigger: { trigger: '.zero', start: 'top 85%', end: 'center 45%', scrub: 1 }, onUpdate: () => { zeroNum.textContent = String(Math.round(z.v)); } });
      gsap.from('.zero', { scale: 0.6, ease: 'none', scrollTrigger: { trigger: '.zero', start: 'top bottom', end: 'center center', scrub: true } });

      // timeline fill
      gsap.to('#tlFill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.tl', start: 'top 70%', end: 'bottom 60%', scrub: true } });
      $$('.tl-item').forEach(t => gsap.from(t, { x: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 85%' } }));

      // CTA glyph
      gsap.from('.cta-glyph', { rotate: -180, scale: 0.2, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'center center', scrub: true } });
      gsap.to('.cta-glyph', { y: -20, duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    });

    return teardown;
  }, []);

  return null;
}
