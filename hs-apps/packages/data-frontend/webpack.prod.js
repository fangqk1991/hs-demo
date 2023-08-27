const { WebpackBuilder } = require('@fangcha/webpack')

module.exports = new WebpackBuilder()
  .useReact()
  .setDevMode(false)
  .setPublicPath('/')
  // .setPublicPath(config.DataDev.cdnURLBase)
  .setEntry('./src/index.tsx')
  // .setExtras({
  //   optimization: {
  //     minimize: false,
  //   },
  // })
  .build()
