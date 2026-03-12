import { KernelManager } from '../backend/kernel/kernelmanager.js'
import { KernelResult } from '../../shared/kernelResult.js'
import { KernelProcess } from '../backend/types/kernelprocess.js'

describe('KernelManager', () => {
  const createMockKernel = () => {
    const listeners: Record<string, (msg: KernelResult) => void> = {}
    return {
      kill: jest.fn(),
      send: jest.fn(),
      on: jest.fn((event: string, cb: (msg: KernelResult) => void) => {
        listeners[event] = cb
      }),
      off: jest.fn(),
      emit: (event: string, data: KernelResult) => {
        if (listeners[event]) listeners[event](data)
      },
    }
  }

  const setup = () => {
    const mockKernel = createMockKernel()
    const createProcessMock = jest.fn<KernelProcess, []>(() => mockKernel)
    const kernelManager = new KernelManager(createProcessMock)
    return { kernelManager, mockKernel, createProcessMock }
  }

  it('B1-Verify start works properly without existing kernel', () => {
    const { kernelManager, createProcessMock } = setup()
    kernelManager.start()
    expect(createProcessMock).toHaveBeenCalledTimes(1)
  })

  it('B2-Verify start works properly with existing kernel', () => {
    const { kernelManager, createProcessMock } = setup()
    kernelManager.start()
    kernelManager.start()
    expect(createProcessMock).toHaveBeenCalledTimes(1)
  })

  it('B3-Verify stop works properly without existing kernel', () => {
    const { kernelManager, mockKernel } = setup()
    kernelManager.stop()
    expect(mockKernel.kill).toHaveBeenCalledTimes(0)
  })

  it('B4-Verify stop works properly with existing kernel', () => {
    const { kernelManager, mockKernel } = setup()
    kernelManager.start()
    kernelManager.stop()
    expect(mockKernel.kill).toHaveBeenCalledTimes(1)
  })

  it('B5-Verify runCode throws error when called without existing kernel', () => {
    const { kernelManager } = setup()
    expect(() => {
      kernelManager.runCode({
        id: 'yaha',
        code: 'console.log("nanda");',
        language: 'JavaScript',
      })
    }).toThrow('Kernel not started')
  })

  it('B6-Verify runCode works properly with existing kernel', async () => {
    const { kernelManager, mockKernel } = setup()
    kernelManager.start()
    const result = kernelManager.runCode({
      id: 'yaha',
      code: 'console.log("nanda");',
      language: 'JavaScript',
    })
    expect(mockKernel.send).toHaveBeenCalledWith({
      id: 'yaha',
      code: 'console.log("nanda");',
      language: 'JavaScript',
    })
    mockKernel.emit('message', {
      id: 'yaha',
      result: 1,
      logs: ['nanda'],
      error: null,
    })
    const sol = await result
    expect(sol.id).toBe('yaha')
    expect(sol.logs).toStrictEqual(['nanda'])
    expect(sol.error).toBe(null)
  })
})
