import type { es } from './es'

export const en: Record<keyof typeof es, string> = {
  'app.title': 'toi_writer',
  'editor.placeholder': 'Start writing…',
  'common.cancel': 'Cancel',
  'library.toggle': 'Library',
  'library.noFolder': 'Choose a folder to keep your notes in.',
  'library.chooseFolder': 'Choose folder…',
  'library.changeFolder': 'Change folder',
  'library.newNote': 'New note',
  'library.empty': 'No notes yet.',
  'view.focus': 'Sentence focus',
  'view.typewriter': 'Typewriter',
  'note.untitled': 'Untitled',
  'note.rename': 'Rename',
  'note.delete': 'Move to Trash',
  'note.exists': 'A note with that name already exists.',
  'note.delete.title': 'Move “{name}” to the Trash?',
  'note.delete.detail': 'You can restore it from the Trash.',
  'note.delete.confirm': 'Move to Trash'
}
