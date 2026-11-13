import { useEffect } from 'react'
import Editor from './editor/Editor'
import { LibraryMenu } from './components/LibraryMenu'
import { useI18n } from './i18n/context'
import { useLibrary } from './store/library'
import { useView } from './store/view'

function App(): React.JSX.Element {
  const { t } = useI18n()
  const docKey = useLibrary((s) => s.docKey)
  const initialDoc = useLibrary((s) => s.initialDoc)
  const title = useLibrary((s) => s.notes.find((n) => n.path === s.currentPath)?.name)
  const focus = useView((s) => s.focus)
  const typewriter = useView((s) => s.typewriter)
  const { init, edit, flush, refresh, newNote, chooseFolder, setMenuOpen } = useLibrary.getState()

  useEffect(() => {
    void init()
  }, [init])

  useEffect(() => {
    const onFocus = (): void => void refresh()
    const onBlur = (): void => void flush()
    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)
    window.addEventListener('beforeunload', onBlur)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('beforeunload', onBlur)
    }
  }, [refresh, flush])

  // Native menu shortcuts arrive in milestone 7; until then, handle them here.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (!e.metaKey || e.altKey) return
      const key = e.key.toLowerCase()
      if (e.shiftKey) {
        if (key === 'f') {
          e.preventDefault()
          useView.getState().toggleFocus()
        } else if (key === 't') {
          e.preventDefault()
          useView.getState().toggleTypewriter()
        }
        return
      }
      if (key === 'l') {
        e.preventDefault()
        setMenuOpen(!useLibrary.getState().menuOpen)
      } else if (key === 'n' && useLibrary.getState().folder) {
        e.preventDefault()
        void newNote(t('note.untitled'))
      } else if (key === 'o') {
        e.preventDefault()
        void chooseFolder()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [newNote, chooseFolder, setMenuOpen, t])

  return (
    <div className="app">
      <header className="titlebar">
        <span className="titlebar-title">{title}</span>
        <LibraryMenu />
      </header>
      <Editor
        key={docKey}
        initialDoc={initialDoc}
        placeholder={t('editor.placeholder')}
        focus={focus}
        typewriter={typewriter}
        onChange={(doc) => edit(doc, t('note.untitled'))}
      />
    </div>
  )
}

export default App
