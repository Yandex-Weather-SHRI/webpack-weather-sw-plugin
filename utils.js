'use strict'

const crypto = require('crypto')
const { resolve } = require('path')
const minimatch = require('minimatch')


function getSource(source) {
  return {
    source() {
      return source
    },
    size() {
      return Buffer.byteLength(source, 'utf8')
    },
  }
}


function getAssetsList(defaultAssets, assets, patternsAssets) {
  return defaultAssets.concat(Object.keys(assets))
    .map(assetName => resolve('/', assetName))
    .filter((assetName) => patternsAssets.some(name => minimatch(assetName, name)))
}

function assetsAdapter(assets) {
  return assets.map(fileName => `'${resolve('/', fileName)}'`).join(',\n  ');
}

function createVersionHash(list) {
  const hash = crypto.createHash('md5')
  const content = list.sort().join('')
  hash.update(content)
  return hash.digest('hex').slice(0, 10)
}

module.exports = {
  getSource,
  getAssetsList,
  assetsAdapter,
  createVersionHash,
}
