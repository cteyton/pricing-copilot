---
name: Copilot pricing
description: What GitHub Copilot models cost in AI credits, and which one to use.
colors:
  paper: "#fafaf9"
  sheet: "#ffffff"
  ink: "#141413"
  ink-soft: "#5b5a56"
  ink-faint: "#6f6d68"
  rule: "#e9e8e4"
  rule-strong: "#d6d4ce"
  wash: "#f3f2ef"
  paper-dark: "#151514"
  sheet-dark: "#1c1c1b"
  ink-dark: "#f4f3ef"
  ink-soft-dark: "#b9b7b0"
  ink-faint-dark: "#85837d"
  rule-dark: "#2a2a28"
  rule-strong-dark: "#3a3a37"
  wash-dark: "#222221"
  openai-blue: "#2a78d6"
  anthropic-clay: "#eb6834"
  google-green: "#1baf7a"
  microsoft-amber: "#eda100"
  xai-pink: "#e87ba4"
  moonshot-green: "#008300"
  other-stone: "#8f8d87"
  better-green: "#1a7a4c"
  worse-rust: "#b2431f"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(28px, 4.2vw, 40px)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  display-start:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(30px, 4.6vw, 46px)"
    fontWeight: 500
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  takeaway:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.45
  lede:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  control:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1
  figure:
    fontFamily: "Geist Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1
    fontFeature: "tnum"
  data-label:
    fontFamily: "Geist Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  hairline: "2px"
  segment: "6px"
  field: "8px"
  tooltip: "10px"
  panel: "12px"
  answer: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  gutter: "clamp(16px, 3vw, 40px)"
components:
  filter-button:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0 10px 0 12px"
    height: "34px"
  filter-button-open:
    backgroundColor: "{colors.wash}"
  filter-panel:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.panel}"
    padding: "14px 16px 16px"
  segmented:
    backgroundColor: "{colors.wash}"
    rounded: "{rounded.field}"
    padding: "3px"
  segmented-option:
    textColor: "{colors.ink-soft}"
    typography: "{typography.control}"
    rounded: "{rounded.segment}"
    padding: "7px 12px"
  segmented-option-selected:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
  chip:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "7px 12px 7px 10px"
  chip-off:
    textColor: "{colors.ink-faint}"
  step-rail:
    backgroundColor: "{colors.wash}"
    rounded: "{rounded.panel}"
    padding: "3px"
  step-current:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "9px"
    padding: "8px 12px 9px"
  chart-frame:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.panel}"
    padding: "8px 4px 4px"
  tooltip:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tooltip}"
    padding: "14px 16px"
  answer-card:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.answer}"
    padding: "clamp(20px, 3vw, 32px)"
---

# Design System: Copilot pricing

## Overview

**Creative North Star: "The Price Ledger"**

The site reads like a well-kept ledger: warm off-white paper by day, near-black paper by night, neutral ink, and numbers set in a mono face so they line up and compare at a glance. Nothing on the page competes with the figures. The interface is quiet so that a price gap of 47× or a score of 79.1 stands out on its own.

Colour is rationed. The only hues are the six provider colours, which identify a model wherever it appears (a chart dot, a bar, a chip, a swatch in a table), plus a green/rust pair that marks better and worse on the comparison table. Everything else is ink on paper, separated by hairline rules and one-step tonal washes rather than boxes and shadows.

Density is that of a careful reference work: generous around the question and its answer, tight inside controls and tables. Every page leads with a plain-language question as its heading, answers it in a bold takeaway sentence, then shows the chart. Controls stay out of the way: assumptions and filters fold into a single bar of summary buttons, and chart settings sit in a small toolbar above the chart.

**Key Characteristics:**
- Neutral paper and ink in two themes (light and dark), switched by the reader or the OS.
- Six provider hues as the only decorative colour; they always mean "this provider".
- Geist for words, Geist Mono for figures, with tabular numerals everywhere numbers are compared.
- Flat surfaces divided by 1px rules; shadows only on things that float.
- Pills for things you toggle or open, softly rounded rectangles for things that hold content.

## Colors

A neutral warm-grey ledger with six identifying provider hues and nothing else competing.

### Primary
- **Ledger Ink** (ink / ink-dark): the text colour and, in the absence of a brand accent, the "primary" colour: selected states, focus rings (2px solid), the slider thumb, emphasis in takeaways. In dark mode it is a warm off-white, never pure white.

### Secondary
- **Provider hues** (openai-blue, anthropic-clay, google-green, microsoft-amber, xai-pink, moonshot-green, other-stone): identity, not decoration. Each marks one provider's models across every chart, bar, chip swatch and table dot. The dark theme shifts each slightly (for example Anthropic Clay to `#d95926`) to hold contrast on dark paper.

### Tertiary
- **Better Green / Worse Rust** (better-green, worse-rust): only on the comparison table, for the gap to the baseline column. Dark-mode values are `#4cc08a` and `#ec7a55`.

### Neutral
- **Paper** (paper / paper-dark): the page background.
- **Sheet** (sheet / sheet-dark): raised content: the chart frame, cards, panels, tooltips, the selected segment and step.
- **Ink Soft** (ink-soft): ledes, secondary values, unselected control text.
- **Ink Faint** (ink-faint): axis ticks, field labels, hints, counts. Still meets AA on paper.
- **Rule** (rule): hairline dividers, chart gridlines, section borders.
- **Rule Strong** (rule-strong): control outlines: pills, inputs, tooltips.
- **Wash** (wash): one tonal step below paper: segmented-control tracks, the step rail, hover fills.

### Named Rules
**The Provider-Only Hue Rule.** A saturated colour on screen means a provider. Don't use the provider hues for status, emphasis or decoration, and don't introduce a brand accent.

**The Two-Theme Parity Rule.** Every colour token exists in both themes, and the dark values are defined under both `prefers-color-scheme: dark` (unless the reader chose light) and an explicit `data-theme="dark"`.

## Typography

**Display Font:** Geist (with ui-sans-serif, system-ui fallback)
**Body Font:** Geist
**Label/Mono Font:** Geist Mono (with ui-monospace, SF Mono, Menlo)

**Character:** a neutral grotesque that keeps out of the way, paired with its own mono for numbers, so words and figures share one voice but figures align in columns.

### Hierarchy
- **Display** (500, clamp(28px, 4.2vw, 40px), 1.1, −0.025em): the page's question as its H1. The start page goes larger (clamp(30px, 4.6vw, 46px), −0.03em). Always `text-wrap: balance`.
- **Takeaway** (400, 17px, 1.45): the bold-led answer sentence above each chart, max 70ch. Key figures and model names in 600.
- **Lede** (400, 15px, 1.5; 16px on the start page): the intro paragraph, max ~64ch, in Ink Soft.
- **Body** (400, 14px, 1.5): explanations, tables (13px), tooltips (13px).
- **Control** (500, 13px, 1): segmented options, filter buttons, chips, nav step names.
- **Figure** (Geist Mono 500, 11–13px, tabular numerals): prices, credits, counts, axis ticks, mix readouts.
- **Data label** (Geist Mono 500, 11px, 0.08em, uppercase): field and table labels next to data (BUDGET, TOKENS, MODEL).

### Named Rules
**The Tabular Figures Rule.** Any number a reader might compare with another number is set with tabular numerals, in Geist Mono when it stands alone.

**The Data Label Rule.** Uppercase mono labels name a piece of data or a table group. They never sit above a heading as a kicker.

## Layout

Pages sit in a centred column up to 110rem wide (the start page's content is 76rem, but its header breaks out to the same width so the nav lines up across pages), with a fluid side gutter of clamp(16px, 3vw, 40px).

Detail pages are a single column in this order: masthead, intro (question and lede), filter bar, then content (takeaway, chart toolbar, legend, chart, explainer, table, footer). There is no sidebar: charts use the full width. The start page is a two-column task picker with a sticky answer card on the right, folding to one column on narrow screens.

Spacing follows a 4/8 rhythm: 8px between controls, 16px inside groups, 24px between bands (intro to filter bar, filter bar to content), 48px before the explainer and footer. Expandable sections and the footer are separated by a 1px rule with 20px above the content.

Responsive behaviour is driven by container queries on the masthead (it narrows the nav) and a 640px media query for the filter bar (panels go full width) and toolbar (group labels hide). Everything works at 390px with no horizontal page scroll.

## Elevation & Depth

Flat by default. Surfaces are separated by hairline rules and by the paper → wash → sheet tonal steps, not by shadow. Shadows appear on exactly two kinds of thing: elements that float above the page, and the one selected option in a segmented control or the step rail.

### Shadow Vocabulary
- **Selected lift** (`box-shadow: 0 1px 2px rgb(0 0 0 / .06)`, plus a 1px rule ring on segments): the current segment or current step, lifted just enough to read as "pressed in front".
- **Tooltip** (`box-shadow: 0 8px 24px rgb(0 0 0 / .08)`): chart tooltips and glossary pop-ups.
- **Floating panel** (`box-shadow: 0 12px 32px rgb(0 0 0 / .12), 0 2px 6px rgb(0 0 0 / .05)`): filter-bar panels and the folded nav list.

### Named Rules
**The Float-Only Shadow Rule.** If it doesn't float above the page or mark the current choice, it has no shadow. Cards, the chart frame and the answer card are bordered sheets, not lifted ones.

## Shapes

Two shape families. **Pills** (999px) are for things you press: filter buttons, chips, the theme button, the folded nav button, tags. **Soft rectangles** are for things that hold content, with radius growing with size: 6px for segments, 8px for inputs and segmented tracks, 10px for tooltips, 12px for the chart frame, panels and the step rail, 16px for the start page's answer card. Borders are always 1px; unselected filter chips use a dashed outline to read as "off".

## Components

### Buttons
- **Shape:** pill (999px) for filter and theme buttons; text-link buttons have no box.
- **Filter button:** Sheet background, 1px Rule Strong outline, 34px tall. It shows a faint key and a bold value (`Mix 90 / 10`, `Provider 5 of 6`) and a 12px chevron that turns 180° when open. Provider buttons add up to four overlapping colour dots for a partial choice.
- **Hover / Focus:** hover fills with Wash; open adds a Wash fill and an Ink Faint outline; focus is a 2px Ink ring offset 2px.
- **Link button:** Ink Soft text with a Rule Strong underline offset 3px, turning Ink on hover (Reset filters, Back to 90/10, All · None).

### Segmented control
- **Style:** Wash track (8px radius, 3px padding, 1px Rule border); options are 13px/500 Ink Soft text.
- **State:** the selected option becomes a Sheet tile with Ink text and the selected lift. Selection is announced through `aria-pressed`.

### Chips
- **Style:** pill, Sheet background, Rule Strong outline, 13px text, an 8px provider swatch on the left and a mono count on the right.
- **State:** on is solid; off is transparent with a dashed outline, Ink Faint text and a hollow swatch; zero-count chips fade to 50%.

### Cards / Containers
- **Corner Style:** 12px (chart frame, panels), 16px (answer card).
- **Background:** Sheet on Paper.
- **Shadow Strategy:** none at rest (see Float-Only Shadow Rule).
- **Border:** 1px Rule.
- **Internal Padding:** 14–16px for panels and tooltips, clamp(20px, 3vw, 32px) for the answer card.

### Inputs / Fields
- **Style:** Sheet background, 1px Rule Strong outline, 8px radius, mono 13px value with tabular numerals.
- **Focus:** 2px Ink outline offset 2px. Range sliders use Ink as their accent colour.

### Navigation
- **Brand:** the GitHub mark and "Copilot pricing" with the start page's question under it in Ink Faint; it is the link to the start page.
- **Steps:** the five detail pages in a Wash rail (12px radius). Each step shows its mono number, its short name (13px/500) and its question (12px, Ink Faint, balanced wrap). The current step becomes a Sheet tile with the selected lift; hover brightens the text only.
- **Narrow:** the brand's question hides first; under ~860px of masthead width the steps fold into one pill naming the current page, which opens the same list as a floating panel.

### Filter bar (signature)
The band between the intro and the content, bounded by rules above and below. Assumptions (Budget, Mix, Threshold) come first, then a 1px divider, then model filters (Provider, Class, Long-context). The "Showing N of M" count and Reset sit at the right edge. Each button opens a floating panel with a 13px/500 heading (with its glossary "?"), the control itself, and at most one 12px hint. One panel is open at a time; Esc or a click outside closes it and focus returns to the button.

### Chart toolbar
A row of labelled segmented controls directly above the legend and chart, for settings that change how the chart is drawn (Price/Score, Coding/Intelligence, Linear/Log, Month/Working day, ordering). Labels are 13px Ink Faint and hide under 640px.

## Do's and Don'ts

### Do:
- **Do** lead every page with its question as the H1 and a bold takeaway sentence before the chart.
- **Do** keep provider colours consistent across every view: the same model is the same hue on every page.
- **Do** set compared numbers in Geist Mono with tabular numerals.
- **Do** put assumptions and model filters in the filter bar as summary buttons, and chart-drawing settings in the toolbar above the chart.
- **Do** move explanations into the glossary "?" pop-up or a filter panel's single hint line instead of leaving them under every control.
- **Do** define every colour for both themes and check AA contrast in each.

### Don't:
- **Don't** add a brand accent colour or use provider hues for status or emphasis.
- **Don't** put a shadow on a resting card, chart or table: only floating layers and the current selection are lifted.
- **Don't** put an uppercase mono label above a heading as a kicker.
- **Don't** bring back a sidebar of stacked filters or a tab strip that shrinks its labels as the window narrows.
- **Don't** mention scripts, data files or maintenance steps in visible copy.
