import { SpecFactory } from '@fangcha/router'
import { DataRecordApis } from '@web/data-common/admin-api'
import { DataSpecHandler } from '../../../services/DataSpecHandler'
import { TableDataHandler } from '../../../services/TableDataHandler'
import { DataFieldHelper, DataPermissionKey } from '@web/data-common/models'
import { FangchaSession } from '@fangcha/session'

const factory = new SpecFactory('Records')

factory.prepare(DataRecordApis.RecordPageDataGet, async (ctx) => {
  await new DataSpecHandler(ctx).handleTable(async (table) => {
    ctx.body = await new TableDataHandler(table).getPageResult(ctx.request.query)
  })
})

factory.prepare(DataRecordApis.RecordExcelExport, async (ctx) => {
  await new DataSpecHandler(ctx).handleTable(async (table) => {
    const items = await new TableDataHandler(table).getAllDataItems(ctx.request.query)
    const filename = encodeURIComponent(`${table.name}-数据.xlsx`)
    ctx.set('Content-disposition', `attachment; filename=${filename}`)
    ctx.body = await DataFieldHelper.makeExcelBuffer(table.fieldItems(), items, true)
  })
})

factory.prepare(DataRecordApis.BatchRecordsPut, async (ctx) => {
  const session = ctx.session as FangchaSession
  await new DataSpecHandler(ctx).handleTable(async (table) => {
    await new TableDataHandler(table).bulkUpsertRecords(ctx.request.body, {
      author: session.curUserStr(),
      canInsert: session.checkVisitorHasPermission(DataPermissionKey.Data_Approval_Create),
      canUpdate: session.checkVisitorHasPermission(DataPermissionKey.Data_Approval_Update),
    })
    ctx.status = 200
  })
})

factory.prepare(DataRecordApis.BatchRecordsPass, async (ctx) => {
  const session = ctx.session as FangchaSession
  await new DataSpecHandler(ctx).handleTable(async (table) => {
    const handler = new TableDataHandler(table)
    const items = await handler.getReviewingRecords({
      Creating: session.checkVisitorHasPermission(DataPermissionKey.Data_Approval_Create),
      Updating: session.checkVisitorHasPermission(DataPermissionKey.Data_Approval_Update),
      Deleting: session.checkVisitorHasPermission(DataPermissionKey.Data_Approval_Delete),
    })
    await handler.passRecordsBatch(items)
    ctx.status = 200
  })
})

factory.prepare(DataRecordApis.BatchRecordsReject, async (ctx) => {
  const session = ctx.session as FangchaSession
  await new DataSpecHandler(ctx).handleTable(async (table) => {
    const handler = new TableDataHandler(table)
    const items = await handler.getReviewingRecords({
      Creating: session.checkVisitorHasPermission(DataPermissionKey.Data_Approval_Create),
      Updating: session.checkVisitorHasPermission(DataPermissionKey.Data_Approval_Update),
      Deleting: session.checkVisitorHasPermission(DataPermissionKey.Data_Approval_Delete),
    })
    await handler.rejectRecordsBatch(items)
    ctx.status = 200
  })
})

factory.prepare(DataRecordApis.RecordCreate, async (ctx) => {
  const session = ctx.session as FangchaSession
  await new DataSpecHandler(ctx).handleTable(async (table) => {
    ctx.body = await new TableDataHandler(table).createRecord(ctx.request.body, {
      withoutAudit: session.checkVisitorHasPermission(DataPermissionKey.Data_Approval_Create),
      author: session.curUserStr(),
    })
  })
})

factory.prepare(DataRecordApis.RecordInfoGet, async (ctx) => {
  await new DataSpecHandler(ctx).handleTable(async (table) => {
    ctx.body = await new TableDataHandler(table).getDataRecord(ctx.params.dataId)
  })
})

factory.prepare(DataRecordApis.RecordUpdate, async (ctx) => {
  const session = ctx.session as FangchaSession
  await new DataSpecHandler(ctx).handleData(async (dataInfo, table) => {
    ctx.body = await new TableDataHandler(table).updateDataRecord(dataInfo, ctx.request.body, {
      withoutAudit: session.checkVisitorHasPermission(DataPermissionKey.Data_Approval_Update),
      author: session.curUserStr(),
    })
  })
})

factory.prepare(DataRecordApis.RecordDelete, async (ctx) => {
  const session = ctx.session as FangchaSession
  await new DataSpecHandler(ctx).handleData(async (dataInfo, table) => {
    const dataStatus = await new TableDataHandler(table).deleteDataRecord(dataInfo, {
      withoutAudit: session.checkVisitorHasPermission(DataPermissionKey.Data_Approval_Delete),
      author: session.curUserStr(),
    })
    ctx.body = {
      dataStatus: dataStatus,
    }
  })
})

factory.prepare(DataRecordApis.RecordAuditPass, async (ctx) => {
  await new DataSpecHandler(ctx).handleDataReviewing(async (dataInfo, table) => {
    await new TableDataHandler(table).passAuditData(dataInfo)
    ctx.status = 200
  })
})

factory.prepare(DataRecordApis.RecordAuditReject, async (ctx) => {
  await new DataSpecHandler(ctx).handleDataReviewing(async (dataInfo, table) => {
    await new TableDataHandler(table).rejectAuditData(dataInfo)
    ctx.status = 200
  })
})

factory.prepare(DataRecordApis.RecordIdPageDataGet, async (ctx) => {
  await new DataSpecHandler(ctx).handleTable(async (table) => {
    const pageResult = await new TableDataHandler(table).getPageResult(ctx.request.query, ['data_id'])
    ctx.body = {
      totalCount: pageResult.totalCount,
      dataIdList: pageResult.items.map((item) => item.data_id),
    }
  })
})

export const DataRecordSpecs = factory.buildSpecs()
