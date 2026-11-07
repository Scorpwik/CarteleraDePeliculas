import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { extname, relative, resolve } from 'node:path'

const SKIP_EXT = new Set(['', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'])

let raw = ''
try {
  raw = readFileSync(0, 'utf8')
} catch {
  process.exit(0)
}

let filePath = ''
try {
  const payload = JSON.parse(raw)
  filePath = payload?.tool_input?.file_path ?? payload?.tool_input?.path ?? ''
} catch {
  process.exit(0)
}

if (!filePath) process.exit(0)

const abs = resolve(filePath)
const rel = relative(process.cwd(), abs).replaceAll('\\', '/')

if (rel === 'src/index.css' || rel.startsWith('dist/') || rel.startsWith('node_modules/')) {
  process.exit(0)
}

if (SKIP_EXT.has(extname(abs).toLowerCase())) process.exit(0)

const result = spawnSync(
  'npx',
  ['prettier', '--write', '--ignore-unknown', abs],
  { stdio: 'ignore', shell: true },
)

process.exit(result.status === null ? 0 : result.status)
