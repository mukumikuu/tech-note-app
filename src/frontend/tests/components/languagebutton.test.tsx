import { render, screen, fireEvent } from '@testing-library/react'
import LanguageButton from '../../components/languagebutton'
import type { Language } from '../../../shared/language'

describe('languagebutton', () => {
  const setup = (language: Language) => {
    const onChange = jest.fn()
    render(
      <LanguageButton value={language} onChange={onChange}/>
    )
  }
  it('C44-Verify language button renders with initial language', () => {
    setup('JavaScript')
    expect(screen.getByTestId('languagebutton')).toBeInTheDocument()
    expect(screen.queryByText('JavaScript')).toBeInTheDocument()
  })
  it('C45-Verify language button open and close dropdown on mouse enter and leave', () => {
    setup('JavaScript')
    fireEvent.mouseEnter(screen.getByTestId('languagebutton'))
    expect(screen.getByTestId('dropdowncard')).toBeInTheDocument()
    fireEvent.mouseLeave(screen.getByTestId('languagebutton'))
    expect(screen.queryByTestId('dropdowncard')).not.toBeInTheDocument()
  })
  it('C46-Verify language button open and close dropdown on click', () => {
    setup('JavaScript')
    fireEvent.click(screen.getByTestId('languagetoggle'))
    expect(screen.getByTestId('dropdowncard')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('languagetoggle'))
    expect(screen.queryByTestId('dropdowncard')).not.toBeInTheDocument()
  })
  it('C47-Verify language button close on language change', () => {
    setup('JavaScript')
    fireEvent.mouseEnter(screen.getByTestId('languagebutton'))
    fireEvent.click(screen.queryByText('Shell')!)
    expect(screen.queryByTestId('dropdowncard')).not.toBeInTheDocument()
  })
})
