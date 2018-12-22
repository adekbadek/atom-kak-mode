'use babel'

export const getStatusBar = (state, statusBar) => {
  const element = document.createElement('kak-mode-status')
  element.classList.add('inline-block')
  const item = updateStatusBar(element, state)
  return {
    element: item,
    statusBar: statusBar.addLeftTile({ item, priority: 100 }),
  }
}

export const updateStatusBar = (element, state) => {
  const { mode, count } = state
  element.textContent = `${mode.inStatusBar}${count ? ` count: ${count}` : ''}`
  return element
}
