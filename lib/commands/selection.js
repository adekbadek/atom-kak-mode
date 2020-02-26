'use babel'

import matchingCharCommand from './matchingCharCommand'
import { getMovementCommand, getSelectionCommand, isCursorAtBeginningOfSelection } from './utils/index'
import { withCount, withGoto, withoutGoto } from './utils/decorators'

// selection commands will be triggered for each selection

export default {
  /**
   * @movement move down
   * @shift extend selection down
   */
  j: withoutGoto(withCount(getMovementCommand('Down'))),
  /**
   * @movement move up
   * @shift extend selection up
   */
  k: withCount(getMovementCommand('Up')),
  /**
   * @movement move left
   * @shift extend selection to left
   * @goto go to line begin
   */
  h: withGoto(
    (selection, { withShift }) => {
      withShift
        ? selection.selectToBeginningOfLine()
        : selection.cursor.moveToBeginningOfLine()
    },
    {},
    withCount(getMovementCommand('Left'))
  ),
  /**
   * @movement move right
   * @shift extend selection to right
   * @goto go to line end
   */
  l: withGoto(
    (selection, { withShift }) => {
      withShift
        ? selection.selectToEndOfLine()
        : selection.cursor.moveToEndOfLine()
    },
    {},
    withCount(getMovementCommand('Right'))
  ),
  /**
   * @goto go to non blank line start
   */
  i: withGoto((selection, { withShift }) => {
    withShift
      ? selection.selectToFirstCharacterOfLine()
      : selection.cursor.moveToFirstCharacterOfLine()
  }),
  /**
   * @selections select to next matching character
   * @shift extend selection to next matching character
   * @config matchingChars
   */
  m: matchingCharCommand,
  /**
   * @selections -
   * @shift insert at line end
   */
  a: ({ cursor }, { instance, withShift }) => {
    if (withShift) {
      cursor.moveToEndOfLine()
      instance.changeModeToInsert()
    }
  },
  /**
   * @movement select to next word start
   * @shift extend selection to next word start
   */
  w: withCount(getSelectionCommand('selectToBeginningOfNextWord')),
  /**
   * @movement select to next word end
   * @shift extend selection to next word end
   */
  e: withoutGoto(withCount(getSelectionCommand('selectToEndOfWord'))),
  /**
   * @movement select to previous word start
   * @shift extend selection to previous word start
   */
  b: withoutGoto(
    withCount(getSelectionCommand('selectToPreviousWordBoundary'))
  ),
  /**
   * @selections select line
   * @shift extend selection to next line
   */
  x: withCount(getSelectionCommand('selectLine')),
  /**
   * @changes erase selected text (or the character before cursor) or modify count
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
  /**
   * @selections reduce selections to their cursor
   */
  ';': selection => {
    // TODO: this is a bit hacky. We should really _set_ the selection to what we
    // want. (This approach also has the side effect of constantly swapping the
    // cursor if the ';' button is hit repeatedly)
    const cursorAtBeginningOfSelection = isCursorAtBeginningOfSelection(selection.cursor)
    selection.clear()
    if (cursorAtBeginningOfSelection) selection.selectRight()
    else selection.selectLeft()
  },
}
