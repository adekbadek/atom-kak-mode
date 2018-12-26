'use babel'

export const initWorkspace = async () => {
  const workspaceElement = atom.views.getView(atom.workspace)
  jasmine.attachToDOM(workspaceElement)

  await atom.workspace.open()
  await atom.packages.activatePackage('kak-mode')
  await atom.packages.activatePackage('status-bar')

  const mainModule = atom.packages.getActivePackage('kak-mode').mainModule
  mainModule.reset()
  return { workspaceElement, mainModule }
}

export const simulateKeys = keys =>
  keys.split().map(key => {
    const event = atom.keymaps.constructor.buildKeydownEvent(key, {
      target: document.activeElement,
    })
    atom.keymaps.handleKeyboardEvent(event)
  })
