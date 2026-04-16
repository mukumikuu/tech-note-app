import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { KernelManager } from '../backend/kernel/kernelmanager.js'
import { KernelResult } from '../../shared/kernelResult.js'
import { KernelProcess } from '../backend/types/kernelprocess.js'
function makeKernelProcess(): jest.Mocked<KernelProcess> {
  return {
    send: jest.fn(),
    kill: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  } as unknown as jest.Mocked<KernelProcess>
}

const BASE_PAYLOAD = {
  id: 'run-1',
  code: '1+1',
  language: 'JavaScript',
} as const

describe('KernelManager', () => {
  let kernelProcess: jest.Mocked<KernelProcess>
  let createProcess: jest.Mock
  let manager: KernelManager
  beforeEach(() => {
    kernelProcess = makeKernelProcess()
    createProcess = jest.fn(() => kernelProcess) as jest.Mock<
      () => KernelProcess
    >
    manager = new KernelManager(createProcess as unknown as () => KernelProcess)
  })
  it('B1-Verify start() calls createProcess and stores the kernel', () => {
    manager.start()
    expect(createProcess).toHaveBeenCalledTimes(1)
  })
  it('B2-Verify start() does not create a second process if already started', () => {
    manager.start()
    manager.start()
    expect(createProcess).toHaveBeenCalledTimes(1)
  })
  it('B3-Verify stop() kills the kernel process', () => {
    manager.start()
    manager.stop()
    expect(kernelProcess.kill).toHaveBeenCalledTimes(1)
  })
  it('B4-Verify stop() nulls the kernel so it can be restarted', () => {
    manager.start()
    manager.stop()
    manager.start()
    expect(createProcess).toHaveBeenCalledTimes(2)
  })
  it('B5-Verify stop() is a no-op when the kernel was never started', () => {
    expect(() => manager.stop()).not.toThrow()
    expect(kernelProcess.kill).not.toHaveBeenCalled()
  })
  it('B6-Verify runcode() throws if the kernel has not been started', () => {
    expect(() => manager.runCode(BASE_PAYLOAD)).toThrow('Kernel not started')
  })
  it('B7-Verify runcode() sends the payload to the kernel process', () => {
    manager.start()
    manager.runCode(BASE_PAYLOAD)
    expect(kernelProcess.send).toHaveBeenCalledWith(BASE_PAYLOAD)
  })
  it('B8-Verify runcode() resolves with the matching message from the kernel', async () => {
    manager.start()
    kernelProcess.on.mockImplementation(
      (_event: string, listener: (msg: KernelResult) => void) => {
        const result: KernelResult = {
          id: 'run-1',
          result: 2,
          logs: [],
          error: null,
        }
        listener(result)
        return kernelProcess
      }
    )
    const result = await manager.runCode(BASE_PAYLOAD)
    expect(result).toEqual({ id: 'run-1', result: 2, logs: [], error: null })
  })
  it('B9-Verify runcode() ignores messages with a different id and only resolves for the matching one', async () => {
    manager.start()
    kernelProcess.on.mockImplementation(
      (_event: string, listener: (msg: KernelResult) => void) => {
        listener({ id: 'other-run', result: 99, logs: [], error: null })
        listener({ id: 'run-1', result: 2, logs: [], error: null })
        return kernelProcess
      }
    )
    const result = await manager.runCode(BASE_PAYLOAD)
    expect(result.id).toBe('run-1')
    expect(result.result).toBe(2)
  })
  it('B10-Verify runcode() removes the listener after resolving', async () => {
    manager.start()
    kernelProcess.on.mockImplementation(
      (_event: string, listener: (msg: KernelResult) => void) => {
        listener({ id: 'run-1', result: 2, logs: [], error: null })
        return kernelProcess
      }
    )
    await manager.runCode(BASE_PAYLOAD)
    expect(kernelProcess.off).toHaveBeenCalledWith(
      'message',
      expect.any(Function)
    )
  })
  it('B11-Verify runcode() resolves with an error payload if the kernel reports an error', async () => {
    manager.start()
    kernelProcess.on.mockImplementation(
      (_event: string, listener: (msg: KernelResult) => void) => {
        listener({
          id: 'run-1',
          result: undefined,
          logs: [],
          error: 'SyntaxError: bad code',
        })
        return kernelProcess
      }
    )
    const result = await manager.runCode(BASE_PAYLOAD)
    expect(result.error).toBe('SyntaxError: bad code')
  })
})
