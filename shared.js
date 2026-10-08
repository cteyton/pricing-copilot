// Shared by the pages, loaded before each page's own script:
// - state that follows the reader from page to page (mix, providers, classes, the compare shortlist),
// - links to the same model on another page (?focus=<model>),
// - tooltips that pin on click so those links can be used,
// - and the styles for these pieces.
window.CopilotShared = (() => {
  const KEY = 'copilot-shared';
  // One agent step: files, history and prompt sent, an answer back. A rough size; real ones vary widely.
  const REQUEST_TOKENS = 50000;
  // Prices are held in USD; the pages show them in AI credits (1 credit = $0.01).
  const CREDIT_USD = 0.01;
  // USD amount → credits: one decimal below 10 (7.5), a whole number above (2,500).
  function credits(usd) {
    const c = Math.round(usd / CREDIT_USD * 1e4) / 1e4;
    return c < 10 && c % 1 ? c.toFixed(c * 10 % 1 ? 2 : 1) : Math.round(c).toLocaleString('en-US');
  }
  // Secondary USD figure next to a credit value.
  const usd = v => '$' + (v < 1 && Math.round(v * 1e4) % 100 ? v.toFixed(3) : v.toFixed(2));
  const PAGES = [
    { id: 'cost', href: 'cost.html', label: '1 · Cost' },
    { id: 'budget', href: 'tokens.html', label: '2 · Budget' },
    { id: 'value', href: 'performance.html', label: '3 · Value' },
    { id: 'compare', href: 'compare.html', label: '4 · Compare' },
    { id: 'timeline', href: 'timeline.html', label: '5 · Timeline' },
  ];

  const css = `
.tip.pinned { pointer-events: auto; border-color: var(--ink-3); }
.tip .t-links { margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--rule);
  display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; font-size: 12px; color: var(--ink-3); }
.tip .t-links a { color: var(--ink); font-weight: 500; text-underline-offset: 3px; text-decoration-color: var(--rule-strong); }
.tip .t-links a:hover { text-decoration-color: currentColor; }
.tip .t-hint { margin-top: 10px; font-size: 11.5px; color: var(--ink-3); }
@keyframes focus-flash { from { box-shadow: 0 0 0 3px var(--ink-3); } to { box-shadow: 0 0 0 3px transparent; } }`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.append(style);

  // Disclosure panels: the narrow-screen page list and the filter bar's panels.
  // One open at a time; Esc or a click outside closes it.
  let openBtn = null;
  function closePanel(focus) {
    if (!openBtn) return;
    const btn = openBtn;
    openBtn = null;
    btn.setAttribute('aria-expanded', 'false');
    if (btn.classList.contains('steps-btn')) btn.closest('.site-nav').classList.remove('open');
    else document.getElementById(btn.getAttribute('aria-controls')).hidden = true;
    if (focus) btn.focus();
  }
  function openPanel(btn) {
    closePanel(false);
    openBtn = btn;
    btn.setAttribute('aria-expanded', 'true');
    if (btn.classList.contains('steps-btn')) { btn.closest('.site-nav').classList.add('open'); return; }
    const pop = document.getElementById(btn.getAttribute('aria-controls'));
    pop.hidden = false;
    // Flip to the right edge when the panel would overflow the window.
    pop.classList.remove('end');
    if (pop.getBoundingClientRect().right > document.documentElement.clientWidth - 16) pop.classList.add('end');
    pop.querySelector('input, button:not(.gl)')?.focus({ preventScroll: true });
  }
  document.querySelectorAll('.steps-btn, .fb-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openBtn === btn ? closePanel(false) : openPanel(btn);
    });
  });
  document.addEventListener('click', e => {
    if (!openBtn || !e.target.isConnected) return;
    const panel = openBtn.classList.contains('steps-btn') ? openBtn.closest('.site-nav') : document.getElementById(openBtn.getAttribute('aria-controls'));
    if (!panel.contains(e.target) && !e.target.closest?.('.gl-pop')) closePanel(false);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && openBtn && document.getElementById('gl-pop')?.hidden !== false) closePanel(true); });
  document.addEventListener('focusin', e => {
    if (!openBtn) return;
    const panel = openBtn.classList.contains('steps-btn') ? openBtn.closest('.site-nav') : openBtn.closest('.fb-item');
    if (!panel.contains(e.target)) closePanel(false);
  });

  // Each filter-bar button shows what its panel is set to. The pages update the controls
  // inside the panels; the buttons follow by watching them.
  const chipName = c => c.querySelector('span:not(.sw):not(.n):not(.key-bar)')?.textContent ?? '';
  const summaries = {
    // data-sum="chips:<container id>": All, None, the one chosen, or "3 of 6"
    chips(id, btn) {
      const chips = [...document.getElementById(id).querySelectorAll('.chip')];
      const on = chips.filter(c => c.getAttribute('aria-pressed') !== 'false');
      const sw = btn.querySelector('.sw-row');
      // Provider colours next to the value, only for a partial choice small enough to read.
      const partial = on.length && on.length < chips.length && on.length <= 4;
      if (sw) sw.replaceChildren(...(partial ? on : []).filter(c => c.style.getPropertyValue('--c')).map(c => {
        const i = document.createElement('i');
        i.style.setProperty('--c', c.style.getPropertyValue('--c'));
        return i;
      }));
      if (!chips.length || on.length === chips.length) return 'All';
      if (!on.length) return 'None';
      if (on.length === 1) return chipName(on[0]);
      return `${on.length} of ${chips.length}`;
    },
    mix() {
      const i = document.getElementById('mix-in')?.textContent ?? '';
      const o = document.getElementById('mix-o')?.textContent ?? '';
      return `${i.replace('%', '')} / ${o.replace('%', '')}`;
    },
    min: () => '≥ ' + document.getElementById('min').value,
    credits() {
      const v = Number(document.getElementById('credits').value) || 0;
      return v.toLocaleString('en-US');
    },
  };
  const sumBtns = [...document.querySelectorAll('.fb-btn[data-sum]')];
  function refresh() {
    sumBtns.forEach(btn => {
      const [kind, arg] = btn.dataset.sum.split(':');
      const out = btn.querySelector('.fb-v');
      const v = summaries[kind]?.(arg, btn);
      if (out && v != null && out.textContent !== v) out.textContent = v;
    });
  }
  if (sumBtns.length) {
    let queued = false;
    const later = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; refresh(); }); } };
    const mo = new MutationObserver(later);
    document.querySelectorAll('.fb-pop').forEach(p => {
      mo.observe(p, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-pressed', 'class', 'hidden'] });
      p.addEventListener('input', later);
      p.addEventListener('change', later);
    });
    later();
  }

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null') || {}; } catch { return {}; }
  }
  // A page may list fewer providers or classes than another (performance.html only lists scored
  // models): what it doesn't know keeps its previous state instead of being dropped, which would
  // make the other pages treat it as new and turn it back on.
  function merge(prev, patch, selKey, knownKey) {
    if (!Array.isArray(patch[knownKey]) || !Array.isArray(prev[knownKey])) return;
    const others = prev[knownKey].filter(n => !patch[knownKey].includes(n));
    const prevSel = Array.isArray(prev[selKey]) ? prev[selKey] : [];
    patch[selKey] = [...patch[selKey], ...others.filter(n => prevSel.includes(n))];
    patch[knownKey] = [...patch[knownKey], ...others];
  }
  function write(patch) {
    const prev = read();
    patch = { ...patch };
    merge(prev, patch, 'active', 'known');
    merge(prev, patch, 'cats', 'knownCats');
    try { localStorage.setItem(KEY, JSON.stringify({ ...prev, ...patch })); } catch {}
  }
  // A saved selection, keeping anything that appeared since it was saved (not in `known`).
  // Returns null when nothing was saved.
  function restore(all, saved, known) {
    if (!Array.isArray(saved)) return null;
    return new Set(all.filter(n => saved.includes(n) || (Array.isArray(known) && !known.includes(n))));
  }

  // ?focus=<model>: read once, then dropped from the URL so a reload doesn't pin it again.
  function takeFocus() {
    const q = new URLSearchParams(location.search);
    const model = q.get('focus');
    if (model == null) return null;
    q.delete('focus');
    const s = q.toString();
    try { history.replaceState(null, '', s ? '?' + s : location.pathname); } catch {}
    return model;
  }

  // "Compare on 2 · Budget · 3 · Value", the other pages with this model focused.
  function pageLinks(current, model) {
    const box = document.createElement('div');
    box.className = 't-links';
    box.append('Compare on');
    PAGES.filter(p => p.id !== current).forEach(p => {
      const a = document.createElement('a');
      a.href = `${p.href}?focus=${encodeURIComponent(model)}`;
      a.textContent = p.label + ' →';
      box.append(a);
    });
    return box;
  }
  function hint(text) {
    const d = document.createElement('div');
    d.className = 't-hint';
    d.textContent = text;
    return d;
  }

  // Hover or focus previews a tooltip; click, Enter or Space pins it (and its links become usable).
  // Esc, a click elsewhere, or clicking the pinned item again closes it.
  // open(item, pinned) and close() draw the page's own tooltip.
  function pinnable({ tip, open, close }) {
    let pinned = null;
    const unpin = () => { pinned = null; close(); };
    const toggle = item => { if (pinned === item) unpin(); else { pinned = item; open(item, true); } };
    function attach(node, item) {
      node.addEventListener('mouseenter', () => { if (!pinned) open(item, false); });
      node.addEventListener('mouseleave', () => { if (!pinned) close(); });
      node.addEventListener('focus', () => { if (!pinned) open(item, false); });
      node.addEventListener('blur', e => { if (!pinned && !tip.contains(e.relatedTarget)) close(); });
      node.addEventListener('click', e => { e.stopPropagation(); toggle(item); });
      node.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(item); }
      });
    }
    document.addEventListener('click', e => { if (pinned && !tip.contains(e.target)) unpin(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && pinned) unpin(); });
    return {
      attach,
      pin(item) { pinned = item; open(item, true); },
      reset: unpin,
    };
  }

  return { REQUEST_TOKENS, CREDIT_USD, credits, usd, read, write, restore, takeFocus, pageLinks, hint, pinnable };
})();
