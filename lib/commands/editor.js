'use babel'

import { times } from '../utils'
import {
  withCount,
  withGoto,
  withoutGoto,
  removeAllSelectionsButLast,
} from './utils'

// editor commands will be triggered once per keystroke

export default {
  /**
   * @normal change mode to insert
   */
  i: withoutGoto((_, { instance }) => instance.changeModeToInsert()),
  /**
   * @normal undo last change
   * @shift redo last change
   */
  u: withCount((editor, { withShift }) => {
    withShift ? editor.redo() : editor.undo()
  }),
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
    (editor, { instance, lastCursor, withShift }) => {
      withShift
        ? lastCursor.selection.selectToBufferPosition([0, 0])
        : lastCursor.setBufferPosition([0, 0])
      instance.updateGoTo(false)
    },
    { removeMultipleSelections: true },
    (_, { instance }) => instance.updateGoTo(true)
  ),
  /**
   * @goto go to the first line
   */
  k: withGoto(
    (editor, { instance, lastCursor, withShift }) => {
      withShift
        ? lastCursor.selection.selectToBufferPosition([0, 0])
        : lastCursor.setBufferPosition([0, 0])
    },
    { removeMultipleSelections: true }
  ),
  /**
   * @goto go to last char of last line
   */
  e: withGoto(
    (editor, { lastCursor, withShift }) => {
      withShift
        ? lastCursor.selection.selectToBottom()
        : lastCursor.moveToBottom()
    },
    { removeMultipleSelections: true }
  ),
  /**
   * @goto go to the last line
   */
  j: withGoto(
    (editor, { lastCursor, withShift }) => {
      if (withShift) {
        lastCursor.selection.selectToBottom()
        lastCursor.selection.selectToBeginningOfLine()
      } else {
        lastCursor.moveToBottom()
        lastCursor.moveToBeginningOfLine()
      }
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
    (editor, { view, lastCursor, withShift }) => {
      const position = [view.getFirstVisibleScreenRow(), 0]
      withShift
        ? lastCursor.selection.selectToScreenPosition(position)
        : lastCursor.setScreenPosition(position)
    },
    { removeMultipleSelections: true }
  ),
  /**
   * @goto go to the last visible line
   */
  b: withGoto(
    (editor, { view, lastCursor, withShift }) => {
      const position = [view.getLastVisibleScreenRow(), 0]
      withShift
        ? lastCursor.selection.selectToScreenPosition(position)
        : lastCursor.setScreenPosition(position)
    },
    { removeMultipleSelections: true }
  ),
  /**
   * @goto go to the middle visible line
   */
  c: withGoto(
    (editor, { view, lastCursor, withShift }) => {
      const firstVisible = view.getFirstVisibleScreenRow()
      const lastVisible = view.getLastVisibleScreenRow()
      const middleRow = firstVisible + (lastVisible - firstVisible) / 2
      const position = [middleRow, 0]
      withShift
        ? lastCursor.selection.selectToScreenPosition(position)
        : lastCursor.setScreenPosition(position)
    },
    { removeMultipleSelections: true }
  ),
  /**
   * @normal insert on new line below
   * @shift insert on new line above
   * @difference if used with count, kak would add cursor at beginning of each created line
   */
  o: withCount((selection, { editor, instance, withShift }) => {
    withShift ? editor.insertNewlineAbove() : editor.insertNewlineBelow()
    instance.changeModeToInsert()
  }),
}
