import { renderHook, act } from '@testing-library/react'
import { useSidebar } from '../../hooks/usesidebar'
import Folder from '../../../shared/folder'
import Notebook from '../../../shared/notebook'

const mockFolders: Folder[] = [
  {
    folderid: 'f1',
    name: 'Folder 1',
    parentFolderId: undefined,
    folders: [],
    notebooks: [],
  },
  {
    folderid: 'f2',
    name: 'Folder 2',
    parentFolderId: 'f1',
    folders: [],
    notebooks: [],
  },
  {
    folderid: 'f3',
    name: 'Folder 3',
    parentFolderId: undefined,
    folders: [],
    notebooks: [],
  },
]

const mockNotebooks: Notebook[] = [
  { notebookid: 'n1', name: 'Notebook 1', folderid: 'f1', blocks: [] },
  { notebookid: 'n2', name: 'Notebook 2', folderid: undefined, blocks: [] },
]

describe('useSidebar', () => {
  it('H50-Verify activeFolder is undefined initially', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    expect(result.current.activeFolder).toBeUndefined()
  })

  it('H51-Verify activeFolder returns correct folder when set', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    act(() => {
      result.current.setActiveId('f1')
    })
    expect(result.current.activeFolder?.folderid).toBe('f1')
  })

  it('H52-Verify activeNotebook returns correct notebook when set', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    act(() => {
      result.current.setActiveId('n1')
    })
    expect(result.current.activeNotebook?.notebookid).toBe('n1')
  })

  it('H53-Verify tree places root folders at top level', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    const rootIds = result.current.tree.map((i) => i.id)
    expect(rootIds).toContain('f1')
    expect(rootIds).toContain('f3')
  })

  it('H54-Verify tree nests child folder under parent', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    const f1 = result.current.tree.find((i) => i.id === 'f1')
    expect(f1?.type).toBe('folder')
    if (f1?.type === 'folder') {
      expect(f1.children.map((c) => c.id)).toContain('f2')
    }
  })

  it('H55-Verify tree places notebook inside correct folder', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    const f1 = result.current.tree.find((i) => i.id === 'f1')
    if (f1?.type === 'folder') {
      expect(f1.children.map((c) => c.id)).toContain('n1')
    }
  })

  it('H56-Verify tree places notebook at root when no folder', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    const rootIds = result.current.tree.map((i) => i.id)
    expect(rootIds).toContain('n2')
  })

  it('H57-Verify allSortableIds contains all folders and notebooks', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    expect(result.current.allSortableIds).toContain('f1')
    expect(result.current.allSortableIds).toContain('f2')
    expect(result.current.allSortableIds).toContain('n1')
    expect(result.current.allSortableIds).toContain('n2')
  })

  it('H58-Verify isDescendant returns true for direct child', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    expect(result.current.isDescendant('f2', 'f1')).toBe(true)
  })

  it('H59-Verify isDescendant returns false for non-child', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    expect(result.current.isDescendant('f3', 'f1')).toBe(false)
  })

  it('H60-Verify isDescendant returns false when no parentFolderId', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    expect(result.current.isDescendant('f1', 'f3')).toBe(false)
  })

  it('H61-Verify isDescendant handles recursive ancestry', () => {
    const deepFolders: Folder[] = [
      { folderid: 'f1', name: 'F1', parentFolderId: undefined, folders:[], notebooks:[] },
      { folderid: 'f2', name: 'F2', parentFolderId: 'f1', folders:[], notebooks:[] },
      { folderid: 'f3', name: 'F3', parentFolderId: 'f2', folders:[], notebooks:[] },
    ]
    const { result } = renderHook(() => useSidebar(deepFolders, []))
    expect(result.current.isDescendant('f3', 'f1')).toBe(true)
  })

  it('H62-Verify getTargetFolderId handles folder-drop prefix', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    expect(result.current.getTargetFolderId('folder-drop:f1')).toBe('f1')
  })

  it('H63-Verify getTargetFolderId returns folderid for notebook', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    expect(result.current.getTargetFolderId('n1')).toBe('f1')
  })

  it('H64-Verify getTargetFolderId returns undefined for root notebook', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    expect(result.current.getTargetFolderId('n2')).toBeUndefined() // folderid is null
  })

  it('H65-Verify getTargetFolderId returns parentFolderId for folder', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    expect(result.current.getTargetFolderId('f2')).toBe('f1')
  })

  it('H66-Verify getTargetFolderId returns undefined for root folder', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    expect(result.current.getTargetFolderId('f1')).toBeUndefined() // no parentFolderId
  })

  it('H67-Verify getTargetFolderId returns undefined for unknown id', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    expect(result.current.getTargetFolderId('unknown')).toBeUndefined()
  })

  it('H68-Verify query is empty string initially', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    expect(result.current.query).toBe('')
  })

  it('H69-Verify setQuery updates query', () => {
    const { result } = renderHook(() => useSidebar(mockFolders, mockNotebooks))
    act(() => {
      result.current.setQuery('hello')
    })
    expect(result.current.query).toBe('hello')
  })
})
