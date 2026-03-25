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
import TrashDropZone from './trashbar'

interface SidebarProps {
  folders: Folder[]
  setFolders: Dispatch<SetStateAction<Folder[]>>
  addFolder: (index: number, name: string) => void
  removeFolder: (id: string) => void
  reorderFolders: (activeId: string, overId: string) => void
}

const Sidebar = ({
  folders,
  setFolders,
  addFolder,
  removeFolder,
  reorderFolders,
}: SidebarProps) => {
  const [activeId, setActiveId] = useState<string | null>(null)

  const isFolderOpened = folders.length > 0

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
    <div className='bg-blue flex h-screen w-1/4 flex-col px-2 py-2'>
      <OptionBar onAdd={() => addFolder(0, 'untitled')}></OptionBar>
      {!isFolderOpened && (
        <div className='font-poppins pt-2 text-center text-sm text-white'>
          NO FOLDER OPENED
        </div>
      )}
      {isFolderOpened && (
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
                  <SortableSidebarElement
                    key={folder.folderid}
                    id={folder.folderid}
                    name={folder.name}
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
      )}
    </div>
  )
}

export default Sidebar
