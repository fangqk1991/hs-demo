import { DataConfig } from '../DataConfig'
import { GlobalAppConfig } from 'fc-config'
import { WebApp } from '@fangcha/backend-kit/lib/router'

const app = new WebApp({
  env: GlobalAppConfig.Env,
  tags: GlobalAppConfig.Tags,
  appName: 'data-open',
  wecomBotKey: DataConfig.wecomBotKey,
  routerOptions: {
    baseURL: DataConfig.openBaseURL,
    backendPort: DataConfig.openPort,
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
