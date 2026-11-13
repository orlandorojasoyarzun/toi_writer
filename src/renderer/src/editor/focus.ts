import { RangeSetBuilder, type EditorState, type Extension } from '@codemirror/state'
import {
  Decoration,
  ViewPlugin,
  type DecorationSet,
  type EditorView,
  type ViewUpdate
} from '@codemirror/view'

interface Span {
  from: number
  to: number
}

// A sentence ends at . ! ? … (plus closing quotes/brackets) followed by whitespace.
// Abbreviations like "Sr. Pérez" are split too; a good-enough heuristic for focus.
const SENTENCE_END = /[.!?…]+["'’”»)\]]*(?=\s|$)/g

// Sentences never cross a line break: pressing Enter always starts a new one, so
// the line you are typing on is the focus even before you write a period.
function sentenceAt(state: EditorState, pos: number): Span {
  const line = state.doc.lineAt(pos)
  const rel = pos - line.from
  const ends: number[] = []
  for (const m of line.text.matchAll(SENTENCE_END)) ends.push(m.index + m[0].length)
  if (ends[ends.length - 1] !== line.text.length) ends.push(line.text.length)

  let start = 0
  for (const end of ends) {
    let next = end
    while (next < line.text.length && /\s/.test(line.text[next])) next++
    // The gap between two sentences still belongs to the one before it, so typing
    // a space after a period doesn't jump the focus ahead.
    if (rel < next || end === line.text.length) {
      return { from: line.from + start, to: line.from + end }
    }
    start = next
  }
  return { from: line.from, to: line.to }
}

function activeSpan(state: EditorState): Span {
  const { from, to } = state.selection.main
  const a = sentenceAt(state, from)
  if (from === to) return a
  const b = sentenceAt(state, to)
  return { from: Math.min(a.from, b.from), to: Math.max(a.to, b.to) }
}

const dim = Decoration.mark({ class: 'cm-dim' })

function buildDimming(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  const active = activeSpan(view.state)
  // Only the visible part of the document is decorated, to keep long notes fast.
  for (const { from, to } of view.visibleRanges) {
    if (from < active.from) builder.add(from, Math.min(to, active.from), dim)
    if (to > active.to) builder.add(Math.max(from, active.to), to, dim)
  }
  return builder.finish()
}

const focusPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = buildDimming(view)
    }

    update(update: ViewUpdate): void {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.decorations = buildDimming(update.view)
      }
    }
  },
  { decorations: (plugin) => plugin.decorations }
)

export function focusExtension(enabled: boolean): Extension {
  return enabled ? focusPlugin : []
}
