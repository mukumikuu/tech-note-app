import { render, screen, fireEvent, act } from '@testing-library/react'
import CodeBlock from '../../components/codeblock'
import type { EditorDiv } from '../../../test/types/editor'

const mockCopy = jest.fn()
jest.mock('../../hooks/usecopytoclipboard', () => ({
  useCopyToClipboard: () => ({
    copy: mockCopy,
    copied: true,
  }),
}))

describe('codeblock', () => {
  const setup = () => {
    const onRemove = jest.fn()
    const onAdd = jest.fn()
    const onExecute = jest.fn()
    const onContentChange = jest.fn()
    const onLangChange = jest.fn()
    render(
      <CodeBlock
        id='a'
        blockIndex={0}
        content='Write something...'
        language='JavaScript'
        onContentChange={onContentChange}
        onLangChange={onLangChange}
        onAdd={onAdd}
        onRemove={onRemove}
        onExecute={onExecute}
      ></CodeBlock>
    )
    return { onAdd, onRemove }
  }

  it('C19-Verify CodeBlock renders with language', () => {
    setup()
    expect(screen.getByTestId('codeblock')).toBeInTheDocument()
    expect(screen.queryByText('JavaScript')).toBeInTheDocument()
  })
  it('C20-Verify code block renders with content', () => {
    setup()
    expect(screen.getByTestId('codeblock')).toBeInTheDocument()
    const editor = screen.getByTestId('editor')
    const content = editor.querySelector('.cm-content')
    expect(content?.textContent).toContain('Write something...')
  })
  it('C21-Verify code block renders with Copy and trash button', () => {
    setup()
    expect(screen.getByTestId('codeblock')).toBeInTheDocument()
    expect(screen.getByTestId('copy')).toBeInTheDocument()
    expect(screen.getByTestId('remove')).toBeInTheDocument()
  })
  it('C22-Verify code block renders with AddBlockMenu and DragButton', () => {
    setup()
    expect(screen.getByTestId('codeblock')).toBeInTheDocument()
    expect(screen.getByTestId('addblockmenu')).toBeInTheDocument()
    expect(screen.getByTestId('dragbutton')).toBeInTheDocument()
  })
  it('C23-Verify code block text can be edited', () => {
    setup()
    const editor = screen.getByTestId('editor') as EditorDiv
    expect(editor.cmView).toBeDefined()
    const view = editor.cmView
    const text = 'Una Yaha!@#$?'
    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: text,
        },
      })
    })
    expect(view.state.doc.toString()).toContain(text)
    const text2 = '123NandaOmai'
    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: text2,
        },
      })
    })
    expect(view.state.doc.toString()).toContain(text2)
  })
  it('C24-Verify code block content can be copied', () => {
    setup()
    const copyButton = screen.getByTestId('copy')
    fireEvent.click(copyButton)
    expect(mockCopy).toHaveBeenCalled()
  })
  it('C25-Verify code block can be deleted', () => {
    const { onRemove } = setup()
    const removeButton = screen.getByTestId('remove')
    fireEvent.click(removeButton)
    expect(onRemove).toHaveBeenCalled()
  })
})
