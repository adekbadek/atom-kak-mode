'use babel'

import { last } from 'ramda'

import { times } from '../utils'
import matchingCharCommand from './matchingCharCommand'
import { withCount, getMovement, getSelectionCommand } from './utils'

export const editorCommands = {
  /**
   * change mode to insert
   */
  i: (_, { instance }) => instance.changeModeToInsert(),
  /**
   * undo last change
   */
  u: withCount(editor => editor.undo()),
  /**
   * redo last change
   */
  U: withCount(editor => editor.redo()),
  /**
   * paste yanked text after selection
   */
  p: withCount(editor => editor.pasteText()),
  /**
   * remove all selections except main
   */
  space: editor => {
    const selections = editor.getSelectedBufferRanges()
    if (selections.length > 1) {
      editor.setSelectedBufferRanges([last(selections)])
    }
  },
  // just for docs
  /** set count */
  '1-9': () => {},
  ...times(10).reduce((acc, i) => {
    acc[i] = (_, { instance }) => {
      const count = parseInt(`${instance.state.count}${i}`)
      instance.updateCount(count)
    }
    return acc
  }, {}),
}

export const cursorCommands = {
  /**
   * move down
   * @shift extend selecton down
   */
  j: withCount(getMovement('Down')),
  /**
   * move up
   * @shift extend selecton up
   */
  k: withCount(getMovement('Up')),
  /**
   * move left
   * @shift extend selecton to left
   */
  h: withCount(getMovement('Left')),
  /**
   * move right
   * @shift extend selecton to right
   */
  l: withCount(getMovement('Right')),
  /**
   * select to next matching character
   * @shift extend selecton to next matching character
   */
  m: matchingCharCommand,

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
   * @difference if used with count, kak would add cursor at beginning of each created line
   */
  o: withCount((cursor, { editor, instance }) => {
    editor.insertNewlineBelow()
    instance.changeModeToInsert()
  }),
  /**
   * insert on new line above
   * @difference if used with count, kak would add cursor at beginning of each created line
   */
  O: withCount((cursor, { editor, instance }) => {
    editor.insertNewlineAbove()
    instance.changeModeToInsert()
  }),
}

export const selectionCommands = {
  /**
   * select to next word start
   * @shift extend selecton to next word start
   */
  w: withCount(getSelectionCommand('selectToBeginningOfNextWord')),
  /**
   * select to next word end
   * @shift extend selecton to next word end
   */
  e: withCount(getSelectionCommand('selectToEndOfWord')),
  /**
   * select to previous word start
   * @shift extend selecton to previous word start
   */
  b: withCount(getSelectionCommand('selectToPreviousWordBoundary')),
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
   * @shift extend selecton to next line
   */
  x: withCount(getSelectionCommand('selectLine')),
  /**
   * yank selected text
   */
  y: selection => selection.copy(),
  /**
   * erase selected text (or the character before cursor) or modify count
   */
  backspace: (selection, { instance }) => {
    const count = instance.state.count
    if (count) {
      const countString = String(count)
      const updatedCountString = countString.substring(0, countString.length - 1)
      const updatedCount = updatedCountString ? parseInt(updatedCountString) : 0
      instance.updateCount(updatedCount)
    } else {
      if (selection.isEmpty()) {
        selection.selectLeft()
      }
      selection.delete()
    }
  },
}
