export type SearchResult = {
  notebookid: string
  name: string
  matches: Match[]
}

type Match = {
  blockid: string
  type: 'code' | 'markdown'
  snippet: string
}

export type SearchResultsEvent =
  | { status: 'success'; results: SearchResult[]; query: string }
  | { status: 'error'; error: string; query: string }
