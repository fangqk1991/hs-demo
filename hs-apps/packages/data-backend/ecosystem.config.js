const { makeRunningConfig } = require('fc-config/config.utils')
const path = require('path')
const rootDir = path.resolve(__dirname, '../..')

let appList = [
  {
    name: 'data-admin',
    script: `${rootDir}/packages/data-backend/dist/data-admin.js`,
    error_file: '/data/logs/data/data-admin-err.log',
    out_file: '/data/logs/data/data-admin-out.log',
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
    name: 'data-open',
    script: `${rootDir}/packages/data-backend/dist/data-open.js`,
    error_file: '/data/logs/data/data-open-err.log',
    out_file: '/data/logs/data/data-open-out.log',
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
if (config.Data.onlyStatic) {
  appList = [
    {
      name: 'data-empty',
      script: `${rootDir}/packages/data-backend/dist/data-empty.js`,
      error_file: '/data/logs/data/data-empty-err.log',
      out_file: '/data/logs/data/data-empty-out.log',
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
