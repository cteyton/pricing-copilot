// Inline glossary shared by all pages.
// Markup: <button type="button" class="gl" data-gl="input"></button> next to a term.
// The button gets a "?" and an aria-label; clicking, focusing with Enter, or hovering opens a
// short definition. Esc, a click outside, or leaving the button closes it.
(() => {
  const GLOSSARY = {
    token: ['Token', 'A chunk of text a model reads or writes, about ¾ of an English word. Prices are quoted in AI credits per million tokens.'],
    input: ['Input tokens', 'Everything sent to the model: your prompt, open files, conversation history. Coding agents send a lot of these.'],
    output: ['Output tokens', 'What the model writes back: code, answers, reasoning. Usually 3–8× the price of input.'],
    credit: ['AI credit', 'GitHub Copilot bills models in AI credits. 1 credit = $0.01, so 1,000 credits = $10.'],
    mix: ['Input / output mix', 'Your share of input vs output tokens. Coding agents are about 90% input: they re-read files and history at every step and write comparatively little.'],
    blended: ['Blended price', 'One price per million tokens, in AI credits, weighting the input and output prices by the mix: r × input + (1 − r) × output.'],
    long: ['Long context', 'Some models charge a higher rate once a single prompt passes a size threshold (e.g. 272K tokens). Drawn as outlined bars.'],
    class: ['Class', 'GitHub’s own capability tiers: Lightweight for quick tasks, Versatile for everyday work, Powerful for the hardest problems.'],
    multCheap: ['×N', 'How many times the cheapest model in view: ×10 means ten times the price.'],
    moreTokens: ['N× more', 'Tokens compared with the most expensive model in view, which buys the fewest: 10× more means ten times as many tokens for the same budget. More tokens is not the same as better work: see page 3.'],
    workday: ['Working day', 'The monthly budget split over 21 working days (5 days a week), to show what one day of work can use.'],
    request: ['Agent request', 'Counted as 50,000 tokens: one agent step that sends files and history and gets an answer. Real sizes vary widely.'],
    index: ['Artificial Analysis index', 'A composite benchmark score: higher is better. Coding Index covers coding tasks; Intelligence Index adds reasoning, knowledge and maths.'],
    frontier: ['Pareto frontier', 'Models that no cheaper model beats on the score. A model below the line has a cheaper alternative that scores at least as well.'],
    cached: ['Cached input', 'Input the provider has seen recently (the same files and history at the start of the prompt) and reuses, billed at a fraction of the input price. Agents resend a lot of the same context, so much of their input can be cached.'],
    cachewrite: ['Cache write', 'What some providers charge to store a prompt prefix the first time, so later requests can read it at the cached price. Empty when GitHub lists no such charge.'],
    perdollar: ['Coding points per 100 credits', 'Coding Index divided by the blended price per million tokens, in hundreds of credits: how much benchmark score 100 credits ($1) buy. Higher is better value, not a better model.'],
    log: ['Log scale', 'Each step right multiplies the price (×2, ×10) instead of adding to it, so cheap and pricey models fit on one axis.'],
  };

  const css = `
.gl {
  appearance: none; display: inline-grid; place-items: center; vertical-align: 1px;
  width: 15px; height: 15px; padding: 0; margin-left: 5px;
  border: 1px solid var(--rule-strong); border-radius: 50%; background: transparent;
  font: 500 10px/1 var(--font-sans); letter-spacing: 0; text-transform: none; color: var(--ink-3);
  cursor: help; transition: color .15s, border-color .15s;
}
.gl-t { white-space: nowrap; }
.gl:hover, .gl[aria-expanded="true"] { color: var(--ink); border-color: var(--ink-2); }
.gl:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.gl-pop {
  position: absolute; z-index: 20; max-width: 280px;
  background: var(--surface); border: 1px solid var(--rule-strong); border-radius: 10px;
  padding: 12px 14px; box-shadow: 0 8px 24px rgb(0 0 0 / .1);
  font: 400 13px/1.45 var(--font-sans); color: var(--ink-2); text-transform: none; letter-spacing: 0;
}
.gl-pop b { display: block; color: var(--ink); font-weight: 500; margin-bottom: 4px; }`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.append(style);

  const pop = document.createElement('div');
  pop.className = 'gl-pop';
  pop.id = 'gl-pop';
  pop.setAttribute('role', 'tooltip');
  pop.hidden = true;
  document.body.append(pop);

  let open = null, pinned = false;
  function show(btn, pin) {
    const entry = GLOSSARY[btn.dataset.gl];
    if (!entry) return;
    if (open && open !== btn) open.setAttribute('aria-expanded', 'false');
    open = btn; pinned = pin;
    const b = document.createElement('b');
    b.textContent = entry[0];
    pop.replaceChildren(b, entry[1]);
    pop.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    const r = btn.getBoundingClientRect();
    const w = pop.offsetWidth;
    const left = Math.max(8, Math.min(r.left + scrollX - 12, scrollX + document.documentElement.clientWidth - w - 8));
    pop.style.left = left + 'px';
    pop.style.top = (r.bottom + scrollY + 8) + 'px';
  }
  function hide() {
    if (open) open.setAttribute('aria-expanded', 'false');
    open = null; pinned = false;
    pop.hidden = true;
  }

  // Buttons can be created later (re-rendered sentences): bind() labels them, events are delegated.
  function bind(btn) {
    const entry = GLOSSARY[btn.dataset.gl];
    if (!entry) return;
    btn.type = 'button';
    btn.textContent = '?';
    btn.setAttribute('aria-label', 'What is ' + entry[0] + '?');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-describedby', 'gl-pop');
  }
  window.glossaryBind = bind;
  document.querySelectorAll('.gl[data-gl]').forEach(bind);
  const glOf = t => (t instanceof Element ? t.closest('.gl[data-gl]') : null);
  document.addEventListener('click', e => {
    const btn = glOf(e.target);
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    open === btn && pinned ? hide() : show(btn, true);
  }, true);
  document.addEventListener('mouseover', e => { const btn = glOf(e.target); if (btn && !pinned) show(btn, false); });
  document.addEventListener('mouseout', e => { const btn = glOf(e.target); if (btn && !pinned && open === btn) hide(); });
  document.addEventListener('click', e => { if (open && !pop.contains(e.target)) hide(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) { const b = open; hide(); b.focus(); } });
  addEventListener('resize', hide);
})();
