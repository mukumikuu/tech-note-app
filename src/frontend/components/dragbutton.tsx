import { forwardRef, type ReactNode } from 'react'
import dragger from '../ui/assets/picture/dragger.svg'
import '../ui/index.css'

interface DragButtonProps {
  children?: ReactNode
  rounded?: 'lg' | 'sm' | 'full'
  className?: string
}

const DragButton = forwardRef<HTMLButtonElement, DragButtonProps>(
  ({ children, rounded = 'sm', className, ...props }, ref) => {
    const baseClasses =
      'flex items-center justify-center gap-2 font-Poppins text-white bg-transparent hover:brightness-125 cursor-pointer transition-all duration-300 ease-in-out'

    const roundedClasses = {
      sm: 'rounded-sm',
      lg: 'rounded-lg',
      full: 'rounded-full',
    }

    const combinedClasses = [
      baseClasses,
      roundedClasses[rounded],
      className,
    ].join(' ')

    return (
      <button ref={ref} className={combinedClasses} {...props}>
        <img src={dragger} alt='||' className='h-5 w-5' />
        {children}
      </button>
    )
  }
)

export default DragButton
