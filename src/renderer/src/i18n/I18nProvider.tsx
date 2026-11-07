import { useEffect, useMemo, useState } from 'react'
import { I18nContext, type I18n } from './context'
import { detectLocale, translate, type Locale } from './index'

export function I18nProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [locale, setLocale] = useState<Locale>(detectLocale)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18n>(
    () => ({ locale, setLocale, t: (key, vars) => translate(locale, key, vars) }),
    [locale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
