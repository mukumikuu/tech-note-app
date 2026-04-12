import { render, screen } from '@testing-library/react'
import FolderDropZone from '../../components/folderdropzone'

const mockSetNodeRef = jest.fn()
let mockIsOver = false

jest.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    isOver: mockIsOver,
    setNodeRef: mockSetNodeRef,
  }),
}))

describe('folderdrop', () => {
  const setup = (isDragging: boolean) => {
    render(<FolderDropZone folderId='a' isDragging={isDragging} />)
  }
  it('C67-Verify folderdrop renders properly when not dragging', () => {
    setup(false)
    expect(screen.getByTestId('folderdrop')).toBeInTheDocument()
  })
  it('C68-Verify folderdrop renders properly when dragging over', () => {
    mockIsOver = true
    setup(true)
    expect(screen.getByTestId('folderdrop')).toBeInTheDocument()
    expect(screen.getByTestId('folderdrop')).toHaveClass('h-1')
    expect(screen.getByTestId('folderdrop')).toHaveClass('bg-white/30')
  })
  it('C69-Verify folderdrop renders properly when dragging but not over', () => {
    mockIsOver = false
    setup(true)
    expect(screen.getByTestId('folderdrop')).toBeInTheDocument()
    expect(screen.getByTestId('folderdrop')).toHaveClass('h-1')
    expect(screen.getByTestId('folderdrop')).not.toHaveClass('bg-white/30')
  })
})
