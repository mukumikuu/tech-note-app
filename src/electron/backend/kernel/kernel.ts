import { KernelResult } from '../../../shared/kernelResult.js'
import { KernelFactory } from '../services/kernelfactory.js'
process.on('message', async ({id, code, language}) => {
  try {
    const factory = new KernelFactory()
    const kernel = factory.createKernel(language)
    const payload: KernelResult = await kernel.run(id, code)
    process.send?.(payload)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    const payload: KernelResult = {
      id,
      result: null,
      logs: [],
      error: message,
    }
    process.send?.(payload)
  }
})
