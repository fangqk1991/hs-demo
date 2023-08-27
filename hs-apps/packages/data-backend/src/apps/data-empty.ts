import * as http from 'http'
import { DataConfig } from '../DataConfig'

for (const port of [DataConfig.adminPort, DataConfig.openPort]) {
  http
    .createServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'text/plain' })
      response.end('PONG\n')
    })
    .listen(port)
}
