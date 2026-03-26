import { useEffect, useState } from 'react'
import { socket } from '../utils/socket'
import type { CellStatus } from '../../shared/cellstatus'
import type { SearchResult } from '../../shared/searchResult'

export function useSearch(notebookId?: string) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [status, setStatus] = useState<CellStatus>('idle')
  const [errors, setErrors] = useState<string>('')
  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected to search system')
    })
    socket.on('searchResults', (data) => {
      if (data.success) {
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
    })
    return () => {
      socket.off('connect')
      socket.off('searchResults')
    }
  }, [])

  const search = (query: string) => {
    if (query.trim() === '') {
      setResults([])
      return
    }
    setStatus('running')
    socket.emit('search', { query, notebookId: notebookId || null })
  }
  return { results, errors, search, status }
}
