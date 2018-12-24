module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/github',
    '@semantic-release/apm',
  ],
  prepare: [
    '@semantic-release/changelog',
    '@semantic-release/apm',
    {
      path: '@semantic-release/git',
      assets: ['package.json', 'package-lock.json', 'CHANGELOG.md'],
      message:
        // eslint-disable-next-line no-template-curly-in-string
        'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    },
  ],
}
