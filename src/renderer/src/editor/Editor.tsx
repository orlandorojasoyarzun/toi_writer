import { useEffect, useRef } from 'react'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { focusExtension } from './focus'
import { editorExtensions } from './theme'
import { centerCursor, typewriterExtension } from './typewriter'

interface EditorProps {
  initialDoc: string
  placeholder: string
  focus: boolean
  typewriter: boolean
  onChange?: (doc: string) => void
}

function Editor({
  initialDoc,
  placeholder: placeholderText,
  focus,
  typewriter,
  onChange
}: EditorProps): React.JSX.Element {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const placeholderSlot = useRef(new Compartment())
  const focusSlot = useRef(new Compartment())
  const typewriterSlot = useRef(new Compartment())
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  })

  useEffect(() => {
    const editor = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: initialDoc,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          markdown({ base: markdownLanguage }),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ spellcheck: 'true', autocorrect: 'on' }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current?.(update.state.doc.toString())
          }),
          placeholderSlot.current.of(placeholder(placeholderText)),
          focusSlot.current.of(focusExtension(focus)),
          typewriterSlot.current.of(typewriterExtension(typewriter)),
          ...editorExtensions
        ]
      })
    })
    view.current = editor
    editor.focus()
    return () => {
      editor.destroy()
      view.current = null
    }
    // The editor is created once per document (App remounts it via `key`); the
    // placeholder is reconfigured below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    view.current?.dispatch({
      effects: placeholderSlot.current.reconfigure(placeholder(placeholderText))
    })
  }, [placeholderText])

  useEffect(() => {
    view.current?.dispatch({ effects: focusSlot.current.reconfigure(focusExtension(focus)) })
  }, [focus])

  useEffect(() => {
    const editor = view.current
    if (!editor) return
    editor.dispatch({
      effects: typewriterSlot.current.reconfigure(typewriterExtension(typewriter))
    })
    if (typewriter) centerCursor(editor)
  }, [typewriter])

  return <div className="editor" ref={host} />
}

export default Editor
