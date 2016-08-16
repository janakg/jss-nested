const assign = require('lodash.assign')
const webpackConfig = require('./webpack.config')

module.exports = (config) => {
  config.set({
    browsers: ['Chrome', 'Firefox', 'Safari'],
    frameworks: ['mocha'],
    files: ['tests-src.webpack.js'],
    preprocessors: {
      'tests-src.webpack.js': ['webpack', 'sourcemap']
    },
    webpack: assign(webpackConfig, {
      devtool: 'inline-source-map'
    }),
    webpackServer: {
      noInfo: true
    },
    reporters: ['mocha', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      file: 'coverage.json',
      type: 'json'
    }
  })
}
