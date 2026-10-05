'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { matches, national, normalize, type RuleType } from '@/lib/matcher';

const TYPES: [RuleType, string][] = [
  ['EXACT', 'Exact'],
  ['STARTS_WITH', 'Starts with'],
  ['CONTAINS', 'Contains'],
  ['ENDS_WITH', 'Ends with'],
  ['REGEX', 'Regex'],
];

const PRESETS: { label: string; type: RuleType; pattern: string; num: string }[] = [
  { label: 'US 555 block', type: 'STARTS_WITH', pattern: '+1 800 555', num: '+1 (800) 555-0142' },
  { label: 'robo *0000', type: 'ENDS_WITH', pattern: '0000', num: '+44 7700 900000' },
  { label: 'national vs +91', type: 'EXACT', pattern: '9881234567', num: '+91 98812 34567' },
  { label: 'UK mobile regex', type: 'REGEX', pattern: '^\\+447\\d{9}$', num: '+44 7911 123456' },
  { label: 'miss', type: 'CONTAINS', pattern: '555', num: '+1 212 867 5309' },
];

function Form({ label, value, hit }: { label: string; value: string; hit: boolean }) {
  return (
    <div>
      <span>{label}</span>
      <b className={hit ? 'm' : undefined}>{value || '∅'}</b>
    </div>
  );
}

export default function Lab() {
  const [type, setType] = useState<RuleType>('STARTS_WITH');
  const [pattern, setPattern] = useState('1900');
  const [num, setNum] = useState('+91 1900 190 000');
  const verdictRef = useRef<HTMLDivElement>(null);

  const r = matches(num, type, pattern);
  const isReg = type === 'REGEX';
  const viaE164 = r.hit && (isReg || r.via.startsWith('E'));
  const viaNational = r.hit && r.via.startsWith('n');

  // Replay the verdict animation on every change.
  useEffect(() => {
    const v = verdictRef.current;
    if (!v) return;
    v.classList.remove('anim');
    void v.offsetWidth;
    v.classList.add('anim');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && r.hit) gsap.fromTo(v, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1,.3)' });
  }, [type, pattern, num, r.hit]);

  return (
    <div className="lab-box">
      <div className="lab-l">
        <label className="mono">rule type</label>
        <div className="seg">
          {TYPES.map(([t, label]) => (
            <button key={t} className={t === type ? 'on' : undefined} onClick={() => setType(t)}>
              {label}
            </button>
          ))}
        </div>
        <label className="mono" htmlFor="labPat">pattern</label>
        <input id="labPat" className="mono" value={pattern} onChange={e => setPattern(e.target.value)} autoComplete="off" spellCheck={false} />
        <label className="mono" htmlFor="labNum">incoming caller ID</label>
        <input id="labNum" className="mono" value={num} onChange={e => setNum(e.target.value)} autoComplete="off" spellCheck={false} />
        <div className="lab-presets mono">
          <span>try:</span>
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => { setType(p.type); setPattern(p.pattern); setNum(p.num); }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="lab-r">
        <div className="lab-forms mono">
          <Form label="E.164 caller" value={normalize(num)} hit={viaE164} />
          <Form label="national caller" value={isReg ? '(unused)' : national(num)} hit={viaNational} />
          <Form label="E.164 pattern" value={isReg ? pattern : normalize(pattern)} hit={viaE164} />
          <Form label="national pattern" value={isReg ? '(unused)' : national(pattern)} hit={viaNational} />
        </div>
        <div ref={verdictRef} className={`verdict${r.hit ? '' : ' pass'}`}>
          <div className="v-ring">
            <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" /></svg>
            <span>{r.hit ? '✱' : '☎'}</span>
          </div>
          <div>
            <b>{r.hit ? 'BLOCKED' : 'RINGS THROUGH'}</b>
            <small className="mono">{r.via}</small>
          </div>
        </div>
      </div>
    </div>
  );
}
