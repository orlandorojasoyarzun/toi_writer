import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

/** Scrolls the cursor line to the vertical center of the editor. */
export function centerCursor(view: EditorView): void {
  requestAnimationFrame(() => {
    view.dispatch({
      effects: EditorView.scrollIntoView(view.state.selection.main.head, { y: 'center' })
    })
  })
}

// Recenters while typing or moving with the keyboard, but not on mouse clicks:
// the text jumping under the pointer would be disorienting.
const recenter = EditorView.updateListener.of((update) => {
  const moved =
    update.docChanged ||
    (update.selectionSet && !update.transactions.some((tr) => tr.isUserEvent('select.pointer')))
  if (moved) centerCursor(update.view)
})

// There is deliberately no extra room above the first line: adding it would make
// the text jump on the first keystroke. The first lines start at the top and the
// cursor settles at the center once the text grows past it.
export function typewriterExtension(enabled: boolean): Extension {
  return enabled ? recenter : []
}
