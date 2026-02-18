import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { cpp } from '@codemirror/lang-cpp'
import { java } from '@codemirror/lang-java'
import { LanguageSupport, StreamLanguage } from '@codemirror/language'
import { shell } from '@codemirror/legacy-modes/mode/shell'
import type { Language } from '../../../shared/language'

type LanguageMap = Record<Language, LanguageSupport | StreamLanguage<Language>>
const languageMap: LanguageMap = {
  Cpp: cpp(),
  Java: java(),
  JavaScript: javascript(),
  Python: python(),
  Shell: StreamLanguage.define(shell),
}

export default languageMap
