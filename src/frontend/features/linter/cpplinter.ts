import type { Diagnostic } from '@codemirror/lint'
import { linter } from '@codemirror/lint'

const cppLinter = linter((view): Diagnostic[] => {
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

  // 1. C-style IO
  addMatches(/\bprintf\s*\(/g, 'Use std::cout instead of printf')
  addMatches(/\bscanf\s*\(/g, 'Use std::cin instead of scanf')

  // 2. Raw new/delete
  addMatches(/\bnew\s+\w+/g, 'Avoid raw new, use smart pointers')
  addMatches(/\bdelete\s+/g, 'Avoid raw delete, use smart pointers')

  // 3. NULL instead of nullptr
  addMatches(/\bNULL\b/g, 'Use nullptr instead of NULL')

  // 4. typedef instead of using
  addMatches(/\btypedef\b/g, 'Prefer using over typedef')

  // 5. std::endl performance warning
  addMatches(
    /\bstd::endl\b/g,
    'Use \\n instead of std::endl for better performance'
  )

  // 6. Dangerous gets()
  addMatches(/\bgets\s*\(/g, 'gets() is unsafe', 'error')

  // 7. Missing header guard or pragma once
  if (
    text.includes('#include') &&
    !text.includes('#pragma once') &&
    !/#ifndef\s+\w+/.test(text)
  ) {
    diagnostics.push({
      from: 0,
      to: 0,
      severity: 'warning',
      message: 'Header file missing include guard or #pragma once',
    })
  }

  // 8. Unused includes (basic heuristic)
  const includeRegex = /#include\s+[<"](\w+)[>"]/g
  for (const match of text.matchAll(includeRegex)) {
    const header = match[1]
    const occurrences = text.match(new RegExp(`\\b${header}\\b`, 'g'))
    if (occurrences && occurrences.length === 1 && match.index !== undefined) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'warning',
        message: `Possibly unused include <${header}>`,
      })
    }
  }

  // 9. Missing semicolon (line heuristic)
  const lines = text.split('\n')
  let position = 0

  for (const line of lines) {
    const trimmed = line.trim()

    if (
      trimmed &&
      !trimmed.endsWith(';') &&
      !trimmed.endsWith('{') &&
      !trimmed.endsWith('}') &&
      !trimmed.startsWith('#') &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('class') &&
      !trimmed.startsWith('struct')
    ) {
      diagnostics.push({
        from: position,
        to: position + line.length,
        severity: 'warning',
        message: 'Possible missing semicolon',
      })
    }

    // 10. Trailing whitespace
    if (/\s+$/.test(line)) {
      diagnostics.push({
        from: position,
        to: position + line.length,
        severity: 'warning',
        message: 'Trailing whitespace',
      })
    }

    position += line.length + 1
  }

  // 11. Missing newline at EOF
  if (!text.endsWith('\n')) {
    diagnostics.push({
      from: text.length - 1,
      to: text.length,
      severity: 'warning',
      message: 'File should end with a newline',
    })
  }

  return diagnostics
})

export default cppLinter
