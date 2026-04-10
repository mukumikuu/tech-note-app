import { fireEvent, render, screen } from '@testing-library/react'
import NotebookElement from '../../components/notebookelement'

describe('notebookelement', () => {
  const setup = (label: string) => {
    const onClick = jest.fn()
    const onLabelChange = jest.fn()
    render(
      <NotebookElement
        label={label}
        onClick={onClick}
        onLabelChange={onLabelChange}
      />
    )
    return { onClick, onLabelChange }
  }
  it('C70-Verify notebookelement is rendered properly', () => {
    setup('yaha')
    expect(screen.getByTestId('notebookelement')).toBeInTheDocument()
    expect(screen.getByText('yaha')).toBeInTheDocument()
  })
  it('C71-Verify notebookelement can handle onClick', () => {
    const { onClick } = setup('yaha')
    fireEvent.click(screen.getByTestId('notebookelement'))
    expect(onClick).toHaveBeenCalled()
  })
  it('C72-Verify notebookelement can handle onLabelChange', () => {
    const { onLabelChange } = setup('yaha')
    const test = 'pri'
    fireEvent.doubleClick(screen.getByText('yaha'))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: test } })
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(onLabelChange).toHaveBeenCalledWith(test)
  })
  it('C73-Verify notebookelement can cancel onLabelChange', () => {
    const { onLabelChange } = setup('yaha')
    const test = 'pri'
    fireEvent.doubleClick(screen.getByText('yaha'))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: test } })
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' })
    expect(onLabelChange).not.toHaveBeenCalledWith(test)
  })
  it('C74-Verify clicking on icon does not trigger event', () => {
    const {onClick} = setup('yaha')
    fireEvent.click(screen.getByTestId('icon'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
