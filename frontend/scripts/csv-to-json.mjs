#!/usr/bin/env node
/*
 * One-time conversion of the original research CSV files to JSON.
 *
 *   Reads   ../results/data/*.csv            (never written to)
 *   Writes  public/data/*.json + manifest.json
 *
 * Run from the `frontend` folder:
 *
 *   node scripts/csv-to-json.mjs            convert, verify, and write the JSON files
 *   node scripts/csv-to-json.mjs --force    overwrite JSON files that already exist
 *   node scripts/csv-to-json.mjs --check    verify existing JSON against the CSVs (writes nothing)
 *
 * Fidelity rules:
 *   - every column and every row is kept, in the original order;
 *   - numeric text becomes a JSON number with the same double value (no rounding);
 *   - "True"/"False" become booleans; an empty cell becomes null; everything else stays a string;
 *   - the converted data is compared with the CSV cell by cell, and the CSV files are hashed before
 *     and after the run to prove they were not changed.
 *
 * No dependencies: this file only uses Node's built-in modules.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const FRONTEND_DIR = path.resolve(HERE, '..')
const REPO_ROOT = path.resolve(FRONTEND_DIR, '..')
const CSV_DIR = path.join(REPO_ROOT, 'results', 'data')
const OUT_DIR = path.join(FRONTEND_DIR, 'public', 'data')
const RESULTS_JS = path.join(FRONTEND_DIR, 'src', 'data', 'results.js')

// The 12 research files. `required` lists columns the app reads; a missing one stops the run.
const CSV_FILES = {
  phase3_comparison_summary: {
    required: ['model', 'mean_original_reward', 'std_original_reward', 'mean_length', 'landed', 'crashed', 'timeout', 'solved_200'],
  },
  phase3_comparison_per_episode: {
    required: ['model', 'episode', 'seed', 'original_reward', 'length', 'outcome'],
  },
  bad_reward_eval_custom_env: {
    required: ['episode', 'seed', 'custom_reward', 'original_reward', 'length', 'outcome_original_rule', 'wrapper_landing_bonus', 'terminated', 'truncated'],
  },
  bad_reward_eval_original_env: {
    required: ['episode', 'seed', 'original_reward', 'length', 'outcome', 'terminated', 'truncated'],
  },
  improved_reward_eval_improved_env: {
    required: ['episode', 'seed', 'improved_reward', 'original_reward', 'shaping_return', 'length', 'outcome', 'terminated', 'truncated'],
  },
  improved_reward_eval_original_env: {
    required: ['episode', 'seed', 'original_reward', 'length', 'outcome', 'terminated', 'truncated'],
  },
  training_episodes_log: { required: ['r', 'l', 't', 'timesteps', 'reward_ma100'] },
  bad_reward_training_episodes_log: {
    required: ['r', 'l', 't', 'original_episode_return', 'landed_by_wrapper', 'timesteps'],
  },
  improved_reward_training_episodes_log: {
    required: ['r', 'l', 't', 'original_episode_return', 'shaping_episode_return', 'timesteps'],
  },
  training_progress_log: { required: [] },
  bad_reward_training_progress_log: { required: [] },
  improved_reward_training_progress_log: { required: [] },
}

const NUMERIC = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/
const MODEL_IDS = { 'Baseline PPO': 'baseline', 'Bad Reward PPO': 'badReward', 'Improved Reward PPO': 'improved' }

const errors = []
const warnings = []
const notes = []

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex')

// ---------------------------------------------------------------------------------------------
// CSV parsing (RFC 4180: quoted fields, doubled quotes, CRLF or LF, optional BOM)
// ---------------------------------------------------------------------------------------------
export function parseCsv(input) {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  let i = 0
  const endRow = () => {
    row.push(field)
    rows.push(row)
    row = []
    field = ''
  }
  while (i < text.length) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i += 1
        continue
      }
      field += ch
      i += 1
      continue
    }
    if (ch === '"' && field === '') {
      inQuotes = true
      i += 1
    } else if (ch === ',') {
      row.push(field)
      field = ''
      i += 1
    } else if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1
      endRow()
      i += 1
    } else {
      field += ch
      i += 1
    }
  }
  if (inQuotes) throw new Error('unterminated quoted field')
  if (field !== '' || row.length > 0) endRow()
  return rows
}

function significantDigits(text) {
  const mantissa = text.replace(/^-/, '').split(/[eE]/)[0].replace('.', '')
  return mantissa.replace(/^0+/, '').length
}

function convertCell(raw, where) {
  if (raw === '') return null
  if (NUMERIC.test(raw)) {
    const value = Number(raw)
    if (Number.isFinite(value)) {
      if (significantDigits(raw) > 17) warnings.push(`${where}: "${raw}" has more than 17 significant digits, which a JSON number may not hold exactly.`)
      return value
    }
  }
  if (raw === 'True' || raw === 'true') return true
  if (raw === 'False' || raw === 'false') return false
  return raw
}

function cellMatches(raw, value) {
  if (raw === '') return value === null
  if (value === null) return false
  if (typeof value === 'boolean') return raw === (value ? 'True' : 'False') || raw === (value ? 'true' : 'false')
  if (typeof value === 'number') return NUMERIC.test(raw) && Number(raw) === value
  return typeof value === 'string' && raw === value
}

function buildTable(name, records) {
  if (records.length === 0) throw new Error('the file is empty')
  const columns = records[0]
  if (columns.some((c) => c === '')) throw new Error('the header has an empty column name')
  if (new Set(columns).size !== columns.length) throw new Error('the header has duplicate column names')
  const rows = records.slice(1).map((record, index) => {
    const line = index + 2
    if (columns.length > 1 && record.length === 1 && record[0] === '') throw new Error(`line ${line} is blank`)
    if (record.length !== columns.length) throw new Error(`line ${line} has ${record.length} cells, expected ${columns.length}`)
    return record.map((raw, c) => convertCell(raw, `${name}.csv line ${line}, column "${columns[c]}"`))
  })
  return { source: `results/data/${name}.csv`, columns, rowCount: rows.length, rows }
}

function serialize(table) {
  const rows = table.rows.map((row) => `    ${JSON.stringify(row)}`).join(',\n')
  return (
    '{\n' +
    `  "source": ${JSON.stringify(table.source)},\n` +
    `  "columns": ${JSON.stringify(table.columns)},\n` +
    `  "rowCount": ${table.rowCount},\n` +
    `  "rows": [\n${rows}\n  ]\n` +
    '}\n'
  )
}

// ---------------------------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------------------------
function verifyJsonAgainstCsv(name, records, json) {
  const problems = []
  const header = records[0]
  if (!Array.isArray(json.columns) || json.columns.length !== header.length || json.columns.some((c, i) => c !== header[i])) {
    problems.push('columns differ from the CSV header')
    return problems
  }
  const expectedRows = records.length - 1
  if (json.rowCount !== expectedRows || json.rows.length !== expectedRows) {
    problems.push(`row count differs: CSV has ${expectedRows}, JSON has ${json.rows.length} (rowCount ${json.rowCount})`)
    return problems
  }
  for (let r = 0; r < expectedRows; r += 1) {
    const jsonRow = json.rows[r]
    if (jsonRow.length !== header.length) {
      problems.push(`row ${r + 1} has ${jsonRow.length} cells, expected ${header.length}`)
      continue
    }
    for (let c = 0; c < header.length; c += 1) {
      if (!cellMatches(records[r + 1][c], jsonRow[c])) {
        problems.push(`row ${r + 1}, column "${header[c]}": CSV "${records[r + 1][c]}" vs JSON ${JSON.stringify(jsonRow[c])}`)
        if (problems.length >= 10) return problems
      }
    }
  }
  return problems
}

// A second, deliberately naive structure check (plain split) for files that contain no quotes.
function naiveStructureCheck(text, records) {
  if (text.includes('"')) return null
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  if (lines[lines.length - 1] === '') lines.pop()
  if (lines.length !== records.length) return `parser found ${records.length} records but the file has ${lines.length} lines`
  const width = lines[0].split(',').length
  const bad = lines.findIndex((line) => line.split(',').length !== width)
  return bad === -1 ? null : `line ${bad + 1} does not have ${width} comma-separated cells`
}

// ---------------------------------------------------------------------------------------------
// Cross-checks between files (these catch a wrong or stale CSV before it reaches the charts)
// ---------------------------------------------------------------------------------------------
const close = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))
const round1 = (value) => Math.round(value * 10) / 10

function objects(table) {
  return table.rows.map((row) => Object.fromEntries(table.columns.map((c, i) => [c, row[i]])))
}

function outcomeKey(text) {
  const t = typeof text === 'string' ? text.trim().toUpperCase() : ''
  if (t.startsWith('LANDED')) return 'landed'
  if (t.startsWith('CRASH')) return 'crashed'
  if (t.startsWith('TIMEOUT')) return 'timeout'
  return 'other'
}

async function crossChecks(tables) {
  const perEpisode = objects(tables.phase3_comparison_per_episode)
  const summary = objects(tables.phase3_comparison_summary)
  const byModel = {}
  for (const row of perEpisode) (byModel[row.model] ??= []).push(row)

  let evaluation = null
  try {
    evaluation = (await import(pathToFileURL(RESULTS_JS).href)).EVALUATION
  } catch {
    warnings.push('Skipped the check against src/data/results.js (it could not be imported).')
  }

  for (const row of summary) {
    const rows = byModel[row.model]
    if (!rows) {
      errors.push(`summary lists "${row.model}" but the per-episode file has no rows for it.`)
      continue
    }
    const rewards = rows.map((r) => r.original_reward)
    const lengths = rows.map((r) => r.length)
    const mean = rewards.reduce((a, b) => a + b, 0) / rewards.length
    const std = Math.sqrt(rewards.reduce((a, b) => a + (b - mean) ** 2, 0) / rewards.length)
    const meanLength = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const counts = { landed: 0, crashed: 0, timeout: 0, other: 0 }
    rows.forEach((r) => { counts[outcomeKey(r.outcome)] += 1 })
    const solved = rewards.filter((v) => v >= 200).length
    const label = `${row.model}`
    if (!close(mean, row.mean_original_reward)) errors.push(`${label}: mean of per-episode original_reward (${mean}) differs from the summary (${row.mean_original_reward}).`)
    if (!close(std, row.std_original_reward)) errors.push(`${label}: population standard deviation (${std}) differs from the summary (${row.std_original_reward}).`)
    if (!close(meanLength, row.mean_length)) errors.push(`${label}: mean length (${meanLength}) differs from the summary (${row.mean_length}).`)
    if (counts.landed !== row.landed) errors.push(`${label}: ${counts.landed} LANDED episodes vs summary landed=${row.landed}.`)
    if (counts.crashed !== row.crashed) errors.push(`${label}: ${counts.crashed} CRASHED episodes vs summary crashed=${row.crashed}.`)
    if (counts.timeout !== row.timeout) errors.push(`${label}: ${counts.timeout} TIMEOUT episodes vs summary timeout=${row.timeout}.`)
    if (counts.other > 0) warnings.push(`${label}: ${counts.other} episode(s) have an outcome label that is not LANDED, CRASHED or TIMEOUT.`)
    if (solved !== row.solved_200) errors.push(`${label}: ${solved} episodes with original_reward >= 200 vs summary solved_200=${row.solved_200}.`)

    const id = MODEL_IDS[row.model]
    if (evaluation && id && evaluation[id]) {
      const e = evaluation[id]
      const same =
        round1(mean) === e.meanReward && round1(std) === e.std && round1(meanLength) === e.meanLength &&
        counts.landed === e.landed && counts.crashed === e.crashed && counts.timeout === e.timeouts
      if (!same) errors.push(`${label}: values computed from the CSV do not match EVALUATION.${id} in src/data/results.js.`)
    }
  }

  const compareEval = (modelName, tableName) => {
    const rows = byModel[modelName] ?? []
    const evalRows = objects(tables[tableName])
    if (evalRows.length !== rows.length) {
      errors.push(`${tableName}: ${evalRows.length} rows vs ${rows.length} per-episode rows for ${modelName}.`)
      return
    }
    evalRows.forEach((e, i) => {
      const p = rows.find((r) => r.episode === e.episode)
      if (!p || p.original_reward !== e.original_reward || p.length !== e.length || p.seed !== e.seed || p.outcome !== (e.outcome ?? e.outcome_original_rule)) {
        errors.push(`${tableName}: episode ${e.episode} differs from the per-episode file.`)
      }
    })
  }
  compareEval('Bad Reward PPO', 'bad_reward_eval_original_env')
  compareEval('Bad Reward PPO', 'bad_reward_eval_custom_env')
  compareEval('Improved Reward PPO', 'improved_reward_eval_original_env')
  compareEval('Improved Reward PPO', 'improved_reward_eval_improved_env')

  for (const e of objects(tables.improved_reward_eval_improved_env)) {
    if (!close(e.improved_reward, e.original_reward + e.shaping_return)) {
      notes.push(`improved_reward_eval_improved_env episode ${e.episode}: improved_reward is not original_reward + shaping_return.`)
    }
  }

  // Information only: confirms how the training logs behave, without changing any data.
  for (const name of ['training_episodes_log', 'bad_reward_training_episodes_log', 'improved_reward_training_episodes_log']) {
    const rows = objects(tables[name])
    let cumulative = 0
    let cumulativeMatches = true
    let nonDecreasing = true
    rows.forEach((r, i) => {
      cumulative += r.l
      if (cumulative !== r.timesteps) cumulativeMatches = false
      if (i > 0 && r.timesteps < rows[i - 1].timesteps) nonDecreasing = false
    })
    notes.push(`${name}: ${rows.length} episodes; timesteps ${nonDecreasing ? 'never decreases' : 'DECREASES in places'}; timesteps ${cumulativeMatches ? 'equals' : 'does not equal'} the running sum of l.`)
  }
  const improvedTraining = objects(tables.improved_reward_training_episodes_log)
  const worst = improvedTraining.reduce((m, r) => Math.max(m, Math.abs(r.r - (r.original_episode_return + r.shaping_episode_return))), 0)
  notes.push(`improved_reward_training_episodes_log: largest |r - (original_episode_return + shaping_episode_return)| = ${worst}. (Information only; the app never treats r as original reward.)`)
}

// ---------------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2)
  const known = new Set(['--check', '--force'])
  const unknown = args.filter((a) => !known.has(a))
  if (unknown.length) {
    console.error(`Unknown option(s): ${unknown.join(' ')}\nUsage: node scripts/csv-to-json.mjs [--check] [--force]`)
    process.exit(2)
  }
  const checkOnly = args.includes('--check')
  const force = args.includes('--force')

  const names = Object.keys(CSV_FILES)
  const sources = {}
  const tables = {}
  const records = {}
  const hashesBefore = {}

  for (const name of names) {
    const file = path.join(CSV_DIR, `${name}.csv`)
    if (!existsSync(file)) {
      errors.push(`Missing CSV: results/data/${name}.csv`)
      continue
    }
    const buffer = readFileSync(file)
    hashesBefore[name] = { sha256: sha256(buffer), bytes: buffer.length }
    sources[name] = buffer.toString('utf8')
    try {
      records[name] = parseCsv(sources[name])
      tables[name] = buildTable(name, records[name])
    } catch (error) {
      errors.push(`${name}.csv: ${error.message}`)
      continue
    }
    const structure = naiveStructureCheck(sources[name], records[name])
    if (structure) errors.push(`${name}.csv: ${structure}`)
    const missing = CSV_FILES[name].required.filter((c) => !tables[name].columns.includes(c))
    if (missing.length) errors.push(`${name}.csv is missing required column(s): ${missing.join(', ')}`)
  }

  if (!errors.length) await crossChecks(tables)

  if (errors.length) return finish(null)

  if (checkOnly) {
    for (const name of names) {
      const file = path.join(OUT_DIR, `${name}.json`)
      if (!existsSync(file)) {
        errors.push(`Missing JSON: public/data/${name}.json (run without --check first)`)
        continue
      }
      const problems = verifyJsonAgainstCsv(name, records[name], JSON.parse(readFileSync(file, 'utf8')))
      problems.forEach((p) => errors.push(`${name}.json: ${p}`))
    }
    return finish(tables)
  }

  const existing = names.filter((name) => existsSync(path.join(OUT_DIR, `${name}.json`)))
  if (existing.length && !force) {
    errors.push(`public/data already contains ${existing.length} JSON file(s). Re-run with --force to overwrite them, or --check to verify them.`)
    return finish(null)
  }

  // Verify the serialized text before anything is written.
  const outputs = {}
  for (const name of names) {
    outputs[name] = serialize(tables[name])
    const problems = verifyJsonAgainstCsv(name, records[name], JSON.parse(outputs[name]))
    problems.forEach((p) => errors.push(`${name}: ${p}`))
  }
  if (errors.length) return finish(null)

  mkdirSync(OUT_DIR, { recursive: true })
  const manifest = { schemaVersion: 1, note: 'Generated by scripts/csv-to-json.mjs. Do not edit by hand.', files: {} }
  for (const name of names) {
    writeFileSync(path.join(OUT_DIR, `${name}.json`), outputs[name])
    manifest.files[name] = {
      json: `${name}.json`,
      source: `results/data/${name}.csv`,
      sourceSha256: hashesBefore[name].sha256,
      sourceBytes: hashesBefore[name].bytes,
      columns: tables[name].columns,
      rows: tables[name].rowCount,
    }
  }
  writeFileSync(path.join(OUT_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

  // Re-read what was written to disk and verify it again.
  for (const name of names) {
    const onDisk = JSON.parse(readFileSync(path.join(OUT_DIR, `${name}.json`), 'utf8'))
    verifyJsonAgainstCsv(name, records[name], onDisk).forEach((p) => errors.push(`${name}.json (on disk): ${p}`))
  }
  return finish(tables, hashesBefore)
}

function finish(tables, hashesBefore) {
  if (hashesBefore) {
    for (const name of Object.keys(hashesBefore)) {
      const after = sha256(readFileSync(path.join(CSV_DIR, `${name}.csv`)))
      if (after !== hashesBefore[name].sha256) errors.push(`${name}.csv changed during the run. This must never happen.`)
    }
  }
  if (tables) {
    console.log('\nFile'.padEnd(46) + 'Rows'.padStart(8) + 'Columns'.padStart(10))
    for (const [name, table] of Object.entries(tables)) {
      console.log(`${name}.csv`.padEnd(45) + String(table.rowCount).padStart(8) + String(table.columns.length).padStart(10))
    }
  }
  if (notes.length) console.log(`\nInformation:\n${notes.map((n) => `  - ${n}`).join('\n')}`)
  if (warnings.length) console.log(`\nWarnings:\n${warnings.map((w) => `  - ${w}`).join('\n')}`)
  if (errors.length) {
    console.error(`\nFAILED. Fix the following and run again:\n${errors.map((e) => `  - ${e}`).join('\n')}`)
    process.exitCode = 1
    return
  }
  console.log(
    tables && hashesBefore
      ? `\nOK. Wrote ${Object.keys(tables).length} JSON files and manifest.json to public/data/.\nEvery cell was compared with its CSV, and the CSV files are byte-for-byte unchanged (SHA-256 checked).`
      : '\nOK. The JSON files match the CSV files cell by cell.',
  )
}

// Only run when executed directly (so the parser can be imported by tests).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
