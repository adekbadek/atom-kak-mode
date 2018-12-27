'use babel'

import { toPairs } from 'ramda'

export const initWorkspace = async () => {
  const workspaceElement = atom.views.getView(atom.workspace)
  workspaceElement.style.height = '400px'
  jasmine.attachToDOM(workspaceElement)

  await atom.workspace.open()
  await atom.packages.activatePackage('kak-mode')
  await atom.packages.activatePackage('status-bar')

  const mainModule = atom.packages.getActivePackage('kak-mode').mainModule
  mainModule.reset()
  return { workspaceElement, mainModule }
}

export const simulateKey = key => {
  const event = atom.keymaps.constructor.buildKeydownEvent(key, {
    target: document.activeElement,
  })
  atom.keymaps.handleKeyboardEvent(event)
}

export const simulateKeySequence = keys => keys.split('').map(simulateKey)

export const getFirstCursorPosition = () => {
  const editor = atom.workspace.getActiveTextEditor()
  return {
    row: editor.getCursors()[0].getBufferPosition().row,
    column: editor.getCursors()[0].getBufferPosition().column,
  }
}

/**
 * Iterates over a test object.
 * The key of the test object should be formatted as:
 * `<keystroke> <description>`
 * The value of the test object should be the expectation, which
 * will be passed to the function supplied as the second argument.
 *
 * @private
 */
export const mapTests = (tests, fn) => {
  toPairs(tests).map(([description, expectation]) => {
    const [keyStroke, ...desc] = description.split(' ')
    fn({ keyStroke, expectation, description: desc.join(' ') })
  })
}
