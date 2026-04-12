import { render, screen } from '@testing-library/react'
import TrashDropZone from '../../components/trashbar'

const mockSetNodeRef = jest.fn()
let mockIsOver = false

jest.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    isOver: mockIsOver,
    setNodeRef: mockSetNodeRef,
  }),
}))

describe('trashbar', () => {
  it('C59-Verify trashbar is rendered properly', () => {
    render(<TrashDropZone />)
    expect(screen.getByTestId('trashbar')).toBeInTheDocument()
  })
  it('C60-Verify trashbar is invisible when not hovered', () => {
    mockIsOver = false
    render(<TrashDropZone />)
    expect(screen.getByTestId('trashbar')).toHaveClass('opacity-0')
  })
  it('C61-Verify trashbar is visible when dragging over', () => {
    mockIsOver = true
    render(<TrashDropZone />)
    expect(screen.getByTestId('trashbar')).toHaveClass('opacity-100')
    expect(screen.getByTestId('trashbar')).toHaveClass('brightness-125')
  })
})
