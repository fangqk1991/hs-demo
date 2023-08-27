import { ChromeFilled, CrownFilled } from '@ant-design/icons'
import { Route } from '@ant-design/pro-layout/es/typing'

export const MyMenu: Route = {
  path: '/',
  children: [
    {
      name: '数据管理',
      children: [
        {
          path: '/v1/table',
          name: '数据表',
        },
      ],
    },
  ],
}
