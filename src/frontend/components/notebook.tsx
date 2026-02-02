'use client'
import MarkdownBlock from './markdownblock'
import CodeBlock from './codeblock'
import { useBlocks } from '../hooks/useblock'
import {
  DndContext,
  rectIntersection,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import FileHeader from './fileheader'
const Notebook = () => {
  const { blocks, addBlockAfter, reorderBlocks, removeBlock } = useBlocks()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [label, setLabel] = useState('untitled')

  function onDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    if (active.id === over!.id) return
    reorderBlocks(active.id as string, over!.id as string)
  }

  const activeBlock = blocks.find((b) => b.id === activeId)

  return (
    <div>
      <FileHeader label={label} onLabelChange={setLabel}></FileHeader>
      <DndContext
        collisionDetection={rectIntersection}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className='flex flex-col gap-4'>
            {blocks.map((block, index) =>
              block.type === 'markdown' ? (
                <MarkdownBlock
                  key={block.id}
                  id={block.id}
                  onAdd={(type) => addBlockAfter(index, type)}
                  onRemove={() => removeBlock(block.id)}
                />
              ) : (
                <CodeBlock
                  key={block.id}
                  id={block.id}
                  blockIndex={index}
                  onAdd={(type) => addBlockAfter(index, type)}
                  onRemove={() => removeBlock(block.id)}
                />
              )
            )}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeBlock ? (
            activeBlock.type === 'markdown' ? (
              <MarkdownBlock
                id={activeBlock.id}
                onAdd={() => {}}
                onRemove={() => {}}
              />
            ) : (
              <CodeBlock
                id={activeBlock.id}
                blockIndex={0}
                onAdd={() => {}}
                onRemove={() => {}}
              />
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default Notebook
