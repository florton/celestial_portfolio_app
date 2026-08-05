# Atlas Cœlestis

A portfolio built as a single rotating sky. Categories are celestial bodies on a
wheel whose center sits off-canvas past the bottom-right corner; turning the
wheel moves the sky's time of day with it.

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · Motion

```bash
yarn dev        # http://localhost:3000
yarn test       # vitest, pure wheel math
yarn typecheck
```

## How it works

**The wheel is one number.** A single `MotionValue` holds the rotation in
degrees. Everything else derives from it: each body's position, its scale and
opacity by angular proximity to the focal direction, the star field's rotation,
the sky gradient, and the compass rose. Nothing about the wheel lives in React
state, so dragging never triggers a re-render — only the active category index
does, and only when it actually changes.

**The sky interpolates, it doesn't switch.** Each category carries a
three-stop time-of-day palette. `Backdrop` maps rotation onto a continuous
position in that list and interpolates all three stops through a
`useMotionTemplate` gradient, so the sky glides through dusk between categories
instead of cross-fading between two fixed images.

**Night follows the sun.** Star opacity is a cosine of the wheel's position, so
stars vanish at the sun (index 0) and reach full brightness half a turn away,
smoothly everywhere between. The star field itself is a uniform-density *disc*
rather than a ring: a disc is rotation-invariant, so spinning it can never open
a gap at any angle. Positions come from a deterministic hash so server and
client agree.

**Rotation accumulates.** Scrolling piles up turns without bound. Snapping to a
category therefore targets the equivalent angle nearest the current rotation
(`nearestEquivalentAngle`), so clicking the sun after five turns of scrolling
settles at 1800°, not 0°.

**Bodies are both draggable and clickable.** A press on a body starts the same
sky drag as a press on empty space; only a release that barely moved counts as
a selection. Otherwise, making bodies clickable would swallow every drag that
happened to start on one.

## Layout

    app/lib/wheel.ts       geometry + cycle math, pure and tested
    app/data/portfolio.ts  categories, palettes, projects
    app/components/        Backdrop (sky), RadialNav (wheel), CelestialBody,
                           CategoryCard, PortfolioExperience (composition)

The pure math lives in `app/lib/wheel.ts` specifically so it can be tested
without a DOM; `RadialNav` is then just the binding to motion values and pointer
events.

## Deploying

Set `NEXT_PUBLIC_SITE_URL` to the canonical origin. It backs `metadataBase`,
the sitemap, `robots.txt`, and the OpenGraph card.
