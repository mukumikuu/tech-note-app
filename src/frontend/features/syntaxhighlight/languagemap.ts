import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { LanguageSupport, StreamLanguage } from '@codemirror/language'
import { shell } from '@codemirror/legacy-modes/mode/shell'
import type { Language } from '../../types/language'

type LanguageMap = Record<Language, LanguageSupport | StreamLanguage<Language>>
const languageMap: LanguageMap = {
  JavaScript: javascript(),
  Python: python(),
  Shell: StreamLanguage.define(shell),
}

export default languageMap
