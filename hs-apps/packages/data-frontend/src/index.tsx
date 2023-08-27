import ReactDOM from 'react-dom/client'
import React from 'react'
import { App } from './app/App'
import { AuthSdkHelper, SessionProvider } from '@fangcha/auth-react'

AuthSdkHelper.defaultRedirectUri = '/'

const app = ReactDOM.createRoot(document.getElementById('app')!)
app.render(
  <React.StrictMode>
    <SessionProvider>
      <App />
    </SessionProvider>
  </React.StrictMode>
)
