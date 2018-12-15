const fs = require('fs')
const pug = require('pug')
const documentation = require('documentation')

const generateHTMLDocs = async () => {
  const docs = await documentation.build(['lib/**'], {})
  fs.writeFileSync(
    './docs/index.html',
    pug.renderFile('./docs/index.pug', { docs })
  )
}

generateHTMLDocs()
