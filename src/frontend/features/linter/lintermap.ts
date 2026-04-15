import type { Extension } from '@codemirror/state'
import type { Language } from '../../../shared/language'
import jsLinter from './jslinter'
import javaLinter from './javalinter'
import pythonLinter from './pythonlinter'
import shellLinter from './shelllinter'
import cppLinter from './cpplinter'
import sqlLinter from './sqllinter'

type LinterMap = Record<Language, Extension>
const linterMap: LinterMap = {
  Cpp: cppLinter,
  Java: javaLinter,
  JavaScript: jsLinter,
  Python: pythonLinter,
  Shell: shellLinter,
  SQL: sqlLinter,
}

export default linterMap
