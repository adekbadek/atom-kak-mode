'use babel'

import { Range, Point } from 'atom'
import { matchRecursive } from 'xregexp'
import escapeStringRegexp from 'escape-string-regexp'
import { last } from 'ramda'

export const editorCommands = {
  /**
   * change mode to insert
   */
  i: (_, { instance }) => instance.changeModeToInsert(),
  /**
   * undo last change
   */
  u: editor => editor.undo(),
  /**
   * redo last change
   */
  U: editor => editor.redo(),
  /**
   * paste yanked text after selection
   */
  p: editor => editor.pasteText(),
  /**
   * remove all selections except main
   * @type selection
   */
  space: editor => {
    const selections = editor.getSelectedBufferRanges()
    if (selections.length > 1) {
      editor.setSelectedBufferRanges([last(selections)])
    }
  },
}
const getMovement = type => (cursor, { modifier }) => {
  if (modifier === 'shift') {
    cursor.selection[`select${type}`]()
  } else {
    cursor[`move${type}`]()
  }
}

export const cursorCommands = {
  /**
   * move down
   * @type movement
   */
  j: getMovement('Down'),
  /**
   * move up
   * @type movement
   */
  k: getMovement('Up'),
  /**
   * move left
   * @type movement
   */
  h: getMovement('Left'),
  /**
   * move right
   * @type movement
   */
  l: getMovement('Right'),
  /**
   * select to next matching character
   */
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
  /**
   * insert at line end
   */
  A: (cursor, { instance }) => {
    cursor.moveToEndOfLine()
    instance.changeModeToInsert()
  },
  /**
   * insert on new line below
   */
  o: (cursor, { editor, instance }) => {
    editor.insertNewlineBelow()
    instance.changeModeToInsert()
  },
  /**
   * insert on new line above
   */
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
  /**
   * select to next word start
   * @type selection
   */
  w: getSelectionCommand('selectToBeginningOfNextWord'),
  /**
   * select to next word end
   * @type selection
   */
  e: getSelectionCommand('selectToEndOfWord'),
  /**
   * select to previous word start
   * @type selection
   */
  b: getSelectionCommand('selectToPreviousWordBoundary'),
  /**
   * erase selected text
   */
  d: selection => selection.cut(),
  /**
   * change selected text (erase and enter insert mode)
   */
  c: (selection, { instance }) => {
    selection.cut()
    instance.changeModeToInsert()
  },
  /**
   * select line
   * @type selection
   */
  x: getSelectionCommand('selectLine'),
  /**
   * yank selected text
   */
  y: selection => selection.copy(),
  /**
   * erase selected text or the character before cursor
   */
  backspace: selection => {
    if (selection.isEmpty()) {
      selection.selectLeft()
    }
    selection.delete()
  },
}
