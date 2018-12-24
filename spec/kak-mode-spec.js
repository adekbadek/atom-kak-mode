'use babel'

import { MODES } from '../lib/consts'

describe('KakMode', () => {
  let workspaceElement, simulateKeys

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)

    simulateKeys = keys => keys.split().map(key => {
      const event = atom.keymaps.constructor.buildKeydownEvent('i', { target: document.activeElement })
      atom.keymaps.handleKeyboardEvent(event)
    })

    waitsForPromise(() => atom.workspace.open())
    waitsForPromise(() => atom.packages.activatePackage('status-bar'))
    waitsForPromise(() => atom.packages.activatePackage('kak-mode'))
  })

  describe('status bar', () => {
    it('displays mode and handles mode update', () => {
      const getStatusIndicator = () => workspaceElement.querySelector('kak-mode-status')
      expect(getStatusIndicator().innerText).toMatch(MODES.NORMAL.inStatusBar)
      simulateKeys('i')
      expect(getStatusIndicator().innerText).toMatch(MODES.INSERT.inStatusBar)
    })
  })
})
