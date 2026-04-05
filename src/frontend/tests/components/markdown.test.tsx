import { render, screen, fireEvent } from '@testing-library/react'
import MarkdownBlock from '../../components/markdownblock'

const mockCopy = jest.fn()
jest.mock('../../hooks/usecopytoclipboard', () => ({
  useCopyToClipboard: () => ({
    copy: mockCopy,
    copied: true,
  }),
}))

describe('markdown', () => {
  const setup = () => {
    const onAdd = jest.fn()
    const onRemove = jest.fn()
    const onContentChange = jest.fn()
    render(
      <MarkdownBlock
        id='a'
        onAdd={onAdd}
        onRemove={onRemove}
        content='Write Something...'
        onContentChange={onContentChange}
      ></MarkdownBlock>
    )
    return { onAdd, onRemove }
  }

  it('C26-Verify markdown renders with content', () => {
    setup()
    expect(screen.getByTestId('markdownblock')).toBeInTheDocument()
  })

  it('C27-Verify markdown renders with Copy and trash button on focus', () => {
    setup()
    fireEvent.focusIn(screen.getByRole('textbox'))
    expect(screen.getByTestId('copy')).toBeInTheDocument()
    expect(screen.getByTestId('remove')).toBeInTheDocument()
  })

  it('C28-Verify markdown renders with AddBlockMenu and DragButton', () => {
    setup()
    expect(screen.getByTestId('addblockmenu')).toBeInTheDocument()
    expect(screen.getByTestId('dragbutton')).toBeInTheDocument()
  })

  it('C29-Verify markdown text can be edited', () => {
    setup()
    const test = 'Write Something...'
    const text = screen.getByRole('textbox')
    fireEvent.change(text, { target: { value: test } })
    expect(text).toHaveValue(test)
  })

  it('C30-Verify markdown content can be copied', () => {
    setup()
    fireEvent.focusIn(screen.getByRole('textbox'))
    const copyButton = screen.getByTestId('copy')
    fireEvent.click(copyButton)
    expect(mockCopy).toHaveBeenCalled()
  })

  it('C31-Verify markdown can be deleted', () => {
    const { onRemove } = setup()
    fireEvent.focusIn(screen.getByRole('textbox'))
    const removeButton = screen.getByTestId('remove')
    fireEvent.click(removeButton)
    expect(onRemove).toHaveBeenCalled()
  })
})
