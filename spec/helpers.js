'use babel'

import { Range } from 'atom'
import { head, toPairs, flatten } from 'ramda'

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

const isUpperCaseLetter = char => !!char.match(/[A-Z]/)

const modifierKeyRegex = /(<\w*-[^>]>)/
const withModifierKeyRegex = new RegExp(`${modifierKeyRegex.source}|(\\w)`)

export const simulateKey = key => {
  // eslint-disable-next-line no-unused-vars
  let _, modifier
  if (key.match(modifierKeyRegex)) {
    ;[_, modifier, key] = key.match(/<(\w*)-([^>])>/)
  }

  const event = atom.keymaps.constructor.buildKeydownEvent(key, {
    target: document.activeElement,
    ...((isUpperCaseLetter(key) || modifier === 'shift') && {
      shift: true,
    }),
    ...(modifier === 'alt' && {
      alt: true,
    }),
  })
  atom.keymaps.handleKeyboardEvent(event)
}

export const simulateKeySequence = keys => {
  const keysWithModifers = keys
    .split(withModifierKeyRegex)
    .filter(v => !!v)
    .map(keys => (keys.match(withModifierKeyRegex) ? keys : keys.split('')))
  return flatten(keysWithModifers).map(simulateKey)
}

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

export const getCursorRange = editor =>
  head(editor.getCursors().map(({ selection }) => selection.getBufferRange()))

export const setCursorAtBeginning = editor =>
  editor
    .getCursors()
    .map(({ selection }) => selection.setBufferRange(new Range([0, 0], [0, 0])))
