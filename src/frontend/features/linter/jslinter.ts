import type { Diagnostic } from '@codemirror/lint'
import { linter } from '@codemirror/lint'

const jsLinter = linter((view): Diagnostic[] => {
  const diagnostics: Diagnostic[] = []
  const text = view.state.doc.toString()

  const addMatches = (
    regex: RegExp,
    message: string,
    severity: 'error' | 'warning' = 'warning'
  ) => {
    for (const match of text.matchAll(regex)) {
      if (match.index !== undefined) {
        diagnostics.push({
          from: match.index,
          to: match.index + match[0].length,
          severity,
          message,
        })
      }
    }
  }

  // 1. Avoid var
  addMatches(/\bvar\b/g, "Avoid using 'var', use 'let' or 'const'")

  // 2. Enforce strict equality
  addMatches(/([^=!])==([^=])/g, "Use '===' instead of '=='")
  addMatches(/!=([^=])/g, "Use '!==' instead of '!='")

  // 3. debugger statement
  addMatches(/\bdebugger\b/g, 'Remove debugger statement', 'error')

  // 4. Missing semicolon
  const lines = text.split('\n')
  let position = 0
  for (const line of lines) {
    const trimmed = line.trim()
    if (
      trimmed &&
      !trimmed.endsWith(';') &&
      !trimmed.endsWith(',') &&
      !trimmed.endsWith('{') &&
      !trimmed.endsWith('}') &&
      !trimmed.startsWith('//')
    ) {
      diagnostics.push({
        from: position,
        to: position + line.length,
        severity: 'warning',
        message: 'Possible missing semicolon',
      })
    }
    position += line.length + 1
  }

  // 5. Unused variable
  const variableRegex = /\b(let|const)\s+(\w+)/g
  for (const match of text.matchAll(variableRegex)) {
    const variableName = match[2]
    const occurrences = text.match(new RegExp(`\\b${variableName}\\b`, 'g'))
    if (occurrences && occurrences.length === 1 && match.index !== undefined) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'warning',
        message: `Unused variable '${variableName}'`,
      })
    }
  }

  return diagnostics
})

export default jsLinter
