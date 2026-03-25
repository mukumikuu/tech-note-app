import ExecuteCellButton from './executecellbutton'
import { useState, useEffect } from 'react'
import Button from './button'
import { Copy, Trash } from 'lucide-react'
import type { CellStatus } from '../../shared/cellstatus'
import type { KernelResult } from '../../shared/kernelResult'
import { useCopyToClipboard } from '../hooks/usecopytoclipboard'
import AddBlockMenu from './addblockmenu'
import '../ui/index.css'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DragButton from './dragbutton'
import { useRef } from 'react'
import { basicSetup, EditorView } from 'codemirror'
import { EditorState } from '@codemirror/state'
import linterMap from '../features/linter/lintermap'
import languageMap from '../features/syntaxhighlight/languagemap'
import type { Language } from '../../shared/language'
import { Compartment } from '@codemirror/state'
import {
  darkEditor,
  darkEditorLegacy,
} from '../features/syntaxhighlight/editortheme'
import LanguageButton from './languagebutton'

type CodeBlockProps = {
  id: string
  blockIndex: number
  content: string
  language: Language
  onContentChange?: (content: string) => void
  onLangChange?: (lang: Language) => void
  onAdd: (type: 'markdown' | 'code') => void
  onRemove: () => void
  onExecute: (id: string, code: string, language: Language) => void
  output?: KernelResult
}

const CodeBlock = ({
  id,
  blockIndex,
  content,
  language,
  onContentChange,
  onLangChange,
  onAdd,
  onRemove,
  onExecute,
  output,
}: CodeBlockProps) => {
  const [status, setStatus] = useState<CellStatus>('idle')
  const { copy, copied } = useCopyToClipboard()
  const editorRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({ id })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }
  const languageCompartment = useRef(new Compartment()).current
  const highlightCompartment = useRef(new Compartment()).current
  const linterCompartment = useRef(new Compartment()).current

  useEffect(() => {
    if (!editorRef.current) return
    const startState = EditorState.create({
      doc: content,
      extensions: [
        basicSetup,
        languageCompartment.of(languageMap[language]),
        highlightCompartment.of(
          language === 'Shell' ? darkEditorLegacy : darkEditor
        ),
        linterCompartment.of(linterMap[language]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onContentChange) {
            onContentChange(update.state.doc.toString())
          }
        }),
        EditorView.editable.of(!isDragging),
      ],
    })
    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    })
    viewRef.current = view
    editorRef.current.cmView = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!viewRef.current) return
    const isLegacy = language === 'Shell'
    viewRef.current.dispatch({
      effects: [
        languageCompartment.reconfigure(languageMap[language]),
        highlightCompartment.reconfigure(
          isLegacy ? darkEditorLegacy : darkEditor
        ),
        linterCompartment.reconfigure(linterMap[language]),
      ],
    })
  }, [language])

  useEffect(() => {
    if (!output) return
    if (output.error) {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 300)
    } else {
      setStatus('idle')
    }
  }, [output])

  const runBlock = () => {
    try {
      setStatus('running')
      onExecute(id, content, language)
      setTimeout(() => setStatus('idle'), 300)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 300)
    }
  }

  const handleCopy = async () => {
    await copy(content!)
    if (!copied) console.log('copy failed')
  }

  const handleRemove = () => {
    onRemove()
    console.log(`${id} is removed`)
  }

  return (
    <div
      data-testid='codeblock'
      ref={setNodeRef}
      style={style}
      className={`flex w-full gap-2 ${
        isDragging ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className='flex w-full items-center gap-2'>
        <div className='flex flex-col items-end gap-y-1'>
          <ExecuteCellButton
            status={status}
            iconColor='var(--color-light-blue)'
            iconSize={16}
            onExecute={runBlock}
          />
          <div className='font-poppins text-[12px] text-white'>{`[${blockIndex}]`}</div>
          <div className='flex flex-row items-center'>
            <AddBlockMenu onSelect={(type) => onAdd(type)}></AddBlockMenu>
            <DragButton
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
            ></DragButton>
          </div>
        </div>
        <div className='w-full'>
          <div
            className='flex flex-row items-center gap-4 bg-[#191E30]'
            style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
          >
            <LanguageButton
              value={language!}
              onChange={onLangChange!}
            ></LanguageButton>
            <Button
              data-testid='copy'
              onClick={handleCopy}
              icon={Copy}
              variant='icon'
            />
            <Button
              data-testid='remove'
              onClick={handleRemove}
              icon={Trash}
              variant='icon'
            />
          </div>
          <div
            data-testid='editor'
            ref={editorRef}
            className='bg-blue w-full font-mono text-white'
            style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
          />
          <div className='bg-blue pt-2 pl-6 font-mono text-sm text-white'>
            {output?.error && <div className='text-red'>{output.error}</div>}
            {output && !output.error && (
              <div className='whitespace-pre-wrap text-green-300'>
                {output.logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            )}
            {language !== 'JavaScript' && output?.result !== undefined && (
              <div className='text-green-300'>{String(output.result)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeBlock
