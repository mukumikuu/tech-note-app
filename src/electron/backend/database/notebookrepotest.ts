import { saveNotebook, loadNotebook } from '../repositories/notebookrepo.js'
import Notebook from '../../../shared/notebook.js'
import Block from '../../../shared/block.js'

export function testNotebookRepo() {
  console.log('🚀 Testing NotebookRepo...')

  // 1️⃣ Create notebook
  const notebook = new Notebook('Test Notebook')

  // 2️⃣ Add a block
  const block = new Block('markdown')
  block.content = 'Hello world'
  notebook.blocks.push(block)

  console.log('📦 Saving notebook:', notebook)

  // 3️⃣ Save to DB
  saveNotebook(notebook)

  // 4️⃣ Load from DB
  const loaded = loadNotebook(notebook.notebookid)

  console.log('📥 Loaded notebook:', loaded)

  // 5️⃣ Validate
  if (!loaded) {
    throw new Error('❌ Failed: loaded notebook is null')
  }

  if (loaded.notebookid !== notebook.notebookid) {
    throw new Error('❌ Failed: ID mismatch')
  }

  if (loaded.blocks.length !== 1) {
    throw new Error('❌ Failed: blocks not saved')
  }

  if (loaded.blocks[0].content !== 'Hello world') {
    throw new Error('❌ Failed: content mismatch')
  }

  console.log('✅ NotebookRepo working perfectly!')
}
