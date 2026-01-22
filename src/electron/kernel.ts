import { transform } from 'esbuild';
import vm from 'vm';
import { KernelResult } from '../types/kernelResult.js';

process.on('message', async (code: string) => {
  const logs: string[] = [];
  const sandbox = {
    console: {
      log: (...args: unknown[]) => logs.push(args.join(' ')),
    },
  };

  try {
    const { code: js } = await transform(code, {
      loader: 'ts',
      target: 'es2020',
      format: 'cjs',
    });

    const script = new vm.Script(js);
    const context = vm.createContext(sandbox);
    const result = script.runInContext(context, { timeout: 1000 });

    const payload: KernelResult = { result, logs, error: null };
    process.send?.(payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const payload: KernelResult = { result: null, logs, error: message };
    process.send?.(payload);
  }
});
