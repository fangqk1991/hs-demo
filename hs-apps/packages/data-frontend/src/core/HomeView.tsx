import React, { useEffect, useState } from 'react'
import { MyRequest, useVisitorCtx } from '@fangcha/auth-react'
import { Divider } from 'antd'
import { RetainedHealthApis } from '@fangcha/app-models'

export const HomeView: React.FC = () => {
  const visitorCtx = useVisitorCtx()
  const [appInfo, setAppInfo] = useState({
    env: '',
    tags: [],
    codeVersion: '',
    runningMachine: '',
  })

  useEffect(() => {
    ;(async () => {
      setAppInfo(await MyRequest(RetainedHealthApis.SystemInfoGet).quickSend())
    })()
  }, [])

  return (
    <div>
      <h3>运行信息</h3>
      <ul className='mt-3'>
        <li>版本: {appInfo.codeVersion}</li>
        <li>环境: {appInfo.env}</li>
        <li>主机: {appInfo.runningMachine}</li>
      </ul>
      <Divider />
      <h3>用户信息</h3>
      <pre>{JSON.stringify(visitorCtx.userInfo, null, 2)}</pre>
      <Divider />
      <a href={'/api-docs/v1/data'} target={'_blank'}>
        点击查看 API 文档
      </a>
    </div>
  )
}
