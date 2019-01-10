'use babel'

import { times } from '../../helpers'
import { removeAllSelectionsButLast } from './index'

export const withCount = fn => (entity, aux) => {
  const command = () => fn(entity, aux)
  if (aux.count) {
    // transact batches the commands into one undo/redo step
    aux.editor.transact(() => {
      times(aux.count).map(_ => command())
    })
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
