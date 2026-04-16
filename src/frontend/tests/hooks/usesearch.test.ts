import { renderHook, act } from '@testing-library/react'
import { useSearch } from '../../hooks/usesearch'
import Block from '../../../shared/block'

jest.mock('../../utils/socket', () => ({
  socket: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}))

import { socket } from '../../utils/socket'
const mockSocket = socket as jest.Mocked<typeof socket>

const mockBlocks: Block[] = [
  { blockid: 'a', type: 'markdown', content: 'hello world nanda' },
  {
    blockid: 'b',
    type: 'code',
    content: 'console.log("hello")',
    language: 'JavaScript',
  },
]

describe('useSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('H24-Verify socket listeners registered on mount', () => {
    renderHook(() => useSearch())
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith(
      'searchResults',
      expect.any(Function)
    )
  })
  it('H25-Verify socket listeners removed on unmount', () => {
    const { unmount } = renderHook(() => useSearch())
    unmount()
    expect(mockSocket.off).toHaveBeenCalledWith('connect')
    expect(mockSocket.off).toHaveBeenCalledWith(
      'searchResults',
      expect.any(Function)
    )
  })
  it('H26-Verify search clears results on empty query', () => {
    const { result } = renderHook(() => useSearch('nb1', mockBlocks))
    act(() => {
      result.current.search('')
    })
    expect(result.current.results).toEqual([])
  })
  it('H27-Verify search clears results on whitespace query', () => {
    const { result } = renderHook(() => useSearch('nb1', mockBlocks))
    act(() => {
      result.current.search('   ')
    })
    expect(result.current.results).toEqual([])
  })
  it('H28-Verify search emits socket event when no notebookId or blocks', () => {
    const { result } = renderHook(() => useSearch())
    act(() => {
      result.current.search('hello')
    })
    expect(mockSocket.emit).toHaveBeenCalledWith('search', { query: 'hello' })
    expect(result.current.status).toBe('running')
  })
  it('H29-Verify search finds matches in blocks', () => {
    const { result } = renderHook(() => useSearch('nb1', mockBlocks))
    act(() => {
      result.current.search('hello')
    })
    expect(result.current.results).toHaveLength(1)
    expect(result.current.results[0].matches).toHaveLength(2)
    expect(result.current.status).toBe('success')
  })
  it('H30-Verify search match contains correct blockid and range', () => {
    const { result } = renderHook(() => useSearch('nb1', mockBlocks))
    act(() => {
      result.current.search('nanda')
    })
    const match = result.current.results[0].matches[0]
    expect(match.blockid).toBe('a')
    expect(match.from).toBe(12)
    expect(match.to).toBe(17)
  })
  it('H31-Verify search returns empty matches when no match found', () => {
    const { result } = renderHook(() => useSearch('nb1', mockBlocks))
    act(() => {
      result.current.search('zzznomatch')
    })
    expect(result.current.results[0].matches).toHaveLength(0)
  })
  it('H32-Verify search does nothing when blocks is undefined', () => {
    const { result } = renderHook(() => useSearch('nb1', undefined))
    act(() => {
      result.current.search('hello')
    })
    expect(result.current.results).toEqual([])
  })
  it('H33-Verify searchHandler updates results on success', () => {
    const { result } = renderHook(() => useSearch())
    const searchHandler = mockSocket.on.mock.calls.find(
      ([e]) => e === 'searchResults'
    )?.[1]
    act(() => {
      searchHandler?.({
        status: 'success',
        results: [{ notebookid: 'nb1', name: 'test', matches: [] }],
      })
    })
    expect(result.current.results).toHaveLength(1)
    expect(result.current.errors).toBe('')
    expect(result.current.status).toBe('success')
  })
  it('H34-Verify searchHandler sets error on failure', () => {
    const { result } = renderHook(() => useSearch())
    const searchHandler = mockSocket.on.mock.calls.find(
      ([e]) => e === 'searchResults'
    )?.[1]
    act(() => {
      searchHandler?.({ status: 'error', error: 'search failed' })
    })
    expect(result.current.errors).toBe('search failed')
    expect(result.current.results).toEqual([])
    expect(result.current.status).toBe('error')
  })
  it('H35-Verify status resets to idle after success', () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useSearch())
    const searchHandler = mockSocket.on.mock.calls.find(
      ([e]) => e === 'searchResults'
    )?.[1]
    act(() => {
      searchHandler?.({ status: 'success', results: [] })
    })
    expect(result.current.status).toBe('success')
    act(() => {
      jest.advanceTimersByTime(300)
    })
    expect(result.current.status).toBe('idle')
    jest.useRealTimers()
  })
})
