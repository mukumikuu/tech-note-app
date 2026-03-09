import { render, screen, act, waitFor } from '@testing-library/react'
import CodeBlock from '../../components/codeblock'
import { diagnosticCount } from '@codemirror/lint'
import type { EditorDiv } from '../../../test/types/editor'

describe('linting', () => {
  const setup = () => {
    const onRemove = jest.fn()
    const onAdd = jest.fn()
    const onExecute = jest.fn()
    const onValueChange = jest.fn()
    const onLangChange = jest.fn()
    render(
      <CodeBlock
        id='a'
        blockIndex={0}
        value='Write something...'
        language='JavaScript'
        onValueChange={onValueChange}
        onLangChange={onLangChange}
        onAdd={onAdd}
        onRemove={onRemove}
        onExecute={onExecute}
      ></CodeBlock>
    )
  }

  it('F7-Verify linter works with single line invalid code', async () => {
    setup()
    const editor = screen.getByTestId('editor') as EditorDiv
    expect(editor.cmView).toBeDefined()
    const view = editor.cmView
    const invalidCode = 'console.log('
    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: invalidCode,
        },
      })
    })
    await waitFor(() => {
      expect(diagnosticCount(view.state)).toBeGreaterThan(0)
    })
  })

  it('F8-Verify linter works with single line valid code', async () => {
    setup()
    const editor = screen.getByTestId('editor') as EditorDiv
    expect(editor.cmView).toBeDefined()
    const view = editor.cmView
    const validCode = 'console.log("yaha");'
    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: validCode,
        },
      })
    })
    await waitFor(() => {
      expect(diagnosticCount(view.state)).toBe(0)
    })
  })

  it('F9-Verify linter works with multi line invalid code', async () => {
    setup()
    const editor = screen.getByTestId('editor') as EditorDiv
    expect(editor.cmView).toBeDefined()
    const view = editor.cmView
    const invalidCode = 'const usagi = {\nfrom: "chikawa",\ntype: "rabbit",'
    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: invalidCode,
        },
      })
    })
    await waitFor(() => {
      expect(diagnosticCount(view.state)).toBeGreaterThan(0)
    })
  })

  it('F9-Verify linter works with multi line valid code', async () => {
    setup()
    const editor = screen.getByTestId('editor') as EditorDiv
    expect(editor.cmView).toBeDefined()
    const view = editor.cmView
    const validCode = `const usagi = {
  from: "chiikawa",
  type: "rabbit"
};`
    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: validCode,
        },
      })
    })
    await waitFor(() => {
      expect(diagnosticCount(view.state)).toBe(0)
    })
  })
})
