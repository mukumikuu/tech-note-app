import { useState } from 'react'
import Button from './button'
import DropDownCard from './dropdowncard'
import type { Language } from '../../shared/language'

type LanguageButtonProps = {
  value: Language
  onChange: (language: Language) => void
}

const LanguageButton = ({ value, onChange }: LanguageButtonProps) => {
  const languages: Language[] = [
    'Cpp',
    'Java',
    'JavaScript',
    'Python',
    'Shell',
    'SQL',
  ]
  const [open, setOpen] = useState(false)

  const toggleMenu = () => {
    setOpen((prev) => !prev)
  }

  return (
    <div
      data-testid='languagebutton'
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className='pl-3 text-white'
    >
      <Button data-testid='languagetoggle' variant='icon' onClick={toggleMenu}>
        {value}
      </Button>
      {open && (
        <DropDownCard
          data={languages}
          renderItem={(lang) => lang}
          onSelect={(lang) => {
            onChange(lang)
            setOpen(false)
          }}
        ></DropDownCard>
      )}
    </div>
  )
}

export default LanguageButton
