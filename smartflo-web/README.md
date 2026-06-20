# SmartFlow — web

Portfolio site for the SmartFlow reinforcement-learning traffic-signal
controller. Single-page, React + Vite + TypeScript + Tailwind, with Framer
Motion for scroll/hover motion (fully `prefers-reduced-motion` aware).

All figures shown on the site are transcribed from the repository
(`backend/results/comparison.csv`, produced by `backend/rl/evaluate.py`) — none
are invented. See `src/data/results.ts` and `src/data/content.ts`.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run preview  # serve the production build
npm run lint
```

## Design system

"Transit Blueprint" — a light, editorial engineering-paper direction. Tokens
live in `tailwind.config.js`:

- **Type:** Fraunces (display) · Public Sans (body) · Space Mono (data)
- **Colour:** warm paper `#F4F1EA` / ink `#14171A`, one "go" accent `#157F5B`,
  amber `#E08A00` (caution) and red `#C2453C` (reserved for emergency).

## Structure

```
src/
├── components/   section + primitive components
├── data/         results.ts (real metrics) · content.ts (copy + facts)
├── lib/          motion variants
├── App.tsx       page composition
└── index.css     base styles, focus, reduced-motion
```

## Personal links

`src/data/content.ts → LINKS` holds the owner's name, GitHub, LinkedIn and email.
Replace the `[[placeholder]]` values before publishing.
