import { TmplDemoConfig } from '../TmplDemoConfig'
import { GlobalAppConfig } from 'fc-config'
import { WebApp } from '@fangcha/backend-kit/lib/router'
import { SsoSdkPlugin } from '@fangcha/web-auth-sdk'

const app = new WebApp({
  env: GlobalAppConfig.Env,
  tags: GlobalAppConfig.Tags,
  appName: 'tmpl-demo-admin',
  wecomBotKey: TmplDemoConfig.wecomBotKey,
  frontendConfig: TmplDemoConfig.adminFrontendConfig,
  routerOptions: {
    baseURL: TmplDemoConfig.adminBaseURL,
    backendPort: TmplDemoConfig.adminPort,
    jwtProtocol: {
      jwtKey: 'tmpl-demo_token_jwt',
      jwtSecret: TmplDemoConfig.adminJwtSecret,
    },
  },
  plugins: [
    SsoSdkPlugin({
      ssoAuth: TmplDemoConfig.adminSSO,
      jwtOptions: {
        jwtKey: 'tmpl-demo_token_jwt',
        jwtSecret: TmplDemoConfig.adminJwtSecret,
      },
    }),
  ],
  checkHealth: async () => {},
})
app.launch()
