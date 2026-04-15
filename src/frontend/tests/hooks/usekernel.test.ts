import { renderHook, act } from '@testing-library/react'
import { useKernels } from '../../hooks/usekernel'
import { socket } from '../../utils/socket'
import type Block from '../../../shared/block'
jest.mock('../../utils/socket', () => ({
  socket: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}))
const mockSocket = socket as jest.Mocked<typeof socket>
describe('useKernel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('H18-Verify socket listeners registered on mount', () => {
    renderHook(() => useKernels())
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith(
      'codeResult',
      expect.any(Function)
    )
  })
  it('H19-Verify socket listeners removed on unmount', () => {
    const { unmount } = renderHook(() => useKernels())
    unmount()
    expect(mockSocket.off).toHaveBeenCalledWith('connect')
    expect(mockSocket.off).toHaveBeenCalledWith(
      'codeResult',
      expect.any(Function)
    )
  })

  it('H20-Verify runBlock emits runCode event', () => {
    const { result } = renderHook(() => useKernels())
    act(() => {
      result.current.runBlock('a', "console.log('hello')", 'JavaScript')
    })
    expect(mockSocket.emit).toHaveBeenCalledWith('runCode', {
      id: 'a',
      code: "console.log('hello')",
      language: 'JavaScript',
    })
  })

  it('H21-Verify restartKernel emits and clears output', async () => {
    const { result } = renderHook(() => useKernels())
    const codeHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === 'codeResult'
    )?.[1]
    act(() => {
      codeHandler?.({
        id: 'a',
        result: { id: 'a', result: '42', logs: [], error: null },
      })
    })
    expect(result.current.output['a']).toBeDefined()

    await act(async () => {
      await result.current.restartKernel()
    })
    expect(mockSocket.emit).toHaveBeenCalledWith('restartKernel')
    expect(result.current.output).toStrictEqual({})
  })

  it('H22-Verify codeResult updates output', () => {
    const { result } = renderHook(() => useKernels())
    const codeHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === 'codeResult'
    )?.[1]

    act(() => {
      codeHandler?.({
        id: 'block1',
        result: { id: 'block1', result: '42', logs: [], error: null },
      })
    })

    expect(result.current.output['block1']).toEqual({
      id: 'block1',
      result: '42',
      logs: [],
      error: null,
    })
  })

  it('H23-Verify clearOutput resets code blocks', () => {
    const { result } = renderHook(() => useKernels())
    const blocks:Block[] = [
      {
        blockid: 'a',
        type: 'code' ,
        content: 'x',
        language: 'JavaScript' ,
      },
      { blockid: 'b', type: 'markdown' , content: 'y' },
    ]
    act(() => {
      result.current.clearOutput(blocks)
    })
    expect(result.current.output['a']).toEqual({
      id: 'a',
      result: undefined,
      logs: [],
      error: null,
    })
    expect(result.current.output['b']).toBeUndefined()
  })
})
