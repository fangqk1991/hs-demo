const { WebpackBuilder } = require('@fangcha/webpack')

const config = require('fc-config').GlobalAppConfig

module.exports = new WebpackBuilder()
  .useReact()
  .setDevMode(true)
  .setPort(config.TmplDemo.adminFrontendPort)
  .setEntry('./src/index.tsx')
  .setExtras({
    devServer: {
      proxy: {
        '/api': `http://localhost:${config.TmplDemo.adminPort}`,
      },
    },
  })
  .build()
