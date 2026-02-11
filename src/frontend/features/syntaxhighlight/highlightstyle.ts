import { HighlightStyle } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

export const darkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#8ab4f8', fontWeight: '500' },
  { tag: [t.variableName, t.propertyName], color: '#c9d1e8' },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName)],
    color: '#7dd3c0',
  },
  { tag: t.string, color: '#e3b587' },
  { tag: [t.number, t.bool, t.null], color: '#f0a6a6' },
  { tag: t.comment, color: '#7f8599', fontStyle: 'italic' },
  { tag: t.operator, color: '#9aa4c7' },
  { tag: t.punctuation, color: '#b0b7d1' },
  { tag: t.className, color: '#f2c38f' },
  { tag: t.standard(t.variableName), color: '#9cd6ff' },
  { tag: t.invalid, color: '#ff6b6b' },
])

export const shellHighlight = HighlightStyle.define([
  { tag: t.keyword, color: '#f78c6c' },
  { tag: t.function(t.variableName), color: '#f78c6c' },
  { tag: t.string, color: '#e0e6d8' },
  { tag: t.number, color: '#e0e6d8' },
  { tag: t.comment, color: '#7f8599', fontStyle: 'italic' },
  { tag: t.operator, color: '#89ddff' },
  { tag: t.variableName, color: '#ffe014' }, // shell commands
])
