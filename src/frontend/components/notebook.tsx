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
        await runBlock(b.blockid, b.content!, b.language!)
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

  const activeBlock = blocks.find((b) => b.blockid === activeId)

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
          items={blocks.map((b) => b.blockid)}
          strategy={verticalListSortingStrategy}
        >
          <div className='flex flex-col gap-4'>
            {blocks.map((block, index) =>
              block.type === 'markdown' ? (
                <MarkdownBlock
                  key={block.blockid}
                  id={block.blockid}
                  onAdd={(type) => addBlockAfter(index, type)}
                  onRemove={() => removeBlock(block.blockid)}
                />
              ) : (
                <CodeBlock
                  key={block.blockid}
                  id={block.blockid}
                  blockIndex={index}
                  content={block.content!}
                  language={block.language!}
                  onContentChange={(val) =>
                    updateBlock(block.blockid, { content: val })
                  }
                  onLangChange={(lang) =>
                    updateBlock(block.blockid, { language: lang })
                  }
                  onAdd={(type) => addBlockAfter(index, type)}
                  onRemove={() => removeBlock(block.blockid)}
                  onExecute={runBlock}
                  output={output[block.blockid]}
                />
              )
            )}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeBlock ? (
            activeBlock.type === 'markdown' ? (
              <MarkdownBlock
                id={activeBlock.blockid}
                onAdd={() => {}}
                onRemove={() => {}}
              />
            ) : (
              <CodeBlock
                id={activeBlock.blockid}
                blockIndex={0}
                content={activeBlock.content!}
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
