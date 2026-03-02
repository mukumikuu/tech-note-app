export interface KernelResult {
  id: string
  result: unknown
  logs: string[]
  error: string | null
}
