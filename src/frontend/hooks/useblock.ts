import { useState, useCallback } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import Block from '../../shared/block'
import type { blockType } from '../../shared/block'
import type { Language } from '../../shared/language'

export const useBlocks = (
  initialBlocks?: Block[],
  onBlocksChange?: (blocks: Block[]) => void
) => {
  const [blocks, setBlocksState] = useState<Block[]>(
    initialBlocks && initialBlocks.length > 0
      ? initialBlocks
      : [
          {
            blockid: crypto.randomUUID(),
            type: 'markdown',
            content: '',
          },
        ]
  )

  const setBlocks = useCallback(
    (newBlocks: Block[] | ((prev: Block[]) => Block[])) => {
      if (typeof newBlocks === 'function') {
        setBlocksState((prev) => {
          const updatedBlocks = newBlocks(prev)
          onBlocksChange?.(updatedBlocks)
          return updatedBlocks
        })
      } else {
        setBlocksState(newBlocks)
        onBlocksChange?.(newBlocks)
      }
    },
    [onBlocksChange]
  )

  const addBlockAfter = (index: number, type: blockType) => {
    setBlocks((prev) => {
      const copy = [...prev]
      if (type === 'code') {
        copy.splice(index + 1, 0, {
          blockid: crypto.randomUUID(),
          type,
          content: '',
          language: 'JavaScript',
        })
      } else {
        copy.splice(index + 1, 0, {
          blockid: crypto.randomUUID(),
          type,
          content: '',
        })
      }
      return copy
    })
  }

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.blockid !== id))
  }

  const reorderBlocks = (activeId: string, overId: string) => {
    if (activeId === overId) return
    const oldIndex = blocks.findIndex((b) => b.blockid === activeId)
    const newIndex = blocks.findIndex((b) => b.blockid === overId)
    setBlocks((blocks) => {
      return arrayMove(blocks, oldIndex, newIndex)
    })
  }

  const updateBlock = (
    id: string,
    data: Partial<{ content: string; language: Language }>
  ) => {
    setBlocks((prev) =>
      prev.map((b) => (b.blockid === id ? { ...b, ...data } : b))
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
