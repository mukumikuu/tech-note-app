import { fireEvent, render, screen } from '@testing-library/react'
import NameModal from '../../components/namemodal'

describe('namemodal', () => {
  const setup = (isOpened: boolean, topic: string, placeholder: string) => {
    const onClose = jest.fn()
    const onSubmit = jest.fn()
    render(
      <NameModal
        isOpen={isOpened}
        topic={topic}
        placeholder={placeholder}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    )
    return { onClose, onSubmit }
  }
  it('C80-Verify namemodal is rendered properly', () => {
    setup(true, 'Create New Notebook 📔', 'Enter notebook name ...')
    expect(screen.getByTestId('namemodal')).toBeInTheDocument()
  })
  it('C81-Verify namemodal handle onClose when click on modalbox', () => {
    const { onClose } = setup(
      true,
      'Create New Notebook 📔',
      'Enter notebook name ...'
    )
    fireEvent.click(screen.getByTestId('modalbox'))
    expect(onClose).not.toHaveBeenCalled()
  })
  it('C82-Verify namemodal can be edited', () => {
    setup(true, 'Create New Notebook 📔', 'Enter notebook name ...')
    const test = 'nanda'
    fireEvent.change(screen.getByRole('textbox'), { target: { value: test } })
    expect(screen.getByRole('textbox')).toHaveValue(test)
  })
  it('C83-Verify namemodal can handle onSubmit', () => {
    const { onSubmit } = setup(
      true,
      'Create New Notebook 📔',
      'Enter notebook name ...'
    )
    const test = 'nanda'
    fireEvent.change(screen.getByRole('textbox'), { target: { value: test } })
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledWith(test)
  })
  it('C84-Verify clicking background of namemodal', () => {
    const { onClose } = setup(
      true,
      'Create New Notebook 📔',
      'Enter notebook name ...'
    )
    fireEvent.click(screen.getByTestId('background'))
    expect(onClose).toHaveBeenCalled()
  })
  it('C85-Verify namemodal is hidden', () => {
    setup(false, '', '')
    expect(screen.queryByTestId('namemodal')).not.toBeInTheDocument()
  })
  it('C86-Verify namemodal can cancel onSubmit', () => {
    const { onSubmit } = setup(
      true,
      'Create New Notebook 📔',
      'Enter notebook name ...'
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: test } })
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' })
    expect(onSubmit).not.toHaveBeenCalledWith(test)
  })
})
