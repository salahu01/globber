(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const digit = () => (Math.random() * 10) | 0;

  /* ---------- Port of RuleMatcher.kt ---------- */
  const NSN_LEN = 10;
  const normalize = s => { const t = s.trim(); const d = t.replace(/\D/g, ''); return t.startsWith('+') ? '+' + d : d; };
  const national = s => {
    let d = s.replace(/\D/g, '');
    if (d.length > NSN_LEN) { d = d.replace(/^0+/, ''); if (d.length > NSN_LEN) d = d.slice(-NSN_LEN); }
    return d;
  };
  function matches(number, type, pattern) {
    const n = normalize(number);
    if (type === 'REGEX') { try { return { hit: new RegExp(pattern).test(n), via: 'regex on E.164' }; } catch { return { hit: false, via: 'invalid regex → never matches' }; } }
    const p = normalize(pattern), nn = national(number), pn = national(pattern);
    const op = { EXACT: (a, b) => a === b, STARTS_WITH: (a, b) => a.startsWith(b), CONTAINS: (a, b) => a.includes(b), ENDS_WITH: (a, b) => a.endsWith(b) }[type];
    if (p && op(n, p)) return { hit: true, via: 'E.164 form matched' };
    if (pn && op(nn, pn)) return { hit: true, via: 'national form matched' };
    return { hit: false, via: 'neither form matched' };
  }

  /* ---------- Loader ---------- */
  const loader = $('#loader');
  const ldNum = $('#ldNum'), ldBar = $('#ldBar');
  let ldT = 0;
  const ldTick = setInterval(() => {
    ldT = Math.min(100, ldT + rnd(4, 14));
    ldNum.textContent = `+1 800 555 ${digit()}${digit()}${digit()}${digit()}`;
    ldBar.style.width = ldT + '%';
  }, 70);
  function hideLoader() {
    clearInterval(ldTick);
    ldBar.style.width = '100%';
    ldNum.textContent = '+1 800 555 ****';
    ldNum.style.color = '#C6FF00';
    if (!window.gsap || RM) { loader.remove(); return intro(); }
    gsap.timeline()
      .to('.ld-star', { scale: 18, rotate: 240, duration: 1, ease: 'expo.in', delay: .25 })
      .to(loader, { autoAlpha: 0, duration: .3 }, '-=.2')
      .add(() => { loader.remove(); intro(); }, '-=.15');
  }
  addEventListener('load', () => setTimeout(hideLoader, 500));
  setTimeout(() => document.body.contains(loader) && hideLoader(), 4500);

  /* ---------- Number rain canvas ---------- */
  const cv = $('#rain'), cx = cv.getContext('2d');
  let W, H, cols = [], mouse = { x: -999, y: -999 };
  const FS = 15;
  function size() {
    const dpr = Math.min(devicePixelRatio, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    cx.scale(1, 1);
    const n = Math.floor(innerWidth / 26);
    cols = Array.from({ length: n }, (_, i) => ({ x: (i + .5) * (W / n), y: rnd(-H, 0), v: rnd(.6, 2.2) * dpr, s: dpr }));
  }
  size(); addEventListener('resize', size);
  addEventListener('pointermove', e => { mouse.x = e.clientX * (W / innerWidth); mouse.y = e.clientY * (H / innerHeight); });
  let scrollY0 = 0;
  function rain() {
    cx.fillStyle = 'rgba(10,12,7,.18)';
    cx.fillRect(0, 0, W, H);
    for (const c of cols) {
      const fs = FS * c.s;
      cx.font = `${fs}px JetBrains Mono, monospace`;
      const d = Math.hypot(c.x - mouse.x, c.y - mouse.y);
      const near = d < 160 * c.s;
      cx.fillStyle = near ? '#C6FF00' : (Math.random() < .015 ? '#ff4d3d' : '#2b3420');
      cx.fillText(near ? '*' : digit(), c.x, c.y);
      c.y += c.v * fs * .12 + scrollY0 * .02;
      if (c.y > H + 20) { c.y = rnd(-200, 0); c.v = rnd(.6, 2.2) * c.s; }
    }
    scrollY0 *= .9;
    if (!RM) requestAnimationFrame(rain);
  }
  rain();

  /* ---------- Cursor ---------- */
  const cur = $('#cursor');
  let cxp = innerWidth / 2, cyp = innerHeight / 2, tx = cxp, ty = cyp;
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
  (function loop() { cxp += (tx - cxp) * .2; cyp += (ty - cyp) * .2; cur.style.transform = `translate(${cxp}px,${cyp}px)`; requestAnimationFrame(loop); })();
  $$('a,button,input,video').forEach(el => {
    el.addEventListener('pointerenter', () => cur.classList.add('big'));
    el.addEventListener('pointerleave', () => cur.classList.remove('big'));
  });

  /* ---------- Magnetic buttons ---------- */
  $$('.magnet').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * .25}px,${y * .35}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transition = 'transform .5s cubic-bezier(.2,1.6,.4,1)'; el.style.transform = ''; setTimeout(() => el.style.transition = '', 500); });
  });

  /* ---------- Nav ---------- */
  const nav = $('.nav');
  addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 40), { passive: true });

  /* ---------- Hero terminal feed ---------- */
  const htBody = $('#htBody');
  const feed = [
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
    while (htBody.children.length > 8) htBody.firstChild.remove();
    if (window.gsap && !RM) gsap.from(d, { x: -20, opacity: 0, duration: .4 });
  }
  for (let i = 0; i < 4; i++) feedLine();
  setInterval(feedLine, 1600);

  /* ---------- Burn list (problem) ---------- */
  const burn = $('#burnList'), cntExact = $('#cntExact');
  let bn = 101, exactCount = 0;
  function burnLine() {
    const d = document.createElement('div');
    const isRange = Math.random() < .75;
    const num = isRange ? `+1 800 555 ${String(bn++).padStart(4, '0')}` : `+1 ${digit()}${digit()}${digit()} ${digit()}${digit()}${digit()} ${digit()}${digit()}${digit()}${digit()}`;
    d.innerHTML = `<span>${num}</span><span>${isRange ? '✱ +1 800 555*' : 'allowed'}</span>`;
    if (isRange) { d.className = 'hit'; exactCount++; cntExact.textContent = exactCount; }
    burn.appendChild(d);
    while (burn.children.length > 14) burn.firstChild.remove();
  }
  for (let i = 0; i < 10; i++) burnLine();
  setInterval(burnLine, 900);

  /* ---------- Lab ---------- */
  let labType = 'STARTS_WITH';
  const pat = $('#labPat'), num = $('#labNum'), verdict = $('#verdict');
  function runLab() {
    const r = matches(num.value, labType, pat.value);
    const n = normalize(num.value), nn = national(num.value), p = normalize(pat.value), pn = national(pat.value);
    const set = (id, v, m) => { const el = $(id); el.textContent = v || '∅'; el.classList.toggle('m', !!m); };
    const isReg = labType === 'REGEX';
    set('#fN', n, r.hit && (isReg || r.via.startsWith('E'))); set('#fNN', isReg ? '(unused)' : nn, r.hit && r.via.startsWith('n'));
    set('#fP', isReg ? pat.value : p, r.hit && (isReg || r.via.startsWith('E'))); set('#fPN', isReg ? '(unused)' : pn, r.hit && r.via.startsWith('n'));
    verdict.classList.toggle('pass', !r.hit);
    $('#vTxt').textContent = r.hit ? 'BLOCKED' : 'RINGS THROUGH';
    $('#vIco').textContent = r.hit ? '✱' : '☎';
    $('#vWhy').textContent = r.via;
    verdict.classList.remove('anim'); void verdict.offsetWidth; verdict.classList.add('anim');
    if (window.gsap && !RM && r.hit) gsap.fromTo(verdict, { x: -6 }, { x: 0, duration: .4, ease: 'elastic.out(1,.3)' });
  }
  $$('#labType button').forEach(b => b.onclick = () => { $$('#labType button').forEach(x => x.classList.remove('on')); b.classList.add('on'); labType = b.dataset.t; runLab(); });
  pat.oninput = num.oninput = runLab;
  $$('.lab-presets button').forEach(b => b.onclick = () => {
    const [t, p, n] = b.dataset.p.split('|');
    $$('#labType button').forEach(x => x.classList.toggle('on', x.dataset.t === t)); labType = t;
    pat.value = p; num.value = n; runLab();
  });
  runLab();

  /* ---------- Reel autoplay when visible ---------- */
  const reel = $('#reel');
  new IntersectionObserver(([e]) => { if (e.isIntersecting) { reel.preload = 'auto'; reel.play().catch(() => {}); } else reel.pause(); }, { threshold: .35 }).observe(reel);
  reel.addEventListener('click', () => { reel.muted = !reel.muted; });

  /* ---------- GSAP scenes ---------- */
  function intro() {
    if (!window.gsap || RM) { $('#zeroNum').textContent = '0'; return; }
    gsap.from('.hero-title .w', { yPercent: 110, rotate: 6, duration: 1.1, stagger: .07, ease: 'expo.out' });
    gsap.from('.star', { rotate: -360, scale: 0, duration: 1.6, ease: 'expo.out', delay: .3 });
    gsap.to('.star', { rotate: '+=360', duration: 12, repeat: -1, ease: 'none', delay: 1.9 });
    gsap.from('.hero-meta,.hero-sub,.hero-term,.hero-cta>*', { y: 40, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out', delay: .4 });
    gsap.from('.nav', { y: -80, opacity: 0, duration: 1, ease: 'expo.out', delay: .2 });
  }

  if (!window.gsap || RM) { $$('.strike').forEach(s => s.style.setProperty('--s', 1)); $('#zeroNum').textContent = '0'; return; }
  gsap.registerPlugin(ScrollTrigger);

  // Lenis smooth scroll
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: .09 });
    lenis.on('scroll', e => { ScrollTrigger.update(); scrollY0 += e.velocity; });
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -60, duration: 1.6 }); } }));
  }

  // hero parallax out
  gsap.to('.hero-title', { yPercent: -30, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.outline', { letterSpacing: '.1em', ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // marquee driven by time + scroll velocity
  const mq = $('.mq-track'); let mqx = 0, mqv = 1;
  ScrollTrigger.create({ onUpdate: s => { mqv = 1 + Math.abs(s.getVelocity()) / 300; } });
  gsap.ticker.add(() => { mqx -= mqv; mqv += (1 - mqv) * .05; const w = mq.scrollWidth / 2; if (-mqx > w) mqx += w; mq.style.transform = `translateX(${mqx}px)`; });

  // split headings into chars
  $$('.big-split').forEach(h => {
    const walk = node => {
      [...node.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(word => {
            if (/^\s+$/.test(word) || !word) { frag.append(word); return; }
            const w = document.createElement('span'); w.style.display = 'inline-block'; w.style.whiteSpace = 'nowrap';
            [...word].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; w.append(s); });
            frag.append(w);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    };
    walk(h);
    gsap.from($$('.ch', h), { yPercent: 100, opacity: 0, rotateX: -80, stagger: .012, duration: .8, ease: 'back.out(1.6)', scrollTrigger: { trigger: h, start: 'top 85%' } });
  });
  $$('.strike').forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 70%', onEnter: () => s.style.setProperty('--s', 1) }));

  // generic reveals
  gsap.utils.toArray('.lead,.pg-copy,.lab-box,.fg,.steps li,.priv-grid div,.stack-row span').forEach(el =>
    gsap.from(el, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));

  // pipeline: draw live path + travelling packet + node highlight
  const live = $('#pipeLive');
  if (live && getComputedStyle($('.pipe-svg')).display !== 'none') {
    const L = live.getTotalLength();
    gsap.set(live, { strokeDasharray: L, strokeDashoffset: L });
    const packet = document.createElement('div'); packet.className = 'packet'; $('.pipe').append(packet);
    const svg = $('.pipe-svg'), nodes = $$('.pn');
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.pipe', start: 'top 70%', end: 'bottom 40%', scrub: 1 } });
    tl.to(live, { strokeDashoffset: 0, ease: 'none', onUpdate() {
      const prog = this.progress();
      const pt = live.getPointAtLength(prog * L), b = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
      packet.style.transform = `translate(${pt.x / vb.width * b.width - 9}px,${pt.y / vb.height * b.height - 9}px)`;
      nodes.forEach((n, i) => n.classList.toggle('on', prog >= i / 4 + .02));
    } });
  } else {
    $$('.pn').forEach(n => ScrollTrigger.create({ trigger: n, start: 'top 70%', onEnter: () => n.classList.add('on') }));
  }

  // horizontal rules scroller (desktop)
  ScrollTrigger.matchMedia({
    '(min-width: 861px)': () => {
      const track = $('.rules-track');
      const dist = () => Math.max(0, track.offsetLeft + track.scrollWidth - innerWidth * .94);
      const tw = gsap.to(track, { x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.rules', pin: '.rules-pin', start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true } });
      $$('.rc').forEach(c => gsap.from(c, { rotate: 6, y: 80, opacity: .3, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tw, start: 'left 100%', end: 'left 60%', scrub: true } }));
    }
  });

  // phones: 3D fan-in + parallax + mouse tilt
  gsap.from('.phone', { y: 200, rotateY: (i) => (i - 1.5) * 30, rotateX: 30, opacity: 0, stagger: .12, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.phones', start: 'top 80%' } });
  $$('.phone').forEach(p => gsap.to(p, { y: -120 * p.dataset.depth, ease: 'none', scrollTrigger: { trigger: '.phones', start: 'top bottom', end: 'bottom top', scrub: true } }));
  const phones = $('.phones');
  phones.addEventListener('pointermove', e => {
    const r = phones.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    $$('.phone img', phones).forEach((img, i) => gsap.to(img, { rotateY: x * 24, rotateX: -y * 18, z: 30 * (i % 2 + 1), duration: .6 }));
  });
  phones.addEventListener('pointerleave', () => gsap.to('.phone img', { rotateY: 0, rotateX: 0, z: 0, duration: .8 }));

  // reel: clip-path iris open
  gsap.to('.reel-wrap', { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none', scrollTrigger: { trigger: '.reel', start: 'top 85%', end: 'center center', scrub: true } });

  // privacy: count 100 → 0
  const z = { v: 100 };
  gsap.to(z, { v: 0, ease: 'power3.out', scrollTrigger: { trigger: '.zero', start: 'top 85%', end: 'center 45%', scrub: 1 }, onUpdate: () => $('#zeroNum').textContent = Math.round(z.v) });
  gsap.from('.zero', { scale: .6, ease: 'none', scrollTrigger: { trigger: '.zero', start: 'top bottom', end: 'center center', scrub: true } });

  // timeline fill
  gsap.to('#tlFill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.tl', start: 'top 70%', end: 'bottom 60%', scrub: true } });
  $$('.tl-item').forEach(t => gsap.from(t, { x: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 85%' } }));

  // CTA glyph
  gsap.from('.cta-glyph', { rotate: -180, scale: .2, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'center center', scrub: true } });
  gsap.to('.cta-glyph', { y: -20, duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
})();
