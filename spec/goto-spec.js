'use babel'

import { last } from 'ramda'

import { CLASSNAMES } from '../lib/consts'
import {
  simulateKey,
  simulateKeySequence,
  initWorkspace,
  getFirstCursorPosition,
  mapTests,
} from './helpers'

describe('KakMode', () => {
  const text = `text
  some more text
  then even more text
  and more text
  here`
  const lines = text.split('\n')
  const lastTextLine = last(lines)
  let mainModule

  beforeEach(async () => {
    ;({ mainModule } = await initWorkspace())
    const buffer = atom.workspace.getActiveTextEditor().getBuffer()
    buffer.setText(text)
  })

  it('show and hides goto menu', () => {
    expect(document.querySelector(CLASSNAMES.tooltip)).toBe(null)
    expect(mainModule.state.isGoToActive).toEqual(false)
    simulateKeySequence('g')
    expect(mainModule.state.isGoToActive).toEqual(true)
    expect(document.querySelector(CLASSNAMES.tooltip)).toBeDefined()
    simulateKey('escape')
    expect(document.querySelector(CLASSNAMES.tooltip)).toBe(null)
    expect(mainModule.state.isGoToActive).toEqual(false)
  })

  it('begins with the cursor at buffer end position', () => {
    expect(getFirstCursorPosition()).toEqual({
      row: lines.length - 1,
      column: lastTextLine.length,
    })
  })

  mapTests(
    {
      'gg goes to top': {
        row: 0,
        column: 0,
      },
      'gk goes to top': {
        row: 0,
        column: 0,
      },
      'gl goes to line end': {
        row: lines.length - 1,
        column: lastTextLine.length,
      },
      'gh goes to line begin': {
        row: lines.length - 1,
        column: 0,
      },
      'gi goes to line non blank start': {
        row: lines.length - 1,
        column: 2,
      },
      'gj goes to begin of last line': {
        row: lines.length - 1,
        column: 0,
      },
      'ge goes to end of last line': {
        row: lines.length - 1,
        column: lastTextLine.length,
      },
      'gt goes to window top': {
        row: 0,
        column: 0,
      },
      'gb goes to window bottom': {
        row: lines.length - 1,
        column: 0,
      },
      'gc goes to window center': {
        row: Math.floor(lines.length / 2),
        column: 0,
      },
    },
    ({ keyStroke, expectation, description }) => {
      it(description, () => {
        simulateKeySequence(keyStroke)
        expect(getFirstCursorPosition()).toEqual(expectation)
      })
    }
  )
})
