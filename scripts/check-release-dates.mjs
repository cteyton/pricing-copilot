#!/usr/bin/env node
// Checks data/release-dates.csv (hand-maintained release history) against the Copilot models in data/models.csv,
// matched through data/release-mapping.json. Read-only: it writes nothing.
// Fails on a malformed date, a duplicate model row, or a mapping value missing from release-dates.csv.
//
// Usage: node scripts/check-release-dates.mjs

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MODELS_PATH = join(ROOT, 'data', 'models.csv');
const MAPPING_PATH = join(ROOT, 'data', 'release-mapping.json');
const DATES_PATH = join(ROOT, 'data', 'release-dates.csv');

const fail = msg => { console.error(`✗ ${msg}`); process.exit(1); };

// Minimal CSV reader (quoted fields), same as scripts/update-scores.mjs.
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

async function main() {
  const mapping = JSON.parse(await readFile(MAPPING_PATH, 'utf8'));
  const copilot = [...new Set(fromCSV(await readFile(MODELS_PATH, 'utf8')).map(r => r.model))];
  const history = fromCSV(await readFile(DATES_PATH, 'utf8'));

  const dates = new Map();
  for (const { model, release_date } of history) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(release_date) || Number.isNaN(Date.parse(release_date))) {
      fail(`${model}: bad release_date "${release_date}" in data/release-dates.csv`);
    }
    if (dates.has(model)) fail(`${model}: listed twice in data/release-dates.csv`);
    dates.set(model, release_date);
  }

  for (const [model, name] of Object.entries(mapping)) {
    if (name != null && !dates.has(name)) fail(`${model}: "${name}" not in data/release-dates.csv`);
  }

  for (const m of copilot) if (!(m in mapping)) console.warn(`! ${m}: not in data/release-mapping.json`);
  const undated = copilot.filter(m => m in mapping && mapping[m] == null);
  for (const m of undated) console.warn(`! ${m}: no release date (null in data/release-mapping.json)`);

  const dated = copilot.filter(m => mapping[m] != null).length;
  console.log(`✓ ${dated}/${copilot.length} Copilot models dated (${history.length} models in history)`);
}

main();
