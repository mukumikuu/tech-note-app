import { fireEvent, render, screen } from '@testing-library/react'
import FolderElement from '../../components/folderelement'

describe('folderelement', () => {
  const setup = (label: string) => {
    const onClick = jest.fn()
    const onLabelChange = jest.fn()
    const onToggleExpanded = jest.fn()
    render(
      <FolderElement
        label={label}
        onClick={onClick}
        onLabelChange={onLabelChange}
        onToggleExpanded={onToggleExpanded}
      />
    )
    return { onClick, onLabelChange, onToggleExpanded }
  }
  it('C87-Verify folderelement is rendered properly', () => {
    setup('yaha')
    expect(screen.getByTestId('folderelement')).toBeInTheDocument()
    expect(screen.getByText('yaha')).toBeInTheDocument()
  })
  it('C88-Verify folderelement can handle toggleExpanded', () => {
    const { onToggleExpanded } = setup('yaha')
    fireEvent.click(screen.getByTestId('togglebutton'))
    expect(onToggleExpanded).toHaveBeenCalled()
  })
  it('C89-Verify folderelement can handle onLabelChange', () => {
    const { onLabelChange } = setup('yaha')
    const test = 'pri'
    fireEvent.doubleClick(screen.getByText('yaha'))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: test } })
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(onLabelChange).toHaveBeenCalledWith(test)
  })
  it('C90-Verify folderelement can cancel onLabelChange', () => {
    const { onLabelChange } = setup('yaha')
    const test = 'pri'
    fireEvent.doubleClick(screen.getByText('yaha'))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: test } })
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' })
    expect(onLabelChange).not.toHaveBeenCalledWith(test)
  })
  it('C91-Verify clicking on icon does not trigger event', () => {
    const { onClick } = setup('yaha')
    fireEvent.click(screen.getByTestId('icon'))
    expect(onClick).not.toHaveBeenCalled()
  })
  it('C92-Verify folderelement shows expanded indicator', () => {
    render(
      <FolderElement
        label='yaha'
        onClick={jest.fn()}
        onToggleExpanded={jest.fn()}
        isExpanded={true}
      />
    )
    expect(screen.getByTestId('togglebutton')).toContainElement(
      screen.getByTestId('ChevronDown')
    )
  })

  it('C93-Verify folderelement shows collapsed indicator', () => {
    render(
      <FolderElement
        label='yaha'
        onClick={jest.fn()}
        onToggleExpanded={jest.fn()}
        isExpanded={false}
      />
    )
    expect(screen.getByTestId('togglebutton')).toContainElement(
      screen.getByTestId('ChevronRight')
    )
  })

  it('C94-Verify folderelement calls onClick when not editing', () => {
    const { onClick } = setup('yaha')
    fireEvent.click(screen.getByText('yaha'))
    expect(onClick).toHaveBeenCalled()
  })

  it('C95-Verify folderelement does not call onClick when editing', () => {
    const { onClick } = setup('yaha')
    fireEvent.doubleClick(screen.getByText('yaha'))
    fireEvent.click(screen.getByRole('textbox'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
