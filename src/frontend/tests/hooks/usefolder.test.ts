import { renderHook, act } from '@testing-library/react'
import { useFolders } from '../../hooks/usefolder'
import { socket } from '../../utils/socket'

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

const mockFolder = {
  folderid: 'f1',
  name: 'Folder 1',
  parentFolderId: undefined,
  folders: [],
  notebooks: [],
}
const mockFolder2 = {
  folderid: 'f2',
  name: 'Folder 2',
  parentFolderId: undefined,
}
const mockFolder3 = {
  folderid: 'f3',
  name: 'Child Folder',
  parentFolderId: 'f1',
}

beforeEach(() => jest.clearAllMocks())
it('H99-Verify useFolders initial state is correct', () => {
  const { result } = renderHook(() => useFolders())
  expect(result.current.folders).toEqual([])
  expect(result.current.fLoaded).toBe(false)
  expect(result.current.error).toBeNull()
  expect(result.current.status).toBe('idle')
})
it('H100-Verify useFolders registers socket listeners on mount', () => {
  renderHook(() => useFolders())
  const events = mockSocket.on.mock.calls.map(([e]) => e)
  expect(events).toContain('connect')
  expect(events).toContain('folder:created')
  expect(events).toContain('folder:updated')
  expect(events).toContain('folder:deleted')
  expect(events).toContain('folder:allLoaded')
})
it('H101-Verify useFolders deregisters socket listeners on unmount', () => {
  const { unmount } = renderHook(() => useFolders())
  unmount()
  const events = mockSocket.off.mock.calls.map(([e]) => e)
  expect(events).toContain('folder:created')
  expect(events).toContain('folder:deleted')
  expect(events).toContain('folder:allLoaded')
})
it('H102-Verify addFolder emits socket event and sets status to running', () => {
  const { result } = renderHook(() => useFolders())
  act(() => result.current.addFolder('New Folder'))
  expect(mockSocket.emit).toHaveBeenCalledWith('folder:create', {
    name: 'New Folder',
  })
  expect(result.current.status).toBe('running')
})
it('H103-Verify folder:created success appends folder to list', () => {
  const { result } = renderHook(() => useFolders())
  const handler = getHandler('folder:created')
  act(() => handler({ status: 'success', folder: mockFolder }))
  expect(result.current.folders).toContainEqual(mockFolder)
  expect(result.current.error).toBeNull()
  expect(result.current.status).toBe('success')
})
it('H104-Verify folder:created success appends without replacing existing folders', () => {
  const { result } = renderHook(() => useFolders())
  const handler = getHandler('folder:created')
  act(() => handler({ status: 'success', folder: mockFolder }))
  act(() => handler({ status: 'success', folder: mockFolder2 }))
  expect(result.current.folders).toHaveLength(2)
  expect(result.current.folders).toContainEqual(mockFolder)
  expect(result.current.folders).toContainEqual(mockFolder2)
})
it('H105-Verify folder:created error sets error state', () => {
  const { result } = renderHook(() => useFolders())
  const handler = getHandler('folder:created')
  act(() => handler({ status: 'error', error: 'Create failed' }))
  expect(result.current.error).toBe('Create failed')
  expect(result.current.status).toBe('error')
  expect(result.current.folders).toEqual([])
})
it('H106-Verify listAllFolder emits socket event and sets status to running', () => {
  const { result } = renderHook(() => useFolders())
  act(() => result.current.listAllFolder())
  expect(mockSocket.emit).toHaveBeenCalledWith('folder:listAll')
  expect(result.current.status).toBe('running')
})
it('H107-Verify folder:allLoaded success sets folders and fLoaded', () => {
  const { result } = renderHook(() => useFolders())
  const handler = getHandler('folder:allLoaded')
  act(() => handler({ status: 'success', folders: [mockFolder, mockFolder2] }))
  expect(result.current.folders).toHaveLength(2)
  expect(result.current.fLoaded).toBe(true)
  expect(result.current.error).toBeNull()
  expect(result.current.status).toBe('success')
})
it('H108-Verify folder:allLoaded error does not set fLoaded', () => {
  const { result } = renderHook(() => useFolders())
  const handler = getHandler('folder:allLoaded')
  act(() => handler({ status: 'error', error: 'Load failed' }))
  expect(result.current.fLoaded).toBe(false)
  expect(result.current.error).toBe('Load failed')
  expect(result.current.status).toBe('error')
})
it('H109-Verify updateFolder emits socket event and sets status to running', () => {
  const { result } = renderHook(() => useFolders())
  act(() => result.current.updateFolder(mockFolder))
  expect(mockSocket.emit).toHaveBeenCalledWith('folder:update', {
    folder: mockFolder,
  })
  expect(result.current.status).toBe('running')
})
it('H110-Verify folder:updated success updates folder in list', () => {
  const { result } = renderHook(() => useFolders())
  const allHandler = getHandler('folder:allLoaded')
  act(() =>
    allHandler({ status: 'success', folders: [mockFolder, mockFolder2] })
  )
  const updatedFolder = { ...mockFolder, name: 'Updated Folder' }
  const updateHandler = getHandler('folder:updated')
  act(() => updateHandler({ status: 'success', folder: updatedFolder }))
  expect(result.current.folders.find((f) => f.folderid === 'f1')?.name).toBe(
    'Updated Folder'
  )
  expect(result.current.folders).toContainEqual(mockFolder2)
  expect(result.current.error).toBeNull()
  expect(result.current.status).toBe('success')
})
it('H111-Verify folder:updated error sets error state', () => {
  const { result } = renderHook(() => useFolders())
  const handler = getHandler('folder:updated')
  act(() => handler({ status: 'error', error: 'Update failed' }))
  expect(result.current.error).toBe('Update failed')
  expect(result.current.status).toBe('error')
})
it('H112-Verify removeFolder emits socket event and optimistically removes folder', () => {
  const { result } = renderHook(() => useFolders())
  const allHandler = getHandler('folder:allLoaded')
  act(() =>
    allHandler({ status: 'success', folders: [mockFolder, mockFolder2] })
  )
  act(() => result.current.removeFolder('f1'))
  expect(mockSocket.emit).toHaveBeenCalledWith('folder:delete', {
    folderId: 'f1',
  })
  expect(result.current.folders).not.toContainEqual(mockFolder)
  expect(result.current.folders).toContainEqual(mockFolder2)
  expect(result.current.status).toBe('running')
})
it('H113-Verify folder:deleted success sets status to success', () => {
  const { result } = renderHook(() => useFolders())
  const handler = getHandler('folder:deleted')
  act(() => handler({ status: 'success' }))
  expect(result.current.error).toBeNull()
  expect(result.current.status).toBe('success')
})
it('H114-Verify folder:deleted error sets error state', () => {
  const { result } = renderHook(() => useFolders())
  const handler = getHandler('folder:deleted')
  act(() => handler({ status: 'error', error: 'Delete failed' }))
  expect(result.current.error).toBe('Delete failed')
  expect(result.current.status).toBe('error')
})
it('H115-Verify reorderFolders does nothing when activeId equals overId', () => {
  const { result } = renderHook(() => useFolders())
  const allHandler = getHandler('folder:allLoaded')
  act(() =>
    allHandler({ status: 'success', folders: [mockFolder, mockFolder2] })
  )
  const before = result.current.folders
  act(() => result.current.reorderFolders('f1', 'f1'))
  expect(result.current.folders).toBe(before)
})
it('H116-Verify reorderFolders moves folder within siblings', () => {
  const { result } = renderHook(() => useFolders())
  const allHandler = getHandler('folder:allLoaded')
  act(() =>
    allHandler({ status: 'success', folders: [mockFolder, mockFolder2] })
  )
  act(() => result.current.reorderFolders('f1', 'f2'))
  expect(result.current.folders[0].folderid).toBe('f2')
  expect(result.current.folders[1].folderid).toBe('f1')
})
it('H117-Verify reorderFolders does nothing if activeId not found', () => {
  const { result } = renderHook(() => useFolders())
  const allHandler = getHandler('folder:allLoaded')
  act(() =>
    allHandler({ status: 'success', folders: [mockFolder, mockFolder2] })
  )
  const before = result.current.folders
  act(() => result.current.reorderFolders('nonexistent', 'f2'))
  expect(result.current.folders).toEqual(before)
})
it('H118-Verify reorderFolders does nothing if overId not found in siblings', () => {
  const { result } = renderHook(() => useFolders())
  const allHandler = getHandler('folder:allLoaded')
  act(() =>
    allHandler({ status: 'success', folders: [mockFolder, mockFolder2] })
  )
  const before = result.current.folders
  act(() => result.current.reorderFolders('f1', 'nonexistent'))
  expect(result.current.folders).toEqual(before)
})
it('H119-Verify reorderFolders only reorders within same parent', () => {
  const { result } = renderHook(() => useFolders())
  const allHandler = getHandler('folder:allLoaded')
  act(() =>
    allHandler({
      status: 'success',
      folders: [mockFolder, mockFolder2, mockFolder3],
    })
  )
  act(() => result.current.reorderFolders('f1', 'f2'))
  // child folder under f1 should remain untouched
  expect(result.current.folders).toContainEqual(mockFolder3)
  expect(result.current.folders).toHaveLength(3)
})
it('H120-Verify reparentFolder updates parentFolderId of target folder', () => {
  const { result } = renderHook(() => useFolders())
  const allHandler = getHandler('folder:allLoaded')
  act(() =>
    allHandler({ status: 'success', folders: [mockFolder, mockFolder2] })
  )
  act(() => result.current.reparentFolder('f1', 'f2'))
  expect(
    result.current.folders.find((f) => f.folderid === 'f1')?.parentFolderId
  ).toBe('f2')
  // f2 should be untouched
  expect(
    result.current.folders.find((f) => f.folderid === 'f2')?.parentFolderId
  ).toBeUndefined()
})

it('H121-Verify reparentFolder sets parentFolderId to null when newParentId is null', () => {
  const { result } = renderHook(() => useFolders())
  const allHandler = getHandler('folder:allLoaded')
  act(() => allHandler({ status: 'success', folders: [mockFolder3] }))
  act(() => result.current.reparentFolder('f3', null))
  expect(
    result.current.folders.find((f) => f.folderid === 'f3')?.parentFolderId
  ).toBeUndefined()
})

it('H122-Verify reparentFolder does not modify other folders', () => {
  const { result } = renderHook(() => useFolders())
  const allHandler = getHandler('folder:allLoaded')
  act(() =>
    allHandler({
      status: 'success',
      folders: [mockFolder, mockFolder2, mockFolder3],
    })
  )
  act(() => result.current.reparentFolder('f1', 'f2'))
  expect(result.current.folders).toHaveLength(3)
  expect(result.current.folders.find((f) => f.folderid === 'f2')).toEqual(
    mockFolder2
  )
  expect(result.current.folders.find((f) => f.folderid === 'f3')).toEqual(
    mockFolder3
  )
})
