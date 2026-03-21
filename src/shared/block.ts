import type { Language } from './language'

type blockType = 'code' | 'markdown'
export type { blockType }

export default class Block {
  public blockid: string
  public type: blockType
  public content?: string
  public language?: Language

  public constructor(type: blockType) {
    this.blockid = crypto.randomUUID()
    this.type = type
  }
}
