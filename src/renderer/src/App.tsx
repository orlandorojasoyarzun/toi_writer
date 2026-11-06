import { useEffect } from 'react'
import Editor from './editor/Editor'
import { useI18n } from './i18n/useI18n'

function App(): React.JSX.Element {
  const { locale, t } = useI18n()

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <div className="app">
      <header className="titlebar" />
      <Editor placeholder={t('editor.placeholder')} />
    </div>
  )
}

export default App
