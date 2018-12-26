'use babel'

import { MODES } from '../lib/consts'
import { simulateKeys, initWorkspace } from './helpers'

describe('KakMode', () => {
  let workspaceElement, mainModule

  beforeEach(async () => {
    ;({ workspaceElement, mainModule } = await initWorkspace())
  })

  describe('status bar', () => {
    it('displays mode and handles mode update', () => {
      const getStatusIndicator = () =>
        workspaceElement.querySelector('kak-mode-status')
      expect(getStatusIndicator().innerText.trim()).toEqual(
        MODES.NORMAL.inStatusBar
      )
      expect(mainModule.state.mode).toEqual(MODES.NORMAL)
      simulateKeys('i')
      expect(getStatusIndicator().innerText.trim()).toEqual(
        MODES.INSERT.inStatusBar
      )
      expect(mainModule.state.mode).toEqual(MODES.INSERT)
    })
  })
})
