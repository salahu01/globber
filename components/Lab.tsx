'use client';

import { useEffect, useRef, useState } from 'react';
import { matches, national, normalize, type RuleType } from '@/lib/matcher';

const TYPES: [RuleType, string][] = [
  ['STARTS_WITH', 'Starts with'],
  ['ENDS_WITH', 'Ends with'],
  ['CONTAINS', 'Contains'],
  ['EXACT', 'Exact'],
  ['REGEX', 'Regex'],
];

const PRESETS: { label: string; type: RuleType; pattern: string; num: string }[] = [
  { label: 'Telemarketing series', type: 'STARTS_WITH', pattern: '+91 140', num: '+91 140 223 3445' },
  { label: 'Robo tail', type: 'ENDS_WITH', pattern: '0000', num: '+44 7700 900000' },
  { label: 'Local vs +91', type: 'EXACT', pattern: '9881234567', num: '+91 98812 34567' },
  { label: 'UK mobile regex', type: 'REGEX', pattern: '^\\+447\\d{9}$', num: '+44 7911 123456' },
  { label: 'A real friend', type: 'STARTS_WITH', pattern: '+91 140', num: '+91 98470 12345' },
];

function Form({ label, value, hit }: { label: string; value: string; hit: boolean }) {
  return (
    <div>
      <span>{label}</span>
      <b className={hit ? 'm' : undefined}>{value || '∅'}</b>
    </div>
  );
}

const Block = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><circle cx="12" cy="12" r="8.5" /><path d="M6 18 18 6" /></svg>
);
const Ring = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

/** Live port of the app's RuleMatcher: same normalisation, same verdicts. */
export default function Lab() {
  const [type, setType] = useState<RuleType>('STARTS_WITH');
  const [pattern, setPattern] = useState('+91 140');
  const [num, setNum] = useState('+91 140 223 3445');
  const verdictRef = useRef<HTMLDivElement>(null);

  const r = matches(num, type, pattern);
  const isReg = type === 'REGEX';
  const viaE164 = r.hit && (isReg || r.via.startsWith('E'));
  const viaNational = r.hit && r.via.startsWith('n');

  // Replay the verdict pop on every change.
  useEffect(() => {
    const v = verdictRef.current;
    if (!v) return;
    v.classList.remove('anim');
    void v.offsetWidth;
    v.classList.add('anim');
  }, [type, pattern, num]);

  return (
    <div className="lab-box reveal">
      <div className="lab-l">
        <label>Match type</label>
        <div className="seg" role="radiogroup" aria-label="Match type">
          {TYPES.map(([t, label]) => (
            <button key={t} role="radio" aria-checked={t === type} className={t === type ? 'on' : undefined} onClick={() => setType(t)}>
              {label}
            </button>
          ))}
        </div>
        <label htmlFor="labPat">Pattern</label>
        <div className="field">
          <i aria-hidden="true">✱</i>
          <input id="labPat" value={pattern} onChange={e => setPattern(e.target.value)} autoComplete="off" spellCheck={false} />
        </div>
        <label htmlFor="labNum">Incoming caller ID</label>
        <div className="field">
          <i aria-hidden="true">☏</i>
          <input id="labNum" value={num} onChange={e => setNum(e.target.value)} inputMode="tel" autoComplete="off" spellCheck={false} />
        </div>
        <div className="lab-presets">
          <span>Try</span>
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => { setType(p.type); setPattern(p.pattern); setNum(p.num); }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className={`lab-r${r.hit ? '' : ' pass'}`}>
        <div className="lab-forms">
          <Form label="Caller · E.164" value={normalize(num)} hit={viaE164} />
          <Form label="Caller · national" value={isReg ? 'unused' : national(num)} hit={viaNational} />
          <Form label="Pattern · E.164" value={isReg ? pattern : normalize(pattern)} hit={viaE164} />
          <Form label="Pattern · national" value={isReg ? 'unused' : national(pattern)} hit={viaNational} />
        </div>
        <div ref={verdictRef} className={`verdict${r.hit ? '' : ' pass'}`} aria-live="polite">
          <div className="v-badge">{r.hit ? <Block /> : <Ring />}</div>
          <div>
            <b>{r.hit ? 'Blocked' : 'Rings through'}</b>
            <small>{r.via}</small>
          </div>
        </div>
      </div>
    </div>
  );
}
