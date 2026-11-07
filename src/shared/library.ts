export interface NoteInfo {
  path: string
  /** File name without the .md extension. */
  name: string
  mtime: number
}

export interface LibraryState {
  folder: string
  notes: NoteInfo[]
  lastNote: string | null
}

export type RenameResult = { path: string } | { error: 'exists' | 'invalid' }

export interface DeleteStrings {
  title: string
  detail: string
  confirm: string
  cancel: string
}

export interface LibraryApi {
  /** Restores the last opened folder, or null if none is set (or it vanished). */
  getState(): Promise<LibraryState | null>
  /** Shows the native folder picker. Null when the user cancels. */
  openFolder(): Promise<LibraryState | null>
  list(): Promise<NoteInfo[]>
  read(path: string): Promise<string>
  write(path: string, content: string): Promise<void>
  create(baseName: string, content?: string): Promise<NoteInfo>
  rename(path: string, newName: string): Promise<RenameResult>
  /** Asks for confirmation, then moves the note to the Trash. False if cancelled. */
  remove(path: string, strings: DeleteStrings): Promise<boolean>
  setLastNote(path: string | null): Promise<void>
}
