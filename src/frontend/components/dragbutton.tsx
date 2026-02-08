import { forwardRef } from 'react'
import dragger from '../ui/assets/picture/dragger.svg'
import '../ui/index.css'

interface DragButtonProps {
  className?: string
}

const DragButton = forwardRef<HTMLButtonElement, DragButtonProps>(
  ({ className, ...props }, ref) => {
    const baseClasses =
      'flex items-center justify-center gap-2 font-Poppins text-white bg-transparent hover:brightness-125 cursor-grab transition-all duration-300 ease-in-out'

    const combinedClasses = [baseClasses, className].join(' ')

    return (
      <button
        data-testid='dragbutton'
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        <img src={dragger} alt='||' className='h-5 w-5' />
      </button>
    )
  }
)

export default DragButton
