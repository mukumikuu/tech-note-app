import { renderHook, act } from '@testing-library/react'
import { useNotebook } from '../../hooks/usenotebook'
import { socket } from '../../utils/socket'
import type Notebook from '../../../shared/notebook'

jest.mock('../../utils/socket', () => ({
  socket: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}))

jest.mock('@dnd-kit/sortable', () => ({
  arrayMove: jest.fn((arr, from, to) => {
    const result = [...arr]
    const [removed] = result.splice(from, 1)
    result.splice(to, 0, removed)
    return result
  }),
}))

const mockSocket = socket as jest.Mocked<typeof socket>

const getHandler = (event: string) => {
  const call = mockSocket.on.mock.calls.find(([e]) => e === event)
  return call?.[1] as (data: unknown) => void
}

const mockNotebook = {
  notebookid: 'nb1',
  name: 'Test NB',
  folderid: 'f1',
  blocks: [],
}
const mockNotebook2 = { notebookid: 'nb2', name: 'Test NB 2', folderid: 'f1' }

beforeEach(() => jest.clearAllMocks())
it('H70-Verify useNotebook initial state is correct', () => {
  const { result } = renderHook(() => useNotebook())
  expect(result.current.notebook).toBeNull()
  expect(result.current.notebooks).toEqual([])
  expect(result.current.loading).toBe(false)
  expect(result.current.error).toBeNull()
  expect(result.current.status).toBe('idle')
  expect(result.current.nbLoaded).toBe(false)
})
it('H71-Verify useNotebook registers socket listeners on mount', () => {
  renderHook(() => useNotebook())
  const events = mockSocket.on.mock.calls.map(([e]) => e)
  expect(events).toContain('connect')
  expect(events).toContain('notebook:created')
  expect(events).toContain('notebook:loaded')
  expect(events).toContain('notebook:updated')
  expect(events).toContain('notebook:deleted')
  expect(events).toContain('notebook:allLoaded')
  expect(events).toContain('notebook:folderLoaded')
})
it('H72-Verify useNotebook deregisters socket listeners on unmount', () => {
  const { unmount } = renderHook(() => useNotebook())
  unmount()
  const events = mockSocket.off.mock.calls.map(([e]) => e)
  expect(events).toContain('notebook:created')
  expect(events).toContain('notebook:loaded')
  expect(events).toContain('notebook:updated')
  expect(events).toContain('notebook:deleted')
  expect(events).toContain('notebook:allLoaded')
  expect(events).toContain('notebook:folderLoaded')
})
it('H73-Verify useNotebook emits notebook:get on connect when notebookId provided', () => {
  renderHook(() => useNotebook('nb1'))
  const connectHandler = getHandler('connect')
  act(() => connectHandler(undefined))
  expect(mockSocket.emit).toHaveBeenCalledWith('notebook:get', {
    notebookId: 'nb1',
  })
})
it('H74-Verify useNotebook does not emit notebook:get on connect when no notebookId', () => {
  renderHook(() => useNotebook())
  const connectHandler = getHandler('connect')
  act(() => connectHandler(undefined))
  expect(mockSocket.emit).not.toHaveBeenCalled()
})
it('H75-Verify createNotebook emits socket event and sets loading/running', () => {
  const { result } = renderHook(() => useNotebook())
  act(() => result.current.createNotebook('My NB'))
  expect(mockSocket.emit).toHaveBeenCalledWith('notebook:create', {
    name: 'My NB',
    folderId: undefined,
  })
  expect(result.current.loading).toBe(true)
  expect(result.current.status).toBe('running')
})
it('H76-Verify createNotebook with folderId passes folderId in emit', () => {
  const { result } = renderHook(() => useNotebook())
  act(() => result.current.createNotebook('My NB', 'folder1'))
  expect(mockSocket.emit).toHaveBeenCalledWith('notebook:create', {
    name: 'My NB',
    folderId: 'folder1',
  })
})
it('H77-Verify notebook:created success updates state', () => {
  const { result } = renderHook(() => useNotebook())
  act(() => result.current.createNotebook('My NB'))
  const handler = getHandler('notebook:created')
  act(() => handler({ status: 'success', notebook: mockNotebook }))
  expect(result.current.notebook).toEqual(mockNotebook)
  expect(result.current.notebooks).toContainEqual(mockNotebook)
  expect(result.current.loading).toBe(false)
  expect(result.current.error).toBeNull()
  expect(result.current.status).toBe('success')
})
it('H78-Verify notebook:created error sets error state', () => {
  const { result } = renderHook(() => useNotebook())
  const handler = getHandler('notebook:created')
  act(() => handler({ status: 'error', error: 'Create failed' }))
  expect(result.current.error).toBe('Create failed')
  expect(result.current.status).toBe('error')
  expect(result.current.loading).toBe(false)
})
it('H79-Verify getNotebook emits socket event and sets loading', () => {
  const { result } = renderHook(() => useNotebook())
  act(() => result.current.getNotebook('nb1'))
  expect(mockSocket.emit).toHaveBeenCalledWith('notebook:get', {
    notebookId: 'nb1',
  })
  expect(result.current.loading).toBe(true)
  expect(result.current.status).toBe('running')
})
it('H80-Verify notebook:loaded success sets notebook', () => {
  const { result } = renderHook(() => useNotebook())
  const handler = getHandler('notebook:loaded')
  act(() => handler({ status: 'success', notebook: mockNotebook }))
  expect(result.current.notebook).toEqual(mockNotebook)
  expect(result.current.loading).toBe(false)
  expect(result.current.error).toBeNull()
})
it('H81-Verify notebook:loaded error sets error', () => {
  const { result } = renderHook(() => useNotebook())
  const handler = getHandler('notebook:loaded')
  act(() => handler({ status: 'error', error: 'Not found' }))
  expect(result.current.error).toBe('Not found')
  expect(result.current.status).toBe('error')
})
it('H82-Verify updateNotebook emits socket event', () => {
  const { result } = renderHook(() => useNotebook())
  act(() => result.current.updateNotebook(mockNotebook))
  expect(mockSocket.emit).toHaveBeenCalledWith('notebook:update', {
    notebook: mockNotebook,
  })
  expect(result.current.loading).toBe(true)
})
it('H83-Verify notebook:updated success updates notebook and list', () => {
  const { result } = renderHook(() => useNotebook())
  const allHandler = getHandler('notebook:allLoaded')
  act(() =>
    allHandler({ status: 'success', notebooks: [mockNotebook, mockNotebook2] })
  )
  const updatedNb = { ...mockNotebook, name: 'Updated' }
  const updateHandler = getHandler('notebook:updated')
  act(() => updateHandler({ status: 'success', notebook: updatedNb }))
  expect(result.current.notebook).toEqual(updatedNb)
  expect(
    result.current.notebooks.find((n: Notebook) => n.notebookid === 'nb1')?.name
  ).toBe('Updated')
  expect(result.current.notebooks).toContainEqual(mockNotebook2)
})
it('H84-Verify notebook:updated error sets error', () => {
  const { result } = renderHook(() => useNotebook())
  const handler = getHandler('notebook:updated')
  act(() => handler({ status: 'error', error: 'Update failed' }))
  expect(result.current.error).toBe('Update failed')
  expect(result.current.status).toBe('error')
})
it('H85-Verify deleteNotebook emits socket event and optimistically removes from list', () => {
  const { result } = renderHook(() => useNotebook())
  const allHandler = getHandler('notebook:allLoaded')
  act(() =>
    allHandler({ status: 'success', notebooks: [mockNotebook, mockNotebook2] })
  )
  act(() => result.current.deleteNotebook('nb1'))
  expect(mockSocket.emit).toHaveBeenCalledWith('notebook:delete', {
    notebookId: 'nb1',
  })
  expect(result.current.notebooks).not.toContainEqual(mockNotebook)
  expect(result.current.notebooks).toContainEqual(mockNotebook2)
})
it('H86-Verify notebook:deleted success clears current notebook', () => {
  const { result } = renderHook(() => useNotebook())
  const loadHandler = getHandler('notebook:loaded')
  act(() => loadHandler({ status: 'success', notebook: mockNotebook }))
  const deleteHandler = getHandler('notebook:deleted')
  act(() => deleteHandler({ status: 'success' }))
  expect(result.current.notebook).toBeNull()
  expect(result.current.loading).toBe(false)
  expect(result.current.error).toBeNull()
})
it('H87-Verify notebook:deleted error sets error', () => {
  const { result } = renderHook(() => useNotebook())
  const handler = getHandler('notebook:deleted')
  act(() => handler({ status: 'error', error: 'Delete failed' }))
  expect(result.current.error).toBe('Delete failed')
})
it('H88-Verify listAllNotebooks emits socket event and sets loading', () => {
  const { result } = renderHook(() => useNotebook())
  act(() => result.current.listAllNotebooks())
  expect(mockSocket.emit).toHaveBeenCalledWith('notebook:listAll')
  expect(result.current.loading).toBe(true)
})
it('H89-Verify notebook:allLoaded success sets notebooks and nbLoaded', () => {
  const { result } = renderHook(() => useNotebook())
  const handler = getHandler('notebook:allLoaded')
  act(() =>
    handler({ status: 'success', notebooks: [mockNotebook, mockNotebook2] })
  )
  expect(result.current.notebooks).toHaveLength(2)
  expect(result.current.nbLoaded).toBe(true)
  expect(result.current.loading).toBe(false)
})
it('H90-Verify notebook:allLoaded error does not set nbLoaded', () => {
  const { result } = renderHook(() => useNotebook())
  const handler = getHandler('notebook:allLoaded')
  act(() => handler({ status: 'error', error: 'List failed' }))
  expect(result.current.nbLoaded).toBe(false)
  expect(result.current.error).toBe('List failed')
})
it('H91-Verify listNotebooksByFolder emits socket event with folderId', () => {
  const { result } = renderHook(() => useNotebook())
  act(() => result.current.listNotebooksByFolder('folder1'))
  expect(mockSocket.emit).toHaveBeenCalledWith('notebook:listByFolder', {
    folderId: 'folder1',
  })
})
it('H92-Verify notebook:folderLoaded success sets notebooks', () => {
  const { result } = renderHook(() => useNotebook())
  const handler = getHandler('notebook:folderLoaded')
  act(() => handler({ status: 'success', notebooks: [mockNotebook] }))
  expect(result.current.notebooks).toEqual([mockNotebook])
  expect(result.current.loading).toBe(false)
})
it('H93-Verify notebook:folderLoaded error sets error but not nbLoaded', () => {
  const { result } = renderHook(() => useNotebook())
  const handler = getHandler('notebook:folderLoaded')
  act(() => handler({ status: 'error', error: 'Folder load failed' }))
  expect(result.current.error).toBe('Folder load failed')
  expect(result.current.nbLoaded).toBe(false)
})
it('H94-Verify reorderNotebooks does nothing when activeId equals overId', () => {
  const { result } = renderHook(() => useNotebook())
  const allHandler = getHandler('notebook:allLoaded')
  act(() =>
    allHandler({ status: 'success', notebooks: [mockNotebook, mockNotebook2] })
  )
  const before = result.current.notebooks
  act(() => result.current.reorderNotebooks('nb1', 'nb1', 'f1'))
  expect(result.current.notebooks).toBe(before)
})
it('H95-Verify reorderNotebooks moves notebook within folder', () => {
  const { result } = renderHook(() => useNotebook())
  const allHandler = getHandler('notebook:allLoaded')
  act(() =>
    allHandler({ status: 'success', notebooks: [mockNotebook, mockNotebook2] })
  )
  act(() => result.current.reorderNotebooks('nb1', 'nb2', 'f1'))
  expect(result.current.notebooks[0].notebookid).toBe('nb2')
  expect(result.current.notebooks[1].notebookid).toBe('nb1')
})
it('H96-Verify reorderNotebooks does nothing if activeId not found in siblings', () => {
  const { result } = renderHook(() => useNotebook())
  const allHandler = getHandler('notebook:allLoaded')
  act(() =>
    allHandler({ status: 'success', notebooks: [mockNotebook, mockNotebook2] })
  )
  const before = result.current.notebooks
  act(() => result.current.reorderNotebooks('nonexistent', 'nb2', 'f1'))
  expect(result.current.notebooks).toEqual(before)
})
it('H97-Verify reorderNotebooks only reorders siblings in same folder', () => {
  const nbOtherFolder = { notebookid: 'nb3', name: 'Other', folderid: 'f2' }
  const { result } = renderHook(() => useNotebook())
  const allHandler = getHandler('notebook:allLoaded')
  act(() =>
    allHandler({
      status: 'success',
      notebooks: [mockNotebook, mockNotebook2, nbOtherFolder],
    })
  )
  act(() => result.current.reorderNotebooks('nb1', 'nb2', 'f1'))
  expect(result.current.notebooks).toContainEqual(nbOtherFolder)
  expect(result.current.notebooks).toHaveLength(3)
})
it('H98-Verify reorderNotebooks does nothing if overId not found in siblings', () => {
  const { result } = renderHook(() => useNotebook())
  const allHandler = getHandler('notebook:allLoaded')
  act(() =>
    allHandler({ status: 'success', notebooks: [mockNotebook, mockNotebook2] })
  )
  const before = result.current.notebooks
  act(() => result.current.reorderNotebooks('nb1', 'nonexistent', 'f1'))
  expect(result.current.notebooks).toEqual(before)
})
