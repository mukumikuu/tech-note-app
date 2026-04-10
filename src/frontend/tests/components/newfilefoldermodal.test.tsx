import { fireEvent, render, screen } from '@testing-library/react'
import NewFileFolderModal from '../../components/newfilefoldermodal'

describe('newfilefoldermodal', () => {
  const setup = (isOpened: boolean) => {
    const onClosed = jest.fn()
    const onNewFile = jest.fn()
    const onNewFolder = jest.fn()
    render(
      <NewFileFolderModal
        isOpen={isOpened}
        onClose={onClosed}
        onNewFile={onNewFile}
        onNewFolder={onNewFolder}
      />
    )
    return { onClosed, onNewFile, onNewFolder }
  }
  it('C75-Verify newfilefoldermodal is rendered properly', () => {
    setup(true)
    expect(screen.getByTestId('newfilefoldermodal')).toBeInTheDocument()
  })
  it('C76-Verify newfilefoldermodal is not rendered when opened', () => {
    setup(false)
    expect(screen.queryByTestId('newfilefoldermodal')).not.toBeInTheDocument()
  })
  it('C77-Verify newfilefoldermodal can stop click on modal', () => {
    const { onClosed } = setup(true)
    fireEvent.click(screen.getByTestId('modalbox'))
    expect(onClosed).not.toHaveBeenCalled()
  })
  it('C78-Verify newfilefoldermodal can handle onNewFile', () => {
    const {onNewFile} = setup(true)
    fireEvent.click(screen.getByText('New File'))
    expect(onNewFile).toHaveBeenCalled()
  })
  it('C79-Verify newfilefoldermodal can handle onNewFolder', () => {
    const { onNewFolder } = setup(true)
    fireEvent.click(screen.getByText('Create Folder'))
    expect(onNewFolder).toHaveBeenCalled()
  })
})
