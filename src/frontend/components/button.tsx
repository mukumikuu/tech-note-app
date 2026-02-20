import type { LucideIcon } from 'lucide-react'
import React, { useState } from 'react'
import '../ui/index.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'icon'
  rounded?: 'lg' | 'sm' | 'full'
  className?: string
  icon?: LucideIcon
  iconSize?: number
  iconColor?: string
  iconClassname?: string
  onMouseDown?: React.MouseEventHandler<HTMLButtonElement>
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  onMouseDown,
  variant = 'default',
  rounded = 'full',
  className = '',
  icon: Icon,
  iconSize = 18,
  iconColor = 'var(--color-white)',
  iconClassname = '',
  ...rest
}) => {
  const [showOutline, setShowOutline] = useState(false)

  const handleClick = () => {
    if (variant === 'default') {
      setShowOutline(true)
      setTimeout(() => setShowOutline(false), 300)
    }

    onClick()
  }

  const baseClasses =
    'flex items-center justify-center gap-2 font-Poppins text-white cursor-pointer transition-all duration-300 ease-in-out'

  const roundedClasses = {
    sm: 'rounded-sm',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }
  const variantClasses = {
    default: 'w-full bg-dark-blue py-2 px-4 hover:brightness-125',
    icon: 'bg-transparent hover:brightness-125',
  }
  const outlineClass =
    variant === 'default' && showOutline
      ? 'outline outline-2 outline-light-blue outline-offset-2'
      : 'outline-none'

  const combinedClasses = [
    baseClasses,
    roundedClasses[rounded],
    variantClasses[variant],
    className,
    outlineClass,
  ].join(' ')

  return (
    <button
      data-testid='button'
      className={combinedClasses}
      onMouseDown={onMouseDown}
      onClick={handleClick}
      {...rest}
    >
      {Icon && (
        <Icon size={iconSize} color={iconColor} className={iconClassname} />
      )}
      {children}
    </button>
  )
}

export default Button
