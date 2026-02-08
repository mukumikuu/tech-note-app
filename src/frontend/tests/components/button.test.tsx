import { render, screen, fireEvent, act } from '@testing-library/react'
import Button from '../../components/button'

jest.useFakeTimers()

describe('Button', () => {
  it('C7-Verify button renders children', () => {
    render(<Button onClick={jest.fn()}>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('C8-Verify button calls onClick when click', () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click</Button>)

    fireEvent.click(screen.getByTestId('button'))
    expect(onClick).toHaveBeenCalled()
  })

  it('C9-Verify button shows outline for default variant', () => {
    render(<Button onClick={jest.fn()}>Click</Button>)
    const button = screen.getByRole('button')

    fireEvent.click(button)
    expect(button.className).toContain('outline-light-blue')

    act(() => {
      fireEvent.click(button)
      jest.advanceTimersByTime(300)
    })
    expect(button.className).not.toContain('outline-light-blue')
  })

  it('C10-Verify button not show outline for icon variant', () => {
    render(
      <Button onClick={jest.fn()} variant='icon'>
        Icon
      </Button>
    )
    const button = screen.getByTestId('button')

    fireEvent.click(button)
    expect(button.className).not.toContain('outline-light-blue')
  })

  it('C11-Verify button rounded works', () => {
    render(
      <Button onClick={jest.fn()} rounded='lg'>
        Rounded
      </Button>
    )
    expect(screen.getByTestId('button').className).toContain('rounded-lg')
  })
})
