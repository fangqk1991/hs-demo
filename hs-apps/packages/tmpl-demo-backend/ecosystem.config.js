const { makeRunningConfig } = require('fc-config/config.utils')
const path = require('path')
const rootDir = path.resolve(__dirname, '../..')

let appList = [
  {
    name: 'tmpl-demo-admin',
    script: `${rootDir}/packages/tmpl-demo-backend/dist/tmpl-demo-admin.js`,
    error_file: '/data/logs/tmpl-demo/tmpl-demo-admin-err.log',
    out_file: '/data/logs/tmpl-demo/tmpl-demo-admin-out.log',
    exec_mode: 'fork',
    listen_timeout: 10000,
    log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
    env: {
      CODE_VERSION: 'COMMIT_SHA',
      NODE_ENV: 'development',
      NODE_CONFIG_ENV: 'development',
    },
    env_staging: {
      NODE_ENV: 'staging',
      NODE_CONFIG_ENV: 'staging',
    },
    env_production: {
      NODE_ENV: 'production',
      NODE_CONFIG_ENV: 'production',
    },
  },
  {
    name: 'tmpl-demo-open',
    script: `${rootDir}/packages/tmpl-demo-backend/dist/tmpl-demo-open.js`,
    error_file: '/data/logs/tmpl-demo/tmpl-demo-open-err.log',
    out_file: '/data/logs/tmpl-demo/tmpl-demo-open-out.log',
    exec_mode: 'fork',
    listen_timeout: 10000,
    log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
    env: {
      CODE_VERSION: 'COMMIT_SHA',
      NODE_ENV: 'development',
      NODE_CONFIG_ENV: 'development',
    },
    env_staging: {
      NODE_ENV: 'staging',
      NODE_CONFIG_ENV: 'staging',
    },
    env_production: {
      NODE_ENV: 'production',
      NODE_CONFIG_ENV: 'production',
    },
  },
]

const config = makeRunningConfig()
if (config.TmplDemo.onlyStatic) {
  appList = [
    {
      name: 'tmpl-demo-empty',
      script: `${rootDir}/packages/tmpl-demo-backend/dist/tmpl-demo-empty.js`,
      error_file: '/data/logs/tmpl-demo/tmpl-demo-empty-err.log',
      out_file: '/data/logs/tmpl-demo/tmpl-demo-empty-out.log',
      exec_mode: 'fork',
      listen_timeout: 10000,
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
      env: {
        CODE_VERSION: 'COMMIT_SHA',
        NODE_ENV: 'development',
        NODE_CONFIG_ENV: 'development',
      },
      env_staging: {
        NODE_ENV: 'staging',
        NODE_CONFIG_ENV: 'staging',
      },
      env_production: {
        NODE_ENV: 'production',
        NODE_CONFIG_ENV: 'production',
      },
    },
  ]
}

module.exports = {
  apps: appList,
}
