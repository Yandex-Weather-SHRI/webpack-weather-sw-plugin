'use strict'

const fs = require('fs')
const { resolve } = require('path')
const template = require('lodash.template')

const { getSource, getAssetsList, assetsAdapter, createVersionHash } = require('./utils')


class WebpackWeatherSWPlugin {
  constructor(options) {
    this.options = Object.assign({}, {
      defaultAssets: ['/'],
    }, options)
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      fs.readFile(resolve(__dirname, 'template.js'), 'utf-8', (error, content) => {
        const { defaultAssets, patternsAssets, name } = this.options
        const assetsList = getAssetsList(defaultAssets, compilation.assets, patternsAssets)
        const assets = assetsAdapter(assetsList)
        const version = createVersionHash(assetsList)
        const templateCompiler = template(content)
        const compiledTemplate = templateCompiler({ version, assets })

        compilation.assets[name] = getSource(compiledTemplate)
        callback()
      })
    })
  }
}

module.exports = {
  WebpackWeatherSWPlugin,
}
