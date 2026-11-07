import { BrowserWindow, dialog, ipcMain, shell, type OpenDialogOptions } from 'electron'
import { promises as fs } from 'fs'
import { basename, dirname, extname, join, resolve } from 'path'
import type { DeleteStrings, LibraryState, NoteInfo, RenameResult } from '../shared/library'
import { loadSettings, saveSettings } from './settings'

const EXT = '.md'

// The library is a single flat folder of .md files. The renderer can only touch
// files directly inside the folder the user picked, never arbitrary paths.
let folder: string | null = null

async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await fs.stat(path)).isDirectory()
  } catch {
    return false
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

function notePath(path: string): string {
  const full = resolve(path)
  if (!folder || dirname(full) !== folder || extname(full) !== EXT) {
    throw new Error('Path is outside the library')
  }
  return full
}

function toName(path: string): string {
  return basename(path, EXT)
}

function sanitizeName(raw: string): string | null {
  const name = raw
    .replace(/\.md$/i, '')
    .replace(/[/\\:]/g, ' ')
    .replace(/^\.+/, '')
    .trim()
    .slice(0, 120)
  return name || null
}

async function listNotes(): Promise<NoteInfo[]> {
  if (!folder) return []
  const entries = await fs.readdir(folder, { withFileTypes: true })
  const notes = await Promise.all(
    entries
      .filter((e) => e.isFile() && extname(e.name) === EXT && !e.name.startsWith('.'))
      .map(async (e) => {
        const path = join(folder!, e.name)
        return { path, name: toName(path), mtime: (await fs.stat(path)).mtimeMs }
      })
  )
  return notes.sort((a, b) => b.mtime - a.mtime)
}

async function stateFor(dir: string): Promise<LibraryState> {
  folder = dir
  const { lastNote } = await loadSettings()
  return { folder: dir, notes: await listNotes(), lastNote: lastNote ?? null }
}

async function uniquePath(base: string): Promise<string> {
  let candidate = join(folder!, base + EXT)
  for (let i = 2; await exists(candidate); i++) {
    candidate = join(folder!, `${base} ${i}${EXT}`)
  }
  return candidate
}

export function registerLibraryIpc(): void {
  ipcMain.handle('library:getState', async () => {
    const { folder: saved } = await loadSettings()
    if (!saved || !(await isDirectory(saved))) return null
    return stateFor(saved)
  })

  ipcMain.handle('library:openFolder', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const options: OpenDialogOptions = { properties: ['openDirectory', 'createDirectory'] }
    const result = win
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options)
    if (result.canceled || !result.filePaths[0]) return null
    await saveSettings({ folder: result.filePaths[0], lastNote: undefined })
    return stateFor(result.filePaths[0])
  })

  ipcMain.handle('library:list', () => listNotes())

  ipcMain.handle('library:read', (_e, path: string) => fs.readFile(notePath(path), 'utf8'))

  ipcMain.handle('library:write', async (_e, path: string, content: string) => {
    const target = notePath(path)
    // Write to a temp file first so a crash can't leave a half-written note.
    const tmp = join(dirname(target), `.${basename(target)}.tmp`)
    await fs.writeFile(tmp, content, 'utf8')
    await fs.rename(tmp, target)
  })

  ipcMain.handle(
    'library:create',
    async (_e, baseName: string, content = ''): Promise<NoteInfo> => {
      if (!folder) throw new Error('No library folder')
      const path = await uniquePath(sanitizeName(baseName) ?? 'Untitled')
      await fs.writeFile(path, content, { encoding: 'utf8', flag: 'wx' })
      return { path, name: toName(path), mtime: Date.now() }
    }
  )

  ipcMain.handle(
    'library:rename',
    async (_e, path: string, newName: string): Promise<RenameResult> => {
      const source = notePath(path)
      const name = sanitizeName(newName)
      if (!name) return { error: 'invalid' }
      const target = join(dirname(source), name + EXT)
      if (target === source) return { path: source }
      // Case-only renames (a -> A) point at the same file on a case-insensitive disk.
      const sameFile = target.toLowerCase() === source.toLowerCase()
      if (!sameFile && (await exists(target))) return { error: 'exists' }
      await fs.rename(source, target)
      return { path: target }
    }
  )

  ipcMain.handle('library:remove', async (event, path: string, strings: DeleteStrings) => {
    const target = notePath(path)
    const win = BrowserWindow.fromWebContents(event.sender)
    const options = {
      type: 'warning' as const,
      message: strings.title,
      detail: strings.detail,
      buttons: [strings.cancel, strings.confirm],
      defaultId: 0,
      cancelId: 0
    }
    const { response } = win
      ? await dialog.showMessageBox(win, options)
      : await dialog.showMessageBox(options)
    if (response !== 1) return false
    await shell.trashItem(target)
    return true
  })

  ipcMain.handle('library:setLastNote', (_e, path: string | null) =>
    saveSettings({ lastNote: path ?? undefined })
  )
}
