import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { PyKernel } from '../backend/kernel/languagekernel/pykernel'
import { ShellKernel } from '../backend/kernel/languagekernel/shellkernel'
import { JSKernel } from '../backend/kernel/languagekernel/jskernel'
import { EventEmitter } from 'events'
const mockCompile = jest.fn<(code: string) => Promise<string>>()
const mockExecute = jest.fn<
  (
    id: string,
    code: string
  ) => Promise<{
    result: number | undefined
    logs: string[]
    error: string | null
  }>
>()
jest.mock('../backend/services/compiler', () => ({
  TSCompiler: jest.fn().mockImplementation(() => ({ compile: mockCompile })),
}))
jest.mock('../backend/services/executor', () => ({
  Executor: jest.fn().mockImplementation(() => ({ execute: mockExecute })),
}))
describe('JSKernel', () => {
  let kernel: JSKernel
  beforeEach(() => {
    mockCompile.mockReset()
    mockExecute.mockReset()
    kernel = new JSKernel()
  })
  it('B12-JSKernel compiles then executes the code and returns a KernelResult', async () => {
    mockCompile.mockResolvedValue('compiled-js')
    mockExecute.mockResolvedValue({
      result: 42,
      logs: ['log line'],
      error: null,
    })
    const result = await kernel.run('id-1', 'let x = 1')
    expect(mockCompile).toHaveBeenCalledWith('let x = 1')
    expect(mockExecute).toHaveBeenCalledWith('id-1', 'compiled-js')
    expect(result).toEqual({
      id: 'id-1',
      result: 42,
      logs: ['log line'],
      error: null,
    })
  })
  it('B13-propagates errors thrown by the compiler', async () => {
    mockCompile.mockRejectedValue(new Error('TS compile error'))
    await expect(kernel.run('id-2', 'bad code')).rejects.toThrow(
      'TS compile error'
    )
  })
  it('B14-propagates errors thrown by the executor', async () => {
    mockCompile.mockResolvedValue('compiled-js')
    mockExecute.mockRejectedValue(new Error('execution failed'))
    await expect(kernel.run('id-3', 'code')).rejects.toThrow('execution failed')
  })
  it('B15-forwards a null error field when execution succeeds cleanly', async () => {
    mockCompile.mockResolvedValue('compiled')
    mockExecute.mockResolvedValue({ result: undefined, logs: [], error: null })
    const result = await kernel.run('id-4', '')
    expect(result.error).toBeNull()
  })
})
import { Readable } from 'stream'
import type { ChildProcess } from 'child_process'
type KillFn = (signal?: number | NodeJS.Signals) => boolean
type MockedChildProcess = ChildProcess & {
  stdout: Readable
  stderr: Readable
  kill: jest.Mock<KillFn>
}
type SpawnMockOptions = { stdout?: string; stderr?: string }
function makeSpawnMock({ stdout = '', stderr = '' }: SpawnMockOptions = {}) {
  const child = new EventEmitter() as unknown as MockedChildProcess
  const stdoutStream = new Readable({ read() {} })
  const stderrStream = new Readable({ read() {} })
  child.stdout = stdoutStream
  child.stderr = stderrStream
  child.kill = jest.fn<KillFn>(() => true)
  const spawnMock = jest.fn(() => {
    setTimeout(() => {
      if (stdout) stdoutStream.push(stdout)
      if (stderr) stderrStream.push(stderr)
      stdoutStream.push(null)
      stderrStream.push(null)
      child.emit('close', 0)
    }, 0)
    return child
  })
  return { spawnMock, child }
}
jest.mock('child_process', () => ({ spawn: jest.fn() }))
import * as childProcess from 'child_process'
const spawnSpy = childProcess.spawn as jest.Mock
describe('PyKernel', () => {
  let kernel: PyKernel
  beforeEach(() => {
    spawnSpy.mockReset()
    kernel = new PyKernel()
  })
  it('B16-resolves with stdout as result and null error on success', async () => {
    const { spawnMock } = makeSpawnMock({ stdout: 'hello\n' })
    spawnSpy.mockImplementation(spawnMock)
    const result = await kernel.run('py-1', 'print("hello")')
    expect(result).toEqual({
      id: 'py-1',
      result: 'hello\n',
      logs: [],
      error: null,
    })
  })
  it('B17-resolves with stderr as error when the script fails', async () => {
    const { spawnMock } = makeSpawnMock({
      stderr: 'NameError: name x not defined\n',
    })
    spawnSpy.mockImplementation(spawnMock)
    const result = await kernel.run('py-2', 'print(x)')
    expect(result.error).toBe('NameError: name x not defined\n')
    expect(result.result).toBe('')
  })
  it('B18-returns empty logs array always', async () => {
    const { spawnMock } = makeSpawnMock({ stdout: 'ok' })
    spawnSpy.mockImplementation(spawnMock)
    const result = await kernel.run('py-3', 'pass')
    expect(result.logs).toEqual([])
  })
  it('B19-uses python on win32', async () => {
    const originalPlatform = process.platform
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      configurable: true,
    })
    const { spawnMock } = makeSpawnMock()
    spawnSpy.mockImplementation(spawnMock)
    await kernel.run('py-4', '')
    expect(spawnSpy).toHaveBeenCalledWith('python', expect.any(Array))
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true,
    })
  })
  it('B20-uses python3 on linux', async () => {
    const originalPlatform = process.platform
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true,
    })
    const { spawnMock } = makeSpawnMock()
    spawnSpy.mockImplementation(spawnMock)
    await kernel.run('py-5', '')
    expect(spawnSpy).toHaveBeenCalledWith('python3', expect.any(Array))
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true,
    })
  })
  it('B21-uses python3 on darwin', async () => {
    const originalPlatform = process.platform
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true,
    })
    const { spawnMock } = makeSpawnMock()
    spawnSpy.mockImplementation(spawnMock)
    await kernel.run('py-6', '')
    expect(spawnSpy).toHaveBeenCalledWith('python3', expect.any(Array))
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true,
    })
  })
  it('B22-passes code via -c flag', async () => {
    const { spawnMock } = makeSpawnMock()
    spawnSpy.mockImplementation(spawnMock)
    await kernel.run('py-7', 'print(1)')
    expect(spawnSpy).toHaveBeenCalledWith(expect.any(String), [
      '-c',
      'print(1)',
    ])
  })
})
describe('ShellKernel', () => {
  let kernel: ShellKernel
  beforeEach(() => {
    spawnSpy.mockReset()
    kernel = new ShellKernel()
  })
  it('B23-resolves with stdout as result and null error on success', async () => {
    const { spawnMock } = makeSpawnMock({ stdout: 'world\n' })
    spawnSpy.mockImplementation(spawnMock)
    const result = await kernel.run('sh-1', 'echo world')
    expect(result).toEqual({
      id: 'sh-1',
      result: 'world\n',
      logs: [],
      error: null,
    })
  })
  it('B24-resolves with stderr as error when the command fails', async () => {
    const { spawnMock } = makeSpawnMock({ stderr: 'command not found: foo\n' })
    spawnSpy.mockImplementation(spawnMock)
    const result = await kernel.run('sh-2', 'foo')
    expect(result.error).toBe('command not found: foo\n')
  })
  it('B25-returns empty logs array always', async () => {
    const { spawnMock } = makeSpawnMock({ stdout: 'ok' })
    spawnSpy.mockImplementation(spawnMock)
    const result = await kernel.run('sh-3', 'echo ok')
    expect(result.logs).toEqual([])
  })
  it('B26-uses powershell.exe on win32', async () => {
    const originalPlatform = process.platform
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      configurable: true,
    })
    const { spawnMock } = makeSpawnMock()
    spawnSpy.mockImplementation(spawnMock)
    await kernel.run('sh-4', '')
    expect(spawnSpy).toHaveBeenCalledWith('powershell.exe', expect.any(Array))
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true,
    })
  })
  it('B27-uses /bin/bash on linux', async () => {
    const originalPlatform = process.platform
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true,
    })
    const { spawnMock } = makeSpawnMock()
    spawnSpy.mockImplementation(spawnMock)
    await kernel.run('sh-5', '')
    expect(spawnSpy).toHaveBeenCalledWith('/bin/bash', expect.any(Array))
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true,
    })
  })
  it('B28-uses /bin/bash on darwin', async () => {
    const originalPlatform = process.platform
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true,
    })
    const { spawnMock } = makeSpawnMock()
    spawnSpy.mockImplementation(spawnMock)
    await kernel.run('sh-6', '')
    expect(spawnSpy).toHaveBeenCalledWith('/bin/bash', expect.any(Array))
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true,
    })
  })
  it('B29-passes code via -c flag', async () => {
    const { spawnMock } = makeSpawnMock()
    spawnSpy.mockImplementation(spawnMock)
    await kernel.run('sh-7', 'echo hi')
    expect(spawnSpy).toHaveBeenCalledWith(expect.any(String), ['-c', 'echo hi'])
  })
  it('B30-accumulates multiple stdout chunks', async () => {
    const child = new EventEmitter() as unknown as ChildProcess
    const stdout = new Readable({ read() {} })
    const stderr = new Readable({ read() {} })
    child.stdout = stdout
    child.stderr = stderr
    spawnSpy.mockReturnValue(child)
    setImmediate(() => {
      stdout.push('part1')
      stdout.push('part2')
      stdout.push(null)
      child.emit('close', 0)
    })
    const result = await kernel.run('sh-8', 'echo part1; echo part2')
    expect(result.result).toBe('part1part2')
  })
})
