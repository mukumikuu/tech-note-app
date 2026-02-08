import { render, screen, fireEvent } from '@testing-library/react'
import CodeBlock from '../../components/codeblock'

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
    render(
      <CodeBlock
        id='a'
        blockIndex={0}
        onAdd={onAdd}
        onRemove={onRemove}
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
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea).toBeInTheDocument()
    expect(textarea.value).toBe('Write something...')
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
    const test = 'hello world'
    const text = screen.getByRole('textbox')
    fireEvent.change(text, { target: { value: test } })
    expect(text).toHaveValue(test)
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
