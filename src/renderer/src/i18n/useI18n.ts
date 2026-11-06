import { useCallback, useState } from 'react'
import { detectLocale, translate, type Locale, type MessageKey } from './index'

export function useI18n(): {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey) => string
} {
  const [locale, setLocale] = useState<Locale>(detectLocale)
  const t = useCallback((key: MessageKey) => translate(locale, key), [locale])
  return { locale, setLocale, t }
}
