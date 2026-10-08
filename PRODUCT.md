# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences, in this order:

- **Business analysts and other non-technical Copilot users** (primary for the start page). They use GitHub Copilot, including agent mode, to write and analyse rather than to ship code: stories, acceptance criteria, specs, summaries, the odd SQL query. They do not follow LLM news and do not want to. Their job: pick a model that does the task well enough without running out of their monthly credits.
- **Developers** who use Copilot agent mode to ship code (tests, reviews, debugging, multi-file features) and want the same quick answer for their tasks; the start page offers them their own task list behind a role switch.
- **Power users** who already follow model releases and want the full picture: per-token prices, budgets, benchmark scores, side-by-side specs (the five detail pages).

## Product Purpose

Explain what GitHub Copilot models cost in AI credits and help people choose one. Success for the primary audience: they open the site, say what they are about to do, and leave knowing which model to use and roughly how far their budget goes with it, without learning what a token is.

## Positioning

Built on GitHub's own Copilot price list (refreshed daily) joined to Artificial Analysis scores, so every recommendation is computed from current prices and scores rather than hand-picked.

## Operating Context

- Each user has a monthly budget of **6,000 AI credits** by default (1 credit = $0.01). Inferred from the brief: monthly, per person.
- Usage is mostly agent mode: one agent request is counted as ~50,000 tokens at a 90% input / 10% output mix (`REQUEST_TOKENS` in `shared.js`).
- Copilot lets the user pick the model per conversation; the site informs that choice, it does not change any setting.

## Capabilities and Constraints

- Static site on GitHub Pages: plain HTML/CSS/JS, no build, no dependencies. Data in `data/*.csv|json`, fetched over HTTP.
- UI language: English (confirmed, including the start page).
- Pages: start page (`index.html`, simple view), then 1 · Cost (`cost.html`), 2 · Budget (`tokens.html`), 3 · Value (`performance.html`), 4 · Compare (`compare.html`), 5 · Timeline (`timeline.html`).
- Prices change; recommendations must be derived from the data at load time, never hard-coded model names.
- Scores are benchmarks (coding, general intelligence), not measurements of the start page's tasks; say so wherever a recommendation leans on them.
- Promotional prices (a `note` mentioning a promotion) must be flagged where they drive a recommendation.

## Evidence on Hand

- `data/models.csv`: GitHub Copilot list prices per model and tier.
- `data/scores.csv`: Artificial Analysis Coding and Intelligence indexes (attribution required).
- `data/release-dates.csv`: provider release dates (hand-maintained). There is no price history: the timeline uses today's prices.
- No user research, testimonials or usage telemetry: do not invent usage numbers beyond the stated 50K-token request assumption.

## Product Principles

1. Answer the question the reader has ("which one, and can I afford it?") before teaching vocabulary.
2. Every number traces back to the price list, the scores, and one stated assumption.
3. Start cheap, step up when the answer is not good enough: the site recommends the cheapest model that is good enough, not the best one.
4. Depth stays one click away; the simple view never hides that the detail pages exist.

## Accessibility & Inclusion

Light and dark themes, keyboard-operable controls, WCAG AA contrast, works at phone width.
