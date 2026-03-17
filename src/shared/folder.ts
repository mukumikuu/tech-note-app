type folderType = 'folder'
export type { folderType }

class Folder {
  public id: string
  public name: string

  public constructor(name: string) {
    this.id = crypto.randomUUID()
    this.name = name
  }
}

export default Folder
