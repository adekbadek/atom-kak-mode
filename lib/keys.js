'use babel'

const otherKeys = ['enter', 'escape', 'backspace']

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
