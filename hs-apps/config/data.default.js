module.exports = {
  Data: {
    configVersion: '0.0.0',
    onlyStatic: false,
    adminFrontendPort: 5399,
    adminBaseURL: 'http://localhost:5399',
    adminPort: 5400,
    adminJwtSecret: '<Data Random 32>',
    openPort: 5300,
    openBaseURL: 'http://localhost:5300',
    adminSSO: {
      baseURL: 'https://sso.staging.fangcha.net',
      clientId: '<clientId>',
      clientSecret: '<clientSecret>',
      authorizePath: '/api/v1/oauth/authorize',
      tokenPath: '/api/v1/oauth/token',
      logoutPath: '/api/v1/logout',
      scope: 'basic',
      callbackUri: 'http://localhost:5399/api-302/auth-sdk/v1/handle-sso',
      userInfoURL: 'https://sso.staging.fangcha.net/api/v1/oauth/user-info',
    },
    adminFrontendConfig: {
      appName: 'Data Demo',
      // colorPrimary: 'rgb(221 115 164)',
    },
    dataDB: {
      host: '127.0.0.1',
      port: 3306,
      database: 'hs_data',
      username: 'root',
      password: '',
      dialect: 'mysql',
      timezone: '+08:00',
      logging: false,
    },
    userService: {
      urlBase: '<urlBase>',
      username: '<username>',
      password: '<password>',
    },
  },
}
