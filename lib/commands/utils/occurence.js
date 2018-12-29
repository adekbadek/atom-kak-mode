'use babel'

import { Point, Range } from 'atom'
import escapeStringRegexp from 'escape-string-regexp'

const getOccurencePosition = (
  { toFind, next = true },
  { selection, editor },
  callback
) => {
  const regexp =
    typeof toFind === 'string' ? new RegExp(escapeStringRegexp(toFind)) : toFind

  const buffer = editor.getBuffer()
  const rangeAhead = new Range(
    selection.cursor.getScreenPosition(),
    buffer.getEndPosition()
  )

  const hasWhiteSpaceInRange = buffer.getTextInRange(rangeAhead).match(regexp)
  if (hasWhiteSpaceInRange) {
    buffer.scanInRange(regexp, rangeAhead, ({ range }) => callback(range.start))
  } else {
    callback(null)
  }
}

export const selectToMatch = (key, config = {}) => {
  const editor = atom.workspace.getActiveTextEditor()
  editor.getSelections().map(selection => {
    getOccurencePosition({ toFind: key }, { selection, editor }, position => {
      if (position) {
        if (config.withFoundChar) {
          position = new Point(position.row, position.column + 1)
        }
        selection.selectToBufferPosition(position)
      }
    })
  })
}
