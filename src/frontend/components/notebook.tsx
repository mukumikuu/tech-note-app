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
import { useState, useEffect } from 'react'
import { useSearch } from '../hooks/useSearch'
import FileHeader from './fileheader'
import { useKernels } from '../hooks/usekernel'
interface NotebookProps {
  notebookId: string
}
const Notebook = ({ notebookId }: NotebookProps) => {
  const { blocks, addBlockAfter, reorderBlocks, removeBlock, updateBlock } =
    useBlocks()
  const { runBlock, restartKernel, clearOutput, output } = useKernels()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [label, setLabel] = useState('untitled')
  const [isSearching, setIsSearching] = useState(false)
  const [query, setQuery] = useState('')
  const { results, search } = useSearch(notebookId)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      if (isTyping) return
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') ||
        e.key === 'ESCAPE'
      ) {
        e.preventDefault()
        setIsSearching((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
          {isSearching && (
            <div className='sticky top-0 z-10 p-2 text-white shadow'>
              <input
                autoFocus
                className='w-full border px-2 py-1 text-sm'
                placeholder='Search in notebook...'
                value={query}
                onChange={(e) => {
                  const q = e.target.value
                  setQuery(q)
                  search(q)
                }}
              />
            </div>
          )}
          {isSearching && results.length > 0 && (
            <div className='p-2 text-sm text-white'>
              {results.map((r) => (
                <div key={r.notebookid}>
                  <div className='font-bold'>{r.name}</div>

                  {r.matches.map((m) => (
                    <div key={m.blockid} className='text-xs opacity-70'>
                      {m.snippet}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
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
