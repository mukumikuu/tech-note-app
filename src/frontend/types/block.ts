type blockType = 'code' | 'markdown'
export type { blockType }

export default class Block {
  public id: string
  public type: blockType

  public constructor(type: blockType) {
    this.id = crypto.randomUUID()
    this.type = type
  }
}
