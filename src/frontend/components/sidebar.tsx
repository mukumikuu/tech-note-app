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
import SortableFolderElement from './sortablefolderelement'
import Folder from '../../shared/folder'
import Notebook from '../../shared/notebook'
import TrashDropZone from './trashbar'
import { useSearch } from '../hooks/useSearch'
import type { SidebarItem } from '../types/sidebaritem'
import { useSidebar } from '../hooks/usesidebar'
import NotebookClass from '../../shared/notebook'
import SortableNotebookElement from './sortablenotebookelement'
import FolderDropZone from './folderdropzone'

interface SidebarProps {
  folders: Folder[]
  notebooks: Notebook[]
  setFolders: Dispatch<SetStateAction<Folder[]>>
  addFolder: (index: number, name: string) => void
  removeFolder: (id: string) => void
  reorderFolders: (activeId: string, overId: string) => void
  reparentFolder: (folderId: string, newParentId: string | null) => void
  onNotebookSelect?: (notebookId: string) => void
  onNotebookUpdate?: (notebook: NotebookClass) => void
  addNotebook: (name: string, folderId?: string) => void
  removeNotebook: (notebookId: string) => void
  reorderNotebooks: (
    activeId: string,
    overId: string,
    currentFolderId: string
  ) => void
}

const Sidebar = ({
  folders,
  notebooks,
  setFolders,
  addFolder,
  removeFolder,
  reorderFolders,
  reparentFolder,
  onNotebookSelect,
  addNotebook,
  onNotebookUpdate,
  reorderNotebooks,
  removeNotebook,
}: SidebarProps) => {
  const [isSearching, setIsSearching] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const { results, search } = useSearch()
  const {
    activeFolder,
    activeNotebook,
    activeId,
    allSortableIds,
    tree,
    query,
    setActiveId,
    setQuery,
    isDescendant,
    getTargetFolderId,
  } = useSidebar(folders, notebooks)
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
    const activeIdStr = active.id as string
    const overIdStr = over.id as string
    const isActiveFolder = folders.some((f) => f.folderid === activeIdStr)
    const isActiveNotebook = notebooks.some((n) => n.notebookid === activeIdStr)
    if (overIdStr === 'drop-zone') {
      if (isActiveFolder) {
        removeFolder(activeIdStr)
      }
      if (isActiveNotebook) {
        removeNotebook(activeIdStr)
      }
      setActiveId(null)
      return
    }
    const targetFolderId = getTargetFolderId(overIdStr)
    if (isActiveFolder) {
      if (
        targetFolderId &&
        targetFolderId !== activeIdStr &&
        !isDescendant(targetFolderId, activeIdStr)
      ) {
        const currentParent = activeFolder?.parentFolderId ?? null
        if (targetFolderId !== currentParent) {
          reparentFolder(activeIdStr, targetFolderId)
          if (targetFolderId) {
            setExpandedFolders((prev) => new Set(prev).add(targetFolderId))
          }
        } else if (activeIdStr !== overIdStr) {
          reorderFolders(activeIdStr, targetFolderId)
        }
      }
      return
    }
    if (isActiveNotebook) {
      const currentFolderId = activeNotebook?.folderid ?? null
      const isDroppedOnFolder = overIdStr.startsWith('folder-drop:')
      const isSameParent = targetFolderId === currentFolderId
      if (!isSameParent) {
        onNotebookUpdate?.({
          ...activeNotebook!,
          folderid: targetFolderId ?? undefined,
        })
      } else if (!isDroppedOnFolder && activeIdStr !== overIdStr) {
        reorderNotebooks?.(activeIdStr, overIdStr, currentFolderId)
      }
    }
  }
  function onDragCancel() {
    setActiveId(null)
  }
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
          <FolderDropZone folderId={item.id} isDragging={activeId !== null} />
          {expandedFolders.has(item.id) && (
            <div
              style={{ marginLeft: `${(depth + 1) * 2}px` }}
              className='flex flex-col gap-1'
            >
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
            onNotebookUpdate?.({ ...item.data, name: label })
          }
        ></SortableNotebookElement>
      </div>
    )
  }

  return (
    <div className='bg-blue flex h-screen w-1/4 flex-col overflow-hidden px-2 py-2'>
      <OptionBar
        onAddFolder={() => addFolder(0, 'untitled')}
        onAddNotebook={() => addNotebook('untitled')}
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
          NO CONTENT OPENED
        </div>
      )}
      {isSearching ? (
        <div className='mt-2 flex flex-col gap-2 text-white'>
          {results.map((r) => (
            <div key={r.notebookid}>
              <div className='font-bold'>{r.name}</div>
              {r.matches.map((m) => (
                <div key={m.blockid} className='text-xs opacity-80'>
                  <p dangerouslySetInnerHTML={{ __html: m.snippet! }} />
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
                items={allSortableIds}
                strategy={verticalListSortingStrategy}
              >
                <div className='flex flex-col gap-1'>
                  {tree.map((item: SidebarItem) => renderItem(item))}
                </div>
              </SortableContext>
              <TrashDropZone />
              <DragOverlay>
                {activeFolder && (
                  <SortableFolderElement
                    id={activeFolder.folderid}
                    name={activeFolder.name}
                    isExpanded={expandedFolders.has(activeFolder.folderid)}
                    onToggleExpanded={() =>
                      toggleFolderExpanded(activeFolder.folderid)
                    }
                    onRename={() => {}}
                  />
                )}
                {activeNotebook && (
                  <SortableNotebookElement
                    id={activeNotebook.notebookid}
                    name={activeNotebook.name}
                    onClick={() => {}}
                    onRename={() => {}}
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
