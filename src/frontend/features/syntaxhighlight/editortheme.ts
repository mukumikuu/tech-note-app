import { syntaxHighlighting } from '@codemirror/language'
import { darkTheme } from './theme'
import { darkHighlightStyle } from './highlightstyle'

export const darkEditor = [darkTheme, syntaxHighlighting(darkHighlightStyle)]
