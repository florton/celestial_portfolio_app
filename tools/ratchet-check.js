const { readFileSync, existsSync } = require('fs')
const { join } = require('path')
const { spawnSync } = require('child_process')

const subject = process.argv[2]
const input = JSON.parse(readFileSync(0, 'utf8'))
const root = process.env.NP_ROOT || join(__dirname, '..')

const yarn = process.platform === 'win32' ? 'yarn.cmd' : 'yarn'

const ok = (reason = '') => { console.log('OK' + (reason ? ' ' + reason : '')); process.exit(0) }
const fail = (reason) => { console.log(reason); process.exit(1) }

const spawnYarn = (args, timeout) => {
  const r = spawnSync(yarn, args, { cwd: root, encoding: 'utf8', timeout })
  if (r.error) return { status: -1, stdout: '', stderr: r.error.message }
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' }
}

const checkData = () => {
  const src = readFileSync(join(root, 'app/data/portfolio.ts'), 'utf8')

  const kindMatch = src.match(/export type CelestialKind\s*=\s*([\s\S]*?);/)
  if (!kindMatch) return fail('no CelestialKind type found')
  const kinds = kindMatch[1].split('|').map(s => s.trim().replace(/"/g, '')).filter(Boolean)

  const bodies = [...src.matchAll(/body:\s*"([^"]+)"/g)].map(m => m[1])
  for (const b of bodies) {
    if (!kinds.includes(b)) return fail(`body "${b}" is not a declared CelestialKind (${kinds.join(', ')})`)
  }

  const hex = /^#[0-9a-fA-F]{6}$/
  const accents = [...src.matchAll(/accent:\s*"([^"]+)"/g)].map(m => m[1])
  for (const a of accents) if (!hex.test(a)) return fail(`accent "${a}" is not 6-digit hex`)

  const colors = [...src.matchAll(/sky:\s*\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g)]
  if (colors.length !== accents.length) return fail(`${accents.length} categories but ${colors.length} three-color sky gradients`)
  for (const [, top, mid, horizon] of colors) {
    if (!hex.test(top) || !hex.test(mid) || !hex.test(horizon)) return fail(`sky gradient [${top}, ${mid}, ${horizon}] is not 6-digit hex`)
  }

  const titles = [...src.matchAll(/title:\s*"([^"]+)"/g)].map(m => m[1])
  const seen = new Set()
  for (const t of titles) {
    if (seen.has(t)) return fail(`duplicate project title "${t}"`)
    seen.add(t)
  }
  if (titles.length === 0) return fail('no projects found')

  const blurbCount = [...src.matchAll(/blurb:\s*"/g)].length
  if (blurbCount < titles.length) return fail(`${titles.length} titles but ${blurbCount} blurbs`)
  if (/blurb:\s*""/.test(src)) return fail('a project has an empty blurb')

  const hrefs = [...src.matchAll(/href:\s*"([^"]+)"/g)].map(m => m[1])
  for (const h of hrefs) {
    if (/^(https?|mailto|tel):/.test(h)) continue
    if (!h.startsWith('/')) return fail(`href "${h}" is not absolute (no scheme, no leading slash)`)
    if (!existsSync(join(root, 'public', h.slice(1)))) return fail(`href "${h}" points at a missing public asset`)
  }

  const scales = [...src.matchAll(/scale:\s*([\d.]+)/g)].map(m => Number(m[1]))
  if (scales.length !== accents.length) return fail(`${accents.length} categories but ${scales.length} scales`)
  for (const s of scales) if (!isFinite(s) || s <= 0) return fail(`scale ${s} is not a positive number`)

  return ok(`${titles.length} projects, ${accents.length} categories, ${bodies.length} bodies checked`)
}

const checkUnitTests = () => {
  if (!existsSync(join(root, 'vitest.config.ts'))) return ok('N/A: no test suite configured')
  const r = spawnYarn(['vitest', 'run'], 120000)
  if (r.status !== 0) return fail(`vitest suite failed: ${r.stderr || r.stdout}`.split('\n').slice(-6).join(' | '))
  const m = r.stdout.match(/Tests\s+\d+ passed \((\d+)\)/)
  return ok(m ? `${m[1]} tests passed` : 'suite passed')
}

const checkBuild = () => {
  const r = spawnYarn(['build'], 600000)
  if (r.status !== 0) return fail(`next build failed: ${(r.stderr || r.stdout).split('\n').slice(-6).join(' | ')}`)
  const m = r.stdout.match(/First Load JS shared by all\s+([\d.]+) kB/)
  return ok(m ? `build ok, shared JS ${m[1]} kB` : 'build ok')
}

const subjects = {
  'data-integrity': checkData,
  'unit-tests': checkUnitTests,
  'build': checkBuild
}

if (!subjects[subject]) {
  console.error(`unknown subject: ${subject}`)
  process.exit(2)
}

subjects[subject]()
