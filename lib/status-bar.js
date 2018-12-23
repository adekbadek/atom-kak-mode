'use babel'

import { TOOLTIP_INFO } from './consts'

export const getStatusBar = (state, statusBar) => {
  const element = document.createElement('kak-mode-status')
  element.classList.add('inline-block')
  const item = updateStatusBar(element, state)
  return {
    element: item,
    statusBar: statusBar.addLeftTile({ item, priority: 0 }),
  }
}

const getStatusBarItemHTML = ({ mode, count }) => `
  <div>
    ${mode.inStatusBar}
    ${count ? ` count: ${count}` : ''}
  </div>
`
const GOTO_COMMANDS_TOOLTIP = {
  title: `
    <div>
      <table>
        <tbody>
          ${TOOLTIP_INFO.gotoCommands.map(({ key, info }) => `
            <tr>
              <td>${key}:</td>
              <td>${info}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class='kak-mode__tooltip__title'>goto</div>
    </div>
  `,
  html: true,
  trigger: 'manual',
  class: 'kak-mode__tooltip',
}

let goToTooltip = null
export const updateStatusBar = (element, state) => {
  element.innerHTML = getStatusBarItemHTML(state)

  if (state.isGoToActive) {
    if (!goToTooltip || goToTooltip.disposed) {
      goToTooltip = atom.tooltips.add(element, GOTO_COMMANDS_TOOLTIP)
    }
  } else {
    goToTooltip && goToTooltip.dispose()
  }

  return element
}
