import { useEffect } from 'react'
import { useI18n } from './i18n/useI18n'

function App(): React.JSX.Element {
  const { locale, t } = useI18n()

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <div className="app">
      <header className="titlebar" />
      <main className="welcome">
        <h1>{t('welcome.title')}</h1>
        <p>{t('welcome.subtitle')}</p>
      </main>
    </div>
  )
}

export default App
