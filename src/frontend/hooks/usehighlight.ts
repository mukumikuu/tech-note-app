import { useEffect } from 'react'
import type { SearchResult } from '../../shared/searchResult'
import { EditorView } from 'codemirror'
import { StateEffect } from '@codemirror/state'
import { Decoration } from '@codemirror/view'
import { StateField } from '@codemirror/state'
import { RangeSet } from '@codemirror/state'
import { RangeSetBuilder } from '@codemirror/state'
import type { Match } from '../../shared/searchResult'

type CellEditorMap = Map<string, EditorView>
const setSearchMatches = StateEffect.define<RangeSet<Decoration>>()

const matchMark = Decoration.mark({
  class: 'cm-searchMatch',
  attributes: { style: 'background-color: #facc15; color: black;' },
})

const focusMark = Decoration.mark({
  class: 'cm-searchMatch cm-searchMatch-selected',
  attributes: { style: 'background-color: #f97316; color: black;' },
})

export function buildHighlights(matches: Match[], focusedIndex = -1) {
  const builder = new RangeSetBuilder<Decoration>()

  // RangeSetBuilder requires ranges sorted by `from`
  const sorted = [...matches].sort((a, b) => a.from - b.from)

  for (let i = 0; i < sorted.length; i++) {
    const { from, to } = sorted[i]
    builder.add(from, to, i === focusedIndex ? focusMark : matchMark)
  }

  return builder.finish()
}

export const searchHighlightField = StateField.define<RangeSet<Decoration>>({
  create() {
    return Decoration.none
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setSearchMatches)) {
        return effect.value // replace with new decoration set
      }
    }
    return decorations.map(tr.changes) // keep in sync with doc edits
  },
  provide: (f) => EditorView.decorations.from(f), // tells CM6 to render these
})
export function highlightInRenderedMarkdown(el: HTMLElement, query: string) {
  const regex = new RegExp(query, 'gi')
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []

  // Collect first — don't mutate while walking
  let node: Node | null
  while ((node = walker.nextNode())) {
    if (regex.test(node.textContent || '')) {
      textNodes.push(node as Text)
    }
    regex.lastIndex = 0 // reset after test()
  }

  for (const textNode of textNodes) {
    const parent = textNode.parentNode
    if (!parent) continue

    const span = document.createElement('span')
    span.setAttribute('data-search-wrapper', 'true')
    span.innerHTML = (textNode.textContent || '').replace(
      regex,
      (match) => `<mark class="search-highlight">${match}</mark>`
    )
    parent.replaceChild(span, textNode)
  }
}

export function clearDomHighlights(el: HTMLElement) {
  const wrappers = el.querySelectorAll('[data-search-wrapper]')

  for (const wrapper of wrappers) {
    const parent = wrapper.parentNode
    if (!parent) continue
    parent.replaceChild(
      document.createTextNode(wrapper.textContent || ''),
      wrapper
    )
    parent.normalize()
  }
}

export function useHighlight(
  results: SearchResult[],
  editors: CellEditorMap,
  renderedRefs: Map<string, HTMLElement>
) {
  useEffect(() => {
    for (const [, view] of editors) {
      view.dispatch({ effects: setSearchMatches.of(Decoration.none) })
    }
    for (const [, el] of renderedRefs) {
      clearDomHighlights(el)
    }
    if (results.length === 0) return
    for (const result of results) {
      for (const match of result.matches) {
        if (match.type === 'code') {
          const view = editors.get(match.blockid)
          if (!view) continue
          const blockMatches = result.matches.filter(
            (m) => m.blockid === match.blockid
          )
          view.dispatch({
            effects: setSearchMatches.of(buildHighlights(blockMatches)),
          })
        } else if (match.type === 'markdown') {
          const el = renderedRefs.get(match.blockid)
          if (!el) continue
          highlightInRenderedMarkdown(el, match.snippet!)
        }
      }
    }
  }, [results])
}
