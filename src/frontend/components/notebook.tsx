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
import { useKernels } from '../hooks/usekernel'
const Notebook = () => {
  const { blocks, addBlockAfter, reorderBlocks, removeBlock, updateBlock } =
    useBlocks()
  const { runBlock, restartKernel, clearOutput, output } = useKernels()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [label, setLabel] = useState('untitled')

  const runAll = async () => {
    for (const b of blocks) {
      if (b.type === 'code') {
        await runBlock(b.id, b.value!, b.language!)
      }
    }
  }

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
      <FileHeader
        blocks={blocks}
        label={label}
        onLabelChange={setLabel}
        onRunAll={runAll}
        onRestart={restartKernel}
        onClearOutput={clearOutput}
      ></FileHeader>
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
                  value={block.value!}
                  language={block.language!}
                  onValueChange={(val) => updateBlock(block.id, { value: val })}
                  onLangChange={(lang) =>
                    updateBlock(block.id, { language: lang })
                  }
                  onAdd={(type) => addBlockAfter(index, type)}
                  onRemove={() => removeBlock(block.id)}
                  onExecute={runBlock}
                  output={output[block.id]}
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
                value={activeBlock.value!}
                language={activeBlock.language!}
                onAdd={() => {}}
                onRemove={() => {}}
                onExecute={() => {}}
              />
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default Notebook
