const { createRunner } = require('atom-jasmine3-test-runner')

module.exports = createRunner({
  showEditor: true,
  specHelper: {
    attachToDom: true,
  },
})
