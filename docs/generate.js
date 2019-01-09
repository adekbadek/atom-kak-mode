const fs = require('fs')
const pug = require('pug')
const md = require('markdown-it')()
const documentation = require('documentation')
const R = require('ramda')

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

  const getSection = (name, { tagName, description } = {}) => {
    const commands = getByTagName(tagName || name, ['shift', 'alt', 'config'])
    return {
      name: `${name} commands`,
      commands,
      description,
      auxCols: [
        ...(R.any(R.prop('shift'), commands) ? ['with shift'] : []),
        ...(R.any(R.prop('alt'), commands) ? ['with alt'] : []),
        ...(R.any(R.prop('config'), commands) ? ['config'] : []),
      ],
    }
  }

  const sections = [
    getSection('movement'),
    getSection('changes'),
    getSection('selections'),
    getSection('search', {
      description: md.render(
        `Searching is triggered with \`/\` key - the search pattern input will be displayed in the status bar. Either a regular expression or a string can be entered.
        If the regular expression is invalid, is will be treated as a query string.`
      ),
    }),
    {
      name: 'goto commands',
      description: md.render(
        'Go to mode is activated with `g` key - a menu will appear listing the possible moves.'
      ),
      commands: getByTagName('goto'),
    },
    getSection('other'),
  ].map(v => ({ auxCols: [], ...v }))

  fs.writeFileSync(
    './docs/index.html',
    pug.renderFile('./docs/index.pug', { sections, packageInfo })
  )
}

generateHTMLDocs()
