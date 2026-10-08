# Copilot Model Pricing

`index.html` is the start page, a simple view for readers who don't follow model news (business analysts, occasional users). They pick what they are about to do (six tasks, from rewriting to hard problems) and get one suggested model: the cheapest whose Artificial Analysis score (Intelligence Index, or Coding Index for code tasks) reaches a share of the top Copilot score set per task in `TASKS` (60% for rewriting up to 98% for hard problems). It also shows a cheaper and a stronger option, and how many agent requests a monthly budget buys with each (default 6,000 credits, editable, `?credits=` and `?task=` in the URL, saved under `copilot-start`). Below: every model banded by credits per request (under 5, 5–25, over 25) with a 1–5 quality rating and requests per month, three habits that save credits, and the method. Older versions (same provider and line, e.g. Claude Sonnet 4.6 next to Claude Sonnet 5.5, matched by the name without its version number) are never suggested and are folded under a "Show N older versions" button in each band, dimmed when shown. No model name is hard-coded: suggestions are recomputed from the data at load.

`cost.html` is the detail page on prices: a chart of GitHub Copilot model prices per million tokens, in AI credits (1 credit = $0.01, the unit Copilot budgets are counted in) on a linear scale, so the gaps between models are visible. Bars are ranked by price by default or grouped by model family, with Input and Output checkboxes (both bars shown by default, on a shared scale, so the output premium is visible) and filters by provider, class (Lightweight / Versatile / Powerful) and long-context tiers (hidden by default), each chip counting the entries it would show. Each bar shows ×N against the cheapest model in view for the same token type.

`tokens.html` is a companion page: how many tokens a budget of AI credits buys with each model (default 6,000 credits = $60, 1 credit = $0.01). It blends each model's prices by an input/output mix (default 90% input / 10% output): `tokens = credits ÷ (r × input + (1 − r) × output) × 1M`, prices in credits, and draws one stacked bar per model (input tint, then output solid) on a linear token scale, with "N× more" tokens than the priciest model in view (worded differently from page 1's ×N, which counts times the cheapest price, so the two aren't confused). Budget and mix are adjustable and reflected in the URL (`tokens.html?credits=10000&in=80`). List prices only: caching is not included. Long-context tiers are hidden by default.

`performance.html` plots each model's blended price in credits per 1M tokens (same 90/10 mix, adjustable, `performance.html?in=80`) on a linear x axis by default (Scale switch: Log spreads out the cheap models, `performance.html?scale=log`) against the [Artificial Analysis](https://artificialanalysis.ai/) Coding Index (default, coding is the use case) or Intelligence Index (Score switch, `performance.html?score=intelligence`), and joins the Pareto frontier: models that score higher than every cheaper one. Default tier only (no long-context rates, no caching). Models with no score for the selected index are listed under the chart, tagged *pending* (on Artificial Analysis, not scored yet) or *not on AA* (`null` in the mapping).

`compare.html` puts 2 to 5 models side by side as a spec sheet: one column per model, one row per attribute, grouped in sections (Model, Scores, Prices, Long context when a chosen model has one, At your mix, Notes). It shows every field we hold: both Artificial Analysis indexes with the variant used and the rank among all scored Copilot models, input, cached input (with the discount), cache write, output and output ÷ input, long-context rates, and at the mix: blended price, AI credits per agent request, coding points per 100 credits and whether the model is on the coding frontier. The best value in each row gets a ★; every other column shows its gap to the baseline column (first model by default, ×N for prices, points for scores), coloured better or worse. A *Differences only* switch hides rows where all chosen models agree. Models are picked with a filterable list (type, ↑/↓, Enter). The selection is in the URL (`compare.html?m=GPT-6%20Sol&m=Claude%20Opus%205.5&base=1&in=80`) and in the shared state (`compare`), so it follows the reader; with neither, the page starts with the top Coding Index of each class. `?focus=<model>` from another page's pinned tooltip adds that model (replacing the last one when 5 are shown), and page 3 links its picks to this page.

All pages share a tab nav at the top, phrased as the questions they answer: the start page (Which model should I use?), then the detail pages numbered in reading order (1 · What does a model cost? · 2 · What does my budget buy? · 3 · Which model is worth it? · 4 · How do they compare?, shortened to Start · Cost · Budget · Value · Compare on phones); its CSS (`.site-nav`) is duplicated in each page, so keep the five copies in sync.

Each page opens the chart with a plain-language takeaway sentence (`#takeaway`), recomputed on every render: the price spread (page 1), the budget in agent requests of 50K tokens (page 2), the top scorer and the cheapest frontier model within 90% of its score (page 3), the best coder among the chosen models and how much cheaper the cheapest one is per agent request (page 4).

`shared.js` (loaded before each page's script) holds what the pages share:
- **State that follows the reader**: the input/output mix, the provider and class filters and the compare shortlist live in one `localStorage` key, `copilot-shared`; it overrides each page's own saved state, and URL parameters override both. A page that lists fewer providers or classes (`performance.html` only lists scored models) leaves the others' state untouched when it saves. Page-specific settings (view, budget, score, long context) stay in each page's key.
- **Compare on other pages**: hovering a row or dot previews its tooltip; clicking it (or Enter) pins it, and the pinned tooltip links to the same model on the other pages with `?focus=<model>`. The target page shows the model even if filters hid it, scrolls to it and pins it (an unscored model is highlighted in the "Not scored yet" list). `focus` is removed from the URL once used.
- `REQUEST_TOKENS` (50K, one agent step), used for the "Agent requests" unit on `tokens.html` and the "1 agent request" tooltip line on `cost.html`.

`cost.html` also shows a dismissable "New here? The basics" strip (three cards linking to the other pages; hidden state is per viewer, `copilot-basics-hidden`). `performance.html` shades the dominated area under the frontier and shows three picks from the frontier: Budget (cheapest with ≥ 75% of the top score), Balanced (≥ 90%) and Best score. A pick whose price is promotional (its `note` mentions a promotion) is flagged, and the tooltip shows the model's note. The takeaway counts the models without the selected index and links to the other index when some of them have it; a `?focus=` on such a model switches the index.

`glossary.js` (shared, loaded by all pages) adds short definitions to jargon: put `<button class="gl" data-gl="input"></button>` after a term; the keys are in its `GLOSSARY` object. Buttons created at render time work too (events are delegated; call `glossaryBind(btn)` to label them).

All pages load `data/models.csv` with `fetch()`, so it must be served over HTTP (GitHub Pages in production). Locally:

```sh
python3 -m http.server   # then open http://localhost:8000
```

No build or dependencies (Geist fonts load from Google Fonts, with a system fallback).

## Data

- Source: https://docs.github.com/fr/copilot/reference/copilot-billing/models-and-pricing (raw markdown: `https://docs.github.com/api/article/body?pathname=/fr/copilot/reference/copilot-billing/models-and-pricing`). The scraper parses the French page, but the UI is in English and links to the English doc (https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing).
- `data/models.csv`: one row per model and tier, prices in USD per million tokens (the pages convert them to AI credits for display, keeping USD as a secondary figure in tooltips and on `compare.html`). Columns: `provider,family,model,category,status,tier,threshold,input,cachedInput,cacheWrite,output,note`. `category` (Lightweight / Versatile / Powerful) and `status` (release status, e.g. GA) are taken as-is from the page.
- `data/meta.json`: source URL and `updated`, the date the data last changed (shown in the footer).
- `family` drives the grouping: version for OpenAI and xAI (GPT-6, GPT-5.6, Grok 4.7…), product line for Claude (Opus, Sonnet, Haiku, Fable). Derived by `FAMILY_RULES` in the script.
- Each "Long context" tier is its own row (`tier=long`) and is drawn as an outlined bar with a `long context > …` suffix.
- `cachedInput` and `cacheWrite` are only displayed on `compare.html`; the other pages use list input and output prices.
- A provider not in the page's color list shows up automatically in a neutral grey.

## Scores (Artificial Analysis)

- Source: the free API `GET https://artificialanalysis.ai/api/v2/data/llms/models` (`x-api-key` header, 1,000 requests/day). The key must never reach client-side code, so the page only reads the committed `data/scores.csv`. Attribution to https://artificialanalysis.ai/ is required and shown in the footer.
- `data/aa-mapping.json`: hand-maintained map from the Copilot `model` name to the Artificial Analysis base name (its `name` without the parenthesised effort, e.g. `Claude 4.5 Haiku`). `null` marks a model absent from Artificial Analysis. Add an entry when Copilot adds a model; the script warns about missing ones.
- Effort: Artificial Analysis lists one entry per reasoning effort. For each index separately, the script takes **High**, else the nearest variant that has that index: High > Xhigh > Medium > Max > Low > Reasoning (unlabeled) > Minimal > Non-reasoning.
- `data/scores.csv`: one row per Copilot model with at least one index. Per index (`coding`, `intelligence`): the score, then `<index>Effort`, `<index>AaName`, `<index>AaId` of the variant used; empty when Artificial Analysis has no score yet.
- `data/scores-meta.json`: `updated`, the date the scores last changed.

```sh
node --env-file=.env scripts/update-scores.mjs   # needs ARTIFICIAL_INTELLIGENCE_API_KEY in .env (git-ignored)
```

Run manually (not in CI). Same safeguards as the pricing script: nothing is written when unchanged or when fewer than half the previous models match. `SCORES_SOURCE=path/to/response.json` parses a saved API response instead.

## Update

```sh
./update.sh   # pricing then scores (needs .env for the scores step)
```

Or each script on its own:

```sh
node scripts/update-pricing.mjs
```

Fetches the page, rewrites `data/models.csv`, and touches `data/meta.json` only when the data changed. It logs added, removed and repriced models. It exits with an error and writes nothing if the page can't be parsed (missing columns, unreadable price, or fewer than half the previous rows). `PRICING_SOURCE=path/to/page.md` parses a local file instead.

`.github/workflows/update-pricing.yml` runs it every day at 06:17 UTC (and on demand via *Run workflow*) and commits `data/` when it changed. That push redeploys GitHub Pages.
