export type SearchResult = {
  notebookid: string
  name: string
  matches: Match[]
}

export type Match = {
  blockid: string
  type: 'code' | 'markdown'
  snippet: string | undefined
  from: number
  to: number
}

export type SearchResultsEvent =
  | { status: 'success'; results: SearchResult[]; query: string }
  | { status: 'error'; error: string; query: string }
