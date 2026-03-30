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
import FolderElement from './folderelement'
import SortableFolderElement from './sortablefolderelement'
import Folder from '../../shared/folder'
import Notebook from '../../shared/notebook'
import TrashDropZone from './trashbar'
import { useSearch } from '../hooks/useSearch'
import type { SidebarItem } from '../types/sidebaritem'
import { useSidebar } from '../utils/sidebartree'
import NotebookClass from '../../shared/notebook'
import SortableNotebookElement from './sortablenotebookelement'

interface SidebarProps {
  folders: Folder[]
  notebooks: Notebook[]
  setFolders: Dispatch<SetStateAction<Folder[]>>
  addFolder: (index: number, name: string) => void
  removeFolder: (id: string) => void
  reorderFolders: (activeId: string, overId: string) => void
  onNotebookSelect?: (notebookId: string) => void
  onNotebookRename?: (notebook: NotebookClass) => void
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
  onNotebookRename,
}: SidebarProps) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const { results, search } = useSearch()
  const { tree } = useSidebar(folders, notebooks)
  const hasContent = folders.length > 0 || notebooks.length > 0
  const toggleFolderExpanded = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
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
    if (active.id !== over.id) {
      reorderFolders(active.id as string, over.id as string)
    }
    setActiveId(null)
  }

  function onDragCancel() {
    setActiveId(null)
  }
  const activeFolder = folders.find((f) => f.folderid === activeId)
  const renderItem = (item: SidebarItem, depth = 0): React.ReactNode => {
    if (item.type === 'folder') {
      return (
        <div key={item.id}>
          <SortableFolderElement
            id={item.id}
            name={item.name}
            isExpanded={expandedFolders.has(item.id)}
            onToggleExpanded={() => toggleFolderExpanded(item.id)}
            onRename={(name) =>
              setFolders((prev) =>
                prev.map((f) => (f.folderid === item.id ? { ...f, name } : f))
              )
            }
          />
          {expandedFolders.has(item.id) && (
            <div className='ml-4 flex flex-col gap-1'>
              {item.children.map((child) => renderItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div key={item.id}>
        <SortableNotebookElement
          id={item.id}
          name={item.name}
          onClick={() => onNotebookSelect?.(item.data.notebookid)}
          onRename={(label) =>
            onNotebookRename?.({ ...item.data, name: label })
          }
        ></SortableNotebookElement>
      </div>
    )
  }

  return (
    <div className='bg-blue flex h-screen w-1/4 flex-col overflow-hidden px-2 py-2'>
      <OptionBar
        onAddFolder={() => addFolder(0, 'untitled')}
        onAddNotebook={() => addNotebook('untitled', folders[0]?.folderid)}
        onToggleSearch={() => setIsSearching((prev) => !prev)}
      />
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
      {!hasContent && (
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
        hasContent && (
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
                items={tree.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className='flex flex-col gap-1'>
                  {tree.map((item: SidebarItem) => renderItem(item))}
                </div>
              </SortableContext>
              <TrashDropZone />
              <DragOverlay>
                {activeFolder && (
                  <FolderElement
                    label={activeFolder.name}
                    onClick={() => {}}
                    className='opacity-100'
                  />
                )}
              </DragOverlay>
            </DndContext>
          </>
        )
      )}
    </div>
  )
}

export default Sidebar
