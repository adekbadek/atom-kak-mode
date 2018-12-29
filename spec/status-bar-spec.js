'use babel'

import { MODES } from '../lib/consts'
import { simulateKeySequence, initWorkspace } from './helpers'

describe('status bar', () => {
  let workspaceElement, mainModule

  beforeEach(async () => {
    ;({ workspaceElement, mainModule } = await initWorkspace())
  })

  describe('status bar', () => {
    it('displays mode and handles mode update', () => {
      const getStatusIndicator = () =>
        workspaceElement.querySelector('kak-mode-status')
      expect(getStatusIndicator().innerText.trim()).toBe(
        MODES.NORMAL.inStatusBar
      )
      expect(mainModule.state.mode).toBe(MODES.NORMAL)
      simulateKeySequence('i')
      expect(getStatusIndicator().innerText.trim()).toBe(
        MODES.INSERT.inStatusBar
      )
      expect(mainModule.state.mode).toBe(MODES.INSERT)
    })
  })
})
