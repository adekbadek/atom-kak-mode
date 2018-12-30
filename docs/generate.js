const fs = require('fs')
const pug = require('pug')
const md = require('markdown-it')()
const documentation = require('documentation')

const packageInfo = require('../package.json')

const getTag = (tagName, tags) => tags.find(({ title }) => title === tagName)

const generateHTMLDocs = async () => {
  const docs = await documentation.build(['lib/**'], {})

  const getByTagName = (tagName, auxTagsNames = []) =>
    docs.reduce((acc, entry) => {
      const tag = getTag(tagName, entry.tags)
      const auxTags = auxTagsNames.map(name => getTag(name, entry.tags))
      if (tag) {
        acc.push({
          name: entry.name,
          description: tag.description,
          ...auxTags.reduce((acc, val) => {
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
      commands: getByTagName('normal', ['shift', 'alt', 'config']),
      auxCols: ['with shift', 'with alt', 'config'],
    },
    {
      name: 'goto commands',
      description: md.render(
        'Go to mode is activated by pressing `g` key - a menu will appear listing the possible moves.'
      ),
      commands: getByTagName('goto'),
    },
  ].map(v => ({ auxCols: [], ...v }))

  fs.writeFileSync(
    './docs/index.html',
    pug.renderFile('./docs/index.pug', { sections, packageInfo })
  )
}

generateHTMLDocs()
