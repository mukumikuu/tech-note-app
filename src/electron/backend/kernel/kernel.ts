import { KernelResult } from '../../../shared/kernelResult.js'
import { KernelFactory } from '../services/kernelfactory.js'
process.on('message', async (code: string) => {
  const factory = new KernelFactory()
  const kernel = factory.createKernel('JavaScript')
  const payload: KernelResult = await kernel.run(code)
  process.send?.(payload)
})
