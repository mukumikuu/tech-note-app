import MarkdownBlock from './markdownblock'
import CodeBlock from './codeblock'
import { useBlocks } from '../hooks/useblock'
const Notebook = () => {
  const { blocks, addBlockAfter } = useBlocks()

  return (
    <div className='flex flex-col gap-4'>
      {blocks.map((block, index) =>
        block.type === 'markdown' ? (
          <MarkdownBlock
            key={block.id}
            onAdd={(type) => addBlockAfter(index, type)}
          />
        ) : (
          <CodeBlock
            key={block.id}
            blockIndex={index}
            onAdd={(type) => addBlockAfter(index, type)}
          />
        )
      )}
    </div>
  )
}

export default Notebook
