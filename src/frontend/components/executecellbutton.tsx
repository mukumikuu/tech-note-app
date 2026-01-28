import { Play, Loader2, Check, X } from 'lucide-react'
import type { CellStatus } from '../types/cellstatus'
interface ExecuteCellButtonProps {
  className?: string
  iconSize?: number
  iconColor?: string
  iconClassname?: string
  status: CellStatus
  onExecute: () => void
}

const ExecuteCellButton = ({
  className = '',
  iconSize = 18,
  iconColor = '#FFFFFF',
  iconClassname = '',
  status,
  onExecute,
}: ExecuteCellButtonProps) => {
  const iconMap = {
    idle: Play,
    running: Loader2,
    success: Check,
    error: X,
  }

  const Icon = iconMap[status]

  const baseClasses =
    'flex items-center justify-center gap-2 py-2 px-4 cursor-pointer transition-all duration-300 ease-in-out hover:brightness-125'

  const combinedClasses = className + baseClasses
  return (
    <button
      onClick={onExecute}
      disabled={status === 'running'}
      className={combinedClasses}
    >
      <Icon
        size={iconSize}
        color={iconColor}
        className={`${iconClassname} ${status === 'running' ? 'animate-spin' : 'fill-[#3E74EA]'}`}
      />
    </button>
  )
}

export default ExecuteCellButton
