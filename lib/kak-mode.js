'use babel'

import { CompositeDisposable } from 'atom'
import { contains } from 'ramda'

import { ATOM_TEXT_EDITOR, MODES } from './consts'
import { getStatusBar, updateStatusBar } from './status-bar'
import { getKeys, uppercaseKeys } from './keys'
import {
  editorCommands,
  selectionCommands,
  cursorCommands,
} from './commands/index'

export default {
  subscriptions: null,

  state: {
    mode: MODES.NORMAL,
    count: 0,
    isGoToActive: false,
    gotoTooltipInfo: [],
  },

  updateState (update) {
    this.state = { ...this.state, ...update }
    updateStatusBar(this.statusBarElement, this.state)
  },

  updateGoTo (isGoToActive) {
    this.updateState({ isGoToActive })
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
        const { mode, isGoToActive } = this.state
        if (mode === MODES.INSERT) {
          // abortKeyBinding has to be called so that the event is propagated
          e.abortKeyBinding()
          key === 'escape' && this.changeModeToNormal()
        } else {
          const editor = atom.workspace.getActiveTextEditor()
          const dispatch = commandName => {
            const editorElement = atom.views.getView(
              atom.workspace.getActiveTextEditor()
            )
            atom.commands.dispatch(editorElement, commandName)
          }
          const commandAuxArg = {
            instance: this,
            modifier,
            editor,
            view: atom.views.getView(editor),
            dispatch,
            ...this.state,
          }

          const runCommands = (commands, getter) => {
            const command = commands[key]
            if (command) {
              if (getter) {
                editor[getter]().map(entity => command(entity, commandAuxArg))
              } else {
                command(editor, commandAuxArg)
              }
            }
          }

          runCommands(editorCommands)
          runCommands(cursorCommands, 'getCursors')
          runCommands(selectionCommands, 'getSelections')
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
          ...(!contains(char, uppercaseKeys) && {
            [`kak-mode:set-input-char-${char}-shift`]: getKeyHandler(
              char,
              'shift'
            ),
          }),
        })
      )
    )

    atom.keymaps.add('kak-mode', {
      [ATOM_TEXT_EDITOR]: {
        ...keys.reduce((acc, char) => {
          acc[char] = `kak-mode:set-input-char-${char}`
          if (!contains(char, uppercaseKeys)) {
            acc[`shift-${char}`] = `kak-mode:set-input-char-${char}-shift`
          }
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
