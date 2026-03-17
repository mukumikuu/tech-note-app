import Block from './block'

export default class Notebook {
  public id: string
  public name: string
  public blocks: Block[]
  public folderid?: string

  public constructor(name: string) {
    this.id = crypto.randomUUID()
    this.name = name
    this.blocks = []
  }
}
