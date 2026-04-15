import type { Diagnostic } from '@codemirror/lint'
import { linter } from '@codemirror/lint'

const shellLinter = linter((view): Diagnostic[] => {
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

  // // 1. Missing shebang
  // if (!text.startsWith('#!')) {
  //   diagnostics.push({
  //     from: 0,
  //     to: 0,
  //     severity: 'warning',
  //     message: 'Missing shebang (e.g. #!/bin/bash)',
  //   })
  // }

  // 2. Dangerous rm command
  addMatches(/\brm\s+-rf\s+\/\b/g, 'Dangerous command: rm -rf /', 'error')

  // 3. Unquoted variables (basic heuristic)
  addMatches(
    /\s\$[A-Za-z_][A-Za-z0-9_]*\s/g,
    'Quote your variables to prevent word splitting'
  )

  // 4. Backticks instead of $(...)
  addMatches(
    /`[^`]+`/g,
    'Use $(...) instead of backticks for command substitution'
  )

  // 5. [ without ]
  addMatches(/\[[^\]]*$/gm, 'Missing closing ] in test expression', 'error')

  // 6. == inside single bracket test
  addMatches(/\[\s*[^]]*==[^]]*\]/g, "Use '=' instead of '==' inside [ ] test")

  // 7. sudo inside script
  addMatches(/\bsudo\b/g, 'Avoid using sudo inside scripts')

  // 8. Useless use of cat
  addMatches(/\bcat\s+\S+\s+\|\s+/g, 'Useless use of cat')

  const lines = text.split('\n')
  let position = 0

  for (const line of lines) {
    // 9. Trailing whitespace
    if (/\s+$/.test(line)) {
      diagnostics.push({
        from: position,
        to: position + line.length,
        severity: 'warning',
        message: 'Trailing whitespace',
      })
    }

    // 10. Tabs used for indentation
    if (/^\t+/.test(line)) {
      diagnostics.push({
        from: position,
        to: position + line.length,
        severity: 'warning',
        message: 'Use spaces instead of tabs',
      })
    }

    position += line.length + 1
  }

  // // 11. Missing newline at end of file
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

export default shellLinter
