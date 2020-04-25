'use babel'

const updateEditorClass = ({ state, workspaceElement }) => {
  workspaceElement.classList.remove('kak-mode-normal')
  workspaceElement.classList.remove('kak-mode-insert')

  if (state.mode.name === 'NORMAL') {
    workspaceElement.classList.add('kak-mode-normal')
  }
  if (state.mode.name === 'INSERT') {
    workspaceElement.classList.add('kak-mode-insert')
  }
}

export default updateEditorClass
