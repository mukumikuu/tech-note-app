import { EditorView } from '@codemirror/view'
type EditorDiv = HTMLDivElement & {
  cmView: EditorView
}

export type { EditorDiv }
