export function isDev() {
  return process.env.NODE_ENV === 'development' // Check if the app is running in development mode
}

export function logMemory() {
  const mem = process.memoryUsage()
  const heap = process.getHeapStatistics()
  console.log(`RSS: ${(mem.rss / 1024 / 1024).toFixed(2)} MB`)
  console.log(`heapUsed: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`)
  console.log(`heapTotal: ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`)
  console.log(`mallocedMemory: ${(heap.mallocedMemory / 1024).toFixed(2)} MB`)
  console.log(`peakMemory: ${(heap.peakMallocedMemory / 1024).toFixed(2)} MB`)
}

export function logAppMemory(app: Electron.App) {
  const metrics = app.getAppMetrics()
  metrics.forEach((metric) => {
    const cpu = metric.cpu.percentCPUUsage
    const memoryKB = metric.memory.workingSetSize
    const memoryMB = memoryKB / 1024
    console.log({
      pid: metric.pid,
      type: metric.type,
      cpuPercent: cpu,
      memoryMB: memoryMB.toFixed(2),
    })
  })
}
