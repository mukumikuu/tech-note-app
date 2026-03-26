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
