const fs = require('fs')
const pug = require('pug')
const documentation = require('documentation')

const getTag = (tagName, tags) => tags.find(({ title }) => title === tagName)

const generateHTMLDocs = async () => {
  const docs = await documentation.build(['lib/**'], {})

  const getByTagName = (tagName, auxTags = []) => docs.reduce((acc, entry) => {
    const tag = getTag(tagName, entry.tags)
    const lol = auxTags.map(name => getTag(name, entry.tags))
    if (tag) {
      acc.push({
        name: entry.name,
        description: tag.description,
        ...lol.reduce((acc, val) => {
          val && (acc[val.title] = val.description)
          return acc
        }, {}),
      })
    }
    return acc
  }, [])

  const sections = [
    {
      name: 'normal mode commands',
      commands: getByTagName('normal', ['shift']),
      auxCols: ['with shift'],
    },
    {
      name: 'goto commands',
      commands: getByTagName('goto'),
      auxCols: [],
    },
  ]

  fs.writeFileSync(
    './docs/index.html',
    pug.renderFile('./docs/index.pug', { sections })
  )
}

generateHTMLDocs()
