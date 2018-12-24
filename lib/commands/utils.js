'use babel'

import { last } from 'ramda'

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
  { modifier, isGoToActive }
) => {
  if (modifier === 'shift') {
    cursor.selection[`select${type}`]()
  } else {
    cursor[`move${type}`]()
  }
}

export const getSelectionCommand = method => (selection, { modifier }) => {
  if (method === 'selectToPreviousWordBoundary') {
    const { start, end } = selection.getBufferRange()
    if (start.column === 0 && end.column === 0 && start.row > 0) {
      selection.cursor.moveLeft()
    }
  }
  if (modifier !== 'shift') {
    selection.clear()
  }
  selection[method]()
}

export const removeAllSelectionsButLast = editor => {
  const selections = editor.getSelectedBufferRanges()
  const lastSelection = last(selections)
  editor.setSelectedBufferRanges([lastSelection])
  return lastSelection
}
