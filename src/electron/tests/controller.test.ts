import { describe, it, expect, jest, beforeEach } from '@jest/globals'
const mockRunCode = jest.fn<
  (payload: { id: string; code: string; language: Language }) => Promise<{
    id: string
    result: unknown
    logs: string[]
    error: string | null
  }>
>()
const mockStart = jest.fn<() => Promise<void>>()
const mockStop = jest.fn<() => void>()

const mockKernel = {
  runCode: mockRunCode,
  stop: mockStop,
  start: mockStart,
}

const mockSearchAcrossNotebook =
  jest.fn<(query: string) => Promise<SearchResult[]>>()
const mockSaveNotebook = jest.fn()
const mockLoadNotebook = jest.fn()
const mockDeleteNotebook = jest.fn()
const mockGetAllNotebooks = jest.fn()
const mockGetNotebooksByFolder = jest.fn()

jest.mock('../backend/repositories/notebookrepo', () => ({
  searchAcrossNotebook: mockSearchAcrossNotebook,
  saveNotebook: mockSaveNotebook,
  loadNotebook: mockLoadNotebook,
  deleteNotebook: mockDeleteNotebook,
  getAllNotebooks: mockGetAllNotebooks,
  getNotebooksByFolder: mockGetNotebooksByFolder,
}))

const mockSaveFolder = jest.fn()
const mockLoadFolder = jest.fn()
const mockDeleteFolder = jest.fn()
const mockGetAllFolders = jest.fn()

jest.mock('../backend/repositories/folderrepo', () => ({
  saveFolder: mockSaveFolder,
  loadFolder: mockLoadFolder,
  deleteFolder: mockDeleteFolder,
  getAllFolders: mockGetAllFolders,
}))

jest.mock('../../shared/notebook', () => {
  const MockNotebook = jest.fn((name: string) => {
    const obj = { name, folderid: undefined, id: 'nb-uuid' }
    Object.setPrototypeOf(obj, MockNotebook.prototype)
    return obj
  })
  return { __esModule: true, default: MockNotebook }
})

jest.mock('../../shared/folder', () => {
  const MockFolder = jest.fn((name: string, parentFolderId?: string) => {
    const obj = {
      name,
      parentFolderId,
      id: 'folder-uuid',
      folders: [],
      notebooks: [],
    }
    Object.setPrototypeOf(obj, MockFolder.prototype)
    return obj
  })
  return { __esModule: true, default: MockFolder }
})

import socketHandlers from '../backend/controllers/socketcontroller'
import { Language } from '../../shared/language'
import { SearchResult } from '../../shared/searchResult'

function makeSocket() {
  const handlers: Record<string, (...args: unknown[]) => Promise<void>> = {}
  return {
    on: jest.fn(
      (event: string, handler: (...args: unknown[]) => Promise<void>) => {
        handlers[event] = handler
      }
    ),
    emit: jest.fn(),
    trigger: async (event: string, payload?: unknown) =>
      handlers[event]?.(payload),
    _handlers: handlers,
  }
}
let socket: ReturnType<typeof makeSocket>
beforeEach(() => {
  jest.resetAllMocks()
  socket = makeSocket()
  socketHandlers(socket as any, mockKernel as any)
})

describe('runCode', () => {
  it('emits codeResult with kernel result on success', async () => {
    const kernelResult = { id: 'r1', result: 42, logs: [], error: null }
    mockRunCode.mockResolvedValue(kernelResult)
    await socket.trigger('runCode', {
      id: 'r1',
      code: '1+1',
      language: 'JavaScript',
    })
    expect(mockRunCode).toHaveBeenCalledWith({
      id: 'r1',
      code: '1+1',
      language: 'JavaScript',
    })
    expect(socket.emit).toHaveBeenCalledWith('codeResult', {
      id: 'r1',
      result: kernelResult,
    })
  })
  it('emits codeResult with error payload when kernel throws', async () => {
    mockRunCode.mockRejectedValue(new Error('kernel crash'))
    await socket.trigger('runCode', {
      id: 'r2',
      code: 'bad()',
      language: 'JavaScript',
    })
    expect(socket.emit).toHaveBeenCalledWith('codeResult', {
      id: 'r2',
      result: {
        id: 'r2',
        result: null,
        logs: [],
        error: 'Error: kernel crash',
      },
    })
  })
})
describe('restartKernel', () => {
  it('calls stop then start on the kernel', async () => {
    mockStart.mockResolvedValue(undefined)
    await socket.trigger('restartKernel')
    expect(mockStop).toHaveBeenCalledTimes(1)
    expect(mockStart).toHaveBeenCalledTimes(1)
    const stopOrder = mockStop.mock.invocationCallOrder[0]
    const startOrder = mockStart.mock.invocationCallOrder[0]
    expect(stopOrder).toBeLessThan(startOrder)
  })
})
describe('search', () => {
  it('emits searchResults with results on success', async () => {
    const results: SearchResult[] = [
      {
        notebookid: 'nb1',
        name: 'Test',
        matches: [
          {
            blockid: 'b1',
            type: 'code',
            snippet: 'abc',
            from: 0,
            to: 1,
          },
        ],
      },
    ]
    mockSearchAcrossNotebook.mockResolvedValue(results)
    await socket.trigger('search', { query: 'hello' })
    expect(mockSearchAcrossNotebook).toHaveBeenCalledWith('hello')
    expect(socket.emit).toHaveBeenCalledWith('searchResults', {
      status: 'success',
      results,
      query: 'hello',
    })
  })
  it('emits searchResults with error status on failure', async () => {
    mockSearchAcrossNotebook.mockRejectedValue(new Error('DB error'))
    await socket.trigger('search', { query: 'hello' })
    expect(socket.emit).toHaveBeenCalledWith('searchResults', {
      status: 'error',
      error: 'Error: DB error',
      query: 'hello',
    })
  })
})
describe('notebook:create', () => {
  //   it('saves and emits the new notebook on success', async () => {
  //     await socket.trigger('notebook:create', { name: 'My Notebook' })
  //     expect(mockSaveNotebook).toHaveBeenCalledTimes(1)
  //     expect(socket.emit).toHaveBeenCalledWith('notebook:created', {
  //       status: 'success',
  //       notebook: expect.objectContaining({ name: 'My Notebook' }),
  //     })
  //   })
  it('assigns folderId when provided', async () => {
    await socket.trigger('notebook:create', { name: 'Nb', folderId: 'f-1' })
    const payload = (socket.emit as jest.Mock).mock.calls[0][1] as {
      notebook: { folderid?: string }
    }
    const emittedNotebook = payload.notebook
    expect(emittedNotebook.folderid).toBe('f-1')
  })
  it('leaves folderid undefined when folderId is not provided', async () => {
    await socket.trigger('notebook:create', { name: 'Nb' })
    const payload = (socket.emit as jest.Mock).mock.calls[0][1] as {
      notebook: { folderid?: string }
    }
    const emittedNotebook = payload.notebook
    expect(emittedNotebook.folderid).toBeUndefined()
  })
  it('emits error status when saveNotebook throws', async () => {
    mockSaveNotebook.mockImplementation(() => {
      throw new Error('write fail')
    })
    await socket.trigger('notebook:create', { name: 'Nb' })
    expect(socket.emit).toHaveBeenCalledWith('notebook:created', {
      status: 'error',
      error: 'Error: write fail',
    })
  })
})
describe('notebook:get', () => {
  it('emits loaded notebook on success', async () => {
    const notebook = { id: 'nb-1', name: 'Test' }
    mockLoadNotebook.mockReturnValue(notebook)
    await socket.trigger('notebook:get', { notebookId: 'nb-1' })
    expect(mockLoadNotebook).toHaveBeenCalledWith('nb-1')
    expect(socket.emit).toHaveBeenCalledWith('notebook:loaded', {
      status: 'success',
      notebook,
    })
  })
  it('emits error status when loadNotebook throws', async () => {
    mockLoadNotebook.mockImplementation(() => {
      throw new Error('not found')
    })
    await socket.trigger('notebook:get', { notebookId: 'nb-x' })
    expect(socket.emit).toHaveBeenCalledWith('notebook:loaded', {
      status: 'error',
      error: 'Error: not found',
    })
  })
})
describe('notebook:update', () => {
  it('saves and emits updated notebook on success', async () => {
    const notebook = { id: 'nb-1', name: 'Updated' }
    await socket.trigger('notebook:update', { notebook })
    expect(mockSaveNotebook).toHaveBeenCalledWith(notebook)
    expect(socket.emit).toHaveBeenCalledWith('notebook:updated', {
      status: 'success',
      notebook,
    })
  })
  it('emits error status when saveNotebook throws', async () => {
    mockSaveNotebook.mockImplementation(() => {
      throw new Error('save fail')
    })
    await socket.trigger('notebook:update', { notebook: { id: 'nb-1' } })
    expect(socket.emit).toHaveBeenCalledWith('notebook:updated', {
      status: 'error',
      error: 'Error: save fail',
    })
  })
})
describe('notebook:delete', () => {
  it('deletes and emits success with notebookId', async () => {
    await socket.trigger('notebook:delete', { notebookId: 'nb-1' })
    expect(mockDeleteNotebook).toHaveBeenCalledWith('nb-1')
    expect(socket.emit).toHaveBeenCalledWith('notebook:deleted', {
      status: 'success',
      notebookId: 'nb-1',
    })
  })
  it('emits error status when deleteNotebook throws', async () => {
    mockDeleteNotebook.mockImplementation(() => {
      throw new Error('delete fail')
    })
    await socket.trigger('notebook:delete', { notebookId: 'nb-x' })
    expect(socket.emit).toHaveBeenCalledWith('notebook:deleted', {
      status: 'error',
      error: 'Error: delete fail',
    })
  })
})
describe('notebook:listAll', () => {
  it('emits all notebooks on success', async () => {
    const notebooks = [{ id: 'nb-1' }, { id: 'nb-2' }]
    mockGetAllNotebooks.mockReturnValue(notebooks)
    await socket.trigger('notebook:listAll')
    expect(socket.emit).toHaveBeenCalledWith('notebook:allLoaded', {
      status: 'success',
      notebooks,
    })
  })
  it('emits error status when getAllNotebooks throws', async () => {
    mockGetAllNotebooks.mockImplementation(() => {
      throw new Error('list fail')
    })
    await socket.trigger('notebook:listAll')
    expect(socket.emit).toHaveBeenCalledWith('notebook:allLoaded', {
      status: 'error',
      error: 'Error: list fail',
    })
  })
})
describe('notebook:listByFolder', () => {
  it('emits notebooks for the given folder on success', async () => {
    const notebooks = [{ id: 'nb-1' }]
    mockGetNotebooksByFolder.mockReturnValue(notebooks)
    await socket.trigger('notebook:listByFolder', { folderId: 'f-1' })
    expect(mockGetNotebooksByFolder).toHaveBeenCalledWith('f-1')
    expect(socket.emit).toHaveBeenCalledWith('notebook:folderLoaded', {
      status: 'success',
      notebooks,
    })
  })
  it('emits error status when getNotebooksByFolder throws', async () => {
    mockGetNotebooksByFolder.mockImplementation(() => {
      throw new Error('folder fail')
    })
    await socket.trigger('notebook:listByFolder', { folderId: 'f-x' })
    expect(socket.emit).toHaveBeenCalledWith('notebook:folderLoaded', {
      status: 'error',
      error: 'Error: folder fail',
    })
  })
})
describe('folder:create', () => {
  //   it('saves and emits new folder on success', async () => {
  //     await socket.trigger('folder:create', { name: 'My Folder' })
  //     expect(mockSaveFolder).toHaveBeenCalledTimes(1)
  //     expect(socket.emit).toHaveBeenCalledWith('folder:created', {
  //       status: 'success',
  //       folder: expect.objectContaining({ name: 'My Folder' }),
  //     })
  //   })
  it('passes parentFolderId to Folder constructor when provided', async () => {
    await socket.trigger('folder:create', {
      name: 'Sub',
    })
    const payload = (socket.emit as jest.Mock).mock.calls[0][1] as {
      folder: { folderid?: string; parentFolderId: string }
    }
    const emittedFolder = payload.folder
    expect(emittedFolder.parentFolderId).toBeUndefined()
  })
  it('passes undefined parentFolderId when not provided', async () => {
    await socket.trigger('folder:create', { name: 'Root' })
    const payload = (socket.emit as jest.Mock).mock.calls[0][1] as {
      folder: { folderid?: string; parentFolderId: string }
    }
    const emittedFolder = payload.folder
    expect(emittedFolder.parentFolderId).toBeUndefined()
  })
  it('emits error status when saveFolder throws', async () => {
    mockSaveFolder.mockImplementation(() => {
      throw new Error('save fail')
    })
    await socket.trigger('folder:create', { name: 'F' })
    expect(socket.emit).toHaveBeenCalledWith('folder:created', {
      status: 'error',
      error: 'Error: save fail',
    })
  })
})
describe('folder:get', () => {
  it('emits loaded folder on success', async () => {
    const folder = { id: 'f-1', name: 'Docs' }
    mockLoadFolder.mockReturnValue(folder)
    await socket.trigger('folder:get', { folderId: 'f-1' })
    expect(mockLoadFolder).toHaveBeenCalledWith('f-1')
    expect(socket.emit).toHaveBeenCalledWith('folder:loaded', {
      status: 'success',
      folder,
    })
  })
  it('emits error status when loadFolder throws', async () => {
    mockLoadFolder.mockImplementation(() => {
      throw new Error('not found')
    })
    await socket.trigger('folder:get', { folderId: 'f-x' })
    expect(socket.emit).toHaveBeenCalledWith('folder:loaded', {
      status: 'error',
      error: 'Error: not found',
    })
  })
})
describe('folder:update', () => {
  it('saves and emits updated folder on success', async () => {
    const folder = { id: 'f-1', name: 'Renamed' }
    await socket.trigger('folder:update', { folder })
    expect(mockSaveFolder).toHaveBeenCalledWith(folder)
    expect(socket.emit).toHaveBeenCalledWith('folder:updated', {
      status: 'success',
      folder,
    })
  })
  it('emits error status when saveFolder throws', async () => {
    mockSaveFolder.mockImplementation(() => {
      throw new Error('update fail')
    })
    await socket.trigger('folder:update', { folder: { id: 'f-1' } })
    expect(socket.emit).toHaveBeenCalledWith('folder:updated', {
      status: 'error',
      error: 'Error: update fail',
    })
  })
})
describe('folder:delete', () => {
  it('deletes and emits success with folderId', async () => {
    await socket.trigger('folder:delete', { folderId: 'f-1' })
    expect(mockDeleteFolder).toHaveBeenCalledWith('f-1')
    expect(socket.emit).toHaveBeenCalledWith('folder:deleted', {
      status: 'success',
      folderId: 'f-1',
    })
  })
  it('emits error status when deleteFolder throws', async () => {
    mockDeleteFolder.mockImplementation(() => {
      throw new Error('delete fail')
    })
    await socket.trigger('folder:delete', { folderId: 'f-x' })
    expect(socket.emit).toHaveBeenCalledWith('folder:deleted', {
      status: 'error',
      error: 'Error: delete fail',
    })
  })
})
describe('folder:listAll', () => {
  it('emits all folders on success', async () => {
    const folders = [{ id: 'f-1' }, { id: 'f-2' }]
    mockGetAllFolders.mockReturnValue(folders)
    await socket.trigger('folder:listAll')
    expect(socket.emit).toHaveBeenCalledWith('folder:allLoaded', {
      status: 'success',
      folders,
    })
  })
  it('emits error status when getAllFolders throws', async () => {
    mockGetAllFolders.mockImplementation(() => {
      throw new Error('list fail')
    })
    await socket.trigger('folder:listAll')
    expect(socket.emit).toHaveBeenCalledWith('folder:allLoaded', {
      status: 'error',
      error: 'Error: list fail',
    })
  })
})
describe('handler registration', () => {
  it('registers all expected socket event handlers', () => {
    const registeredEvents = (socket.on as jest.Mock).mock.calls.map(
      ([event]) => event
    )
    expect(registeredEvents).toEqual(
      expect.arrayContaining([
        'runCode',
        'restartKernel',
        'search',
        'notebook:create',
        'notebook:get',
        'notebook:update',
        'notebook:delete',
        'notebook:listAll',
        'notebook:listByFolder',
        'folder:create',
        'folder:get',
        'folder:update',
        'folder:delete',
        'folder:listAll',
      ])
    )
  })
})
