'use babel'

import { last } from 'ramda'

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

export const swapCase = string =>
  string
    .split('')
    .map(c => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
    .join('')
