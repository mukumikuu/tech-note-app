import Button from './button'
type DropDownCardProps<T> = {
  data: T[]
  renderItem: (item: T) => React.ReactNode
  onSelect: (item: T) => void
}

const DropDownCard = <T,>({
  data,
  renderItem,
  onSelect,
}: DropDownCardProps<T>) => {
  return (
    <div data-testid='dropdowncard' className='absolute z-2 text-[10px]'>
      {data.map((item, i) => (
        <Button key={i} onClick={() => onSelect(item)} rounded='lg'>
          {renderItem(item)}
        </Button>
      ))}
    </div>
  )
}

export default DropDownCard
