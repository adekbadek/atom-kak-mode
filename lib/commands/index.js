'use babel'

import { times } from '../utils'
import matchingCharCommand from './matchingCharCommand'
import {
  withCount,
  withGoto,
  withoutGoto,
  getMovementCommand,
  getSelectionCommand,
  removeAllSelectionsButLast,
} from './utils'

// editor commands will be triggered once per keystroke,
// contrary to selection and cursor commands, which will be triggered for
// each cursor/selection

export const editorCommands = {
  /**
   * change mode to insert
   */
  i: withoutGoto((_, { instance }) => instance.changeModeToInsert()),
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
  space: removeAllSelectionsButLast,
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
  /**
   * @gotoCommand
   */
  g: withGoto(
    (editor, { instance, lastCursor }) => {
      lastCursor.setBufferPosition([0, 0])
      instance.updateGoTo(false)
    },
    { removeMultipleSelections: true },
    (_, { instance }) => instance.updateGoTo(true)
  ),
  /**
   * @gotoCommand
   */
  k: withGoto(
    (editor, { instance, lastCursor }) => {
      lastCursor.setBufferPosition([0, 0])
    },
    { removeMultipleSelections: true }
  ),
  /**
   * @gotoCommand
   */
  e: withGoto((editor, { lastCursor }) => {
    lastCursor.moveToBottom()
  }, { removeMultipleSelections: true }),
  /**
   * @gotoCommand
   */
  j: withGoto((editor, { lastCursor }) => {
    lastCursor.moveToBottom()
    lastCursor.moveToBeginningOfLine()
  }, { removeMultipleSelections: true }),
  /**
   * @gotoCommand
   * @difference opens fuzzy-finder's file finder
   */
  f: withGoto((editor, { dispatch }) => dispatch('fuzzy-finder:toggle-file-finder')),
  /**
   * @gotoCommand
   * @difference opens fuzzy-finder's buffer finder instead of last buffer
   */
  a: withGoto((editor, { dispatch }) => dispatch('fuzzy-finder:toggle-buffer-finder')),
  /**
   * @gotoCommand
   */
  t: withGoto((editor, { view, lastCursor }) => {
    lastCursor.setScreenPosition([view.getFirstVisibleScreenRow(), 0])
  }, { removeMultipleSelections: true }),
  /**
   * @gotoCommand
   */
  b: withGoto((editor, { view, lastCursor }) => {
    lastCursor.setScreenPosition([view.getLastVisibleScreenRow(), 0])
  }, { removeMultipleSelections: true }),
  /**
   * @gotoCommand
   */
  c: withGoto((editor, { view, lastCursor }) => {
    const firstVisible = view.getFirstVisibleScreenRow()
    const lastVisible = view.getLastVisibleScreenRow()
    const middleRow = firstVisible + (lastVisible - firstVisible) / 2
    lastCursor.setScreenPosition([middleRow, 0])
  }, { removeMultipleSelections: true }),
}

export const cursorCommands = {
  /**
   * move down
   * @shift extend selecton down
   */
  j: withoutGoto(withCount(getMovementCommand('Down'))),
  /**
   * move up
   * @shift extend selecton up
   */
  k: withCount(getMovementCommand('Up')),
  /**
   * move left
   * @shift extend selecton to left
   * @gotoCommand
   */
  h: withGoto(
    cursor => cursor.moveToBeginningOfLine(),
    {},
    withCount(getMovementCommand('Left'))
  ),
  /**
   * move right
   * @shift extend selecton to right
   * @gotoCommand
   */
  l: withGoto(
    cursor => cursor.moveToEndOfLine(),
    {},
    withCount(getMovementCommand('Right'))
  ),
  /**
   * @gotoCommand
   */
  i: withGoto(cursor => cursor.moveToFirstCharacterOfLine()),
  /**
   * select to next matching character
   * @shift extend selecton to next matching character
   */
  m: matchingCharCommand,
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
  e: withoutGoto(withCount(getSelectionCommand('selectToEndOfWord'))),
  /**
   * select to previous word start
   * @shift extend selecton to previous word start
   */
  b: withoutGoto(withCount(getSelectionCommand('selectToPreviousWordBoundary'))),
  /**
   * erase selected text
   */
  d: selection => selection.cut(),
  /**
   * change selected text (erase and enter insert mode)
   */
  c: withoutGoto((selection, { instance }) => {
    selection.cut()
    instance.changeModeToInsert()
  }),
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
