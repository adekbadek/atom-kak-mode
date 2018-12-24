'use babel'

const otherKeys = ['enter', 'escape', 'backspace']

// keys that have their uppercase version command (so they should not have a shift-* binding)
export const uppercaseKeys = ['a', 'o', 'u']

const FROM = 32
const TO = 126
export const getKeys = () => [
  ...otherKeys,
  ...Array.from({ length: TO + 1 })
    .map((_, i) => i)
    .slice(FROM)
    .map(code => {
      const char = String.fromCharCode(code)
      return char === ' ' ? 'space' : char
    }),
]
