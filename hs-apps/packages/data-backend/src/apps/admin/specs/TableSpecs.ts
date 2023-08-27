import { SpecFactory } from '@fangcha/router'
import { TableApis } from '@web/data-common/admin-api'
import { DataTable } from '../../../models/extensions/DataTable'
import { FangchaSession } from '@fangcha/session'
import { DataSpecHandler } from '../../../services/DataSpecHandler'

const factory = new SpecFactory('Tables')

factory.prepare(TableApis.TablePageDataGet, async (ctx) => {
  ctx.body = await DataTable.getPageResult(ctx.request.query)
})

factory.prepare(TableApis.TableCreate, async (ctx) => {
  const session = ctx.session as FangchaSession
  const feed = await DataTable.generateTable({
    ...ctx.request.body,
    author: session.curUserStr(),
  })
  ctx.body = feed.modelForClient()
})

factory.prepare(TableApis.TableInfoGet, async (ctx) => {
  await new DataSpecHandler(ctx).handleTable(async (table) => {
    ctx.body = table.modelForClient()
  })
})

factory.prepare(TableApis.TableUpdate, async (ctx) => {
  const session = ctx.session as FangchaSession
  await new DataSpecHandler(ctx).handleTable(async (table) => {
    await table.updateInfos({
      ...ctx.request.body,
      author: session.curUserStr(),
    })
    ctx.body = table.modelForClient()
  })
})

factory.prepare(TableApis.TableDelete, async (ctx) => {
  const session = ctx.session as FangchaSession
  await new DataSpecHandler(ctx).handleTable(async (table) => {
    table.fc_edit()
    table.isDeleted = 1
    table.updateAuthor = session.curUserStr()
    await table.updateToDB()
    ctx.status = 200
  })
})

export const TableSpecs = factory.buildSpecs()
