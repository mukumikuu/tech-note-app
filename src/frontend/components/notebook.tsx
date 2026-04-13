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
import { useState, useEffect, useRef } from 'react'
import FileHeader from './fileheader'
import { useKernels } from '../hooks/usekernel'
import type NotebookClass from '../../shared/notebook'
import SearchBar from './searchbar'
import { useSearch } from '../hooks/useSearch'
import { EditorView } from 'codemirror'
import { useHighlight } from '../hooks/usehighlight'

interface NotebookProps {
  notebook: NotebookClass
  onNotebookUpdate: (notebook: NotebookClass) => void
}

const Notebook = ({ notebook, onNotebookUpdate }: NotebookProps) => {
  const { blocks, addBlockAfter, reorderBlocks, removeBlock, updateBlock } =
    useBlocks(notebook.blocks, (updatedBlocks) => {
      const updated = { ...notebook, blocks: updatedBlocks }
      onNotebookUpdate(updated)
    })
  const { runBlock, restartKernel, clearOutput, output } = useKernels()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [label, setLabel] = useState(notebook.name)
  const { results, search } = useSearch(notebook.notebookid, notebook.blocks)
  const editorRefs = useRef<Map<string, EditorView>>(new Map())
  const markdownRefs = useRef<Map<string, HTMLElement>>(new Map())
  useHighlight(results, editorRefs.current, markdownRefs.current)

  // Sync label changes back to notebook
  useEffect(() => {
    setLabel(notebook.name)
  }, [notebook.notebookid, notebook.name])

  useEffect(() => {
    if (label !== notebook.name) {
      const updated = { ...notebook, name: label }
      onNotebookUpdate(updated)
    }
  }, [label])

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
          <SearchBar query={query} setQuery={setQuery} search={search} />
          <div className='flex flex-col gap-4'>
            {blocks.map((block, index) =>
              block.type === 'markdown' ? (
                <MarkdownBlock
                  key={block.blockid}
                  id={block.blockid}
                  content={block.content!}
                  searchQuery={query}
                  onContentChange={(val) =>
                    updateBlock(block.blockid, { content: val })
                  }
                  onAdd={(type) => addBlockAfter(index, type)}
                  onRemove={() => removeBlock(block.blockid)}
                  onRenderedRef={(id, el) => markdownRefs.current.set(id, el)}
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
                  onLangChange={(lang) => {
                    console.log(
                      '[DEBUG-Notebook] onLangChange called with:',
                      lang,
                      'for block:',
                      block.blockid
                    )
                    updateBlock(block.blockid, { language: lang })
                  }}
                  onAdd={(type) => addBlockAfter(index, type)}
                  onRemove={() => removeBlock(block.blockid)}
                  onExecute={runBlock}
                  output={output[block.blockid]}
                  onEditorReady={(_id, view) =>
                    editorRefs.current.set(block.blockid, view)
                  }
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
                content={activeBlock.content!}
                onContentChange={() => {}}
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
