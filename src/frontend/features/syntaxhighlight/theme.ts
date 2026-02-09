import { EditorView } from '@codemirror/view'
export const darkTheme = EditorView.theme(
  {
    '&': {
      color: '#d6d9e0',
      backgroundColor: '#2c3142',
    },

    '.cm-content': {
      caretColor: '#d6d9e0',
    },

    '.cm-activeLine': {
      backgroundColor: '#3a4058',
    },

    '.cm-activeLineGutter': {
      backgroundColor: '#343a52',
    },

    '.cm-gutters': {
      backgroundColor: '#2c3142',
      color: '#7f8599',
      borderRight: '1px solid #3a4058',
    },
  },
  { dark: true }
)
