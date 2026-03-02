import ExecuteCellButton from './executecellbutton'
import { useState, useEffect } from 'react'
import Button from './button'
import { Copy, Trash } from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import type { CellStatus } from '../types/cellstatus'
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
  onAdd: (type: 'markdown' | 'code') => void
  onRemove: () => void
}

const CodeBlock = ({ id, blockIndex, onAdd, onRemove }: CodeBlockProps) => {
  const [language, setLanguage] = useState<Language>('JavaScript')
  const [status, setStatus] = useState<CellStatus>('idle')
  const [code, setCode] = useState('Write something...')
  const [output, setOutput] = useState<KernelResult | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
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
    const s = io('http://localhost:3030')
    setSocket(s)
    s.on('connect', () => console.log('Connected to kernel'))
    s.on('codeResult', (data: KernelResult) => setOutput(data))
    return () => {
      s.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!editorRef.current) return
    const startState = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        languageCompartment.of(languageMap[language]),
        highlightCompartment.of(
          language === 'Shell' ? darkEditorLegacy : darkEditor
        ),
        linterCompartment.of(linterMap[language]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setCode(update.state.doc.toString())
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

  const runCell = () => {
    if (!socket || !socket.connected) {
      console.error('Socket not connected')
      setStatus('error')
      return
    }

    try {
      setStatus('running')
      socket.emit('runCode', code)
      setTimeout(() => setStatus('idle'), 300)
    } catch {
      setStatus('error')
    }
  }

  const handleCopy = async () => {
    await copy(code)
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
            onExecute={runCell}
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
              value={language}
              onChange={setLanguage}
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
              <div className='text-white'>{output.logs.join('')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeBlock
