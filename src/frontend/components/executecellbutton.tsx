import { Play, Loader2, Check, X } from 'lucide-react'
import type { CellStatus } from '../../shared/cellstatus'
import '../ui/index.css'
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
  iconColor = 'var(--color-white)',
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
    'flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ease-in-out hover:brightness-125'

  const combinedClasses = className + baseClasses
  return (
    <button
      data-testid='executecellbutton'
      onClick={onExecute}
      disabled={status === 'running'}
      className={combinedClasses}
    >
      <Icon
        size={iconSize}
        color={iconColor}
        className={`${iconClassname} ${status === 'running' ? 'animate-spin' : 'fill-light-blue'}`}
      />
    </button>
  )
}

export default ExecuteCellButton
