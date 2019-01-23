'use babel'

import { Range } from 'atom'
import { curry } from 'ramda'

import { getOccurencePosition } from './utils/occurence'
import { getActiveCursorsRanges } from './utils/index'

export default ({
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
      { startPoint: initRange.start, editor },
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

export const setSearchCommandState = curry(
  (config, editor, { instance, withAlt }) => {
    instance.updateSearchPattern({
      isActive: true,
      extendSelection: false,
      withAlt,
      searchSelectionsInitRanges: getActiveCursorsRanges(editor),
      ...config,
    })
  }
)
