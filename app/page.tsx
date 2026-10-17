import Effects from '@/components/Effects';
import Lab from '@/components/Lab';
import Compare from '@/components/Compare';
import { asset, blob, RELEASES, REPO } from '@/lib/site';

const PATTERNS = ['+91 140*', '1860*', '*0000', '^\\+447\\d{9}$', '+1 800 555*', 'contains 555', '+44 70*', '*9999', '+9122*'];

const STEPS = [
  { n: '01', k: 'Write one pattern', h: 'A rule for the whole series, not the number.', p: 'Spammers rotate through hundreds of numbers from the same block. Type the prefix they share, +91 140, and every one of them is covered.', img: 'light-rules' },
  { n: '02', k: 'Let it screen', h: 'Stopped before your phone even rings.', p: 'Globber sits in Android’s call-screening slot. Matching calls are rejected, silenced or sent to voicemail in milliseconds, entirely on-device.', img: 'light-home' },
  { n: '03', k: 'See what it caught', h: 'Every blocked call, on a timeline.', p: 'A calm log grouped by day, with the pattern that caught each call. Tap any entry to allow the number or make a rule like it.', img: 'light-log' },
];

const TYPES = [
  { t: 'Starts with', code: '+91 140', note: 'The default. Silence a telemarketing prefix in one line.', hit: ['+91 140 223 3445', '+91 140 887 7001'], miss: '+91 141 220 0000', wide: true },
  { t: 'Ends with', code: '0000', note: 'Robo-dialers love round tails.', hit: ['+44 7700 900000'], miss: '+44 7700 900001' },
  { t: 'Contains', code: '555', note: 'Any caller ID with that run of digits.', hit: ['+1 800 555 0101'], miss: '+1 212 867 5309' },
  { t: 'Exact', code: '98812 34567', note: 'One number, local or international form.', hit: ['+91 98812 34567'], miss: '+91 98812 34568' },
  { t: 'Regex', code: '^\\+447\\d{9}$', note: 'Full regular expressions, for surgery.', hit: ['+44 7911 123456'], miss: '+44 20 7946 0958' },
];

const MANIFEST: [string, string, boolean][] = [
  ['android.permission.INTERNET', 'not requested', false],
  ['READ_CONTACTS', 'not requested', false],
  ['Analytics SDK', 'none', false],
  ['Ads', 'none', false],
  ['Account · sign-in', 'none', false],
  ['POST_NOTIFICATIONS', 'optional · block alerts', true],
  ['Call screening role', 'required · the whole point', true],
];

const FAQ = [
  ['Does Globber need my contacts?', 'No. Globber never reads your contacts. Android only routes calls from unknown numbers to call-screening apps, so people you know ring as usual.'],
  ['Will it block calls from real people?', 'Only if a rule matches them. Add any number to Allowed numbers and it always rings, whatever your rules say.'],
  ['What happens to blocked calls?', 'You choose per rule: reject, silence, or send to voicemail. Each one lands in the log with the pattern that caught it.'],
  ['Does anything leave my phone?', 'Nothing. The app has no internet permission at all, so it physically cannot send data anywhere.'],
  ['Which phones does it support?', 'Android 10 and newer. It uses the official CallScreeningService, so no root and no hacks.'],
];

const Star = ({ s = 22 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" aria-hidden="true" className="star">
    <g stroke="currentColor" strokeWidth="13" strokeLinecap="round">
      <line x1="50" y1="14" x2="50" y2="86" /><line x1="18.8" y1="32" x2="81.2" y2="68" /><line x1="18.8" y1="68" x2="81.2" y2="32" />
    </g>
    <circle cx="50" cy="50" r="10.5" fill="var(--red)" />
  </svg>
);

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Down = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v12m0 0-5-5m5 5 5-5M5 20h14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

function Phone({ img, alt, className = '' }: { img: string; alt: string; className?: string }) {
  return (
    <div className={`phone ${className}`}>
      <img src={asset(`app/${img}.webp`)} alt={alt} loading="lazy" decoding="async" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Effects />
      <div className="backdrop" aria-hidden="true"><div className="bd-grid" /><div className="bd-glow" /></div>

      {/* ============ NAV ============ */}
      <header className="nav" id="nav">
        <a href="#top" className="brand" aria-label="Globber home">
          <img src={asset('app/mark.svg')} alt="" width={34} height={34} />
          <b>Globber</b>
        </a>
        <nav aria-label="Sections">
          <a href="#how">How it works</a>
          <a href="#lab">Try it</a>
          <a href="#design">Design</a>
          <a href="#private">Privacy</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="btn btn-ink btn-sm magnet" href={RELEASES}>
          <Down /> Download
        </a>
      </header>

      <main id="top">
        {/* ============ HERO ============ */}
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow hero-in"><span className="pulse" /> On-device call screening for Android</p>
            <h1 className="hero-title">
              <span className="ln"><span className="w">Block spam</span></span>
              <span className="ln"><span className="w">by its <em>pattern.</em></span></span>
            </h1>
            <p className="hero-sub hero-in">
              Telemarketers rotate through hundreds of numbers. Globber blocks the shape they share, so one rule like <code>+91 140*</code> silences the entire series before your phone rings.
            </p>
            <div className="hero-cta hero-in">
              <a className="btn btn-ink magnet" href={RELEASES}><Down /> Download for Android</a>
              <a className="btn btn-ghost" href="#lab">Try a pattern <Arrow /></a>
            </div>
            <ul className="hero-proof hero-in" aria-label="Highlights">
              <li><b>0</b> bytes sent off your phone</li>
              <li><b>5</b> ways to match a number</li>
              <li><b>1</b> permission, optional</li>
            </ul>
          </div>

          <div className="stage" aria-hidden="true">
            <div className="lanes" id="lanes" />
            <div className="tile" id="tile">
              <div className="tile-face"><Star s={150} /></div>
            </div>
            <div className="tile-pill"><span id="pillText">+91 140*</span></div>
            <div className="stage-count"><b id="caught">0</b><span>caught this session</span></div>
          </div>
        </section>

        {/* ============ TICKER ============ */}
        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[...PATTERNS, ...PATTERNS].map((p, i) => (
              <span key={i}><Star s={18} />{p}</span>
            ))}
          </div>
        </div>

        {/* ============ HOW IT WORKS (pinned) ============ */}
        <section className="how" id="how">
          <div className="sec-head">
            <p className="eyebrow reveal">How it works</p>
            <h2 className="h2 reveal">Three steps to a <em>quiet</em> phone.</h2>
          </div>
          <div className="how-grid">
            <div className="how-steps">
              {STEPS.map(s => (
                <article className="step" key={s.n} data-img={s.img}>
                  <span className="step-n">{s.n}</span>
                  <p className="step-k">{s.k}</p>
                  <h3>{s.h}</h3>
                  <p>{s.p}</p>
                  <Phone img={s.img} alt="" className="step-phone" />
                </article>
              ))}
            </div>
            <div className="how-sticky">
              <div className="how-device">
                <div className="phone phone-lg">
                  {STEPS.map((s, i) => (
                    <img key={s.img} src={asset(`app/${s.img}.webp`)} alt={s.k} data-shot={s.img} className={i === 0 ? 'on' : undefined} />
                  ))}
                </div>
                <div className="float f1"><span className="dot red" /> <b>+91 140 223 3445</b><small>Rejected · +91 140*</small></div>
                <div className="float f2"><Star s={26} /><div><b>3 rules</b><small>screening every call</small></div></div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ LAB ============ */}
        <section className="lab" id="lab">
          <div className="sec-head">
            <p className="eyebrow reveal">Try it live</p>
            <h2 className="h2 reveal">The real matcher, <em>in your browser.</em></h2>
            <p className="sec-sub reveal">This is a line-for-line port of the app’s rule engine. Type a pattern and a caller ID to see exactly what Globber would do.</p>
          </div>
          <Lab />
        </section>

        {/* ============ MATCH TYPES ============ */}
        <section className="types">
          <div className="sec-head">
            <p className="eyebrow reveal">Five ways to match</p>
            <h2 className="h2 reveal">From a blunt prefix to <em>surgical regex.</em></h2>
          </div>
          <div className="bento">
            {TYPES.map(t => (
              <article key={t.t} className={`card type reveal${t.wide ? ' wide' : ''}`}>
                <div className="type-top">
                  <p className="type-t">{t.t}</p>
                  <code className="type-code">{t.code}</code>
                </div>
                <p className="type-note">{t.note}</p>
                <ul className="type-demo">
                  {t.hit.map(n => <li key={n} className="hit"><span>{n}</span><i>Blocked</i></li>)}
                  <li className="miss"><span>{t.miss}</span><i>Rings</i></li>
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* ============ DESIGN ============ */}
        <section className="design" id="design">
          <div className="sec-head">
            <p className="eyebrow reveal">Designed, not assembled</p>
            <h2 className="h2 reveal">Beautiful by day. <em>Stunning by night.</em></h2>
            <p className="sec-sub reveal">A warm ceramic palette, one signal red, frosted-glass navigation and spring-loaded motion. Drag the handle to switch themes.</p>
          </div>
          <Compare light={asset('app/light-home.webp')} dark={asset('app/dark-home.webp')} />
          <div className="gallery reveal" aria-label="App screens">
            {['light-rules', 'dark-log', 'light-settings', 'dark-rules'].map(s => (
              <Phone key={s} img={s} alt={s.replace('-', ' ')} />
            ))}
          </div>
        </section>

        {/* ============ PRIVACY ============ */}
        <section className="private" id="private">
          <div className="private-in">
            <div className="sec-head">
              <p className="eyebrow reveal">Private by design</p>
              <h2 className="h2 reveal">Nothing leaves <em>your phone.</em></h2>
              <p className="sec-sub reveal">Not because we promise. Because the app has no internet permission, so it can’t.</p>
            </div>
            <div className="private-grid">
              <div className="zero reveal">
                <span className="zero-n" id="zero">0</span>
                <span className="zero-u">bytes sent, ever</span>
              </div>
              <div className="manifest reveal" role="table" aria-label="Permissions">
                <div className="mf-head"><span className="mf-dots"><i /><i /><i /></span>AndroidManifest.xml</div>
                {MANIFEST.map(([k, v, on]) => (
                  <div role="row" key={k} className={`mf-row${on ? ' on' : ''}`}>
                    <span role="cell">{k}</span>
                    <b role="cell">{v}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ OPEN SOURCE ============ */}
        <section className="open">
          <div className="open-card card reveal">
            <div>
              <p className="eyebrow">Open source · MIT</p>
              <h2 className="h3">Read every line that touches your calls.</h2>
              <p className="sec-sub">Kotlin, Jetpack Compose and Room, built on Android’s official call-screening API. No root, no accessibility hacks.</p>
            </div>
            <div className="open-actions">
              <a className="btn btn-ink magnet" href={REPO}>View on GitHub <Arrow /></a>
              <a className="btn btn-ghost" href={blob('CHANGELOG.md')}>Changelog</a>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="faq" id="faq">
          <div className="sec-head">
            <p className="eyebrow reveal">Questions</p>
            <h2 className="h2 reveal">Good to know.</h2>
          </div>
          <div className="faq-list">
            {FAQ.map(([q, a]) => (
              <details key={q} className="reveal">
                <summary>{q}<span className="plus" aria-hidden="true" /></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="final">
          <div className="final-in">
            <img className="final-icon" src={asset('app/mark.svg')} alt="" width={120} height={120} />
            <h2 className="h2">Make your phone <em>quiet</em> again.</h2>
            <p className="sec-sub">Free and open source. Android 10 and newer.</p>
            <div className="hero-cta">
              <a className="btn btn-red magnet" href={RELEASES}><Down /> Download for Android</a>
              <span className="soon">Google Play · coming soon</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <span className="brand"><img src={asset('app/mark.svg')} alt="" width={26} height={26} /><b>Globber</b></span>
        <span>Block spam by its pattern.</span>
        <a href={REPO}>GitHub</a>
      </footer>
    </>
  );
}
