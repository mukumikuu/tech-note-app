import { fork } from 'child_process'
import { KernelProcess } from '../types/kernelprocess.js'

const createNodeKernelProcess = (path: string): KernelProcess => {
  const child = fork(path, [], {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
  })

  return child
}

export default createNodeKernelProcess
