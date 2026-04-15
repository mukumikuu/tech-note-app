import type { Diagnostic } from '@codemirror/lint'
import { linter } from '@codemirror/lint'

const sqlLinter = linter((view): Diagnostic[] => {
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

  // 1. SQL Injection - using string concatenation
  addMatches(
    /['"]["^'"]+\s*\+\s*['"][^'"]*['"]|CONCAT\s*\(/gi,
    'Potential SQL injection; use parameterized queries',
    'error'
  )

  // 2. Missing WHERE clause (dangerous deletes/updates)
  addMatches(
    /^(UPDATE|DELETE)\s+\w+(?!.*(WHERE|;))/gim,
    'Missing WHERE clause; this affects all rows',
    'error'
  )

  // 3. Missing ORDER BY
  addMatches(
    /LIMIT\s+\d+(?!.*ORDER\s+BY)/gi,
    'LIMIT without ORDER BY may give inconsistent results',
    'warning'
  )

  // 4. TODO comments
  addMatches(/--\s*TODO\b|\/\*\s*TODO\b/g, 'TODO comment left in code')

  // 5. Not using table aliases in joins
  addMatches(
    /JOIN\s+\w+(?!\s+(AS\s+)?\w+)/gi,
    'JOIN without alias; use aliases for clarity',
    'warning'
  )

  // 6. Missing semicolon at end of statement
  const lines = text.split('\n')
  let position = 0
  let inMultilineComment = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.includes('/*')) inMultilineComment = true
    if (trimmed.includes('*/')) inMultilineComment = false

    if (
      trimmed &&
      !inMultilineComment &&
      !trimmed.startsWith('--') &&
      (trimmed.match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i) ||
        trimmed.match(/^(WITH|UNION|EXCEPT|INTERSECT)/i)) &&
      !trimmed.endsWith(';')
    ) {
      diagnostics.push({
        from: position,
        to: position + line.length,
        severity: 'warning',
        message: 'SQL statement should end with semicolon',
      })
    }
    position += line.length + 1
  }

  // 7. Using LIKE with leading wildcard (inefficient)
  addMatches(
    /LIKE\s+['"]%[^%]/gi,
    "LIKE '%value' is inefficient; add index if needed",
    'warning'
  )

  return diagnostics
})

export default sqlLinter
