import { render, screen } from '@testing-library/react'
import DragButton from '../../components/dragbutton'
import React from 'react'

describe('DragButton', () => {
  it('C12-Verify button renders children', () => {
    render(<DragButton/>)
    const image = screen.getByRole('img')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('alt', '||')
  })

  it('C13-Verify button calls onClick when click', () => {
    const ref = React.createRef<HTMLButtonElement>()

    render(<DragButton ref={ref} />)

    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
