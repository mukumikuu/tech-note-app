import {
  buildHighlights,
  highlightInRenderedMarkdown,
  clearDomHighlights,
  useHighlight,
} from '../../hooks/usehighlight'
import { Decoration } from '@codemirror/view'
import { EditorView } from '@codemirror/view'
import { renderHook } from '@testing-library/react'
import type { SearchResult } from '../../../shared/searchResult'

describe('buildHighlights', () => {
  const matches = [
    { blockid: 'a', type: 'code' as const, from: 5, to: 10, snippet: 'hello' },
    { blockid: 'a', type: 'code' as const, from: 0, to: 3, snippet: 'abc' },
  ]

  it('H36-Verify returns empty decoration when no matches', () => {
    const result = buildHighlights([])
    expect(result).toEqual(Decoration.none)
  })

  it('H37-Verify sorts matches by from position', () => {
    expect(() => buildHighlights(matches)).not.toThrow()
  })

  it('H38-Verify focused index gets focus mark', () => {
    expect(() => buildHighlights(matches, 0)).not.toThrow()
  })

  it('H39-Verify non-focused index gets match mark', () => {
    expect(() => buildHighlights(matches, 1)).not.toThrow()
  })
})

describe('highlightInRenderedMarkdown', () => {
  it('H40-Verify wraps matched text in mark tag', () => {
    const el = document.createElement('div')
    el.textContent = 'hello world'
    document.body.appendChild(el)
    highlightInRenderedMarkdown(el, 'hello')
    expect(el.querySelector('mark')).toBeInTheDocument()
    expect(el.querySelector('mark')?.textContent).toBe('hello')
  })

  it('H41-Verify is case insensitive', () => {
    const el = document.createElement('div')
    el.textContent = 'Hello World'
    highlightInRenderedMarkdown(el, 'hello')
    expect(el.querySelector('mark')?.textContent).toBe('Hello')
  })

  it('H42-Verify does nothing when no match', () => {
    const el = document.createElement('div')
    el.textContent = 'hello world'
    highlightInRenderedMarkdown(el, 'zzz')
    expect(el.querySelector('mark')).not.toBeInTheDocument()
  })

  it('H43-Verify skips text nodes with no parent', () => {
    const el = document.createElement('div')
    el.textContent = 'hello'
    expect(() => highlightInRenderedMarkdown(el, 'hello')).not.toThrow()
  })
})

describe('clearDomHighlights', () => {
  it('H44-Verify removes search wrapper spans', () => {
    const el = document.createElement('div')
    el.innerHTML =
      '<span data-search-wrapper="true"><mark>hello</mark> world</span>'
    clearDomHighlights(el)
    expect(el.querySelector('[data-search-wrapper]')).not.toBeInTheDocument()
    expect(el.textContent).toBe('hello world')
  })

  it('H45-Verify does nothing when no wrappers present', () => {
    const el = document.createElement('div')
    el.textContent = 'plain text'
    expect(() => clearDomHighlights(el)).not.toThrow()
    expect(el.textContent).toBe('plain text')
  })

  it('H46-Verify normalizes text nodes after removal', () => {
    const el = document.createElement('div')
    el.innerHTML = 'before <span data-search-wrapper="true">hello</span> after'
    clearDomHighlights(el)
    expect(el.childNodes.length).toBe(1)
    expect(el.textContent).toBe('before hello after')
  })
})

describe('useHighlight', () => {
  it('H47-Verify useHighlight does nothing on empty search', () => {
    const editors = new Map<string, EditorView>()
    const renderedRefs = new Map<string, HTMLElement>()
    const dispatchMock = jest.fn()
    editors.set('a', { dispatch: dispatchMock } as unknown as EditorView)
    renderHook(() => useHighlight([], editors, renderedRefs))
    expect(dispatchMock).toHaveBeenCalledTimes(1)
  })

  it('H48-Verify useHighlight can highlight code', () => {
    const editors = new Map<string, EditorView>()
    const renderedRefs = new Map<string, HTMLElement>()
    const dispatchMock = jest.fn()
    editors.set('blockA', { dispatch: dispatchMock } as unknown as EditorView)
    const results: SearchResult[] = [
      {
        notebookid: 'b',
        name: 'yaya',
        matches: [
          {
            type: 'code',
            blockid: 'blockA',
            from: 0,
            to: 5,
            snippet: 'abcdefg',
          },
        ],
      },
    ]
    renderHook(() => useHighlight(results, editors, renderedRefs))
    expect(dispatchMock).toHaveBeenCalledTimes(2)
  })
  it('H49-Verify useHighlight can highlight markdown', () => {
    const editors = new Map<string, EditorView>()
    const renderedRefs = new Map<string, HTMLElement>()
    const dispatchMock = jest.fn()
    editors.set('blockA', { dispatch: dispatchMock } as unknown as EditorView)
    const results: SearchResult[] = [
      {
        notebookid: 'b',
        name: 'yaya',
        matches: [
          {
            type: 'markdown',
            blockid: 'blockA',
            from: 0,
            to: 5,
            snippet: 'abcdefg',
          },
        ],
      },
    ]
    renderHook(() => useHighlight(results, editors, renderedRefs))
    expect(dispatchMock).toHaveBeenCalledTimes(1)
  })
})
