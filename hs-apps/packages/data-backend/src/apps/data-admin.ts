import { DataConfig } from '../DataConfig'
import { GlobalAppConfig } from 'fc-config'
import { WebApp } from '@fangcha/backend-kit/lib/router'
import { SsoSdkPlugin } from '@fangcha/web-auth-sdk'
import { UserSdkPlugin } from '@fangcha/user-sdk'
import { DataSpecDocItems } from './admin/specs/DataSpecDocItems'

const app = new WebApp({
  env: GlobalAppConfig.Env,
  tags: GlobalAppConfig.Tags,
  appName: 'data-admin',
  wecomBotKey: DataConfig.wecomBotKey,
  frontendConfig: DataConfig.adminFrontendConfig,
  routerOptions: {
    baseURL: DataConfig.adminBaseURL,
    backendPort: DataConfig.adminPort,
    jwtProtocol: {
      jwtKey: 'data_token_jwt',
      jwtSecret: DataConfig.adminJwtSecret,
    },
  },
  mainDocItems: DataSpecDocItems,
  plugins: [
    SsoSdkPlugin({
      ssoAuth: DataConfig.adminSSO,
      jwtOptions: {
        jwtKey: 'data_token_jwt',
        jwtSecret: DataConfig.adminJwtSecret,
      },
    }),
    UserSdkPlugin(DataConfig.userService),
  ],
  checkHealth: async () => {},
})
app.launch()
