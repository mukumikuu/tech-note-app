import { render, screen, fireEvent } from '@testing-library/react'
import SearchBar from '../../components/searchbar'

describe('searchbar', () => {
  const setup = (query: string) => {
    const setQuery = jest.fn()
    const search = jest.fn()
    render(
      <SearchBar query={query} setQuery={setQuery} search={search}/>
    )
    return { setQuery, search }
  }
  it('C54-Verify searchbar is rendered properly', () => {
    setup('Hello')
    expect(screen.getByTestId('searchbar')).toBeInTheDocument()
  })
  it('C55-Verify search query can be edited in windows', () => {
    const { setQuery } = setup('Hello')
    const test = 'omai'
    fireEvent.keyDown(window, { key: 'f', ctrlKey: true })
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: test } })
    expect(setQuery).toHaveBeenCalledWith(test)
  })
  it('C56-Verify search query can be edited in mac', () => {
    const { setQuery } = setup('Hello')
    const test = 'omai'
    fireEvent.keyDown(window, { key: 'f', metaKey: true })
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: test } })
    expect(setQuery).toHaveBeenCalledWith(test)
  })
  it('C57-Verify search query can be edited in mac', () => {
    const { setQuery } = setup('Hello')
    const test = 'omai'
    fireEvent.keyDown(window, { key: 'f', metaKey: true })
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: test } })
    expect(setQuery).toHaveBeenCalledWith(test)
  })
  it('C58-Verify search bar can be closed with Escape', () => {
    setup('Hello')
    fireEvent.keyDown(window, { key: 'f', ctrlKey: true })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
