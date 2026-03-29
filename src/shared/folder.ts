import type Notebook from './notebook'

type folderType = 'folder'
export type { folderType }

class Folder {
  public folderid: string
  public name: string
  public folders: Folder[] = []
  public notebooks: Notebook[] = []

  public constructor(name: string) {
    this.folderid = crypto.randomUUID()
    this.name = name
  }
}

export default Folder
