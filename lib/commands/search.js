'use babel'

import { Range } from 'atom'
import { curry } from 'ramda'

import { getOccurencePosition } from './utils/occurence'
import { getActiveCursorsRanges } from './utils/index'

/**
 * finds occurence of pattern
 * and sets the selection to found range in the buffer
 */
export const setSearchSelection = ({
  searchSelectionsInitRanges,
  pattern,
  withAlt,
  extendSelection,
}) => {
  const editor = atom.workspace.getActiveTextEditor()
  editor.getCursors().map(({ id, selection }, i) => {
    const initRange = searchSelectionsInitRanges[id]
    if (!initRange) {
      return
    }
    if (pattern.length === 0) {
      selection.setBufferRange(initRange)
    }
    const selectNextOccurence = !withAlt
    getOccurencePosition(
      { toFind: pattern, next: selectNextOccurence, allowRegExp: true },
      { startPoint: initRange[selectNextOccurence ? 'end' : 'start'], editor },
      range => {
        if (range) {
          if (extendSelection) {
            if (selectNextOccurence) {
              range = new Range(initRange.start, range.end)
            } else {
              range = new Range(range.start, initRange.end)
            }
          }
          selection.setBufferRange(range)
        } else {
          selection.setBufferRange(initRange)
        }
      }
    )
  })
}

/**
 * for the `/` key commmand
 */
export const setSearchCommandState = curry(
  (config, editor, { instance, withAlt, withShift }) => {
    const updatedSearchPatternState = {
      isActive: true,
      extendSelection: withShift || false,
      withAlt,
      searchSelectionsInitRanges: getActiveCursorsRanges(editor),
      ...config,
    }
    instance.updateSearchPattern(updatedSearchPatternState)
    return updatedSearchPatternState
  }
)

/**
 * for the `n` key command
 */
export const setSearchSelectionUsingLastPattern = (config = {}) => (
  editor,
  auxArguments
) => {
  const { searchPattern } = auxArguments.instance.state
  if (searchPattern.lastPattern) {
    const updatedSearchPatternState = setSearchCommandState(
      {
        pattern: searchPattern.lastPattern,
        isActive: false,
        ...config,
      },
      editor,
      auxArguments
    )
    setSearchSelection(updatedSearchPatternState)
    auxArguments.instance.resetSearchPattern()
  }
}
