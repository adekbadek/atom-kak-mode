'use babel'

const updateEditorClass = ({ state }) => {
  atom.workspace.getTextEditors().map(editor => {
    editor.component.element.classList.remove('kak-mode-normal')
    editor.component.element.classList.remove('kak-mode-insert')

    if (state.mode.name === 'NORMAL') {
      editor.component.element.classList.add('kak-mode-normal')
    }
    if (state.mode.name === 'INSERT') {
      editor.component.element.classList.add('kak-mode-insert')
    }
  })
}

export default updateEditorClass
