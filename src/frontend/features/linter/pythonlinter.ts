import type { Diagnostic } from '@codemirror/lint'
import { linter } from '@codemirror/lint'

const pythonLinter = linter((view): Diagnostic[] => {
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

  // 1. == None or != None
  addMatches(/\b==\s*None\b/g, "Use 'is None' instead of '== None'")
  addMatches(/\b!=\s*None\b/g, "Use 'is not None' instead of '!= None'")

  // 2. import *
  addMatches(/\bfrom\s+\w+\s+import\s+\*/g, 'Avoid wildcard imports', 'warning')

  // 3. Empty except block
  addMatches(/except\s*:\s*\n\s*pass/g, 'Avoid empty except block')

  // 4. Mutable default arguments
  addMatches(
    /def\s+\w+\(.*=\s*(\[\]|\{\})\)/g,
    'Avoid mutable default arguments',
    'error'
  )

  // 5. Tabs used for indentation
  addMatches(/^\t+/gm, 'Use spaces instead of tabs')

  const lines = text.split('\n')
  let position = 0

  for (const line of lines) {
    // 6. Trailing whitespace
    if (/\s+$/.test(line)) {
      diagnostics.push({
        from: position,
        to: position + line.length,
        severity: 'warning',
        message: 'Trailing whitespace',
      })
    }

    // 7. Line too long (PEP8: 79 chars)
    if (line.length > 79) {
      diagnostics.push({
        from: position,
        to: position + line.length,
        severity: 'warning',
        message: 'Line exceeds 79 characters',
      })
    }

    position += line.length + 1
  }

  // 8. Unused imports (basic heuristic)
  const importRegex = /\bimport\s+(\w+)/g
  for (const match of text.matchAll(importRegex)) {
    const moduleName = match[1]
    const occurrences = text.match(new RegExp(`\\b${moduleName}\\b`, 'g'))
    if (occurrences && occurrences.length === 1 && match.index !== undefined) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'warning',
        message: `Unused import '${moduleName}'`,
      })
    }
  }

  // 9. Unused variables (very basic heuristic)
  const varRegex = /^\s*(\w+)\s*=/gm
  for (const match of text.matchAll(varRegex)) {
    const variableName = match[1]
    const occurrences = text.match(new RegExp(`\\b${variableName}\\b`, 'g'))
    if (occurrences && occurrences.length === 1 && match.index !== undefined) {
      diagnostics.push({
        from: match.index,
        to: match.index + variableName.length,
        severity: 'warning',
        message: `Unused variable '${variableName}'`,
      })
    }
  }

  // // 10. Missing newline at end of file
  // if (!text.endsWith('\n')) {
  //   diagnostics.push({
  //     from: text.length - 1,
  //     to: text.length,
  //     severity: 'warning',
  //     message: 'File should end with a newline',
  //   })
  // }

  return diagnostics
})

export default pythonLinter
