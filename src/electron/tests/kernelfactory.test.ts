import { Language } from '../../shared/language.js'
import { JSKernel } from '../backend/kernel/languagekernel/jskernel.js'
import { KernelFactory } from '../backend/services/kernelfactory.js'
describe('KernelFactory', () => {
  const setup = () => {
    const factory = new KernelFactory()
    return { factory }
  }

  it('B7-Verify kernel creation from valid input works', () => {
    const { factory } = setup()
    const kernel = factory.createKernel('JavaScript')
    expect(kernel).toBeInstanceOf(JSKernel)
  })

  it('B8-Verify kernel creation from invalid input throws error', () => {
    const { factory } = setup()
    expect(() => {
      factory.createKernel('Yaha' as Language)
    }).toThrow('Unsupported language: Yaha')
  })

  it('B9-Verify kernel creation from unsupported language throws error', () => {
    const { factory } = setup()
    expect(() => {
      factory.createKernel('Cpp')
    }).toThrow('Unsupported language: Cpp')
  })
})
