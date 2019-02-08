'use babel'

import {
  DEFAULT_MATCHING_PAIRS,
  DEFAULT_MATCHING_CHARS,
} from './commands/matchingCharCommand'

const asCode = string => `\`${string}\``

export default {
  matchingChars: {
    title: `Matching chars for ${asCode('m')} command`,
    description: `Opening characters for matching pairs.
    ${Object.keys(DEFAULT_MATCHING_PAIRS)
    .map(asCode)
    .join(', ')} are possible`,
    type: 'array',
    default: DEFAULT_MATCHING_CHARS,
    items: {
      type: 'string',
    },
  },
  goToNormalOnActivePaneChange: {
    title: `Change mode to normal on changing active pane`,
    description: 'Useful when your need a nudge to stay in normal mode.',
    type: 'boolean',
    default: true,
  },
}
