'use client';

import { useRef } from 'react';

/** Light/dark before-after: drag (or arrow-key) the handle to reveal the dark theme. */
export default function Compare({ light, dark }: { light: string; dark: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const set = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const b = (el.querySelector('.cmp-in') ?? el).getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - b.left) / b.width) * 100));
    el.style.setProperty('--x', `${x}%`);
    el.setAttribute('aria-valuenow', String(Math.round(x)));
  };
  return (
    <div
      ref={ref}
      className="compare reveal"
      role="slider"
      tabIndex={0}
      aria-label="Light and dark theme comparison"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={50}
      onPointerDown={e => { (e.target as Element).setPointerCapture?.(e.pointerId); set(e.clientX); }}
      onPointerMove={e => { if (e.buttons) set(e.clientX); }}
      onKeyDown={e => {
        const el = ref.current;
        if (!el || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
        const now = Number(el.getAttribute('aria-valuenow')) + (e.key === 'ArrowRight' ? 5 : -5);
        const b = (el.querySelector('.cmp-in') ?? el).getBoundingClientRect();
        set(b.left + (Math.min(100, Math.max(0, now)) / 100) * b.width);
      }}
    >
      <div className="cmp-in">
        <img src={light} alt="Globber home screen in light theme" />
        <img src={dark} alt="Globber home screen in dark theme" className="cmp-dark" />
        <span className="cmp-tag l">Light</span>
        <span className="cmp-tag d">Dark</span>
        <span className="cmp-line" aria-hidden="true" />
        <span className="cmp-knob" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6-6 6 6 6M15 6l6 6-6 6" /></svg>
        </span>
      </div>
    </div>
  );
}
