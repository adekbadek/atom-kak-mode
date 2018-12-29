'use babel'

import { TOOLTIP_INFO, CLASSNAMES } from './consts'

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

const getTooltip = body => ({
  title: body,
  html: true,
  trigger: 'manual',
  class: CLASSNAMES.tooltip,
})

const GOTO_COMMANDS_TOOLTIP = getTooltip(`
  <div>
    <table>
      <tbody>
        ${TOOLTIP_INFO.gotoCommands
    .map(
      ({ key, info }) => `
          <tr>
            <td>${key}:</td>
            <td>${info}</td>
          </tr>
        `
    )
    .join('')}
      </tbody>
    </table>
    <div class='kak-mode__tooltip__title'>goto</div>
  </div>
`)

const getTooltipHandler = content => {
  let tooltipThing = null
  return (isVisible, element) => {
    if (isVisible && (!tooltipThing || tooltipThing.disposed)) {
      tooltipThing = atom.tooltips.add(element, content)
    } else if (tooltipThing) {
      tooltipThing.dispose()
    }
  }
}

const gotoTooltipHandler = getTooltipHandler(GOTO_COMMANDS_TOOLTIP)
const selectToCharTooltipHandler = getTooltipHandler(
  getTooltip('enter char to select to')
)

export const updateStatusBar = (element, state) => {
  element.innerHTML = getStatusBarItemHTML(state)

  gotoTooltipHandler(state.isGoToActive, element)
  selectToCharTooltipHandler(state.selectToCharActiveInfo, element)

  return element
}
