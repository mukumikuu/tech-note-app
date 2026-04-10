import { fireEvent, render, screen } from '@testing-library/react'
import OptionBar from '../../components/optionbar'

describe('optionbar', () => {
  const setup = () => {
    const onAddFolder = jest.fn()
    const onAddNotebook = jest.fn()
    const onToggleSearch = jest.fn()
    render(
      <OptionBar
        onAddFolder={onAddFolder}
        onAddNotebook={onAddNotebook}
        onToggleSearch={onToggleSearch}
      />
    )
    return { onAddFolder, onAddNotebook, onToggleSearch }
  }
  it('C62-Verify optionbar renders properly', () => {
    setup()
    expect(screen.getByTestId('optionbar')).toBeInTheDocument()
  })
  it('C63-Verify ellipsis can open add menu', () => {
    setup()
    fireEvent.click(screen.getByTestId('ellipsis'))
    expect(screen.getByTestId('folderbutton')).toBeInTheDocument()
    expect(screen.getByTestId('notebookbutton')).toBeInTheDocument()
  })
  it('C64-Verify addFolder can be triggered', () => {
    const { onAddFolder } = setup()
    fireEvent.click(screen.getByTestId('ellipsis'))
    fireEvent.click(screen.getByTestId('folderbutton'))
    expect(onAddFolder).toHaveBeenCalled()
  })
  it('C65-Verify addNotebook can be triggered', () => {
    const { onAddNotebook } = setup()
    fireEvent.click(screen.getByTestId('ellipsis'))
    fireEvent.click(screen.getByTestId('notebookbutton'))
    expect(onAddNotebook).toHaveBeenCalled()
  })
  it('C66-Verify search can be triggered', () => {
    const { onToggleSearch } = setup()
    fireEvent.click(screen.getByTestId('searchbutton'))
    expect(onToggleSearch).toHaveBeenCalled()
  })
})
