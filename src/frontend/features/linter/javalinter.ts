import type { Diagnostic } from '@codemirror/lint'
import { linter } from '@codemirror/lint'

const javaLinter = linter((view): Diagnostic[] => {
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

  // 1. String comparison using ==
  addMatches(
    /"[^"]*"\s*==\s*[^;\n]+/g,
    'Use .equals() to compare Strings instead of ==',
    'error'
  )

  // 2. Empty catch block
  addMatches(
    /catch\s*\([^)]+\)\s*\{\s*\}/g,
    'Empty catch block detected',
    'warning'
  )

  // 3. TODO comments
  addMatches(/\/\/\s*TODO\b/g, 'TODO comment left in code')

  // 4. Thread.sleep usage
  addMatches(/\bThread\.sleep\s*\(/g, 'Avoid Thread.sleep() in main thread')

  // 5. Class name should start with uppercase
  const classRegex = /\bclass\s+([a-z]\w*)/g
  for (const match of text.matchAll(classRegex)) {
    if (match.index !== undefined) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'warning',
        message: 'Class name should start with an uppercase letter',
      })
    }
  }

  // 6. Unused imports (basic heuristic)
  const importRegex = /\bimport\s+([\w.]+);/g
  for (const match of text.matchAll(importRegex)) {
    const fullImport = match[1]
    const simpleName = fullImport.split('.').pop()
    if (
      simpleName &&
      text.match(new RegExp(`\\b${simpleName}\\b`, 'g'))?.length === 1 &&
      match.index !== undefined
    ) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'warning',
        message: `Unused import '${simpleName}'`,
      })
    }
  }

  // 7. Missing semicolon (line-based heuristic)
  const lines = text.split('\n')
  let position = 0
  for (const line of lines) {
    const trimmed = line.trim()
    if (
      trimmed &&
      !trimmed.endsWith(';') &&
      !trimmed.endsWith('{') &&
      !trimmed.endsWith('}') &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('import') &&
      !trimmed.startsWith('class') &&
      !trimmed.startsWith('@')
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

  return diagnostics
})

export default javaLinter
