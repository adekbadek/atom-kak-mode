'use babel'

import { CompositeDisposable } from 'atom'

import config from './config'
import { INIT_STATE, ATOM_TEXT_EDITOR, MODES } from './consts'
import { getStatusBar, updateStatusBar } from './status-bar'
import { getKeys } from './keys'
import { selectToMatch } from './commands/utils/occurence'
import editorCommands from './commands/editor'
import selectionCommands from './commands/selection'

export default {
  config,
  subscriptions: null,

  state: INIT_STATE,

  reset () {
    this.updateState(INIT_STATE)
  },

  updateState (update) {
    this.state = { ...this.state, ...update }
    updateStatusBar(this.statusBarElement, this.state)
  },

  updateGoTo (isGoToActive) {
    this.updateState({ isGoToActive })
  },
  updateSelectToChar (selectToCharActiveInfo) {
    this.updateState({ selectToCharActiveInfo })
  },

  updateCount (count) {
    this.updateState({ count })
  },

  changeModeToInsert () {
    this.updateState({ mode: MODES.INSERT })
    this.updateCount(0)
  },
  changeModeToNormal () {
    this.updateState({ mode: MODES.NORMAL })
  },

  activate (state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

    const getKeyHandler = (key, modifier) => ({
      hiddenInCommandPalette: true,
      didDispatch: e => {
        const { mode, isGoToActive, selectToCharActiveInfo } = this.state
        const editor = atom.workspace.getActiveTextEditor()

        if (selectToCharActiveInfo) {
          selectToMatch(key, selectToCharActiveInfo)
          this.updateSelectToChar(false)
          return
        }

        if (mode === MODES.INSERT) {
          // abortKeyBinding has to be called so that the event is propagated
          e.abortKeyBinding()
          key === 'escape' && this.changeModeToNormal()
        } else {
          const dispatch = commandName => {
            const editorElement = atom.views.getView(
              atom.workspace.getActiveTextEditor()
            )
            atom.commands.dispatch(editorElement, commandName)
          }
          const commandAuxArg = {
            instance: this,
            modifier,
            withShift: modifier === 'shift',
            withAlt: modifier === 'alt',
            editor,
            view: atom.views.getView(editor),
            dispatch,
            ...this.state,
          }

          const runCommands = (commands, selections) => {
            const command = commands[key]
            if (command) {
              if (selections) {
                selections.map(selection => command(selection, commandAuxArg))
              } else {
                command(editor, commandAuxArg)
              }
            }
          }

          runCommands(editorCommands)
          runCommands(selectionCommands, editor.getSelections())
        }

        // any command voids the goto state
        if (key !== 'g' && isGoToActive) {
          this.updateGoTo(false)
        }
      },
    })

    const keys = getKeys()

    this.subscriptions.add(
      ...keys.map(char =>
        atom.commands.add(ATOM_TEXT_EDITOR, {
          [`kak-mode:set-input-char-${char}`]: getKeyHandler(char),
          [`kak-mode:set-input-char-${char}-shift`]: getKeyHandler(
            char,
            'shift'
          ),
          [`kak-mode:set-input-char-${char}-alt`]: getKeyHandler(char, 'alt'),
        })
      )
    )

    atom.keymaps.add('kak-mode', {
      [ATOM_TEXT_EDITOR]: {
        ...keys.reduce((acc, char) => {
          acc[char] = `kak-mode:set-input-char-${char}`
          acc[`shift-${char}`] = `kak-mode:set-input-char-${char}-shift`
          acc[`alt-${char}`] = `kak-mode:set-input-char-${char}-alt`
          return acc
        }, {}),
      },
    })
  },

  deactivate () {
    this.subscriptions.dispose()
    this.deactivateStatusBar && this.deactivateStatusBar()
  },

  serialize () {
    return {
      kakModeState: this.state,
    }
  },

  consumeStatusBar (statusBar) {
    const { statusBarTile, element } = getStatusBar(this.state, statusBar)
    this.statusBarTile = statusBarTile
    this.statusBarElement = element

    this.deactivateStatusBar = () => {
      this.statusBarTile && this.statusBarTile.destroy()
      this.statusBarTile = null
    }
  },
}
