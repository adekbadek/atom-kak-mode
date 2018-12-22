'use babel'

import { Range } from 'atom'
import { last, values, keys, flatten, zipObj } from 'ramda'

import { times } from './utils'

const withCount = fn => (editor, aux) => {
  const command = () => fn(editor, aux)
  if (aux.count) {
    times(aux.count).map(_ => command())
    aux.instance.updateCount(0)
  } else {
    command()
  }
}

export const editorCommands = {
  /**
   * change mode to insert
   */
  i: (_, { instance }) => instance.changeModeToInsert(),
  /**
   * undo last change
   */
  u: withCount(editor => editor.undo()),
  /**
   * redo last change
   */
  U: withCount(editor => editor.redo()),
  /**
   * paste yanked text after selection
   */
  p: withCount(editor => editor.pasteText()),
  /**
   * remove all selections except main
   */
  space: editor => {
    const selections = editor.getSelectedBufferRanges()
    if (selections.length > 1) {
      editor.setSelectedBufferRanges([last(selections)])
    }
  },
  // just for docs
  /** set count */
  '1-9': () => {},
  ...times(10).reduce((acc, i) => {
    acc[i] = (_, { instance }) => {
      const count = parseInt(`${instance.state.count}${i}`)
      instance.updateCount(count)
    }
    return acc
  }, {}),
}
const getMovement = type => (cursor, { modifier }) => {
  if (modifier === 'shift') {
    cursor.selection[`select${type}`]()
  } else {
    cursor[`move${type}`]()
  }
}

export const cursorCommands = {
  /**
   * move down
   * @shift extend selecton down
   */
  j: withCount(getMovement('Down')),
  /**
   * move up
   * @shift extend selecton up
   */
  k: withCount(getMovement('Up')),
  /**
   * move left
   * @shift extend selecton to left
   */
  h: withCount(getMovement('Left')),
  /**
   * move right
   * @shift extend selecton to right
   */
  l: withCount(getMovement('Right')),
  /**
   * select to next matching character
   * @shift extend selecton to next matching character
   */
  m: (cursor, { editor, modifier }) => {
    const MATCHING_PAIRS = {
      '(': ')',
      '{': '}',
      '[': ']',
      '<': '>',
    }
    const [opening, closing] = [keys(MATCHING_PAIRS), values(MATCHING_PAIRS)]
    const allMatchingChars = flatten([opening, closing])
    const getEscapedChar = char => `${'\\'}${char}`
    const getCharsRegex = chars => new RegExp(chars.map(getEscapedChar).join('|'))
    const matchingPairsForLookup = { ...MATCHING_PAIRS, ...zipObj(closing, opening) }

    const buffer = editor.getBuffer()
    const rangeAfterCursor = new Range(cursor.getScreenPosition(), buffer.getEndPosition())

    buffer.scanInRange(getCharsRegex(allMatchingChars), rangeAfterCursor, ({ range, matchText }) => {
      const isOpening = MATCHING_PAIRS[matchText]
      const targetPosition = range[isOpening ? 'start' : 'end']
      if (isOpening && modifier === 'shift') {
        cursor.selection.selectToBufferPosition(targetPosition)
      } else {
        cursor.setBufferPosition(targetPosition)
      }
      const matchingChar = matchingPairsForLookup[matchText]
      const method = isOpening ? 'scanInRange' : 'backwardsScanInRange'
      const scanRange = isOpening ? new Range(range.end, buffer.getEndPosition()) : new Range([0, 0], range.start)

      let unbalancedChars = 0
      buffer[method](
        new RegExp(getCharsRegex([matchText, matchingPairsForLookup[matchText]]), 'g'),
        scanRange,
        ({ range, matchText, stop }) => {
          if (matchText === matchingChar) {
            if (unbalancedChars === 0) {
              stop()
              cursor.selection.selectToBufferPosition(range[isOpening ? 'end' : 'start'])
            }
            unbalancedChars--
          } else {
            unbalancedChars++
          }
        })
    })
  },

  // TODO: with multiple cursors it creates as many lines
  /**
   * insert at line end
   */
  A: (cursor, { instance }) => {
    cursor.moveToEndOfLine()
    instance.changeModeToInsert()
  },
  /**
   * insert on new line below
   * @difference if used with count, kak would add cursor at beginning of each created line
   */
  o: withCount((cursor, { editor, instance }) => {
    editor.insertNewlineBelow()
    instance.changeModeToInsert()
  }),
  /**
   * insert on new line above
   * @difference if used with count, kak would add cursor at beginning of each created line
   */
  O: withCount((cursor, { editor, instance }) => {
    editor.insertNewlineAbove()
    instance.changeModeToInsert()
  }),
}

const getSelectionCommand = method => (selection, { modifier }) => {
  if (modifier !== 'shift') {
    selection.clear()
  }
  selection[method]()
}
export const selectionCommands = {
  /**
   * select to next word start
   * @shift extend selecton to next word start
   */
  w: withCount(getSelectionCommand('selectToBeginningOfNextWord')),
  /**
   * select to next word end
   * @shift extend selecton to next word end
   */
  e: withCount(getSelectionCommand('selectToEndOfWord')),
  /**
   * select to previous word start
   * @shift extend selecton to previous word start
   */
  b: withCount(getSelectionCommand('selectToPreviousWordBoundary')),
  /**
   * erase selected text
   */
  d: selection => selection.cut(),
  /**
   * change selected text (erase and enter insert mode)
   */
  c: (selection, { instance }) => {
    selection.cut()
    instance.changeModeToInsert()
  },
  /**
   * select line
   * @shift extend selecton to next line
   */
  x: withCount(getSelectionCommand('selectLine')),
  /**
   * yank selected text
   */
  y: selection => selection.copy(),
  /**
   * erase selected text (or the character before cursor) or modify count
   */
  backspace: (selection, { instance }) => {
    const count = instance.state.count
    if (count.length) {
      instance.updateCount(count.substring(0, count.length - 1))
    } else {
      if (selection.isEmpty()) {
        selection.selectLeft()
      }
      selection.delete()
    }
  },
}
