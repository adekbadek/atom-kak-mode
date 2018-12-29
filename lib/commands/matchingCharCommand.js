'use babel'

import { Range } from 'atom'
import { values, keys, flatten, zipObj, pick, isEmpty } from 'ramda'

import { showError } from '../helpers'

export const DEFAULT_MATCHING_CHARS = ['(', '{', '[', '<']

const MATCHING_CHARS_FROM_CONFIG = atom.config.get('kak-mode.matchingChars')
const MATCHING_CHARS = MATCHING_CHARS_FROM_CONFIG || DEFAULT_MATCHING_CHARS

export const DEFAULT_MATCHING_PAIRS = {
  '(': ')',
  '{': '}',
  '[': ']',
  '<': '>',
}
const MATCHING_PAIRS = pick(MATCHING_CHARS, DEFAULT_MATCHING_PAIRS)

const [opening, closing] = [keys(MATCHING_PAIRS), values(MATCHING_PAIRS)]
const ALL_MATCHING_CHARS = flatten([opening, closing])
const getEscapedChar = char => `${'\\'}${char}`
const getCharsRegex = chars => new RegExp(chars.map(getEscapedChar).join('|'))
const MATCHING_PAIRS_FOR_LOOKUP = {
  ...MATCHING_PAIRS,
  ...zipObj(closing, opening),
}

export default ({ cursor }, { editor, withShift }) => {
  if (isEmpty(MATCHING_PAIRS)) {
    showError(`Invalid \`matchingChars\` option. Supplied:`, {
      detail: MATCHING_CHARS_FROM_CONFIG.join(', '),
    })
  }
  const buffer = editor.getBuffer()
  const rangeAfterCursor = new Range(
    cursor.getScreenPosition(),
    buffer.getEndPosition()
  )

  buffer.scanInRange(
    getCharsRegex(ALL_MATCHING_CHARS),
    rangeAfterCursor,
    ({ range, matchText }) => {
      const isOpening = MATCHING_PAIRS[matchText]
      const targetPosition = range[isOpening ? 'start' : 'end']
      if (isOpening && withShift) {
        cursor.selection.selectToBufferPosition(targetPosition)
      } else {
        cursor.setBufferPosition(targetPosition)
      }
      const matchingChar = MATCHING_PAIRS_FOR_LOOKUP[matchText]
      const method = isOpening ? 'scanInRange' : 'backwardsScanInRange'
      const scanRange = isOpening
        ? new Range(range.end, buffer.getEndPosition())
        : new Range([0, 0], range.start)

      let unbalancedChars = 0
      buffer[method](
        new RegExp(
          getCharsRegex([matchText, MATCHING_PAIRS_FOR_LOOKUP[matchText]]),
          'g'
        ),
        scanRange,
        ({ range, matchText, stop }) => {
          if (matchText === matchingChar) {
            if (unbalancedChars === 0) {
              stop()
              cursor.selection.selectToBufferPosition(
                range[isOpening ? 'end' : 'start']
              )
            }
            unbalancedChars--
          } else {
            unbalancedChars++
          }
        }
      )
    }
  )
}
