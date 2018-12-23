'use babel'

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
export const getMovement = type => (cursor, { modifier }) => {
  if (modifier === 'shift') {
    cursor.selection[`select${type}`]()
  } else {
    cursor[`move${type}`]()
  }
}
export const getSelectionCommand = method => (selection, { modifier }) => {
  if (modifier !== 'shift') {
    selection.clear()
  }
  selection[method]()
}
