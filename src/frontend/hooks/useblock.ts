import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import Block from '../types/block'
import type { blockType } from '../types/block'
export const useBlocks = () => {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: crypto.randomUUID(), type: 'markdown' },
  ])

  const addBlockAfter = (index: number, type: blockType) => {
    setBlocks((prev) => {
      const copy = [...prev]
      copy.splice(index + 1, 0, {
        id: crypto.randomUUID(),
        type,
      })
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

  return {
    blocks,
    setBlocks,
    addBlockAfter,
    removeBlock,
    reorderBlocks,
  }
}
