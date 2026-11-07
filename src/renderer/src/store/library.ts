import { create } from 'zustand'
import type { DeleteStrings, NoteInfo, RenameResult } from '../../../shared/library'

const AUTOSAVE_DELAY = 600

const api = (): Window['api']['library'] => window.api.library

interface LibraryStore {
  folder: string | null
  notes: NoteInfo[]
  currentPath: string | null
  /** Text the editor is (re)created with. Only changes when a different note is loaded. */
  initialDoc: string
  /** Bumped on every load so the editor remounts with a fresh history. */
  docKey: number
  menuOpen: boolean

  init: () => Promise<void>
  chooseFolder: () => Promise<void>
  refresh: () => Promise<void>
  selectNote: (path: string) => Promise<void>
  newNote: (baseName: string) => Promise<void>
  edit: (text: string, untitledName: string) => void
  flush: () => Promise<void>
  renameNote: (path: string, newName: string) => Promise<RenameResult>
  removeNote: (path: string, strings: DeleteStrings) => Promise<void>
  setMenuOpen: (open: boolean) => void
}

// Autosave bookkeeping lives outside the store: it never drives rendering.
let pending: { path: string; text: string } | null = null
let timer: ReturnType<typeof setTimeout> | null = null
// Set while the first edit of an unsaved document is creating its file.
let creating: Promise<void> | null = null
let lateText: string | null = null

function queueSave(path: string, text: string, flush: () => Promise<void>): void {
  pending = { path, text }
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => void flush(), AUTOSAVE_DELAY)
}

export const useLibrary = create<LibraryStore>((set, get) => {
  const load = async (path: string | null): Promise<void> => {
    const initialDoc = path ? await api().read(path) : ''
    set((s) => ({ currentPath: path, initialDoc, docKey: s.docKey + 1 }))
    await api().setLastNote(path)
  }

  const applyState = async (state: {
    notes: NoteInfo[]
    folder: string
    lastNote: string | null
  }): Promise<void> => {
    set({ folder: state.folder, notes: state.notes })
    const last = state.notes.find((n) => n.path === state.lastNote) ?? state.notes[0]
    await load(last?.path ?? null)
  }

  return {
    folder: null,
    notes: [],
    currentPath: null,
    initialDoc: '',
    docKey: 0,
    menuOpen: false,

    init: async () => {
      const state = await api().getState()
      if (state) await applyState(state)
    },

    chooseFolder: async () => {
      await get().flush()
      const state = await api().openFolder()
      if (state) await applyState(state)
      set({ menuOpen: false })
    },

    refresh: async () => {
      if (!get().folder) return
      set({ notes: await api().list() })
    },

    selectNote: async (path) => {
      await get().flush()
      await load(path)
      set({ menuOpen: false })
    },

    newNote: async (baseName) => {
      await get().flush()
      const note = await api().create(baseName)
      await load(note.path)
      await get().refresh()
      set({ menuOpen: false })
    },

    edit: (text, untitledName) => {
      const { currentPath, folder } = get()
      if (currentPath) {
        queueSave(currentPath, text, get().flush)
      } else if (folder) {
        // First keystroke in an empty document: give it a file. Keystrokes that
        // land while the file is being created are saved right after.
        lateText = text
        creating ??= api()
          .create(untitledName, text)
          .then(async (note) => {
            set({ currentPath: note.path })
            await api().setLastNote(note.path)
            if (lateText !== null && lateText !== text) {
              queueSave(note.path, lateText, get().flush)
            }
            await get().refresh()
          })
          .finally(() => {
            creating = null
            lateText = null
          })
      }
    },

    flush: async () => {
      if (creating) await creating
      if (timer) clearTimeout(timer)
      timer = null
      if (!pending) return
      const { path, text } = pending
      pending = null
      await api().write(path, text)
      await get().refresh()
    },

    renameNote: async (path, newName) => {
      await get().flush()
      const result = await api().rename(path, newName)
      if ('path' in result) {
        if (get().currentPath === path) {
          set({ currentPath: result.path })
          await api().setLastNote(result.path)
        }
        await get().refresh()
      }
      return result
    },

    removeNote: async (path, strings) => {
      await get().flush()
      if (!(await api().remove(path, strings))) return
      await get().refresh()
      if (get().currentPath === path) await load(null)
    },

    setMenuOpen: (menuOpen) => set({ menuOpen })
  }
})
