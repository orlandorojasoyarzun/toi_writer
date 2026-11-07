import { app } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'

export interface Settings {
  folder?: string
  lastNote?: string
}

const file = (): string => join(app.getPath('userData'), 'settings.json')

export async function loadSettings(): Promise<Settings> {
  try {
    return JSON.parse(await fs.readFile(file(), 'utf8'))
  } catch {
    return {}
  }
}

export async function saveSettings(patch: Partial<Settings>): Promise<void> {
  const next = { ...(await loadSettings()), ...patch }
  await fs.writeFile(file(), JSON.stringify(next, null, 2))
}
