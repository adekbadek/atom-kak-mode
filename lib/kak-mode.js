'use babel'

import { CompositeDisposable } from 'atom'
import { mergeDeepRight, equals } from 'ramda'

import config from './config'
import { INIT_STATE, ATOM_TEXT_EDITOR, MODES } from './consts'
import { getStatusBar, updateStatusBar } from './status-bar'
import { getKeys } from './keys'
import { selectToMatch } from './commands/utils/occurence'
import { updateString } from './commands/utils/index'
import editorCommands from './commands/editor'
import selectionCommands from './commands/selection'
import { setSearchSelection } from './commands/search'
import updateEditorClass from './updateEditorClass.js'

export default {
  config,
  subscriptions: null,

  state: INIT_STATE,

  reset () {
    this.updateState(INIT_STATE)
  },

  updateState (update) {
    this.state = mergeDeepRight(this.state, update)
    this.statusBarElement && updateStatusBar(this.statusBarElement, this.state)
    updateEditorClass({
      state: this.state,
      editor: atom.workspace.getActiveTextEditor(),
    })
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
  updateSearchPattern (searchPattern) {
    this.updateState({ searchPattern })
  },
  resetSearchPattern () {
    this.updateSearchPattern({
      ...INIT_STATE.searchPattern,
      lastPattern: this.state.searchPattern.pattern,
    })
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
        const {
          mode,
          isGoToActive,
          selectToCharActiveInfo,
          searchPattern,
          count,
        } = this.state
        const editor = atom.workspace.getActiveTextEditor()

        const escapePressed = key === 'escape'
        const enterPressed = key === 'enter'

        const modifiers = {
          withShift: modifier === 'shift',
          withAlt: modifier === 'alt',
        }

        if (selectToCharActiveInfo) {
          selectToMatch(
            modifiers.withShift ? key.toUpperCase() : key,
            selectToCharActiveInfo
          )
          this.updateSelectToChar(false)
          return
        }

        if (searchPattern.isActive) {
          if (escapePressed || enterPressed) {
            this.resetSearchPattern()
          } else {
            this.updateSearchPattern({
              pattern: updateString(
                searchPattern.pattern,
                modifiers.withShift ? key.toUpperCase() : key
              ),
            })
            setSearchSelection(this.state.searchPattern)
            return
          }
        }

        if (equals(mode, MODES.INSERT)) {
          if (escapePressed) {
            this.changeModeToNormal()
          } else {
            // abortKeyBinding has to be called so that the event is propagated
            e.abortKeyBinding()
          }
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
            ...modifiers,
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

        if (escapePressed && count > 0) {
          this.updateCount(0)
        }

        // any command voids the goto state
        if (key !== 'g' && isGoToActive) {
          this.updateGoTo(false)
        }

        if (escapePressed) {
          // abortKeyBinding has to be called so that the event is propagated
          // escape should be propagated so that it's possible to close find panel
          e.abortKeyBinding()
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

    // handle events while in search mode
    const editor = atom.workspace.getActiveTextEditor()
    if (editor) {
      this.subscriptions.add(
        // if in search pattern mode, paste as search pattern
        // and prevent buffer paste
        editor.onWillInsertText(({ text, cancel }) => {
          if (this.state.searchPattern.isActive) {
            this.updateSearchPattern({
              pattern: text,
            })
            cancel()
          }
        }),
        editor.onDidAddCursor(({ id, selection }) => {
          if (this.state.searchPattern.isActive) {
            this.updateSearchPattern({
              searchSelectionsInitRanges: { [id]: selection.getBufferRange() },
            })
          }
        }),
        atom.workspace.onDidChangeActivePaneItem(() => {
          if (atom.config.get('kak-mode.goToNormalOnActivePaneChange')) {
            this.changeModeToNormal()
          }
        })
      )
    }

    this.updateState({}) // Ensure the editor is synced with the initial state
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
