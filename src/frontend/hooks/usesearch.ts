import { useEffect, useState } from 'react'
import { socket } from '../utils/socket'
import type { CellStatus } from '../../shared/cellstatus'
import type {
  Match,
  SearchResult,
  SearchResultsEvent,
} from '../../shared/searchResult'
import Block from '../../shared/block'

export function useSearch(notebookId?: string, blocks?: Block[]) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [status, setStatus] = useState<CellStatus>('idle')
  const [errors, setErrors] = useState<string>('')
  const searchHandler = (data: SearchResultsEvent) => {
    if (data.status === 'success') {
      setResults(data.results)
      setErrors('')
      setStatus('success')
      setTimeout(() => {
        setStatus('idle')
      }, 300)
    } else {
      setErrors(data.error)
      setResults([])
      setStatus('error')
      setTimeout(() => {}, 300)
    }
  }
  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected to search system')
    })
    socket.on('searchResults', searchHandler)
    return () => {
      socket.off('connect')
      socket.off('searchResults', searchHandler)
    }
  }, [])
  const searchInNotebook = (query: string) => {
    if (!blocks) return
    const regex = new RegExp(query, 'gi')
    const matches: Match[] = []
    for (const block of blocks) {
      const text = block.content
      let m
      while ((m = regex.exec(text!)) !== null) {
        matches.push({
          blockid: block.blockid,
          type: block.type,
          snippet: text?.slice(
            Math.max(0, m.index - 30),
            m.index + m[0].length + 30
          ),
          from: m.index,
          to: m.index + m[0].length,
        })
      }
    }
    setResults([{ notebookid: notebookId!, name: '', matches }])
    setStatus('success')
  }
  const search = (query: string) => {
    if (query.trim() === '') {
      setResults([])
      return
    }
    setStatus('running')
    if (notebookId && blocks) {
      searchInNotebook(query)
    } else {
      socket.emit('search', { query })
    }
  }
  return { results, errors, search, status }
}
