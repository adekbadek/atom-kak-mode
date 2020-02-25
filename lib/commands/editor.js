'use babel'

import { times } from '../helpers'
import { removeAllSelectionsButLast, swapCase } from './utils/index'
import { withCount, withGoto, withoutGoto } from './utils/decorators'
import {
  setSearchCommandState,
  setSearchSelectionUsingLastPattern,
} from './search'

// editor commands will be triggered once per keystroke

export default {
  /**
   * @other change mode to insert
   */
  i: withoutGoto((editor, { instance }) => {
    editor.getSelections().forEach(selection => selection.clear())
    instance.changeModeToInsert()
  }),
  /**
   * @changes undo last change
   * @shift redo last change
   */
  u: withCount((editor, { withShift }) => {
    withShift ? editor.redo() : editor.undo()
  }),
  /**
   * @changes paste yanked text after selection
   */
  p: withCount(editor => editor.pasteText()),
  /**
   * @selections remove all selections except main
   */
  space: removeAllSelectionsButLast,
  // just for docs
  /**
   * @other set count
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
   * @selections select to the next occurrence of given character
   * @goto go to file
   * @alt select to the previous occurrence of given character
   * @difference opens fuzzy-finder's file finder
   */
  f: withGoto(
    (editor, { dispatch }) => dispatch('fuzzy-finder:toggle-file-finder'),
    {},
    (editor, { instance, withAlt }) =>
      instance.updateSelectToChar({ withFoundChar: true, withAlt })
  ),
  /**
   * @goto go to buffer
   * @difference opens fuzzy-finder's buffer finder instead of last buffer
   */
  a: withGoto((editor, { dispatch }) =>
    dispatch('fuzzy-finder:toggle-buffer-finder')
  ),
  /**
   * @selections select until the next occurrence of given character
   * @goto go to the first visible line
   * @alt select until the previous occurrence of given character
   */
  t: withGoto(
    (editor, { view, lastCursor, withShift }) => {
      const position = [view.getFirstVisibleScreenRow(), 0]
      withShift
        ? lastCursor.selection.selectToScreenPosition(position)
        : lastCursor.setScreenPosition(position)
    },
    { removeMultipleSelections: true },
    (editor, { instance, withAlt }) =>
      instance.updateSelectToChar({ withFoundChar: false, withAlt })
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
   * @changes change selected text (erase and enter insert mode)
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
    { removeMultipleSelections: true },
    (editor, { instance }) => {
      editor.mutateSelectedText(selection => selection.cut())
      instance.changeModeToInsert()
    }
  ),
  /**
   * @changes insert on new line below
   * @shift insert on new line above
   * @difference if used with count, kak would add cursor at beginning of each created line
   */
  o: withCount((editor, { instance, withShift }) => {
    withShift ? editor.insertNewlineAbove() : editor.insertNewlineBelow()
    instance.changeModeToInsert()
  }),
  /**
   * @changes copy selected text
   */
  y: editor => editor.copySelectedText(),
  /**
   * @selections select whole buffer
   */
  '%': editor => editor.selectAll(),
  /**
   * @changes to lower case
   * @alt swap case
   */
  '`': (editor, { withAlt }) => {
    if (withAlt) {
      editor.mutateSelectedText(selection => {
        selection.insertText(swapCase(selection.getText()))
      })
    } else {
      editor.lowerCase()
    }
  },
  /**
   * @changes to upper case
   */
  '~': editor => editor.upperCase(),
  /**
   * @changes indent selections
   */
  '>': editor =>
    editor.mutateSelectedText(selection => selection.indentSelectedRows()),
  /**
   * @changes outdent selections
   */
  '<': editor =>
    editor.mutateSelectedText(selection => selection.outdentSelectedRows()),
  /**
   * @changes erase selected text
   */
  d: editor => editor.mutateSelectedText(selection => selection.cut()),
  /**
   * @search select next match after each selection
   * @alt select previous match before each selection
   * @shift extend selection to match
   */
  '/': setSearchCommandState({}),
  // undocumented, because it's the equivalent of <shift-/>
  '?': setSearchCommandState({ extendSelection: true }),
  /**
   * @search select next match using the last used search pattern
   * @alt select previous match using the last used search pattern
   * @shift extend selection to match
   */
  n: setSearchSelectionUsingLastPattern(),
  // for some reason, alt-shift-n is not read as `n`, but as `N`
  N: setSearchSelectionUsingLastPattern({ extendSelection: true }),
}
