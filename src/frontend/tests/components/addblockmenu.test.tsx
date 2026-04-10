import { render, screen, fireEvent } from '@testing-library/react'
import AddBlockMenu from '../../components/addblockmenu'

describe('AddBlockMenu', () => {
  const setup = () => {
    const onSelect = jest.fn()
    render(<AddBlockMenu onSelect={onSelect} />)
    return { onSelect }
  }

  it('C1-Verify menu not shown by default', () => {
    setup()
    expect(screen.queryByText('Code Block')).not.toBeInTheDocument()
    expect(screen.queryByText('Markdown')).not.toBeInTheDocument()
  })

  it('C2-Verify menu open on mouse hover', () => {
    setup()

    const container = screen.getByTestId('addblockmenu')

    fireEvent.mouseEnter(container)

    expect(screen.getByText('Code Block')).toBeInTheDocument()
    expect(screen.getByText('Markdown')).toBeInTheDocument()
  })

  it('C3-Verify menu close on mouse leave', () => {
    setup()

    const container = screen.getByTestId('addblockmenu')

    fireEvent.mouseEnter(container)
    fireEvent.mouseLeave(container)

    expect(screen.queryByText('Code Block')).not.toBeInTheDocument()
  })

  it('C4-Verify menu open on mouse click', () => {
    setup()

    const plusButton = screen.getByRole('button')
    fireEvent.click(plusButton)

    expect(screen.getByText('Code Block')).toBeInTheDocument()
  })

  it('C5-Verify selecting code block closes menu', () => {
    const { onSelect } = setup()

    const container = screen.getByTestId('addblockmenu')

    fireEvent.mouseEnter(container)

    fireEvent.click(screen.getByText('Code Block'))

    expect(onSelect).toHaveBeenCalledWith('code')
    expect(screen.queryByText('Code Block')).not.toBeInTheDocument()
  })

  it('c6-Verify selecting markdown closes menu', () => {
    const { onSelect } = setup()

    const container = screen.getByTestId('addblockmenu')

    fireEvent.mouseEnter(container)

    fireEvent.click(screen.getByText('Markdown'))

    expect(onSelect).toHaveBeenCalledWith('markdown')
    expect(screen.queryByText('Markdown')).not.toBeInTheDocument()
  })
})
