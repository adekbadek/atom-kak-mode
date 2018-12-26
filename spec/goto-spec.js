'use babel'

import { CLASSNAMES } from '../lib/consts'
import { simulateKeys, initWorkspace } from './helpers'

describe('KakMode', () => {
  let mainModule

  beforeEach(async () => {
    ;({ mainModule } = await initWorkspace())
  })

  it('displays goto menu', () => {
    expect(document.querySelector(CLASSNAMES.tooltip)).toBe(null)
    expect(mainModule.state.isGoToActive).toEqual(false)
    simulateKeys('g')
    expect(mainModule.state.isGoToActive).toEqual(true)
    expect(document.querySelector(CLASSNAMES.tooltip)).toBeDefined()
  })
})
