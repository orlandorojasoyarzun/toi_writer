import { en } from './en'
import { es } from './es'

export type Locale = 'es' | 'en'
export type MessageKey = keyof typeof es

const messages: Record<Locale, Record<MessageKey, string>> = { es, en }

// navigator.language reflects the macOS system language inside Electron.
export function detectLocale(): Locale {
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function translate(locale: Locale, key: MessageKey): string {
  return messages[locale][key]
}
