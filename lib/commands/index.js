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
   * @normal change mode to insert
   */
  i: withoutGoto((_, { instance }) => instance.changeModeToInsert()),
  /**
   * @normal undo last change
   */
  u: withCount(editor => editor.undo()),
  /**
   * @normal redo last change
   */
  U: withCount(editor => editor.redo()),
  /**
   * @normal paste yanked text after selection
   */
  p: withCount(editor => editor.pasteText()),
  /**
   * @normal remove all selections except main
   */
  space: removeAllSelectionsButLast,
  // just for docs
  /**
   * @normal set count
   */
  '1-9': () => {},
  ...times(10).reduce((acc, i) => {
    acc[i] = (_, { instance }) => {
      const count = parseInt(`${instance.state.count}${i}`)
      instance.updateCount(count)
    }
    return acc
  }, {}),
  /**
   * @goto enter goto mode or go to the first line
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
   * @goto go to the first line
   */
  k: withGoto(
    (editor, { instance, lastCursor }) => {
      lastCursor.setBufferPosition([0, 0])
    },
    { removeMultipleSelections: true }
  ),
  /**
   * @goto go to last char of last line
   */
  e: withGoto(
    (editor, { lastCursor }) => {
      lastCursor.moveToBottom()
    },
    { removeMultipleSelections: true }
  ),
  /**
   * @goto go to the last line
   */
  j: withGoto(
    (editor, { lastCursor }) => {
      lastCursor.moveToBottom()
      lastCursor.moveToBeginningOfLine()
    },
    { removeMultipleSelections: true }
  ),
  /**
   * @goto go to file
   * @difference opens fuzzy-finder's file finder
   */
  f: withGoto((editor, { dispatch }) =>
    dispatch('fuzzy-finder:toggle-file-finder')
  ),
  /**
   * @goto go to buffer
   * @difference opens fuzzy-finder's buffer finder instead of last buffer
   */
  a: withGoto((editor, { dispatch }) =>
    dispatch('fuzzy-finder:toggle-buffer-finder')
  ),
  /**
   * @goto go to the first visible line
   */
  t: withGoto(
    (editor, { view, lastCursor }) => {
      lastCursor.setScreenPosition([view.getFirstVisibleScreenRow(), 0])
    },
    { removeMultipleSelections: true }
  ),
  /**
   * @goto go to the last visible line
   */
  b: withGoto(
    (editor, { view, lastCursor }) => {
      lastCursor.setScreenPosition([view.getLastVisibleScreenRow(), 0])
    },
    { removeMultipleSelections: true }
  ),
  /**
   * @goto go to the middle visible line
   */
  c: withGoto(
    (editor, { view, lastCursor }) => {
      const firstVisible = view.getFirstVisibleScreenRow()
      const lastVisible = view.getLastVisibleScreenRow()
      const middleRow = firstVisible + (lastVisible - firstVisible) / 2
      lastCursor.setScreenPosition([middleRow, 0])
    },
    { removeMultipleSelections: true }
  ),
}

export const cursorCommands = {
  /**
   * @normal move down
   * @shift extend selection down
   */
  j: withoutGoto(withCount(getMovementCommand('Down'))),
  /**
   * @normal move up
   * @shift extend selection up
   */
  k: withCount(getMovementCommand('Up')),
  /**
   * @normal move left
   * @shift extend selection to left
   * @goto go to line begin
   */
  h: withGoto(
    cursor => cursor.moveToBeginningOfLine(),
    {},
    withCount(getMovementCommand('Left'))
  ),
  /**
   * @normal move right
   * @shift extend selection to right
   * @goto go to line end
   */
  l: withGoto(
    cursor => cursor.moveToEndOfLine(),
    {},
    withCount(getMovementCommand('Right'))
  ),
  /**
   * @goto go to non blank line start
   */
  i: withGoto(cursor => cursor.moveToFirstCharacterOfLine()),
  /**
   * @normal select to next matching character
   * @shift extend selection to next matching character
   */
  m: matchingCharCommand,
  /**
   * @normal insert at line end
   */
  A: (cursor, { instance }) => {
    cursor.moveToEndOfLine()
    instance.changeModeToInsert()
  },
  /**
   * @normal insert on new line below
   * @difference if used with count, kak would add cursor at beginning of each created line
   */
  o: withCount((cursor, { editor, instance }) => {
    editor.insertNewlineBelow()
    instance.changeModeToInsert()
  }),
  /**
   * @normal insert on new line above
   * @difference if used with count, kak would add cursor at beginning of each created line
   */
  O: withCount((cursor, { editor, instance }) => {
    editor.insertNewlineAbove()
    instance.changeModeToInsert()
  }),
}

export const selectionCommands = {
  /**
   * @normal select to next word start
   * @shift extend selection to next word start
   */
  w: withCount(getSelectionCommand('selectToBeginningOfNextWord')),
  /**
   * @normal select to next word end
   * @shift extend selection to next word end
   */
  e: withoutGoto(withCount(getSelectionCommand('selectToEndOfWord'))),
  /**
   * @normal select to previous word start
   * @shift extend selection to previous word start
   */
  b: withoutGoto(
    withCount(getSelectionCommand('selectToPreviousWordBoundary'))
  ),
  /**
   * @normal erase selected text
   */
  d: selection => selection.cut(),
  /**
   * @normal change selected text (erase and enter insert mode)
   */
  c: withoutGoto((selection, { instance }) => {
    selection.cut()
    instance.changeModeToInsert()
  }),
  /**
   * @normal select line
   * @shift extend selection to next line
   */
  x: withCount(getSelectionCommand('selectLine')),
  /**
   * @normal yank selected text
   */
  y: selection => selection.copy(),
  /**
   * @normal erase selected text (or the character before cursor) or modify count
   */
  backspace: (selection, { instance }) => {
    const count = instance.state.count
    if (count) {
      const countString = String(count)
      const updatedCountString = countString.substring(
        0,
        countString.length - 1
      )
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
