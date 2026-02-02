'use client'
import {
  DndContext,
  rectIntersection,
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
const Sidebar = () => {
  const { folders, setFolders, addFolder, reorderFolders } = useFolders()
  const [activeId, setActiveId] = useState<string | null>(null)

  const isFolderOpened = folders.length > 0

  function onDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    if (active.id === over!.id) return
    reorderFolders(active.id as string, over!.id as string)
  }

  const activeFolder = folders.find((f) => f.id === activeId)

  return (
    <div className='bg-blue h-screen w-1/4 px-2 py-2'>
      <OptionBar onAdd={() => addFolder(0, 'untitled')}></OptionBar>
      {!isFolderOpened && (
        <div className='font-poppins pt-2 text-center text-sm text-white'>
          NO FOLDER OPENED
        </div>
      )}
      {isFolderOpened && (
        <div>
          <div className='font-poppins gap-2 pt-2 pb-2 text-left text-sm text-white'>
            FOLDERS
          </div>
          <DndContext
            collisionDetection={rectIntersection}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
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
        </div>
      )}
    </div>
  )
}

export default Sidebar
