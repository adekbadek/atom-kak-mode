'use babel'

import { simulateKeySequence, initWorkspace, mapTests } from './helpers'

describe('changes', () => {
  const text = `text is here`
  let buffer

  beforeEach(async () => {
    await initWorkspace()
    buffer = atom.workspace.getActiveTextEditor().getBuffer()
    buffer.setText(text)
  })

  mapTests(
    {
      'o inserts new line below': `${text}\n`,
      'O inserts new line below': `\n${text}`,
    },
    ({ keyStroke, expectation, description }) => {
      it(description, () => {
        simulateKeySequence(keyStroke)
        expect(buffer.getText()).toBe(expectation)
      })
    }
  )
})
