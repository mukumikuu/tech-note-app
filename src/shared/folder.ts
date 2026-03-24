type folderType = 'folder'
export type { folderType }

class Folder {
  public folderid: string
  public name: string

  public constructor(name: string) {
    this.folderid = crypto.randomUUID()
    this.name = name
  }
}

export default Folder
