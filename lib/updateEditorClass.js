'use babel'

const updateEditorClass = ({ state, editor }) => {
  editor.element.classList.remove('kak-mode-normal')
  editor.element.classList.remove('kak-mode-insert')

  if (state.mode.name === 'NORMAL') { editor.element.classList.add('kak-mode-normal') }
  if (state.mode.name === 'INSERT') { editor.element.classList.add('kak-mode-insert') }
}

export default updateEditorClass
