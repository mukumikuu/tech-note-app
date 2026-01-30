import { useState } from 'react'
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

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index))
  }

  return {
    blocks,
    addBlockAfter,
    removeBlock,
  }
}
