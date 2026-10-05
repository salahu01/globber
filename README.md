# Globber — website

Source for **https://salahu01.github.io/globber/**, the landing page for [Globber](https://github.com/salahu01/globber-app), a pattern-matching call blocker for Android.

Next.js (App Router) exported as a static site, with GSAP + ScrollTrigger + Lenis for motion. The "Lab" section is a TypeScript port of the app's `RuleMatcher.kt` (`lib/matcher.ts`).

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export to out/ (basePath /globber)
```

Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

- `app/page.tsx` — page markup
- `components/Lab.tsx` — interactive matcher
- `components/Effects.tsx` — loader, number rain, cursor and scroll animations
- `public/assets/` — images, icon, promo reel
