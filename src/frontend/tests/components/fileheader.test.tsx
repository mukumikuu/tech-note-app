import { render, screen, fireEvent } from '@testing-library/react'
import FileHeader from '../../components/fileheader'

describe('fileheader', () => {
  const setup = (label: string) => {
    const onLabelChange = jest.fn()
    const onRunAll = jest.fn()
    const onRestart = jest.fn()
    const onClearOutput = jest.fn()
    render(
      <FileHeader
        blocks={[]}
        label={label}
        onLabelChange={onLabelChange}
        onRunAll={onRunAll}
        onRestart={onRestart}
        onClearOutput={onClearOutput}
      />
    )
    return { onLabelChange, onRunAll, onRestart, onClearOutput }
  }
  it('C48-Verify fileheader renders properly', () => {
    setup('Nanda')
    expect(screen.getByTestId('fileheader')).toBeInTheDocument()
    expect(screen.queryByText('Nanda')).toBeInTheDocument()
  })
  it('C49-Verify label can be edited', () => {
    const { onLabelChange } = setup('Nanda')
    const test = 'omai'
    fireEvent.doubleClick(screen.getByText('Nanda'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: test } })
    expect(input).toHaveValue(test)
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onLabelChange).toHaveBeenCalledWith(test)
  })
  it('C50-Verify label editing can be cancelled', () => {
    const { onLabelChange } = setup('Nanda')
    const test = 'omai'
    fireEvent.doubleClick(screen.getByText('Nanda'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: test } })
    expect(input).toHaveValue(test)
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onLabelChange).not.toHaveBeenCalledWith(test)
  })
  it('C51-Verify fileheader can handle onClearOutput', () => {
    const {onClearOutput} = setup('Nanda')
    fireEvent.click(screen.queryByText('Clear Output')!)
    expect(onClearOutput).toHaveBeenCalled()
  })
  it('C52-Verify fileheader can handle onRunAll', () => {
    const {onRunAll} = setup('Nanda')
    fireEvent.click(screen.queryByText('Run All')!)
    expect(onRunAll).toHaveBeenCalled()
  })
  it('C53-Verify fileheader can handle onRestart', () => {
    const {onRestart} = setup('Nanda')
    fireEvent.click(screen.queryByText('Restart')!)
    expect(onRestart).toHaveBeenCalled()
  })
})
