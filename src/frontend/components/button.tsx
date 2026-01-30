import type { LucideIcon } from 'lucide-react'
import React, { useState } from 'react'

interface ButtonProps {
  children?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'icon'
  rounded?: 'lg' | 'sm' | 'full'
  className?: string
  icon?: LucideIcon
  iconSize?: number
  iconColor?: string
  iconClassname?: string
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  rounded = 'full',
  className = '',
  icon: Icon,
  iconSize = 18,
  iconColor = '#FFFFFF',
  iconClassname = '',
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
    'flex items-center justify-center gap-2 py-2 cursor-pointer transition-all duration-300 ease-in-out'

  const roundedClasses = {
    sm: 'rounded-sm',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }
  const variantClasses = {
    default: 'w-full bg-[#191E30] border hover:brightness-125',
    icon: 'bg-transparent hover:brightness-125',
  }
  const outlineClass =
    variant === 'default' && showOutline
      ? 'outline outline-2 outline-[#3E74EA] outline-offset-2'
      : 'outline-none'

  const combinedClasses = [
    baseClasses,
    roundedClasses[rounded],
    variantClasses[variant],
    className,
    outlineClass,
  ].join(' ')

  return (
    <button className={combinedClasses} onClick={handleClick}>
      {Icon && (
        <Icon size={iconSize} color={iconColor} className={iconClassname} />
      )}
      {children}
    </button>
  )
}

export default Button
