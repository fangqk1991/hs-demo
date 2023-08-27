import { Context } from 'koa'
import { Logger } from 'log4js'

declare module 'koa' {
  interface Context {
    session: any
    logger: Logger
  }
}

declare module 'koa-joi-router' {
  interface Spec {
    skipAuth?: boolean
  }
}
