import * as http from 'http'
import { TmplDemoConfig } from '../TmplDemoConfig'

for (const port of [TmplDemoConfig.adminPort, TmplDemoConfig.openPort]) {
  http
    .createServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'text/plain' })
      response.end('PONG\n')
    })
    .listen(port)
}
