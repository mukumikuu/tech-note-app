import { renderHook, act } from '@testing-library/react'
import { useCopyToClipboard } from '../../hooks/usecopytoclipboard'

const mockWriteText = jest.fn()

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true,
})

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    mockWriteText.mockReset()
  })
  it('H1-Verify copied is false initially', () => {
    const { result } = renderHook(() => useCopyToClipboard())
    expect(result.current.copied).toBe(false)
  })
  it('H2-Verify copied is true after successful copy', async () => {
    mockWriteText.mockResolvedValue(undefined)
    const { result } = renderHook(() => useCopyToClipboard())
    await act(async () => {
      await result.current.copy('hello')
    })
    expect(mockWriteText).toHaveBeenCalledWith('hello')
    expect(result.current.copied).toBe(true)
  })
  it('H3-Verify copied is false after failed copy', async () => {
    mockWriteText.mockRejectedValue(new Error('denied'))
    const { result } = renderHook(() => useCopyToClipboard())
    await act(async () => {
      await result.current.copy('hello')
    })
    expect(result.current.copied).toBe(false)
  })
})
