import Block from './block'

export default class Notebook {
  public notebookid: string
  public name: string
  public blocks: Block[]
  public folderid?: string

  public constructor(name: string) {
    this.notebookid = crypto.randomUUID()
    this.name = name
    this.blocks = []
  }
}
