'use client'
import {
  DndContext,
  closestCenter,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState, type Dispatch, type SetStateAction } from 'react'
import OptionBar from './optionbar'
import SideBarElement from './sidebarelement'
import SortableSidebarElement from './sortablesidebarelement'
import Folder from '../../shared/folder'
import Notebook from '../../shared/notebook'
import TrashDropZone from './trashbar'
import { useSearch } from '../hooks/useSearch'

interface SidebarProps {
  folders: Folder[]
  notebooks: Notebook[]
  setFolders: Dispatch<SetStateAction<Folder[]>>
  addFolder: (index: number, name: string) => void
  removeFolder: (id: string) => void
  reorderFolders: (activeId: string, overId: string) => void
  onNotebookSelect?: (notebook: Notebook) => void
  addNotebook: (name: string, folderId?: string) => void
}

const Sidebar = ({
  folders,
  notebooks,
  setFolders,
  addFolder,
  removeFolder,
  reorderFolders,
  onNotebookSelect,
  addNotebook,
}: SidebarProps) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const { results, search } = useSearch()

  const isFolderOpened = folders.length > 0

  const toggleFolderExpanded = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const getNotebooksForFolder = (folderId: string) => {
    return notebooks.filter((nb) => nb.folderid === folderId)
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    if (over.id === 'drop-zone') {
      removeFolder(active.id as string)
      setActiveId(null)
      return
    }
    if (active.id === over!.id) return
    reorderFolders(active.id as string, over!.id as string)
    setActiveId(null)
  }

  function onDragCancel() {
    setActiveId(null)
  }

  const activeFolder = folders.find((f) => f.folderid === activeId)

  return (
    <div className='bg-blue flex h-screen w-1/4 flex-col overflow-hidden px-2 py-2'>
      <OptionBar
        onAddFolder={() => addFolder(0, 'untitled')}
        onAddNotebook={() => addNotebook('untitled')}
        onToggleSearch={() => setIsSearching((prev) => !prev)}
      ></OptionBar>
      {isSearching && (
        <input
          className='mt-2 text-sm text-white'
          placeholder='Search...'
          value={query}
          onChange={(e) => {
            const q = e.target.value
            setQuery(q)
            search(q)
          }}
        />
      )}
      {!isFolderOpened && (
        <div className='font-poppins pt-2 text-center text-sm text-white'>
          NO FOLDER OPENED
        </div>
      )}
      {isSearching ? (
        <div className='mt-2 flex flex-col gap-2 text-white'>
          {results.map((r) => (
            <div key={r.notebookid}>
              <div className='font-bold'>{r.name}</div>
              {r.matches.map((m) => (
                <div key={m.blockid} className='text-xs opacity-80'>
                  {m.snippet}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        isFolderOpened && (
          <>
            <div className='font-poppins gap-2 pt-2 pb-2 text-left text-sm text-white'>
              FOLDERS
            </div>
            <DndContext
              collisionDetection={closestCenter}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragCancel={onDragCancel}
            >
              <SortableContext
                items={folders.map((f) => f.folderid)}
                strategy={verticalListSortingStrategy}
              >
                <div className='flex flex-col gap-1'>
                  {folders.map((folder) => (
                    <div key={folder.folderid}>
                      <SortableSidebarElement
                        id={folder.folderid}
                        name={folder.name}
                        isExpanded={expandedFolders.has(folder.folderid)}
                        onToggleExpanded={() =>
                          toggleFolderExpanded(folder.folderid)
                        }
                        onRename={(name) =>
                          setFolders((f: Folder[]) =>
                            f.map((item) =>
                              item.folderid === folder.folderid
                                ? { ...item, name }
                                : item
                            )
                          )
                        }
                      />
                      {expandedFolders.has(folder.folderid) && (
                        <div className='mt-1 ml-4 flex flex-col gap-1'>
                          {getNotebooksForFolder(folder.folderid).map(
                            (notebook) => (
                              <button
                                key={notebook.notebookid}
                                onClick={() => onNotebookSelect?.(notebook)}
                                className='bg-dark-blue flex w-full rounded-sm px-2 py-1 text-left text-xs text-white transition-all duration-300 hover:brightness-125'
                              >
                                📓 {notebook.name}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>
              <TrashDropZone></TrashDropZone>
              <DragOverlay>
                {activeFolder ? (
                  <SideBarElement
                    label={activeFolder.name}
                    onClick={() => {}}
                    className='opacity-100'
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </>
        )
      )}
    </div>
  )
}

export default Sidebar
