'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/* Numbers that stream into the hero tile. `hit` is the part the rule matches. */
const SPAM = ['223 3445', '887 7001', '555 0123', '410 9921', '302 1180', '776 4302'];
const REAL = ['+91 98470 12345', '+44 20 7946 0958', '+1 212 867 5309', '+91 80 4123 9000'];

/**
 * All imperative motion: smooth scroll, reveals, hero title, the filter stage,
 * the pinned "how it works" phone, magnets and the nav hide-on-scroll.
 */
export default function Effects() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('js');
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: (() => void)[] = [];
    let alive = true;
    const ctx = gsap.context(() => {});

    /* ---------- smooth scroll ---------- */
    let lenis: Lenis | null = null;
    if (!RM) {
      lenis = new Lenis({ lerp: 0.11 });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (t: number) => lenis!.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      cleanups.push(() => { gsap.ticker.remove(tick); lenis!.destroy(); });
      document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(a => {
        const go = (e: Event) => {
          const id = a.getAttribute('href')!;
          const el = id === '#top' ? document.body : document.querySelector(id);
          if (!el) return;
          e.preventDefault();
          lenis!.scrollTo(el as HTMLElement, { offset: -90 });
        };
        a.addEventListener('click', go);
        cleanups.push(() => a.removeEventListener('click', go));
      });
    }

    /* ---------- reveals ---------- */
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${(i % 4) * 70}ms`;
      io.observe(el);
    });
    cleanups.push(() => io.disconnect());

    ctx.add(() => {
      /* ---------- hero title ---------- */
      if (!RM) gsap.from('.hero-title .w', { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.15 });

      /* ---------- tile parallax tilt ---------- */
      const tile = document.getElementById('tile');
      const stage = document.querySelector<HTMLElement>('.stage');
      if (tile && stage && !RM) {
        gsap.from(tile, { scale: 0.6, rotate: -20, opacity: 0, duration: 1.4, ease: 'expo.out', delay: 0.3 });
        const qx = gsap.quickTo(tile, 'rotationY', { duration: 0.8, ease: 'power3' });
        const qy = gsap.quickTo(tile, 'rotationX', { duration: 0.8, ease: 'power3' });
        const move = (e: PointerEvent) => {
          const b = stage.getBoundingClientRect();
          qx(((e.clientX - b.left) / b.width - 0.5) * 22);
          qy(-((e.clientY - b.top) / b.height - 0.5) * 22);
        };
        window.addEventListener('pointermove', move);
        cleanups.push(() => window.removeEventListener('pointermove', move));
        gsap.to('.tile .star', { rotate: 360, duration: 40, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
      }

      /* ---------- how-it-works: swap the pinned phone per step ---------- */
      document.querySelectorAll<HTMLElement>('.step').forEach(step => {
        ScrollTrigger.create({
          trigger: step, start: 'top 55%', end: 'bottom 45%',
          onToggle: ({ isActive }) => {
            step.classList.toggle('on', isActive);
            if (!isActive) return;
            document.querySelectorAll<HTMLImageElement>('[data-shot]').forEach(img => img.classList.toggle('on', img.dataset.shot === step.dataset.img));
          },
        });
      });
      if (!RM) {
        gsap.to('.f1', { y: -40, ease: 'none', scrollTrigger: { trigger: '.how', start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.to('.f2', { y: 50, ease: 'none', scrollTrigger: { trigger: '.how', start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.utils.toArray<HTMLElement>('.gallery .phone').forEach((p, i) => {
          gsap.fromTo(p, { y: 60 + i * 20 }, { y: -40 - i * 10, ease: 'none', scrollTrigger: { trigger: '.gallery', start: 'top bottom', end: 'bottom top', scrub: true } });
        });
        gsap.from('.zero-n', { scale: 0.8, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.private', start: 'top 70%' } });
      }
    });

    /* ---------- the filter stage ---------- */
    const lanes = document.getElementById('lanes');
    const caughtEl = document.getElementById('caught');
    const tileEl = document.getElementById('tile');
    let caught = 0;
    const spawn = () => {
      if (!alive || !lanes || document.hidden) return;
      const W = lanes.clientWidth, H = lanes.clientHeight;
      const spam = Math.random() < 0.7;
      const el = document.createElement('span');
      el.className = 'lane';
      // Spam converges on the tile; real numbers pass well above or below it.
      const y = spam ? H * (0.2 + Math.random() * 0.6) : H * (Math.random() < 0.5 ? 0.08 + Math.random() * 0.12 : 0.86 + Math.random() * 0.08);
      if (spam) el.innerHTML = `<span class="hit">+91 140</span> ${SPAM[(Math.random() * SPAM.length) | 0]}`;
      else el.textContent = REAL[(Math.random() * REAL.length) | 0];
      lanes.appendChild(el);
      const w = el.offsetWidth;
      gsap.set(el, { x: W + 20, y, opacity: 0 });
      const cx = W / 2 - w / 2;
      if (spam) {
        gsap.timeline({ onComplete: () => el.remove() })
          .to(el, { opacity: 1, duration: 0.3 }, 0)
          .to(el, { x: cx + 40, y: H / 2 - 12, duration: 2.6, ease: 'power1.in' }, 0)
          .add(() => el.classList.add('caught'), 1.4)
          .to(el, { scale: 0.4, opacity: 0, filter: 'blur(6px)', duration: 0.35, ease: 'power2.in' }, 2.45)
          .add(() => {
            caught++;
            if (caughtEl) caughtEl.textContent = String(caught);
            tileEl?.classList.add('gulp');
            setTimeout(() => tileEl?.classList.remove('gulp'), 180);
          }, 2.7);
      } else {
        gsap.timeline({ onComplete: () => el.remove() })
          .to(el, { opacity: 1, duration: 0.3 }, 0)
          .add(() => el.classList.add('pass'), 0.2)
          .to(el, { x: -w - 20, duration: 4.2, ease: 'none' }, 0);
      }
    };
    if (!RM) {
      const id = setInterval(spawn, 700);
      cleanups.push(() => clearInterval(id));
      spawn();
    }

    /* ---------- magnets ---------- */
    if (matchMedia('(hover: hover)').matches && !RM) {
      document.querySelectorAll<HTMLElement>('.magnet').forEach(m => {
        const qx = gsap.quickTo(m, 'x', { duration: 0.5, ease: 'power3' });
        const qy = gsap.quickTo(m, 'y', { duration: 0.5, ease: 'power3' });
        const mv = (e: PointerEvent) => { const b = m.getBoundingClientRect(); qx((e.clientX - b.left - b.width / 2) * 0.25); qy((e.clientY - b.top - b.height / 2) * 0.35); };
        const out = () => { qx(0); qy(0); };
        m.addEventListener('pointermove', mv);
        m.addEventListener('pointerleave', out);
        cleanups.push(() => { m.removeEventListener('pointermove', mv); m.removeEventListener('pointerleave', out); });
      });
    }

    /* ---------- nav hides on scroll down ---------- */
    const nav = document.getElementById('nav');
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      nav?.classList.toggle('hide', y > 400 && y > last);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener('scroll', onScroll));

    return () => {
      alive = false;
      cleanups.forEach(f => f());
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return null;
}
