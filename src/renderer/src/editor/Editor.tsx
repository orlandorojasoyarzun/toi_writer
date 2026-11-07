import { useEffect, useRef } from 'react'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { editorExtensions } from './theme'

interface EditorProps {
  initialDoc: string
  placeholder: string
  onChange?: (doc: string) => void
}

function Editor({
  initialDoc,
  placeholder: placeholderText,
  onChange
}: EditorProps): React.JSX.Element {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const placeholderSlot = useRef(new Compartment())
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

  return <div className="editor" ref={host} />
}

export default Editor
