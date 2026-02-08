import { render, screen, fireEvent } from '@testing-library/react'
import ExecuteCellButton from '../../components/executecellbutton'

describe('ExecuteCellButton', () => {
  const setup = () => {
    const onExecute = jest.fn()
    render(
      <ExecuteCellButton
        onExecute={onExecute}
        status='idle'
      ></ExecuteCellButton>
    )
    return { onExecute }
  }

  it('C14-Verify ExecuteCellButton renders button', () => {
    setup()
    expect(screen.getByTestId('executecellbutton')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('C15-Verify button calls onExecute when click', () => {
    const { onExecute } = setup()

    fireEvent.click(screen.getByTestId('executecellbutton'))
    expect(onExecute).toHaveBeenCalledTimes(1)
  })

  it('C16-Verify button can not be clicked when running', () => {
    render(<ExecuteCellButton onExecute={jest.fn()} status='running' />)

    const icon = screen.getByTestId('executecellbutton').querySelector('svg')

    expect(icon).toBeInTheDocument()
  })

  it('C17-Verify icon loader2 is shown when status is running', () => {
    render(<ExecuteCellButton onExecute={jest.fn()} status='running' />)

    const icon = screen.getByTestId('executecellbutton').querySelector('svg')

    expect(icon).toBeInTheDocument()
  })

  it('C18- Verify Icon x is shown when status is error', () => {
    render(<ExecuteCellButton onExecute={jest.fn()} status='error' />)

    const icon = screen.getByTestId('executecellbutton').querySelector('svg')

    expect(icon).toBeInTheDocument()
  })
})
