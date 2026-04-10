import { render, screen, fireEvent, act } from '@testing-library/react'
import CodeBlock from '../../components/codeblock'
import type { EditorDiv } from '../../../test/types/editor'
import type { KernelResult } from '../../../shared/kernelResult'
import type { Language } from '../../../shared/language'
const mockCopy = jest.fn()
let mockCopied = true
jest.mock('../../hooks/usecopytoclipboard', () => ({
  useCopyToClipboard: () => ({
    copy: mockCopy,
    get copied() {
      return mockCopied
    },
  }),
}))
describe('codeblock', () => {
  const setup = ({
    output,
    language,
  }: { language?: Language; output?: KernelResult } = {}) => {
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
        language={language ?? 'JavaScript'}
        output={output}
        onContentChange={onContentChange}
        onLangChange={onLangChange}
        onAdd={onAdd}
        onRemove={onRemove}
        onExecute={onExecute}
      />
    )
    return { onAdd, onRemove, onExecute }
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
    mockCopied = true
    setup()
    const copyButton = screen.getByTestId('copy')
    fireEvent.click(copyButton)
    expect(mockCopy).toHaveBeenCalled()
  })
  it('C25-Verify code block content copy can log failure', async () => {
    mockCopied = false
    setup()
    const copyButton = screen.getByTestId('copy')
    fireEvent.click(copyButton)
    expect(mockCopy).toHaveBeenCalled()
  })
  it('C26-Verify code block can be deleted', () => {
    const { onRemove } = setup()
    const removeButton = screen.getByTestId('remove')
    fireEvent.click(removeButton)
    expect(onRemove).toHaveBeenCalled()
  })
  it('C27-Verify code block can be executed', () => {
    jest.useFakeTimers()
    const { onExecute } = setup()
    fireEvent.click(screen.getByTestId('executecellbutton'))
    expect(onExecute).toHaveBeenCalled()
    expect(screen.getByTestId('codeblock')).toHaveAttribute(
      'data-status',
      'running'
    )
    act(() => jest.advanceTimersByTime(300))
    expect(screen.getByTestId('codeblock')).toHaveAttribute(
      'data-status',
      'idle'
    )
    jest.useRealTimers()
  })
  it('C28-Verify code block can handle execution error', () => {
    jest.useFakeTimers()
    const { onExecute } = setup()
    onExecute.mockImplementation(() => {
      throw new Error('failed')
    })
    fireEvent.click(screen.getByTestId('executecellbutton'))
    expect(screen.getByTestId('codeblock')).toHaveAttribute(
      'data-status',
      'error'
    )
    act(() => jest.advanceTimersByTime(300))
    expect(screen.getByTestId('codeblock')).toHaveAttribute(
      'data-status',
      'idle'
    )
    jest.useRealTimers()
  })
  it('C29-Verify code block can show error output', () => {
    jest.useFakeTimers()
    setup({
      output: { id: 'a', result: '', logs: [], error: 'something went wrong' },
    })
    expect(screen.getByTestId('codeblock')).toHaveAttribute(
      'data-status',
      'error'
    )
    act(() => jest.advanceTimersByTime(300))
    expect(screen.getByTestId('codeblock')).toHaveAttribute(
      'data-status',
      'idle'
    )
    jest.useRealTimers()
  })
  it('C30-Verify code block can show valid output', () => {
    jest.useFakeTimers()
    setup({
      output: { id: 'a', result: 'yaha', logs: [], error: null },
    })
    expect(screen.getByTestId('codeblock')).toHaveAttribute(
      'data-status',
      'idle'
    )
    act(() => jest.advanceTimersByTime(300))
    expect(screen.getByTestId('codeblock')).toHaveAttribute(
      'data-status',
      'idle'
    )
    jest.useRealTimers()
  })
  it('C31-Verify code block show valid output for non-javascript', () => {
    jest.useFakeTimers()
    setup({
      output: { id: 'a', result: 'yaha', logs: [], error: null },
      language: 'Shell',
    })
    expect(screen.getByTestId('codeblock')).toHaveAttribute(
      'data-status',
      'idle'
    )
    act(() => jest.advanceTimersByTime(300))
    expect(screen.getByTestId('codeblock')).toHaveAttribute(
      'data-status',
      'idle'
    )
    jest.useRealTimers()
  })
})
