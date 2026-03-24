import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import Block from '../../shared/block'
import type { blockType } from '../../shared/block'
import type { Language } from '../../shared/language'
export const useBlocks = () => {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: crypto.randomUUID(), type: 'markdown' },
  ])

  const addBlockAfter = (index: number, type: blockType) => {
    setBlocks((prev) => {
      const copy = [...prev]
      if (type === 'code') {
        copy.splice(index + 1, 0, {
          id: crypto.randomUUID(),
          type,
          value: 'Write something...',
          language: 'JavaScript',
        })
      } else {
        copy.splice(index + 1, 0, {
          id: crypto.randomUUID(),
          type,
          value: 'Write something...',
        })
      }
      return copy
    })
  }

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  const reorderBlocks = (activeId: string, overId: string) => {
    if (activeId === overId) return
    const oldIndex = blocks.findIndex((b) => b.id === activeId)
    const newIndex = blocks.findIndex((b) => b.id === overId)
    setBlocks((blocks) => {
      return arrayMove(blocks, oldIndex, newIndex)
    })
  }

  const updateBlock = (
    id: string,
    data: Partial<{ value: string; language: Language }>
  ) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id && b.type === 'code' ? { ...b, ...data } : b
      )
    )
  }

  return {
    blocks,
    setBlocks,
    addBlockAfter,
    removeBlock,
    reorderBlocks,
    updateBlock,
  }
}
