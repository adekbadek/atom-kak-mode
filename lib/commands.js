'use babel'

import { Range, Point } from 'atom'
import { matchRecursive } from 'xregexp'
import escapeStringRegexp from 'escape-string-regexp'

export const editorCommands = {
  i: (_, { instance }) => instance.changeModeToInsert(),
  u: editor => editor.undo(),
  U: editor => editor.redo(),
  p: editor => editor.pasteText(),
}
const getMovement = type => (cursor, { modifier }) => {
  if (modifier === 'shift') {
    cursor.selection[`select${type}`]()
  } else {
    cursor[`move${type}`]()
  }
}

export const cursorCommands = {
  j: getMovement('Down'),
  k: getMovement('Up'),
  h: getMovement('Left'),
  l: getMovement('Right'),
  m: (cursor, { editor }) => {
    const buffer = editor.getBuffer()
    const rangeBefore = new Range([0, 0], cursor.getScreenPosition())
    const PAREN_REGEX = /{|\[|\(/
    buffer.backwardsScanInRange(PAREN_REGEX, rangeBefore, ({ matchText, range }) => {
      cursor.setBufferPosition(range.start)
      const matchingParen = {
        '{': '}',
        '[': ']',
        '(': ')',
      }[matchText]
      const rangeAfter = new Range(cursor.getScreenPosition(), buffer.getEndPosition())
      const textInRange = buffer.getTextInRange(rangeAfter)
      const foundText = matchRecursive(textInRange, `${'\\'}${matchText}`, `${'\\'}${matchingParen}`)
      const textMatched = foundText && foundText[0]
      if (textMatched) {
        buffer.scanInRange(new RegExp(escapeStringRegexp(textMatched)), rangeAfter, ({ range }) => {
          cursor.selection.selectToBufferPosition(new Point(range.end.row, range.end.column + 1))
        })
      }
    })
  },

  // TODO: with multiple cursors it creates as many lines
  A: (cursor, { instance }) => {
    cursor.moveToEndOfLine()
    instance.changeModeToInsert()
  },
  o: (cursor, { editor, instance }) => {
    editor.insertNewlineBelow()
    instance.changeModeToInsert()
  },
  O: (cursor, { editor, instance }) => {
    editor.insertNewlineAbove()
    instance.changeModeToInsert()
  },
}

const getSelectionCommand = method => (selection, { modifier }) => {
  if (modifier !== 'shift') {
    selection.clear()
  }
  selection[method]()
}
export const selectionCommands = {
  w: getSelectionCommand('selectToBeginningOfNextWord'),
  e: getSelectionCommand('selectToEndOfWord'),
  b: getSelectionCommand('selectToPreviousWordBoundary'),
  d: selection => selection.cut(),
  c: (selection, { instance }) => {
    selection.cut()
    instance.changeModeToInsert()
  },
  x: getSelectionCommand('selectLine'),
  y: selection => selection.copy(),
  backspace: selection => {
    if (selection.isEmpty()) {
      selection.selectLeft()
    }
    selection.delete()
  },
}
