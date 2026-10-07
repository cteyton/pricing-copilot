#!/usr/bin/env node
// Fetches model benchmarks from the Artificial Analysis free API and regenerates data/scores.csv:
// a Coding Index and an Intelligence Index per Copilot model, matched through data/aa-mapping.json.
// Each index picks its own variant: a model can have an Intelligence score at High but no Coding score there.
// data/scores-meta.json is only rewritten when the data changes.
//
// Usage: node --env-file=.env scripts/update-scores.mjs
// Needs ARTIFICIAL_INTELLIGENCE_API_KEY. SCORES_SOURCE=<local path> parses a saved API response instead (tests).

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PAGE = 'https://artificialanalysis.ai/';
const SOURCE = 'https://artificialanalysis.ai/api/v2/data/llms/models';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MODELS_PATH = join(ROOT, 'data', 'models.csv');
const MAPPING_PATH = join(ROOT, 'data', 'aa-mapping.json');
const CSV_PATH = join(ROOT, 'data', 'scores.csv');
const META_PATH = join(ROOT, 'data', 'scores-meta.json');

// AA evaluation key per index; each gets <metric>, <metric>Effort, <metric>AaName, <metric>AaId columns.
const METRICS = {
  coding: 'artificial_analysis_coding_index',
  intelligence: 'artificial_analysis_intelligence_index',
};
const FIELDS = ['model', ...Object.keys(METRICS).flatMap(k => [k, `${k}Effort`, `${k}AaName`, `${k}AaId`])];

// AA lists one entry per reasoning effort ("GPT-5.6 Sol (High)"). High is preferred, then the nearest effort.
// Names without a parenthesis (or with an unknown label) rank as "Reasoning".
const EFFORT_ORDER = ['High', 'Xhigh', 'Medium', 'Max', 'Low', 'Reasoning', 'Minimal', 'Non-reasoning'];

const fail = msg => { console.error(`✗ ${msg}`); process.exit(1); };

async function load() {
  if (process.env.SCORES_SOURCE) return JSON.parse(await readFile(process.env.SCORES_SOURCE, 'utf8'));
  const key = process.env.ARTIFICIAL_INTELLIGENCE_API_KEY;
  if (!key) fail('ARTIFICIAL_INTELLIGENCE_API_KEY is not set (run with node --env-file=.env)');
  const res = await fetch(SOURCE, { headers: { 'x-api-key': key } });
  if (!res.ok) fail(`HTTP ${res.status} on ${SOURCE}`);
  return res.json();
}

// "Claude Opus 5.5 (High, Default Fallback)" → "High"; "Claude Sonnet 5 (Non-reasoning, High)" → "Non-reasoning".
function effortOf(name, base) {
  const m = name.slice(base.length).match(/^\s*\(([^)]*)\)/);
  const label = m ? m[1].split(',')[0].trim() : '';
  return EFFORT_ORDER.includes(label) ? label : 'Reasoning';
}

export function pick(models, base, key) {
  const variants = models
    .filter(m => m.name === base || m.name.startsWith(`${base} (`))
    .map(m => ({ m, effort: effortOf(m.name, base) }))
    .filter(v => v.m.evaluations?.[key] != null)
    .sort((a, b) => EFFORT_ORDER.indexOf(a.effort) - EFFORT_ORDER.indexOf(b.effort));
  return variants[0] ?? null;
}

const esc = v => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCSV = rows => [FIELDS.join(','), ...rows.map(r => FIELDS.map(f => esc(r[f])).join(','))].join('\n') + '\n';

// Minimal CSV reader (quoted fields), for models.csv and the previous scores.csv.
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
  const sig = r => Object.keys(METRICS).map(k => `${k} ${r[k] || '–'}${r[k] ? ` (${r[`${k}Effort`]})` : ''}`).join(', ');
  const before = new Map(prev.map(r => [r.model, r]));
  const after = new Map(next.map(r => [r.model, r]));
  const lines = [];
  for (const [k, r] of after) {
    if (!before.has(k)) lines.push(`  + ${k} : ${sig(r)}`);
    else if (sig(before.get(k)) !== sig(r)) lines.push(`  ~ ${k} : ${sig(before.get(k))} → ${sig(r)}`);
  }
  for (const k of before.keys()) if (!after.has(k)) lines.push(`  - ${k}`);
  return lines;
}

async function main() {
  const mapping = JSON.parse(await readFile(MAPPING_PATH, 'utf8'));
  const copilot = [...new Set(fromCSV(await readFile(MODELS_PATH, 'utf8')).map(r => r.model))];
  for (const m of copilot) if (!(m in mapping)) console.warn(`! ${m}: not in data/aa-mapping.json`);

  const { data } = await load();
  if (!Array.isArray(data) || !data.length) fail('empty API response');

  const rows = [];
  for (const model of copilot) {
    const base = mapping[model];
    if (base == null) continue;
    const row = { model };
    for (const [k, key] of Object.entries(METRICS)) {
      const v = pick(data, base, key);
      if (!v) { console.warn(`! ${model}: no "${base}" with ${k} index on Artificial Analysis yet`); continue; }
      Object.assign(row, { [k]: v.m.evaluations[key], [`${k}Effort`]: v.effort, [`${k}AaName`]: v.m.name, [`${k}AaId`]: v.m.id });
    }
    if (Object.keys(METRICS).some(k => row[k] != null)) rows.push(row);
  }
  if (!rows.length) fail('no model matched');

  const previous = existsSync(CSV_PATH) ? await readFile(CSV_PATH, 'utf8') : '';
  const prevRows = previous ? fromCSV(previous) : [];
  if (prevRows.length && rows.length < prevRows.length / 2) {
    fail(`${rows.length} models matched vs. ${prevRows.length} before — API probably changed, nothing written`);
  }

  const csv = toCSV(rows);
  if (csv === previous) {
    console.log(`✓ ${rows.length} scores, no change`);
    return;
  }

  await writeFile(CSV_PATH, csv);
  const updated = new Date().toISOString().slice(0, 10);
  await writeFile(META_PATH, JSON.stringify({ source: PAGE, updated }, null, 2) + '\n');

  console.log(`✓ ${rows.length} scores written to data/scores.csv (${updated})`);
  const diff = prevRows.length ? summarize(prevRows, rows) : [];
  if (diff.length) console.log(diff.join('\n'));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
