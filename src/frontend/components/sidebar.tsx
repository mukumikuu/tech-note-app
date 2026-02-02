'use client'
import {
  DndContext,
  closestCenter,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import OptionBar from './optionbar'
import SideBarElement from './sidebarelement'
import SortableSidebarElement from './sortablesidebarelement'
import { useFolders } from '../hooks/usefolder'
import TrashDropZone from './trashbar'
const Sidebar = () => {
  const { folders, setFolders, addFolder, reorderFolders, removeFolder } =
    useFolders()
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

  const activeFolder = folders.find((f) => f.id === activeId)

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
              items={folders.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className='flex flex-col gap-1'>
                {folders.map((folder) => (
                  <SortableSidebarElement
                    key={folder.id}
                    id={folder.id}
                    name={folder.name}
                    onRename={(name) =>
                      setFolders((f) =>
                        f.map((item) =>
                          item.id === folder.id ? { ...item, name } : item
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
