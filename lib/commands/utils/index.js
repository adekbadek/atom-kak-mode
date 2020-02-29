'use babel'

import { last, init } from 'ramda'

export const isCursorAtBeginningOfSelection = cursor => {
  const selectionStart = cursor.selection.getBufferRange().start
  const cursorPosition = cursor.getBufferPosition()
  return selectionStart.row === cursorPosition.row && selectionStart.column === cursorPosition.column
}

export const getMovementCommand = type => (
  { cursor },
  { withShift, withAlt, isGoToActive }
) => {
  if (withShift) {
    cursor.selection[`select${type}`]()
  } else if (withAlt) {
    if (type === 'Down') {
      cursor.selection.addSelectionBelow()
    } else if (type === 'Up') {
      cursor.selection.addSelectionAbove()
    }
  } else {
    if (!isCursorAtBeginningOfSelection(cursor)) {
      cursor.moveLeft()
    }
    cursor[`move${type}`]()
    cursor.selection.selectRight()
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
  const lastRange = last(editor.getSelectedBufferRanges())
  editor.setSelectedBufferRanges([lastRange])
}

export const swapCase = string =>
  string
    .split('')
    .map(c => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
    .join('')

const isSingleChar = string => string.length === 1
export const updateString = (string, key) => {
  if (key === 'backspace') {
    return init(string)
  } else if (key === 'space') {
    return `${string} `
  } else if (isSingleChar(key)) {
    return `${string}${key}`
  }
}

export const getActiveCursorsRanges = editor =>
  editor.getCursors().reduce((acc, { selection, id }) => {
    acc[id] = selection.getBufferRange()
    return acc
  }, {})
