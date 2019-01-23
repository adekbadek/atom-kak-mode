'use babel'

export const MODES = {
  NORMAL: {
    name: 'NORMAL',
    inStatusBar: 'N',
  },
  INSERT: {
    name: 'INSERT',
    inStatusBar: 'I',
  },
}

export const ATOM_TEXT_EDITOR = 'atom-text-editor:not([mini])'

export const TOOLTIP_INFO = {
  gotoCommands: [
    { key: 'g,k', info: 'buffer top' },
    { key: 'l', info: 'line end' },
    { key: 'h', info: 'line begin' },
    { key: 'i', info: 'line non blank start' },
    { key: 'j', info: 'begin of last line' },
    { key: 'e', info: 'end of last line' },
    { key: 't', info: 'window top' },
    { key: 'b', info: 'window bottom' },
    { key: 'c', info: 'window center' },
    { key: 'f', info: 'file' },
    { key: 'a', info: 'buffer' },
  ],
}

export const INIT_STATE = {
  mode: MODES.NORMAL,
  count: 0,
  searchPattern: {
    isActive: false,
    searchSelectionsInitRanges: null,
    pattern: '',
  },
  isGoToActive: false,
  selectToCharActiveInfo: false,
  gotoTooltipInfo: [],
}

export const CLASSNAMES = {
  tooltip: 'kak-mode__tooltip',
}
