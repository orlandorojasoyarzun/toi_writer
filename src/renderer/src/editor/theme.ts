import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

// All colors come from CSS variables so light/dark follow the system theme.
export const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    color: 'var(--text)',
    backgroundColor: 'transparent',
    fontFamily: 'var(--font-editor)',
    fontSize: 'var(--editor-font-size)'
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': {
    fontFamily: 'inherit',
    lineHeight: 'var(--editor-line-height)',
    overflow: 'auto'
  },
  '.cm-content': {
    maxWidth: 'var(--editor-measure)',
    margin: '0 auto',
    padding: '24px 32px 40vh',
    caretColor: 'var(--accent)',
    userSelect: 'text'
  },
  '.cm-line': { padding: '0' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--accent)', borderLeftWidth: '2px' },
  '.cm-placeholder': { color: 'var(--text-muted)' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground':
    { background: 'var(--selection)' }
})

// Markdown syntax stays visible but dimmed, so the text itself reads first.
const markdownHighlight = HighlightStyle.define([
  { tag: t.processingInstruction, color: 'var(--text-dim)' },
  { tag: t.heading1, fontWeight: '700' },
  { tag: [t.heading2, t.heading3, t.heading4, t.heading5, t.heading6], fontWeight: '700' },
  { tag: t.strong, fontWeight: '700' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through', color: 'var(--text-muted)' },
  { tag: t.quote, color: 'var(--text-muted)' },
  { tag: t.link, textDecoration: 'underline' },
  { tag: t.url, color: 'var(--text-dim)' },
  { tag: t.monospace, backgroundColor: 'var(--code-bg)', borderRadius: '3px' },
  { tag: t.contentSeparator, color: 'var(--text-dim)' }
])

export const editorExtensions = [editorTheme, syntaxHighlighting(markdownHighlight)]
