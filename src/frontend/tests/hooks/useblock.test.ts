import { renderHook, act } from '@testing-library/react'
import { useBlocks } from '../../hooks/useblock'
import Block from '../../../shared/block'

const mockUUID = '00000000-0000-0000-0000-000000000001'
jest.spyOn(crypto, 'randomUUID').mockReturnValue(mockUUID)

describe('useBlocks', () => {
  it('H4-Verify default blocks created when no initial blocks', () => {
    const { result } = renderHook(() => useBlocks())
    expect(result.current.blocks).toHaveLength(1)
    expect(result.current.blocks[0].type).toBe('markdown')
    expect(result.current.blocks[0].content).toBe('Write Something...')
  })
  it('H5-Verify initial blocks are used when given', () => {
    const initial: Block[] = [
      { blockid: mockUUID, type: 'markdown', content: 'yaha' },
    ]
    const { result } = renderHook(() => useBlocks(initial))
    expect(result.current.blocks).toHaveLength(1)
    expect(result.current.blocks[0].type).toBe('markdown')
    expect(result.current.blocks[0].content).toBe('yaha')
  })
  it('H6-Verify default blocks created when given empty array', () => {
    const initial: Block[] = []
    const { result } = renderHook(() => useBlocks(initial))
    expect(result.current.blocks).toHaveLength(1)
    expect(result.current.blocks[0].type).toBe('markdown')
    expect(result.current.blocks[0].content).toBe('Write Something...')
  })
  it('H7-Verify addBlockAfter adds markdown block', () => {
    const { result } = renderHook(() => useBlocks())
    act(() => {
      result.current.addBlockAfter(0, 'markdown')
    })
    expect(result.current.blocks).toHaveLength(2)
    expect(result.current.blocks[1].type).toBe('markdown')
    expect(result.current.blocks[1].content).toBe('Write Something...')
  })
  it('H8-Verify addBlockAfter adds codeblock', () => {
    const { result } = renderHook(() => useBlocks())
    act(() => {
      result.current.addBlockAfter(0, 'code')
    })
    expect(result.current.blocks).toHaveLength(2)
    expect(result.current.blocks[1].type).toBe('code')
    expect(result.current.blocks[1].content).toBe('Write Something...')
    expect(result.current.blocks[1].language).toBe('JavaScript')
  })
  it('H9-Verify addBlockAfter adds at correct position', () => {
    const initial: Block[] = [
      { blockid: 'a', type: 'markdown', content: '1' },
      { blockid: 'b', type: 'markdown', content: '2' },
      { blockid: 'c', type: 'markdown', content: '3' },
    ]
    const { result } = renderHook(() => useBlocks(initial))
    act(() => {
      result.current.addBlockAfter(0, 'code')
    })
    expect(result.current.blocks[1].type).toBe('code')
    expect(result.current.blocks[1].content).toBe('Write Something...')
    expect(result.current.blocks[1].language).toBe('JavaScript')
  })
  it('H10-Verify removeBlock removes correct block', () => {
    const initial: Block[] = [
      { blockid: 'a', type: 'markdown', content: '1' },
      { blockid: 'b', type: 'markdown', content: '2' },
      { blockid: 'c', type: 'markdown', content: '3' },
    ]
    const { result } = renderHook(() => useBlocks(initial))
    act(() => {
      result.current.removeBlock('b')
    })
    expect(result.current.blocks).toHaveLength(2)
    expect(result.current.blocks[0].blockid).toBe('a')
    expect(result.current.blocks[1].blockid).toBe('c')
  })
  it('H11-Verify reorderBlocks move blocks to new position', () => {
    const initial: Block[] = [
      { blockid: 'a', type: 'markdown', content: '1' },
      { blockid: 'b', type: 'markdown', content: '2' },
      { blockid: 'c', type: 'markdown', content: '3' },
    ]
    const { result } = renderHook(() => useBlocks(initial))
    act(() => {
      result.current.reorderBlocks('a', 'c')
    })
    expect(result.current.blocks).toHaveLength(3)
    expect(result.current.blocks.map((b) => b.blockid)).toEqual(['b', 'c', 'a'])
  })
  it('H12-Verify reorderBlocks does not move block when same id', () => {
    const initial: Block[] = [
      { blockid: 'a', type: 'markdown', content: '1' },
      { blockid: 'b', type: 'markdown', content: '2' },
      { blockid: 'c', type: 'markdown', content: '3' },
    ]
    const { result } = renderHook(() => useBlocks(initial))
    act(() => {
      result.current.reorderBlocks('a', 'a')
    })
    expect(result.current.blocks).toHaveLength(3)
    expect(result.current.blocks.map((b) => b.blockid)).toEqual(['a', 'b', 'c'])
  })
  it('H13-Verify updateBlock updates on content change', () => {
    const { result } = renderHook(() => useBlocks())
    const test = 'yaha'
    act(() => {
      result.current.updateBlock(mockUUID, { content: test })
    })
    expect(result.current.blocks[0].content).toBe(test)
  })
  it('H14-Verify updateBlock updates on language change', () => {
    const initial: Block[] = [
      {
        blockid: mockUUID,
        type: 'code',
        content: 'nanda',
        language: 'JavaScript',
      },
    ]
    const { result } = renderHook(() => useBlocks(initial))
    const test = 'Shell'
    act(() => {
      result.current.updateBlock(mockUUID, { language: test })
    })
    expect(result.current.blocks[0].content).toBe('nanda')
    expect(result.current.blocks[0].language).toBe(test)
  })
  it('H15-Verify updateBlock can remain the same', () => {
    const initial: Block[] = [
      {
        blockid: mockUUID,
        type: 'code',
        content: 'nanda',
        language: 'JavaScript',
      },
    ]
    const { result } = renderHook(() => useBlocks(initial))
    act(() => {
      result.current.updateBlock(mockUUID, {})
    })
    expect(result.current.blocks[0].content).toBe('nanda')
    expect(result.current.blocks[0].language).toBe('JavaScript')
  })
  it('H16-Verify setBlocks works with direct array', () => {
    const onBlocksChange = jest.fn()
    const initial: Block[] = [{ blockid: 'a', type: 'markdown', content: '1' }]
    const { result } = renderHook(() => useBlocks(initial, onBlocksChange))
    const newBlocks: Block[] = [
      { blockid: 'b', type: 'markdown', content: '2' },
      { blockid: 'c', type: 'markdown', content: '3' },
    ]
    act(() => {
      result.current.setBlocks(newBlocks)
    })
    expect(result.current.blocks).toHaveLength(2)
    expect(result.current.blocks[0].blockid).toBe('b')
    expect(onBlocksChange).toHaveBeenCalledWith(newBlocks)
  })
  it('H17-Verify updateBlock leaves other blocks unchanged', () => {
    const initial: Block[] = [
      { blockid: 'a', type: 'markdown', content: '1' },
      { blockid: 'b', type: 'markdown', content: '2' },
    ]
    const { result } = renderHook(() => useBlocks(initial))
    act(() => {
      result.current.updateBlock('a', { content: 'updated' })
    })
    expect(result.current.blocks[0].content).toBe('updated')
    expect(result.current.blocks[1].content).toBe('2')
  })
})
