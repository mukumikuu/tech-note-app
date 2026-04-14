type DropDownCardProps<T> = {
  data: T[]
  renderItem: (item: T) => React.ReactNode
  onSelect: (item: T) => void
  className?: string
  style?: React.CSSProperties
}

const DropDownCard = <T,>({
  data,
  renderItem,
  onSelect,
  className = 'absolute top-[calc(100%-1px)] left-0',
  style,
}: DropDownCardProps<T>) => {
  return (
    <div
      data-testid='dropdowncard'
      className={`border-dark-blue bg-dark-blue z-20 w-40 overflow-hidden rounded-none border shadow-lg ${className}`}
      style={style}
    >
      <div className='max-h-52 overflow-y-auto'>
        {data.map((item, i) => (
          <button
            key={i}
            type='button'
            onClick={() => onSelect(item)}
            className='bg-dark-blue hover:bg-blue flex w-full appearance-none items-center border-0 px-3 py-1.5 text-left text-xs text-white hover:text-white'
          >
            {renderItem(item)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default DropDownCard
