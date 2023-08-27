import { TmplDemoConfig } from '../TmplDemoConfig'
import { GlobalAppConfig } from 'fc-config'
import { WebApp } from '@fangcha/backend-kit/lib/router'

const app = new WebApp({
  env: GlobalAppConfig.Env,
  tags: GlobalAppConfig.Tags,
  appName: 'tmpl-demo-open',
  wecomBotKey: TmplDemoConfig.wecomBotKey,
  routerOptions: {
    baseURL: TmplDemoConfig.openBaseURL,
    backendPort: TmplDemoConfig.openPort,
    basicAuthProtocol: {
      findVisitor: (username: string, password: string) => {
        return {
          visitorId: username,
          name: username,
          secrets: [password],
          permissionKeys: [],
          isEnabled: true,
        }
      },
    },
  },

  plugins: [],
  appDidLoad: async () => {},
})
app.launch()
