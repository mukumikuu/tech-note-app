import type { Extension } from '@codemirror/state'
import type { Language } from '../../../shared/language'
import jsLinter from './jslinter'
import javaLinter from './javalinter'
type LinterMap = Record<Language, Extension>
const linterMap: LinterMap = {
  Cpp: jsLinter,
  Java: javaLinter,
  JavaScript: jsLinter,
  Python: jsLinter,
  Shell: jsLinter,
  SQL: jsLinter,
}

export default linterMap
