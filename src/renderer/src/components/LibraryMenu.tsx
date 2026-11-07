import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/context'
import { useLibrary } from '../store/library'
import { FolderIcon, PencilIcon, PlusIcon, TrashIcon } from './icons'

function folderName(path: string): string {
  return path.split('/').filter(Boolean).pop() ?? path
}

function NoteRow({ path, name }: { path: string; name: string }): React.JSX.Element {
  const { t } = useI18n()
  const current = useLibrary((s) => s.currentPath === path)
  const { selectNote, renameNote, removeNote } = useLibrary.getState()
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState(false)

  const commit = async (): Promise<void> => {
    if (draft === null) return
    if (draft.trim() === name) return setDraft(null)
    const result = await renameNote(path, draft)
    if ('error' in result) return setError(true)
    setDraft(null)
  }

  if (draft !== null) {
    return (
      <li className="note-row editing">
        <input
          autoFocus
          className="note-input"
          value={draft}
          aria-invalid={error}
          title={error ? t('note.exists') : undefined}
          onChange={(e) => {
            setDraft(e.target.value)
            setError(false)
          }}
          onFocus={(e) => e.target.select()}
          onBlur={() => setDraft(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void commit()
            if (e.key === 'Escape') {
              e.stopPropagation()
              setDraft(null)
            }
          }}
        />
        {error && <span className="note-error">{t('note.exists')}</span>}
      </li>
    )
  }

  return (
    <li className={`note-row${current ? ' current' : ''}`}>
      <button className="note-open" onClick={() => void selectNote(path)} title={name}>
        {name}
      </button>
      <span className="note-actions">
        <button
          className="icon-button"
          aria-label={t('note.rename')}
          title={t('note.rename')}
          onClick={() => setDraft(name)}
        >
          <PencilIcon />
        </button>
        <button
          className="icon-button"
          aria-label={t('note.delete')}
          title={t('note.delete')}
          onClick={() =>
            void removeNote(path, {
              title: t('note.delete.title', { name }),
              detail: t('note.delete.detail'),
              confirm: t('note.delete.confirm'),
              cancel: t('common.cancel')
            })
          }
        >
          <TrashIcon />
        </button>
      </span>
    </li>
  )
}

export function LibraryMenu(): React.JSX.Element {
  const { t } = useI18n()
  const { folder, notes, menuOpen, setMenuOpen, chooseFolder, newNote } = useLibrary()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: MouseEvent): void => {
      if (!root.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen, setMenuOpen])

  return (
    <div className="library" ref={root}>
      <button
        className={`library-dot${menuOpen ? ' open' : ''}`}
        aria-label={t('library.toggle')}
        aria-expanded={menuOpen}
        title={t('library.toggle')}
        onClick={() => setMenuOpen(!menuOpen)}
      />
      {menuOpen && (
        <div className="library-panel" role="dialog" aria-label={t('library.toggle')}>
          {folder ? (
            <>
              <div className="library-header">
                <span className="library-folder" title={folder}>
                  {folderName(folder)}
                </span>
                <button
                  className="icon-button"
                  aria-label={t('library.changeFolder')}
                  title={t('library.changeFolder')}
                  onClick={() => void chooseFolder()}
                >
                  <FolderIcon />
                </button>
              </div>
              <button className="library-action" onClick={() => void newNote(t('note.untitled'))}>
                <PlusIcon />
                {t('library.newNote')}
              </button>
              {notes.length === 0 ? (
                <p className="library-empty">{t('library.empty')}</p>
              ) : (
                <ul className="note-list">
                  {notes.map((n) => (
                    <NoteRow key={n.path} path={n.path} name={n.name} />
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="library-onboarding">
              <p>{t('library.noFolder')}</p>
              <button className="library-action primary" onClick={() => void chooseFolder()}>
                <FolderIcon />
                {t('library.chooseFolder')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
