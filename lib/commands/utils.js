'use babel'

import { Point, Range } from 'atom'
import { last } from 'ramda'
import escapeStringRegexp from 'escape-string-regexp'

import { times } from '../utils'

export const withCount = fn => (editor, aux) => {
  const command = () => fn(editor, aux)
  if (aux.count) {
    times(aux.count).map(_ => command())
    aux.instance.updateCount(0)
  } else {
    command()
  }
}

export const withGoto = (withGotoFn, config = {}, defaultFn) => (
  entity,
  aux
) => {
  const { removeMultipleSelections } = config
  if (aux.isGoToActive) {
    if (withGotoFn) {
      if (removeMultipleSelections) {
        removeAllSelectionsButLast(aux.editor)
      }
      withGotoFn(entity, {
        ...aux,
        ...(removeMultipleSelections && {
          // getCursorScreenPosition will return the position of the last added cursor
          lastCursor: aux.editor.getCursorAtScreenPosition(
            aux.editor.getCursorScreenPosition()
          ),
        }),
      })
    }
  } else {
    defaultFn && defaultFn(entity, aux)
  }
}

export const withoutGoto = fn => withGoto(null, {}, fn)

export const getMovementCommand = type => (
  { cursor },
  { withShift, isGoToActive }
) => {
  if (withShift) {
    cursor.selection[`select${type}`]()
  } else {
    cursor[`move${type}`]()
  }
}

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

export const getSelectionCommand = method => (
  selection,
  { withShift, withAlt, editor }
) => {
  !withShift && selection.clear()

  // handle beginning of line
  if (method === 'selectToPreviousWordBoundary') {
    const { start, end } = selection.getBufferRange()
    if (start.column === 0 && end.column === 0 && start.row > 0) {
      selection.cursor.moveLeft()
    }
  }

  selection[method]()
}

export const removeAllSelectionsButLast = editor => {
  const selections = editor.getSelectedBufferRanges()
  const lastSelection = last(selections)
  editor.setSelectedBufferRanges([lastSelection])
  return lastSelection
}
