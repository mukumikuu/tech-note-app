import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { Language } from '../../shared/language.js'
import { JSKernel } from '../backend/kernel/languagekernel/jskernel.js'
import { KernelFactory } from '../backend/services/kernelfactory.js'
import type { ChildProcess } from 'child_process'
import { Readable } from 'stream'
describe('KernelProcess', () => {})
import { EventEmitter } from 'events'
jest.mock('electron', () => ({
  app: { getPath: jest.fn(() => '/mock/userData') },
}))
jest.mock('fs', () => ({ appendFileSync: jest.fn() }))
function makeFakeChild() {
  const child = new EventEmitter() as unknown as ChildProcess
  const stdout = new Readable({ read() {} })
  const stderr = new Readable({ read() {} })
  child.stdout = stdout
  child.stderr = stderr
  return child
}

jest.mock('child_process', () => {
  return {
    fork: jest.fn(),
  }
})
import * as childProcess from 'child_process'
const forkMock = childProcess.fork as jest.Mock
import fs from 'fs'
import createNodeKernelProcess from '../backend/services/kernelprocess.js'
const appendSpy = fs.appendFileSync as jest.Mock

describe('createNodeKernelProcess', () => {
  let child: ReturnType<typeof makeFakeChild>
  beforeEach(() => {
    forkMock.mockReset()
    appendSpy.mockReset()
    child = makeFakeChild()
    forkMock.mockReturnValue(child)
  })
  it('B31-forks the given path with ipc stdio', () => {
    createNodeKernelProcess('/some/worker.js')
    expect(forkMock).toHaveBeenCalledWith('/some/worker.js', [], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    })
  })
  it('B32-returns the child process as a KernelProcess', () => {
    const result = createNodeKernelProcess('/some/worker.js')
    expect(result).toBe(child)
  })
  it('B33-logs the fork path', () => {
    createNodeKernelProcess('/some/worker.js')
    expect(appendSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('/some/worker.js')
    )
  })
  it('B34-logs on child process error', () => {
    createNodeKernelProcess('/some/worker.js')
    appendSpy.mockClear()
    child.emit('error', new Error('ENOENT'))
    expect(appendSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('ENOENT')
    )
  })
  it('B35-logs on child process exit', () => {
    createNodeKernelProcess('/some/worker.js')
    appendSpy.mockClear()
    child.emit('exit', 1, null)
    expect(appendSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('1')
    )
  })
  it('B36-logs stderr data from the child', () => {
    createNodeKernelProcess('/some/worker.js')
    appendSpy.mockClear()
    child.stderr?.emit('data', Buffer.from('stderr line'))
    expect(appendSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('stderr line')
    )
  })
  it('B37-logs stdout data from the child', () => {
    createNodeKernelProcess('/some/worker.js')
    appendSpy.mockClear()
    child.stdout?.emit('data', Buffer.from('stdout line'))
    expect(appendSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('stdout line')
    )
  })
  it('B38-logs ipc messages from the child as JSON', () => {
    createNodeKernelProcess('/some/worker.js')
    appendSpy.mockClear()
    child.emit('message', { id: 'r1', result: 42 })
    expect(appendSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('"id":"r1"')
    )
  })
})

import { Executor } from '../backend/services/executor.js'

describe('Executor', () => {
  let executor: Executor

  beforeEach(() => {
    executor = new Executor()
  })

  it('B39-executes code and returns the expression result', async () => {
    const result = await executor.execute('e-1', '1 + 1')
    expect(result).toEqual({ id: 'e-1', result: 2, logs: [], error: null })
  })

  it('B40-captures console.log calls into logs', async () => {
    const result = await executor.execute(
      'e-2',
      'console.log("hello", "world"); 42'
    )
    expect(result.logs).toEqual(['hello world'])
    expect(result.result).toBe(42)
  })

  it('B41-captures multiple console.log calls in order', async () => {
    const result = await executor.execute(
      'e-3',
      'console.log("a"); console.log("b"); console.log("c")'
    )
    expect(result.logs).toEqual(['a', 'b', 'c'])
  })

  it('B42-returns error message and null result on a syntax error', async () => {
    const result = await executor.execute('e-4', '((( invalid')
    expect(result.error).toBeTruthy()
    expect(result.result).toBeNull()
    expect(result.id).toBe('e-4')
  })

  it('B43-returns error message and null result on a runtime error', async () => {
    const result = await executor.execute('e-5', 'undeclaredVar.property')
    expect(result.error).toMatch(/undeclaredVar|not defined|Cannot read/i)
    expect(result.result).toBeNull()
  })

  it('B44-times out code that runs longer than 1000ms', async () => {
    const result = await executor.execute('e-6', 'while(true){}')
    expect(result.error).toMatch(/timed out|Script execution timed out/i)
    expect(result.result).toBeNull()
  }, 5000)

  it('B45-sandboxes code — cannot access Node globals like process', async () => {
    const result = await executor.execute('e-7', 'process.exit(1)')
    expect(result.error).toBeTruthy()
  })

  it('B46-returns logs collected before a runtime error', async () => {
    const result = await executor.execute(
      'e-8',
      'console.log("before"); null.boom'
    )
    expect(result.logs).toEqual(['before'])
    expect(result.error).toBeTruthy()
  })

  it('B47-returns undefined result for code with no return value', async () => {
    const result = await executor.execute('e-9', 'const x = 5')
    expect(result.result).toBeUndefined()
    expect(result.error).toBeNull()
  })

  it('B48-includes the id in the result on both success and failure', async () => {
    const ok = await executor.execute('my-id', '1')
    expect(ok.id).toBe('my-id')
    const fail = await executor.execute('my-id', 'throw new Error("x")')
    expect(fail.id).toBe('my-id')
  })
})
jest.mock('esbuild', () => ({
  transform: jest.fn(),
}))
import { transform } from 'esbuild'
type TransformFn = (
  code: string,
  options: {
    loader: 'ts'
    target: string
    format: string
  }
) => Promise<{ code: string }>
const mockTransform = transform as unknown as jest.MockedFunction<TransformFn>
import { TSCompiler } from '../backend/services/compiler.js'
import { PyKernel } from '../backend/kernel/languagekernel/pykernel.js'
import { ShellKernel } from '../backend/kernel/languagekernel/shellkernel.js'
describe('TSCompiler', () => {
  let compiler: TSCompiler
  beforeEach(() => {
    mockTransform.mockReset()
    compiler = new TSCompiler()
  })
  it('B49-returns the compiled output from esbuild', async () => {
    mockTransform.mockResolvedValue({ code: 'const x = 1;' })
    const result = await compiler.compile('const x: number = 1')
    expect(result).toBe('const x = 1;')
  })
  it('B50-calls esbuild transform with ts loader, es2020 target, cjs format', async () => {
    mockTransform.mockResolvedValue({ code: '' })
    await compiler.compile('let x: string = "hi"')
    expect(mockTransform).toHaveBeenCalledWith('let x: string = "hi"', {
      loader: 'ts',
      target: 'es2020',
      format: 'cjs',
    })
  })
  it('B51-strips TypeScript type annotations', async () => {
    mockTransform.mockImplementation(async (code: string) => {
      const output = code
        .replace(/:\s*\w+/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      return { code: output }
    })
    const result = await compiler.compile('const x: number = 42')
    expect(result).not.toContain(': number')
  })
  it('B52-propagates errors thrown by esbuild', async () => {
    mockTransform.mockRejectedValue(new Error('Transform failed'))
    await expect(compiler.compile('invalid TS ><')).rejects.toThrow(
      'Transform failed'
    )
  })
  it('B53-passes through empty string input without crashing', async () => {
    mockTransform.mockResolvedValue({ code: '' })
    const result = await compiler.compile('')
    expect(result).toBe('')
    expect(mockTransform).toHaveBeenCalledWith('', expect.any(Object))
  })
})
describe('KernelFactory', () => {
  const setup = () => {
    const factory = new KernelFactory()
    return { factory }
  }
  it('B54-Verify kernel creation from valid input works', () => {
    const { factory } = setup()
    const kernel = factory.createKernel('JavaScript')
    expect(kernel).toBeInstanceOf(JSKernel)
  })
  it('B55-Verify kernel creation from invalid input throws error', () => {
    const { factory } = setup()
    expect(() => {
      factory.createKernel('Yaha' as Language)
    }).toThrow('Unsupported language: Yaha')
  })
  it('B56-Verify kernel creation from unsupported language throws error', () => {
    const { factory } = setup()
    expect(() => {
      factory.createKernel('Cpp')
    }).toThrow('Unsupported language: Cpp')
  })
  it('B57-Verify kernel creation for python works', () => {
    const { factory } = setup()
    const kernel = factory.createKernel('Python')
    expect(kernel).toBeInstanceOf(PyKernel)
  })
  it('B58-Verify kernel creation for shell works', () => {
    const { factory } = setup()
    const kernel = factory.createKernel('Shell')
    expect(kernel).toBeInstanceOf(ShellKernel)
  })
})
