import { en } from './en'
import { es } from './es'

export type Locale = 'es' | 'en'
export type MessageKey = keyof typeof es

const messages: Record<Locale, Record<MessageKey, string>> = { es, en }

// navigator.language reflects the macOS system language inside Electron.
export function detectLocale(): Locale {
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function translate(locale: Locale, key: MessageKey, vars?: Record<string, string>): string {
  const text = messages[locale][key]
  return vars ? text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '') : text
}
