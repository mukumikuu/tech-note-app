import { useState, useEffect, type Dispatch, type SetStateAction } from 'react'
interface SearchBarProps {
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  search: (query: string) => void
}

const SearchBar = ({ query, setQuery, search }: SearchBarProps) => {
  const [isSearching, setIsSearching] = useState(false)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      if (isTyping) return
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') ||
        e.key === 'ESCAPE'
      ) {
        e.preventDefault()
        setIsSearching((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  return (
    <>
      {isSearching && (
        <div className='sticky top-0 z-10 p-2 text-white shadow'>
          <input
            autoFocus
            className='w-full border px-2 py-1 text-sm'
            placeholder='Search in notebook...'
            value={query}
            onChange={(e) => {
              const q = e.target.value
              setQuery(q)
              search(q)
            }}
          />
        </div>
      )}
    </>
  )
}

export default SearchBar
