import { Context } from 'koa'
import assert from '@fangcha/assert'
import { FangchaSession } from '@fangcha/session'
import { DataPermissionKey, DataStatus, M_DataInfo } from '@web/data-common/models'
import { DataTable } from '../models/extensions/DataTable'
import { TableDataHandler } from './TableDataHandler'

export class DataSpecHandler {
  public readonly ctx: Context

  public constructor(ctx: Context) {
    this.ctx = ctx
  }

  private _table!: DataTable
  public async prepareTable() {
    if (!this._table) {
      const ctx = this.ctx
      const table = await DataTable.findTable(ctx.params.tableId)
      assert.ok(!!table, `数据表 [tableId = ${ctx.params.tableId}] 不存在`)

      this._table = table
    }
    return this._table
  }

  private _data!: M_DataInfo
  public async prepareData() {
    if (!this._data) {
      const ctx = this.ctx
      const table = await this.prepareTable()

      const dataInfo = await new TableDataHandler(table).getDataRecord(ctx.params.dataId)
      assert.ok(!!dataInfo, `数据 [dataId = ${ctx.params.dataId}] 不存在`)

      this._data = dataInfo
    }
    return this._data
  }

  public async handleTable(handler: (table: DataTable) => Promise<void>) {
    const table = await this.prepareTable()
    await handler(table)
  }

  public async handleData(handler: (dataInfo: M_DataInfo, table: DataTable) => Promise<void>) {
    const table = await this.prepareTable()
    const dataInfo = await this.prepareData()
    await handler(dataInfo, table)
  }

  public async handleDataReviewing(handler: (dataInfo: M_DataInfo, table: DataTable) => Promise<void>) {
    const session = this.ctx.session as FangchaSession

    const table = await this.prepareTable()
    const dataInfo = await this.prepareData()
    switch (dataInfo.data_status) {
      case DataStatus.Creating:
        session.assertVisitorHasPermission(DataPermissionKey.Data_Approval_Create)
        break
      case DataStatus.Updating:
        session.assertVisitorHasPermission(DataPermissionKey.Data_Approval_Update)
        break
      case DataStatus.Deleting:
        session.assertVisitorHasPermission(DataPermissionKey.Data_Approval_Delete)
        break
    }
    await handler(dataInfo, table)
  }
}
