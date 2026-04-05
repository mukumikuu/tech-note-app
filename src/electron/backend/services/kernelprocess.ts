import { fork } from 'child_process'
import { KernelProcess } from '../types/kernelprocess.js'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'

const logFile = path.join(app.getPath('userData'), 'debug.log')
const log = (...args: string[]) => {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`
  fs.appendFileSync(logFile, line)
}
const createNodeKernelProcess = (path: string): KernelProcess => {
  log('Forking kernel at:', path)
  const child = fork(path, [], {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
  })
  child.on('error', (err) => log('❌ Kernel process error:', err.message))
  child.on('exit', (code, signal) =>
    log('❌ Kernel exited — code:', `${code}`, 'signal:', `${signal}`)
  )
  child.stderr?.on('data', (data) => log('❌ Kernel stderr:', data.toString()))
  child.stdout?.on('data', (data) => log('Kernel stdout:', data.toString()))
  child.on('message', (msg) => log('Kernel message:', JSON.stringify(msg)))
  return child
}

export default createNodeKernelProcess
