import Effects from '@/components/Effects';
import Lab from '@/components/Lab';
import { asset, blob, RELEASES, REPO, VERSION } from '@/lib/site';

const MARQUEE = ['+1 800 555 ****', '1900*', '*0000', '^\\+44 70\\d{8}$', '+91 140*', '*9999', 'contains 555'];

const RULES = [
  { n: '01', title: 'Exact', code: '9881234567', body: 'One number, either written locally or with country code — both forms are checked.', demo: [['+91 98812 34567', true], ['+91 98812 34568', false]] },
  { n: '02', title: 'Starts with', code: '1900', body: 'The default. Kill premium-rate or telemarketing prefixes in one line.', demo: [['1900 190 000', true], ['1900 555 123', true], ['1800 190 000', false]] },
  { n: '03', title: 'Contains', code: '555', body: 'Any caller ID with this run of digits anywhere inside.', demo: [['+1 800 555 0101', true], ['+1 212 867 5309', false]] },
  { n: '04', title: 'Ends with', code: '0000', body: 'Sequential robo-dialers love round tails. They stop here.', demo: [['+44 7700 900000', true], ['+44 7700 900001', false]] },
  { n: '05', title: 'Regex', code: '^\\+447\\d{9}$', body: 'Full regular expressions on the normalized E.164 number, for when you need surgery.', demo: [['+44 7911 123456', true], ['+44 20 7946 0958', false]], cls: 'rc-regex' },
] as const;

const PHONES = [
  { img: '01-dashboard.webp', alt: 'Dashboard screen', cap: 'Dashboard — status, counts, today', depth: 0.5 },
  { img: '02-rules.webp', alt: 'Rules screen', cap: 'Rules — reorder, toggle, filter', depth: 1 },
  { img: '03-blocked-calls.webp', alt: 'Blocked calls log', cap: 'Log — grouped by day, searchable', depth: 0.7 },
  { img: '04-settings.webp', alt: 'Settings screen', cap: 'Settings — theme, unknowns, backup', depth: 1.2 },
];

const FEATURES = [
  ['Block log', 'Every screened call, grouped by day, with action filters and search.'],
  ['Backup', 'Export & import your rules as a JSON file. Yours, portable.'],
  ['Theming', 'System, light or dark — with a custom icon set throughout.'],
  ['Notifications', 'Optional heads-up whenever something gets blocked.'],
];

const PERMS: [string, string, boolean][] = [
  ['android.permission.INTERNET', 'not requested', false],
  ['analytics SDK', 'none', false],
  ['ads', 'none', false],
  ['account / sign-in', 'none', false],
  ['POST_NOTIFICATIONS', 'optional · block alerts', true],
  ['Call-screening role', 'required · the whole point', true],
];

const STACK = ['Kotlin', 'Jetpack Compose', 'Room', 'CallScreeningService', 'minSdk 29', 'targetSdk 35', 'MIT'];

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 3v13m0 0-5-5m5 5 5-5M4 21h16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const Star = ({ className }: { className: string }) => (
  <svg className={className} viewBox="-120 -120 240 240"><g fill="#C6FF00">{[0, 60, 120].map(r => <rect key={r} x="-26" y="-104" width="52" height="208" rx="26" transform={r ? `rotate(${r})` : undefined} />)}</g></svg>
);

export default function Home() {
  return (
    <>
      {/* ============ LOADER ============ */}
      <div id="loader" aria-hidden="true">
        <Star className="ld-star" />
        <div className="ld-num mono" id="ldNum">+1 800 555 0000</div>
        <div className="ld-bar"><i id="ldBar" /></div>
      </div>

      <div id="cursor"><span /></div>
      <div className="grain" />
      <canvas id="rain" aria-hidden="true" />

      {/* ============ NAV ============ */}
      <header className="nav">
        <a href="#top" className="brand"><img src={asset('glyph.svg')} alt="" /><b>Globber</b></a>
        <nav>
          {[['how', 'How'], ['lab', 'Lab'], ['rules', 'Rules'], ['screens', 'Screens'], ['privacy', 'Privacy'], ['log', 'Log']].map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
        <a className="btn-pill magnet" href={RELEASES}>Get APK<span>↓</span></a>
      </header>

      <main id="top">
        {/* ============ HERO ============ */}
        <section className="hero">
          <div className="hero-meta mono"><span className="dot" /> {VERSION} · Android 10+ · MIT · 0 bytes sent</div>
          <h1 className="hero-title">
            <span className="line"><span className="w">Block</span> <span className="w">the</span></span>
            <span className="line"><span className="w outline">shape</span><span className="w star">✱</span></span>
            <span className="line"><span className="w">of</span> <span className="w lime">spam.</span></span>
          </h1>
          <div className="hero-row">
            <p className="hero-sub">Spam rotates through numbers. Globber doesn&apos;t care. Describe the <em>pattern</em> — <code>+1 800 555*</code>, <code>1900*</code>, <code>*0000</code> — and Android rejects every match <strong>before your phone rings</strong>.</p>
            <div className="hero-term mono">
              <div className="ht-head"><i /><i /><i /><span>CallScreeningService</span></div>
              <div className="ht-body" id="htBody" />
            </div>
          </div>
          <div className="hero-cta">
            <a className="btn-big magnet" href={RELEASES}><span>Download APK</span><DownloadIcon /></a>
            <a className="btn-ghost magnet" href={REPO}>View source ↗</a>
          </div>
          <div className="scroll-hint mono"><span>scroll</span><i /></div>
        </section>

        {/* ============ MARQUEE ============ */}
        <div className="marquee" aria-hidden="true">
          <div className="mq-track mono">
            {[0, 1].flatMap(k => MARQUEE.flatMap((m, i) => [<span key={`${k}s${i}`}>{m}</span>, <b key={`${k}b${i}`}>✱</b>]))}
          </div>
        </div>

        {/* ============ PROBLEM ============ */}
        <section className="problem" id="why">
          <div className="sec-tag mono">01 — the problem</div>
          <h2 className="big-split">Blocklists want <span className="strike">an exact number.</span><br />Spam <span className="lime">never calls twice</span> from the same one.</h2>
          <div className="problem-grid">
            <div className="pg-numbers mono" id="burnList" />
            <div className="pg-copy">
              <p>Robo-dialers burn through whole ranges — <code>+1 800 555 0101</code>, <code>0102</code>, <code>0103</code>… Every call is a &quot;new&quot; number, so a classic blacklist is always one step behind.</p>
              <p>Globber flips it: you block the <strong>shape</strong>. One rule, the entire range — gone.</p>
              <div className="vs">
                <div><span className="mono">exact list</span><b id="cntExact">0</b><small>rules needed</small></div>
                <div className="lime-box"><span className="mono">globber</span><b>1</b><small>rule needed</small></div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ HOW ============ */}
        <section className="how" id="how">
          <div className="sec-tag mono">02 — how it works</div>
          <h2 className="big-split">Screened in <span className="lime">milliseconds</span>,<br />below the ringtone.</h2>
          <div className="pipe">
            <svg className="pipe-svg" viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true">
              <path id="pipePath" d="M60 110 C 260 110, 260 110, 400 110 S 640 110, 800 110 S 1040 40, 1140 40 M800 110 S 1040 110, 1140 110 M800 110 S 1040 180, 1140 180" fill="none" stroke="#2a3020" strokeWidth="2" strokeDasharray="6 8" />
              <path id="pipeLive" d="M60 110 C 260 110, 260 110, 400 110 S 640 110, 800 110 S 1040 40, 1140 40" fill="none" stroke="#C6FF00" strokeWidth="3" />
            </svg>
            <div className="pipe-nodes">
              <div className="pn"><div className="pn-ico">☎</div><b>Incoming call</b><p>Android hands the caller ID to the system&apos;s call-screening role holder — Globber.</p></div>
              <div className="pn"><div className="pn-ico mono">fn</div><b>Normalize ×2</b><p><code>+91 (988) 123-4567</code> → E.164 <code>+919881234567</code> <em>and</em> national <code>9881234567</code>.</p></div>
              <div className="pn"><div className="pn-ico">✱</div><b>First enabled match</b><p>Rules are tried in your order. Either form matching wins — so local-style and +CC rules both work.</p></div>
              <div className="pn pn-out"><div className="pn-ico">⛔</div><b>Respond</b><p><span className="chip">Reject</span> <span className="chip">Silence</span> <span className="chip">Voicemail</span> — then it&apos;s written to the block log.</p></div>
            </div>
          </div>
        </section>

        {/* ============ LAB ============ */}
        <section className="lab" id="lab">
          <div className="sec-tag mono">03 — the lab</div>
          <h2 className="big-split">Try the <span className="lime">real matcher.</span></h2>
          <p className="lead">This is a line-for-line JavaScript port of <code>RuleMatcher.kt</code> from the app. Type a rule, throw a caller at it.</p>
          <Lab />
        </section>

        {/* ============ RULES (horizontal) ============ */}
        <section className="rules" id="rules">
          <div className="rules-pin">
            <div className="rules-head">
              <div className="sec-tag mono">04 — five match types</div>
              <h2>Five ways to<br />describe a <span className="lime">nuisance.</span></h2>
            </div>
            <div className="rules-track">
              {RULES.map(r => (
                <article key={r.n} className={`rc${'cls' in r ? ` ${r.cls}` : ''}`}>
                  <span className="rc-n mono">{r.n}</span><h3>{r.title}</h3><code>{r.code}</code><p>{r.body}</p>
                  <div className="rc-demo mono">{r.demo.map(([num, hit]) => <i key={num} className={hit ? 'hit' : undefined}>{num}</i>)}</div>
                </article>
              ))}
              <article className="rc rc-act">
                <span className="rc-n mono">+</span><h3>Then pick an action</h3>
                <ul><li><b>Reject</b> hang up instantly</li><li><b>Silence</b> let it ring, mutely</li><li><b>Voicemail</b> send it straight there</li></ul>
                <p className="mono small">+ optional: block withheld / private numbers</p>
              </article>
            </div>
          </div>
        </section>

        {/* ============ SCREENS ============ */}
        <section className="screens" id="screens">
          <div className="sec-tag mono">05 — the app</div>
          <h2 className="big-split">Neon-lime <span className="lime">bento.</span> Built in Compose.</h2>
          <div className="phones">
            {PHONES.map(p => (
              <figure key={p.img} className="phone" data-depth={p.depth}>
                <img src={asset(p.img)} alt={p.alt} loading="lazy" />
                <figcaption className="mono">{p.cap}</figcaption>
              </figure>
            ))}
          </div>
          <div className="feat-grid">
            {FEATURES.map(([t, d]) => <div key={t} className="fg"><b>{t}</b><p>{d}</p></div>)}
          </div>
        </section>

        {/* ============ REEL ============ */}
        <section className="reel">
          <div className="reel-wrap">
            <video id="reel" src={asset('reel.mp4')} poster={asset('reel.jpg')} muted loop playsInline preload="none" />
            <div className="reel-label mono">▶ promo reel · 40s</div>
          </div>
        </section>

        {/* ============ PRIVACY ============ */}
        <section className="privacy" id="privacy">
          <div className="sec-tag mono">06 — privacy</div>
          <div className="zero"><span id="zeroNum">100</span></div>
          <h2 className="priv-h">network permissions.<br /><span className="lime">Globber literally can&apos;t phone home.</span></h2>
          <div className="priv-grid mono">
            {PERMS.map(([name, state, ok]) => (
              <div key={name}>{ok ? <b>{name}</b> : <s>{name}</s>}<span className={ok ? 'yes' : 'no'}>{state}</span></div>
            ))}
          </div>
          <p className="lead">Rules and the block log live in a local Room database on your phone. Nothing else. Read the <a href={blob('PRIVACY.md')}>privacy policy</a>.</p>
        </section>

        {/* ============ SETUP ============ */}
        <section className="setup" id="setup">
          <div className="sec-tag mono">07 — get running</div>
          <h2 className="big-split">Three steps. <span className="lime">Then silence.</span></h2>
          <ol className="steps">
            <li><span className="mono">01</span><b>Download the APK</b><p>Grab the signed build from GitHub Releases. Needs Android 10 (API 29) or newer.</p></li>
            <li><span className="mono">02</span><b>Set as call-screening app</b><p>Globber asks Android for the call-screening role on first launch. Accept it — that&apos;s what lets it reject calls.</p></li>
            <li><span className="mono">03</span><b>Write your first rule</b><p>Tap +, type a prefix like <code>1900</code>. &quot;Starts with&quot; is preselected. Done.</p></li>
          </ol>
        </section>

        {/* ============ CHANGELOG ============ */}
        <section className="log" id="log">
          <div className="sec-tag mono">08 — changelog</div>
          <h2 className="big-split">Shipped, <span className="lime">in public.</span></h2>
          <div className="tl">
            <div className="tl-line"><i id="tlFill" /></div>
            <div className="tl-item"><time className="mono">2026-07-24</time><b>v1.0.5</b><p>National numbers like <code>9605…</code> now match <code>+91…</code> caller IDs — the matcher compares both E.164 and national forms. Add-rule dialog button fixed. Misleading contacts toggle removed, along with <code>READ_CONTACTS</code>.</p></div>
            <div className="tl-item"><time className="mono">2026-06-29</time><b>v1.0.4</b><p>New rules default to <strong>Starts with</strong> — typing <code>1900</code> now blocks the whole prefix out of the box.</p></div>
            <div className="tl-item"><time className="mono">2026-06-29</time><b>v1.0.3</b><p>Settings screen: theme switcher, block-unknown-numbers toggle, portrait lock.</p></div>
            <div className="tl-item"><time className="mono">earlier</time><b>v1.0.0 – 1.0.2</b><p>Pattern rules, call screening, block log, backup, splash screen and the bento UI.</p></div>
          </div>
          <a className="link-arrow mono" href={blob('CHANGELOG.md')}>full changelog →</a>
        </section>

        {/* ============ STACK ============ */}
        <section className="stack">
          <div className="stack-row mono">{STACK.map(s => <span key={s}>{s}</span>)}</div>
        </section>

        {/* ============ CTA ============ */}
        <section className="cta">
          <img className="cta-glyph" src={asset('glyph.svg')} alt="" />
          <h2>Let the shape<br /><span className="lime">ring out.</span></h2>
          <a className="btn-big magnet" href={RELEASES}><span>Download Globber {VERSION}</span><DownloadIcon /></a>
          <div className="cta-links mono">
            <a href={REPO}>Source</a><a href={`${REPO}/issues`}>Issues</a><a href={blob('CONTRIBUTING.md')}>Contributing</a><a href={blob('SECURITY.md')}>Security</a><a href={blob('PRIVACY.md')}>Privacy</a>
          </div>
        </section>
      </main>

      <footer className="foot mono">
        <span>© 2026 <a href="https://github.com/salahu01">salahu01</a> · MIT</span>
        <span>made with ✱ and zero network calls</span>
      </footer>

      <Effects />
    </>
  );
}
