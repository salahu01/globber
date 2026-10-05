/* Port of RuleMatcher.kt from the app. */
export type RuleType = 'EXACT' | 'STARTS_WITH' | 'CONTAINS' | 'ENDS_WITH' | 'REGEX';
export type MatchResult = { hit: boolean; via: string };

const NSN_LEN = 10;

export const normalize = (s: string) => {
  const t = s.trim();
  const d = t.replace(/\D/g, '');
  return t.startsWith('+') ? '+' + d : d;
};

export const national = (s: string) => {
  let d = s.replace(/\D/g, '');
  if (d.length > NSN_LEN) {
    d = d.replace(/^0+/, '');
    if (d.length > NSN_LEN) d = d.slice(-NSN_LEN);
  }
  return d;
};

const ops: Record<Exclude<RuleType, 'REGEX'>, (a: string, b: string) => boolean> = {
  EXACT: (a, b) => a === b,
  STARTS_WITH: (a, b) => a.startsWith(b),
  CONTAINS: (a, b) => a.includes(b),
  ENDS_WITH: (a, b) => a.endsWith(b),
};

export function matches(number: string, type: RuleType, pattern: string): MatchResult {
  const n = normalize(number);
  if (type === 'REGEX') {
    try {
      return { hit: new RegExp(pattern).test(n), via: 'regex on E.164' };
    } catch {
      return { hit: false, via: 'invalid regex → never matches' };
    }
  }
  const p = normalize(pattern), nn = national(number), pn = national(pattern);
  const op = ops[type];
  if (p && op(n, p)) return { hit: true, via: 'E.164 form matched' };
  if (pn && op(nn, pn)) return { hit: true, via: 'national form matched' };
  return { hit: false, via: 'neither form matched' };
}
