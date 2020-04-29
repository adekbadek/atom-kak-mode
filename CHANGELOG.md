# [1.11.0](https://github.com/adekbadek/atom-kak-mode/compare/v1.10.1...v1.11.0) (2020-04-29)


### Features

* go to line feature ([a65c2c6](https://github.com/adekbadek/atom-kak-mode/commit/a65c2c6)), closes [#18](https://github.com/adekbadek/atom-kak-mode/issues/18)

## [1.10.1](https://github.com/adekbadek/atom-kak-mode/compare/v1.10.0...v1.10.1) (2020-04-29)


### Bug Fixes

* **cursor:** apply styling to workspace editors only ([3e02f58](https://github.com/adekbadek/atom-kak-mode/commit/3e02f58))
* abort key hijacking if no active editor ([a9c1325](https://github.com/adekbadek/atom-kak-mode/commit/a9c1325)), closes [#19](https://github.com/adekbadek/atom-kak-mode/issues/19)

# [1.10.0](https://github.com/adekbadek/atom-kak-mode/compare/v1.9.0...v1.10.0) (2020-04-26)


### Features

* use block cursor in normal mode ([#22](https://github.com/adekbadek/atom-kak-mode/issues/22)) ([40f6a5e](https://github.com/adekbadek/atom-kak-mode/commit/40f6a5e)), closes [#8](https://github.com/adekbadek/atom-kak-mode/issues/8)

# [1.9.0](https://github.com/adekbadek/atom-kak-mode/compare/v1.8.0...v1.9.0) (2019-02-08)


### Features

* propagate escape key press ([c249c19](https://github.com/adekbadek/atom-kak-mode/commit/c249c19))
* **settings:** go to normal on pane change setting ([a4dbb5b](https://github.com/adekbadek/atom-kak-mode/commit/a4dbb5b))

# [1.8.0](https://github.com/adekbadek/atom-kak-mode/compare/v1.7.1...v1.8.0) (2019-01-30)


### Features

* add cursors on <alt-k>, <alt-j> ([0fc8418](https://github.com/adekbadek/atom-kak-mode/commit/0fc8418))

## [1.7.1](https://github.com/adekbadek/atom-kak-mode/compare/v1.7.0...v1.7.1) (2019-01-30)


### Bug Fixes

* fixes removing cursors on mode change ([3663657](https://github.com/adekbadek/atom-kak-mode/commit/3663657)), closes [#6](https://github.com/adekbadek/atom-kak-mode/issues/6)

# [1.7.0](https://github.com/adekbadek/atom-kak-mode/compare/v1.6.0...v1.7.0) (2019-01-24)


### Bug Fixes

* **select-to-char:** handle uppercase ([b7796b3](https://github.com/adekbadek/atom-kak-mode/commit/b7796b3))


### Features

* **count:** improvements ([79a247a](https://github.com/adekbadek/atom-kak-mode/commit/79a247a))
* **search:** handle last pattern search (n key) ([2bfcbe1](https://github.com/adekbadek/atom-kak-mode/commit/2bfcbe1))
* %, ~, ` keys handling (select all, case changes) ([d429940](https://github.com/adekbadek/atom-kak-mode/commit/d429940))
* <, > keys handling; better d, c ([ad96b5b](https://github.com/adekbadek/atom-kak-mode/commit/ad96b5b))
* set up search command; update status bar ([ee52113](https://github.com/adekbadek/atom-kak-mode/commit/ee52113))

# [1.6.0](https://github.com/adekbadek/atom-kak-mode/compare/v1.5.0...v1.6.0) (2018-12-30)


### Features

* ; key handling - clearing selection ([a9e51a6](https://github.com/adekbadek/atom-kak-mode/commit/a9e51a6))
* f,t - handle alt modifier key ([9aaf862](https://github.com/adekbadek/atom-kak-mode/commit/9aaf862))
* f,t keys handling - selecting to matching chars ([8eb07f3](https://github.com/adekbadek/atom-kak-mode/commit/8eb07f3))

# [1.5.0](https://github.com/adekbadek/atom-kak-mode/compare/v1.4.0...v1.5.0) (2018-12-29)


### Bug Fixes

* **o:** o/O inserting multiple newlines ([574ebaf](https://github.com/adekbadek/atom-kak-mode/commit/574ebaf)), closes [#4](https://github.com/adekbadek/atom-kak-mode/issues/4)


### Features

* **config:** enables configuration of chars handled by m command ([9492744](https://github.com/adekbadek/atom-kak-mode/commit/9492744))
* **y:** if none selected, copy line ([a578274](https://github.com/adekbadek/atom-kak-mode/commit/a578274))

# [1.4.0](https://github.com/adekbadek/atom-kak-mode/compare/v1.3.1...v1.4.0) (2018-12-29)


### Features

* **goto:** handle shift ([490f961](https://github.com/adekbadek/atom-kak-mode/commit/490f961))

## [1.3.1](https://github.com/adekbadek/atom-kak-mode/compare/v1.3.0...v1.3.1) (2018-12-24)


### Bug Fixes

* **b:** handle empty line ([2a5752e](https://github.com/adekbadek/atom-kak-mode/commit/2a5752e)), closes [#5](https://github.com/adekbadek/atom-kak-mode/issues/5)

# [1.3.0](https://github.com/adekbadek/atom-kak-mode/compare/v1.2.1...v1.3.0) (2018-12-24)


### Bug Fixes

* **test:** update test files ([98eec69](https://github.com/adekbadek/atom-kak-mode/commit/98eec69))


### Features

* **docs:** improves docs; adds docs for goto ([8e6f7a4](https://github.com/adekbadek/atom-kak-mode/commit/8e6f7a4))
* adds goto (g key) command handling ([695f353](https://github.com/adekbadek/atom-kak-mode/commit/695f353)), closes [#2](https://github.com/adekbadek/atom-kak-mode/issues/2)

## [1.2.1](https://github.com/adekbadek/atom-kak-mode/compare/v1.2.0...v1.2.1) (2018-12-23)


### Bug Fixes

* **count:** fixes count bugs ([dcb7229](https://github.com/adekbadek/atom-kak-mode/commit/dcb7229))

# [1.2.0](https://github.com/adekbadek/atom-kak-mode/compare/v1.1.0...v1.2.0) (2018-12-23)


### Features

* adds counts ([cbfc1fe](https://github.com/adekbadek/atom-kak-mode/commit/cbfc1fe)), closes [#3](https://github.com/adekbadek/atom-kak-mode/issues/3)
* **m:** better m command ([fab4e85](https://github.com/adekbadek/atom-kak-mode/commit/fab4e85))

# [1.1.0](https://github.com/adekbadek/atom-kak-mode/compare/v1.0.0...v1.1.0) (2018-12-15)


### Features

* **key:** add space key handling ([3760a1d](https://github.com/adekbadek/atom-kak-mode/commit/3760a1d))

# 1.0.0 (2018-12-15)


### Features

* initial commit - POC ([edbdfb6](https://github.com/adekbadek/atom-kak-mode/commit/edbdfb6))
