'use babel'

import { Point, Range } from 'atom'
import escapeStringRegexp from 'escape-string-regexp'

const getRegexp = string => {
  try {
    return new RegExp(string)
  } catch (e) {
    return false
  }
}

export const getOccurencePosition = (
  { toFind, next = true, allowRegExp },
  { startPoint, editor },
  callback
) => {
  if (typeof toFind !== 'string') {
    callback(null)
  }
  const regexpFromEscaped = new RegExp(escapeStringRegexp(toFind))
  const regexpFromLiteral = getRegexp(toFind)
  const regularExpression =
    allowRegExp && regexpFromLiteral ? regexpFromLiteral : regexpFromEscaped

  const buffer = editor.getBuffer()
  const rangeToScan = next
    ? new Range(startPoint, buffer.getEndPosition())
    : new Range([0, 0], startPoint)

  const foundMatch = buffer.getTextInRange(rangeToScan).match(regularExpression)
  if (foundMatch) {
    buffer[next ? 'scanInRange' : 'backwardsScanInRange'](
      regularExpression,
      rangeToScan,
      ({ range }) => callback(range)
    )
  } else {
    callback(null)
  }
}

export const selectToMatch = (key, config = {}) => {
  const editor = atom.workspace.getActiveTextEditor()
  editor.getSelections().map(selection => {
    getOccurencePosition(
      { toFind: key, next: !config.withAlt },
      { startPoint: selection.cursor.getScreenPosition(), editor },
      range => {
        if (range) {
          if (config.withFoundChar) {
            range = {
              start: new Point(range.start.row, range.start.column + 1),
            }
          }
          selection.selectToBufferPosition(range.start)
        }
      }
    )
  })
}
