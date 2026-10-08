#!/usr/bin/env node
// Fetches the "Models and pricing for GitHub Copilot" page (raw markdown)
// and regenerates data/models.csv. data/meta.json is only rewritten when the data changes.
//
// Usage: node scripts/update-pricing.mjs
// PRICING_SOURCE=<local path> parses a file instead of the URL (tests).

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PAGE = 'https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing';
const SOURCE = 'https://docs.github.com/api/article/body?pathname=/en/copilot/reference/copilot-billing/models-and-pricing';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSV_PATH = join(ROOT, 'data', 'models.csv');
const META_PATH = join(ROOT, 'data', 'meta.json');

const FIELDS = ['provider', 'family', 'model', 'category', 'status', 'tier', 'threshold', 'input', 'cachedInput', 'cacheWrite', 'output', 'note'];
const PRICE_FIELDS = ['input', 'cachedInput', 'cacheWrite', 'output'];

const PROVIDER_NAMES = {
  'Fine-tuned (GitHub)': 'GitHub',
};

// Column headers of the page → CSV fields. Other columns are ignored.
const COLUMNS = {
  'Model': 'model',
  'Category': 'category',
  'Release status': 'status',
  'Tier': 'tier',
  'Threshold (input tokens)': 'threshold',
  'Input': 'input',
  'Cached input': 'cachedInput',
  'Cache write': 'cacheWrite',
  'Output': 'output',
};

const TIERS = { 'Default': 'default', 'Long context': 'long' };

// Family = version for OpenAI / xAI, product line for Claude and Gemini. First match wins.
const FAMILY_RULES = [
  [/^GPT-\d+(?:\.\d+)?/, m => m[0]],
  [/^Claude (\w+)/, m => `Claude ${m[1]}`],
  [/^Gemini [\d.]+ (\w+)/, m => `Gemini ${m[1]}`],
  [/^Grok \d+(?:\.\d+)?/, m => m[0]],
  [/^MAI-Code/, m => m[0]],
];
const familyOf = model => {
  for (const [re, f] of FAMILY_RULES) {
    const m = model.match(re);
    if (m) return f(m);
  }
  return model;
};

const fail = msg => { console.error(`✗ ${msg}`); process.exit(1); };

async function load() {
  if (process.env.PRICING_SOURCE) return readFile(process.env.PRICING_SOURCE, 'utf8');
  const res = await fetch(SOURCE, { headers: { 'user-agent': 'copilot-pricing-updater' } });
  if (!res.ok) fail(`HTTP ${res.status} on ${SOURCE}`);
  return res.text();
}

const cells = line => line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
const isNA = v => !v || v === 'Not applicable';

function price(v, where) {
  if (isNA(v)) return '';
  const n = Number(v.replace(/^\$/, '').replace(/,/g, ''));
  if (!Number.isFinite(n)) fail(`unreadable price "${v}" (${where})`);
  return n;
}

export function parse(md) {
  const notes = Object.fromEntries(
    [...md.matchAll(/^\[\^([^\]]+)\]:\s*(.+)$/gm)].map(m => [m[1], m[2].trim()]));
  const rows = [];

  for (const section of md.split(/^### /m).slice(1)) {
    const heading = section.slice(0, section.indexOf('\n')).trim();
    const provider = PROVIDER_NAMES[heading] ?? heading;
    const lines = section.split('\n').filter(l => l.trim().startsWith('|'));
    if (!lines.length) continue;

    const header = cells(lines[0]).map(h => COLUMNS[h]);
    for (const required of ['model', 'input', 'output']) {
      if (!header.includes(required)) fail(`table "${heading}" has no ${required} column`);
    }

    for (const line of lines.slice(2)) {
      const c = cells(line);
      if (c.every(v => !v)) continue; // spacer rows
      const raw = {};
      header.forEach((f, i) => { if (f) raw[f] = c[i] ?? ''; });

      const refs = [...raw.model.matchAll(/\[\^([^\]]+)\]/g)].map(m => m[1]);
      const model = raw.model.replace(/\[\^[^\]]+\]/g, '').trim();
      const where = `${provider} / ${model}`;
      const tier = raw.tier ? TIERS[raw.tier] : 'default';
      if (!tier) fail(`unknown tier "${raw.tier}" (${where})`);

      const row = {
        provider,
        family: familyOf(model),
        model,
        category: raw.category ?? '',
        status: raw.status ?? '',
        tier,
        threshold: isNA(raw.threshold) ? '' : raw.threshold,
        note: refs.map(r => notes[r]).filter(Boolean).join(' '),
      };
      for (const f of PRICE_FIELDS) row[f] = price(raw[f], where);
      if (row.input === '' || row.output === '') fail(`missing input/output price (${where})`);
      if (rows.some(r => r.model === model && r.tier === tier)) fail(`duplicate ${tier} tier (${where})`);
      rows.push(row);
    }
  }
  return rows;
}

const esc = v => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCSV = rows => [FIELDS.join(','), ...rows.map(r => FIELDS.map(f => esc(r[f])).join(','))].join('\n') + '\n';

// Minimal reader for the previous CSV, used for the change summary.
function fromCSV(text) {
  const out = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') q = false;
      else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); out.push(row); row = []; field = ''; }
    else field += ch;
  }
  if (field || row.length) { row.push(field); out.push(row); }
  const [head, ...data] = out;
  return data.map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

function summarize(prev, next) {
  const key = r => `${r.model} [${r.tier}]`;
  const sig = r => [...PRICE_FIELDS.map(f => r[f]), r.category, r.status].join('/');
  const before = new Map(prev.map(r => [key(r), r]));
  const after = new Map(next.map(r => [key(r), r]));
  const lines = [];
  for (const [k, r] of after) {
    if (!before.has(k)) lines.push(`  + ${k}`);
    else if (sig(before.get(k)) !== sig(r)) lines.push(`  ~ ${k} : ${sig(before.get(k))} → ${sig(r)}`);
  }
  for (const k of before.keys()) if (!after.has(k)) lines.push(`  - ${k}`);
  return lines;
}

async function main() {
  const rows = parse(await load());
  if (!rows.length) fail('no rows extracted');

  const previous = existsSync(CSV_PATH) ? await readFile(CSV_PATH, 'utf8') : '';
  const prevRows = previous ? fromCSV(previous) : [];
  if (prevRows.length && rows.length < prevRows.length / 2) {
    fail(`${rows.length} rows extracted vs. ${prevRows.length} before — page probably changed, nothing written`);
  }

  const csv = toCSV(rows);
  if (csv === previous) {
    console.log(`✓ ${rows.length} rows, no change`);
    return;
  }

  await mkdir(dirname(CSV_PATH), { recursive: true });
  await writeFile(CSV_PATH, csv);
  const updated = new Date().toISOString().slice(0, 10);
  await writeFile(META_PATH, JSON.stringify({ source: PAGE, updated }, null, 2) + '\n');

  console.log(`✓ ${rows.length} rows written to data/models.csv (${updated})`);
  const diff = prevRows.length ? summarize(prevRows, rows) : [];
  if (diff.length) console.log(diff.join('\n'));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
