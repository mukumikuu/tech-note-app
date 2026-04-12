import { render, screen, fireEvent } from '@testing-library/react'
import MarkdownBlock from '../../components/markdownblock'

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

describe('markdown', () => {
  const setup = ({ searchQuery }: { searchQuery?: string } = {}) => {
    const onAdd = jest.fn()
    const onRemove = jest.fn()
    const onContentChange = jest.fn()
    render(
      <MarkdownBlock
        id='a'
        searchQuery={searchQuery}
        onAdd={onAdd}
        onRemove={onRemove}
        content='Write Something...'
        onContentChange={onContentChange}
      />
    )
    return { onAdd, onRemove, onContentChange }
  }
  it('C32-Verify markdown renders with content', () => {
    setup()
    expect(screen.getByTestId('markdownblock')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('C33-Verify markdown renders with Copy and trash button on focus', () => {
    setup()
    fireEvent.focusIn(screen.getByRole('textbox'))
    expect(screen.getByTestId('copy')).toBeInTheDocument()
    expect(screen.getByTestId('remove')).toBeInTheDocument()
  })

  it('C34-Verify markdown renders with AddBlockMenu and DragButton', () => {
    setup()
    expect(screen.getByTestId('addblockmenu')).toBeInTheDocument()
    expect(screen.getByTestId('dragbutton')).toBeInTheDocument()
  })

  it('C35-Verify markdown text can be edited', () => {
    const { onContentChange } = setup()
    const test = 'Yaya upapa'
    const text = screen.getByRole('textbox')
    fireEvent.change(text, { target: { value: test } })
    expect(onContentChange).toHaveBeenCalledWith(test)
  })

  it('C36-Verify markdown content can be copied', () => {
    mockCopied = true
    setup()
    fireEvent.focusIn(screen.getByRole('textbox'))
    fireEvent.click(screen.getByTestId('copy'))
    expect(mockCopy).toHaveBeenCalled()
  })

  it('C37-Verify markdown content copy can log failure', () => {
    mockCopied = false
    setup()
    fireEvent.focusIn(screen.getByRole('textbox'))
    fireEvent.click(screen.getByTestId('copy'))
    expect(mockCopy).toHaveBeenCalled()
  })

  it('C38-Verify markdown can be deleted', () => {
    const { onRemove } = setup()
    fireEvent.focusIn(screen.getByRole('textbox'))
    const removeButton = screen.getByTestId('remove')
    fireEvent.click(removeButton)
    expect(onRemove).toHaveBeenCalled()
  })
  it('C39-Verify copy button prevent default on mouse down', () => {
    setup()
    fireEvent.focus(screen.getByRole('textbox'))
    const copyButton = screen.getByTestId('copy')
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    })
    fireEvent(copyButton, mouseDownEvent)
    expect(mouseDownEvent.defaultPrevented).toBe(true)
  })
  it('C40-Verify trash button prevent default on mouse down', () => {
    setup()
    fireEvent.focus(screen.getByRole('textbox'))
    const copyButton = screen.getByTestId('remove')
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    })
    fireEvent(copyButton, mouseDownEvent)
    expect(mouseDownEvent.defaultPrevented).toBe(true)
  })
  it('C41-Verify buttons hidden again after blur', () => {
    setup()
    fireEvent.focus(screen.getByRole('textbox'))
    expect(screen.getByTestId('copy')).toBeInTheDocument()
    fireEvent.blur(screen.getByRole('textbox'))
    expect(screen.queryByTestId('copy')).not.toBeInTheDocument()
  })
  it('C42-Verify highlighted div shown instead of textarea when searchQuery provided', () => {
    setup({ searchQuery: 'Write' })
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText('Write')).toBeInTheDocument()
  })
  it('C43-Verify searchQuery match is wrapped in mark tag', () => {
    setup({ searchQuery: 'Write' })
    const mark = document.querySelector('mark')
    expect(mark).toBeInTheDocument()
    expect(mark).toHaveTextContent('Write')
  })
})
