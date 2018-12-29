'use babel'

export const times = length => Array.from({ length }).map((v, i) => i)

export const showError = (message, options = {}) => {
  atom.notifications.addError(`kak-mode: ${message}`, options)
}
