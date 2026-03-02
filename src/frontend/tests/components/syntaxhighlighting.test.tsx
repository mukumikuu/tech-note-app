import { render, screen, act } from '@testing-library/react'
import CodeBlock from '../../components/codeblock'
import { syntaxTree } from '@codemirror/language'
import type { EditorDiv } from '../../../test/types/editor'
import { EditorView } from 'codemirror'

function verifyExist(view: EditorView, ASTname: string): boolean {
  const tree = syntaxTree(view.state)
  const cursor = tree.cursor()
  let foundWanted = false
  do {
    if (cursor.name === ASTname) {
      foundWanted = true
      break
    }
  } while (cursor.next())
  return foundWanted
}

describe('syntaxhighlighting', () => {
  const setup = () => {
    const onAdd = jest.fn()
    const onRemove = jest.fn()
    render(
      <CodeBlock
        id={'a'}
        blockIndex={0}
        onAdd={onAdd}
        onRemove={onRemove}
      ></CodeBlock>
    )
  }

  it('F1-Verify Keyword is parsed', () => {
    setup()
    const editor = screen.getByTestId('editor') as EditorDiv
    expect(editor.cmView).toBeDefined()
    const view = editor.cmView
    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: 'if (x) return 1;',
        },
      })
    })
    const foundIf = verifyExist(view, 'IfStatement')
    expect(foundIf).toBe(true)
    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: 'try {} catch (error) {}',
        },
      })
    })
    const foundTry = verifyExist(view, 'TryStatement')
    expect(foundTry).toBe(true)
  })
  it('F2-Verify VariableDeclaration is parsed', () => {
    setup()
    const editor = screen.getByTestId('editor') as EditorDiv
    expect(editor.cmView).toBeDefined()
    const view = editor.cmView
    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: 'const x = "una";',
        },
      })
    })
    const foundX = verifyExist(view, 'VariableDeclaration')
    expect(foundX).toBe(true)
    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: `const car = {
                    name: "Nanda",
                    type: "Thai",
                    };`,
        },
      })
    })
    const foundObject = verifyExist(view, 'VariableDeclaration')
    expect(foundObject).toBe(true)
  })
  it('F3-Verify ExpressionStatement is parsed', () => {
    setup()
    const editor = screen.getByTestId('editor') as EditorDiv
    expect(editor.cmView).toBeDefined()
    const view = editor.cmView
    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: 'console.log("una");',
        },
      })
    })
    const foundExpression = verifyExist(view, 'ExpressionStatement')
    expect(foundExpression).toBe(true)
  })

  it('F4-Verify FunctionDeclaration is parsed', () => {
    setup()
    const editor = screen.getByTestId('editor') as EditorDiv
    expect(editor.cmView).toBeDefined()
    const view = editor.cmView
    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: 'function una() {console.log("yaha");}',
        },
      })
    })
    const foundFunction = verifyExist(view, 'FunctionDeclaration')
    expect(foundFunction).toBe(true)
  })

  it('F5-Verify BinaryExpression is parsed', () => {
    setup()
    const editor = screen.getByTestId('editor') as EditorDiv
    expect(editor.cmView).toBeDefined()
    const view = editor.cmView
    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: 'const y = 1+2;',
        },
      })
    })
    let foundBinary = verifyExist(view, 'BinaryExpression')
    expect(foundBinary).toBe(true)
    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: 'const y = 1*2;',
        },
      })
    })
    foundBinary = verifyExist(view, 'BinaryExpression')
    expect(foundBinary).toBe(true)
  })

  it('F6-Verify UnaryExpression is parsed', () => {
    setup()
    const editor = screen.getByTestId('editor') as EditorDiv
    expect(editor.cmView).toBeDefined()
    const view = editor.cmView
    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: 'const a = !true;',
        },
      })
    })
    const foundBinary = verifyExist(view, 'UnaryExpression')
    expect(foundBinary).toBe(true)
  })
})
