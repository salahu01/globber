import type { Metadata } from 'next';
import { asset, REPO } from '@/lib/site';
import './privacy.css';

// Reachable only by URL (linked from the Play Store listing). Not in the nav, not indexed.
export const metadata: Metadata = {
  title: 'Privacy Policy — Globber',
  description: 'Globber runs entirely on your device. No internet permission, no analytics, no ads.',
  robots: { index: false, follow: false },
};

const UPDATED = '17 October 2026';

export default function Privacy() {
  return (
    <main className="pp">
      <header className="pp-head">
        <a className="pp-brand" href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/`}>
          <img src={asset('glyph.svg')} alt="" width={30} height={30} />
          Globber
        </a>
        <span className="pp-meta mono">Last updated · {UPDATED}</span>
      </header>

      <h1 className="pp-title">
        Privacy<br />
        <span className="lime">Policy</span>
      </h1>
      <p className="pp-lede">
        Globber is built to protect your privacy. It runs <em>entirely on your device</em>.
      </p>

      <ul className="pp-pills" aria-label="Summary">
        <li><i />No internet permission</li>
        <li><i />No analytics or tracking</li>
        <li><i />No ads or third-party SDKs</li>
        <li><i />No accounts</li>
      </ul>

      <section className="pp-sec">
        <h2><span className="mono">01</span>Data Globber accesses</h2>
        <div className="pp-table" role="table">
          <div role="row" className="pp-tr pp-th">
            <span role="columnheader">Data</span><span role="columnheader">Why</span><span role="columnheader">Where it goes</span>
          </div>
          <div role="row" className="pp-tr">
            <b role="cell">Incoming call numbers</b>
            <span role="cell">Matched against your block rules through Android&apos;s <code>CallScreeningService</code></span>
            <span role="cell">Processed on-device. A block log is stored only on your device.</span>
          </div>
          <div role="row" className="pp-tr">
            <b role="cell">Allowed numbers</b>
            <span role="cell">Numbers you choose to always let ring</span>
            <span role="cell">Stored only on your device.</span>
          </div>
          <div role="row" className="pp-tr">
            <b role="cell">Notifications</b>
            <span role="cell">Tell you when a call was blocked</span>
            <span role="cell">Shown on your device only.</span>
          </div>
        </div>
      </section>

      <section className="pp-sec">
        <h2><span className="mono">02</span>Data storage</h2>
        <p>
          Block rules, allowed numbers and the block log are stored in a local database on your device. Uninstalling
          the app removes this data. Globber never sends it to any server. If you have Android&apos;s own device backup
          turned on, Android may include it in your personal Google account backup, which Globber cannot read.
        </p>
      </section>

      <section className="pp-sec">
        <h2><span className="mono">03</span>Permissions</h2>
        <p>Globber requests a single permission:</p>
        <ul className="pp-list">
          <li><code>POST_NOTIFICATIONS</code> to tell you when a call is blocked.</li>
        </ul>
        <p>
          It also asks to be your <strong>call screening app</strong>, a system role rather than a permission, which
          lets Android show it the number of each incoming call. Globber does <strong>not</strong> request contacts,
          internet, location, microphone, camera or storage access.
        </p>
      </section>

      <section className="pp-sec">
        <h2><span className="mono">04</span>Children</h2>
        <p>Globber is not directed at children and collects no personal information from anyone.</p>
      </section>

      <section className="pp-sec">
        <h2><span className="mono">05</span>Changes</h2>
        <p>
          This policy may be updated alongside app releases. Material changes are noted in the{' '}
          <a href={`${REPO}/blob/master/CHANGELOG.md`}>changelog</a>.
        </p>
      </section>

      <section className="pp-sec">
        <h2><span className="mono">06</span>Contact</h2>
        <p>
          Questions? Email <a href="mailto:cvsalahu12@gmail.com">cvsalahu12@gmail.com</a> or{' '}
          <a href={`${REPO}/issues`}>open an issue</a>.
        </p>
      </section>

      <footer className="pp-foot mono">© 2026 Globber · On-device call screening for Android</footer>
    </main>
  );
}
