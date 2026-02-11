import { syntaxHighlighting } from '@codemirror/language'
import { darkTheme } from './theme'
import { darkHighlightStyle, shellHighlight } from './highlightstyle'

export const darkEditor = [darkTheme, syntaxHighlighting(darkHighlightStyle)]
export const darkEditorLegacy = [darkTheme, syntaxHighlighting(shellHighlight)]
