import { DataTable } from '../models/extensions/DataTable'
import { FilterOptions } from 'fc-feed'
import { makeUUID, PageResult } from '@fangcha/tools'
import {
  __SystemFields,
  DataFieldHelper,
  DataFieldType,
  DataStatus,
  M_DataInfo,
  M_OperatorParams,
  M_TableField,
} from '@web/data-common/models'
import { OrderDirection, SQLAdder, SQLBulkAdder, SQLModifier, Transaction } from 'fc-sql'
import assert from '@fangcha/assert'

interface ApprovalPowerMap {
  [DataStatus.Creating]: boolean
  [DataStatus.Updating]: boolean
  [DataStatus.Deleting]: boolean
}

export class TableDataHandler {
  public readonly table: DataTable
  public readonly fieldItems: M_TableField[]

  public constructor(table: DataTable) {
    this.table = table
    this.fieldItems = table.fieldItems()
  }

  public static makeSystemParams(options: FilterOptions = {}) {
    let sortDirection = options._sortDirection || 'ASC'
    if (!['ASC', 'DESC'].includes(sortDirection)) {
      if (sortDirection === 'ascending') {
        sortDirection = 'ASC'
      } else if (sortDirection === 'descending') {
        sortDirection = 'DESC'
      } else {
        sortDirection = 'ASC'
      }
    }
    let { _offset = 0, _length = -1 } = options
    _offset = Math.floor(Number(_offset) || 0)
    _length = Math.floor(Number(_length) || 0)
    return {
      sortKey: options._sortKey || '',
      sortDirection: sortDirection as OrderDirection,
      offset: _offset,
      length: _length,
    }
  }

  public fieldMapper() {
    return [...this.fieldItems, ...__SystemFields].reduce((result, cur) => {
      result[cur.key] = cur
      return result
    }, {} as { [p: string]: M_TableField })
  }

  public getSearcher(options: FilterOptions = {}) {
    const { sortKey, sortDirection, offset, length } = TableDataHandler.makeSystemParams(options)
    const mapper = this.fieldMapper()

    const searcher = this.table.dbSpec().database.searcher()
    searcher.setTable(this.table.sqlTableName())
    searcher.setColumns(['*'])
    if (offset >= 0 && length > 0) {
      searcher.setLimitInfo(offset, length)
    }
    if (sortKey && mapper[sortKey]) {
      searcher.addOrderRule(sortKey, sortDirection)
    }
    {
      const paramsKeys = Object.keys(options)
      paramsKeys
        .filter((key: string) => {
          return /^\w+$/.test(key) && key in mapper && !!options[key]
        })
        .forEach((key) => {
          searcher.addConditionKV(mapper[key].key, options[key])
        })
      for (const key of paramsKeys) {
        const matches = key.match(/^(\w+)\.(\$\w+)$/)
        if (!matches || !(matches[1] in mapper)) {
          continue
        }
        const matchField = mapper[matches[1]]
        const columnKey = matchField.key
        const symbol = matches[2]
        if (symbol === '$like') {
          searcher.addConditionLikeKeywords(columnKey, options[key])
        } else if (['$in', '$notIn'].includes(symbol) && Array.isArray(options[key])) {
          if (symbol === '$in') {
            searcher.addConditionKeyInArray(columnKey, options[key])
          } else if (symbol === '$notIn') {
            searcher.addConditionKeyNotInArray(columnKey, options[key])
          }
        } else if (['$inStr', '$notInStr'].includes(symbol) && typeof options[key] === 'string') {
          const values = (options[key] as string)
            .split(',')
            .map((item) => item.trim())
            .filter((item) => !!item)
          if (symbol === '$inStr') {
            searcher.addConditionKeyInArray(columnKey, values)
          } else if (symbol === '$notInStr') {
            searcher.addConditionKeyNotInArray(columnKey, values)
          }
        } else if (['$eq', '$ne'].includes(symbol) && typeof options[key] === 'string') {
          const value = options[key]
          if (symbol === '$eq') {
            searcher.addSpecialCondition(`\`${columnKey}\` = ?`, value)
          } else if (symbol === '$ne') {
            searcher.addSpecialCondition(`\`${columnKey}\` != ?`, value)
          }
        } else if (
          ['$lt', '$le', '$gt', '$ge', '$eq', '$ne'].includes(symbol) &&
          ((typeof options[key] === 'string' && /^(-?\d+)$|^(-?\d+\.\d+)$/.test(options[key])) ||
            typeof options[key] === 'number')
        ) {
          const placeholder = matchField.fieldType === DataFieldType.Datetime ? 'FROM_UNIXTIME(?)' : '?'
          const value = Number(options[key])
          if (symbol === '$lt') {
            searcher.addSpecialCondition(`\`${columnKey}\` < ${placeholder}`, value)
          } else if (symbol === '$le') {
            searcher.addSpecialCondition(`\`${columnKey}\` <= ${placeholder}`, value)
          } else if (symbol === '$gt') {
            searcher.addSpecialCondition(`\`${columnKey}\` > ${placeholder}`, value)
          } else if (symbol === '$ge') {
            searcher.addSpecialCondition(`\`${columnKey}\` >= ${placeholder}`, value)
          } else if (symbol === '$eq') {
            searcher.addSpecialCondition(`\`${columnKey}\` = ${placeholder}`, value)
          } else if (symbol === '$ne') {
            searcher.addSpecialCondition(`\`${columnKey}\` != ${placeholder}`, value)
          }
        }
      }
    }
    searcher.addSpecialCondition('data_status != ?', DataStatus.Deleted)
    return searcher
  }

  public async getPageResult(options: FilterOptions = {}, fieldKeyList?: string[]): Promise<PageResult<M_DataInfo>> {
    const { offset } = TableDataHandler.makeSystemParams(options)

    const searcher = this.getSearcher(options)
    if (fieldKeyList) {
      searcher.setColumns(fieldKeyList)
    }
    const items = (await searcher.queryList()) as M_DataInfo[]

    return {
      offset: offset,
      length: items.length,
      totalCount: await searcher.queryCount(),
      items: items,
    }
  }

  public async getAllDataItems(options: FilterOptions = {}): Promise<M_DataInfo[]> {
    const searcher = this.getSearcher(options)
    searcher.setLimitInfo(-1, -1)
    return (await searcher.queryList()) as M_DataInfo[]
  }

  public async getDataRecord(dataId: string): Promise<M_DataInfo> {
    const searcher = this.getSearcher()
    searcher.addConditionKV('data_id', dataId)
    return (await searcher.querySingle()) as M_DataInfo
  }

  public async createRecord(options: {}, flags: M_OperatorParams) {
    const author = flags.author || ''
    options = DataFieldHelper.purifyData(this.fieldItems, options)
    const dataId = makeUUID()
    const adder = new SQLAdder(this.table.dbSpec().database)
    adder.setTable(this.table.sqlTableName())
    adder.insertKV('data_id', dataId)
    adder.insertKV('author', author)
    adder.insertKV('update_author', author)
    if (flags.withoutAudit) {
      for (const key of Object.keys(options)) {
        adder.insertKV(key, options[key])
      }
      adder.insertKV('data_status', DataStatus.Normal)
      adder.insertKV('draft_data_str', null)
    } else {
      adder.insertKV('data_status', DataStatus.Creating)
      adder.insertKV('draft_data_str', JSON.stringify(options))
    }
    await adder.execute()

    return await this.getDataRecord(dataId)
  }

  public async updateDataRecord(dataInfo: M_DataInfo, options: {}, flags: M_OperatorParams) {
    assert.ok(dataInfo.data_status !== DataStatus.Deleting, `数据当前处于待删除状态，不可修改`)
    options = DataFieldHelper.purifyData(this.fieldItems, options)
    const keys = Object.keys(options)
    assert.ok(keys.length > 0, '数据无修改')

    const modifier = new SQLModifier(this.table.dbSpec().database)
    modifier.setTable(this.table.sqlTableName())
    modifier.addConditionKV('data_id', dataInfo.data_id)
    modifier.updateKV('update_author', flags.author || '')
    if (flags.withoutAudit) {
      for (const key of keys) {
        modifier.updateKV(key, options[key])
      }
      modifier.updateKV('data_status', DataStatus.Normal)
      modifier.updateKV('draft_data_str', null)
    } else {
      modifier.updateKV('data_status', DataStatus.Updating)
      modifier.updateKV('draft_data_str', JSON.stringify(options))
    }
    await modifier.execute()
    return await this.getDataRecord(dataInfo.data_id)
  }

  public async deleteDataRecord(dataInfo: M_DataInfo, flags: M_OperatorParams) {
    assert.ok(dataInfo.data_status !== DataStatus.Deleting, `数据当前处于待删除状态，不可修改`)
    const dataStatus = flags.withoutAudit ? DataStatus.Deleted : DataStatus.Deleting
    const modifier = new SQLModifier(this.table.dbSpec().database)
    modifier.setTable(this.table.sqlTableName())
    modifier.updateKV('data_status', dataStatus)
    modifier.updateKV('update_author', flags.author || '')
    modifier.addConditionKV('data_id', dataInfo.data_id)
    await modifier.execute()
    return dataStatus
  }

  public async passAuditData(dataInfo: M_DataInfo, transaction?: Transaction) {
    assert.ok(dataInfo.data_status !== DataStatus.Normal, `当前数据无需审批`)

    const modifier = new SQLModifier(this.table.dbSpec().database)
    if (transaction) {
      modifier.transaction = transaction
    }
    modifier.setTable(this.table.sqlTableName())
    switch (dataInfo.data_status) {
      case DataStatus.Creating:
      case DataStatus.Updating: {
        const options = DataFieldHelper.parseDraftData(dataInfo.draft_data_str)
        for (const key of Object.keys(options)) {
          modifier.updateKV(key, options[key])
        }
        modifier.updateKV('data_status', DataStatus.Normal)
        modifier.updateKV('draft_data_str', null)
        break
      }
      case DataStatus.Deleting: {
        modifier.updateKV('data_status', DataStatus.Deleted)
        break
      }
    }
    modifier.addConditionKV('data_id', dataInfo.data_id)
    await modifier.execute()
  }

  public async rejectAuditData(dataInfo: M_DataInfo, transaction?: Transaction) {
    assert.ok(dataInfo.data_status !== DataStatus.Normal, `当前数据无需审批`)

    const modifier = new SQLModifier(this.table.dbSpec().database)
    if (transaction) {
      modifier.transaction = transaction
    }
    modifier.setTable(this.table.sqlTableName())
    switch (dataInfo.data_status) {
      case DataStatus.Creating: {
        modifier.updateKV('data_status', DataStatus.Deleted)
        break
      }
      case DataStatus.Updating:
      case DataStatus.Deleting: {
        modifier.updateKV('data_status', DataStatus.Normal)
        break
      }
    }
    modifier.updateKV('draft_data_str', null)
    modifier.addConditionKV('data_id', dataInfo.data_id)
    await modifier.execute()
  }

  public async passRecordsBatch(items: M_DataInfo[]) {
    const runner = this.table.dbSpec().database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      for (const item of items) {
        await this.passAuditData(item, transaction)
      }
    })
  }

  public async rejectRecordsBatch(items: M_DataInfo[]) {
    const runner = this.table.dbSpec().database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      for (const item of items) {
        await this.rejectAuditData(item, transaction)
      }
    })
  }

  private async _bulkUpsertRecords(records: M_DataInfo[], author: string, transaction?: Transaction) {
    const fieldItems = this.fieldItems
    const bulkAdder = new SQLBulkAdder(this.table.dbSpec().database)
    bulkAdder.setTable(this.table.sqlTableName())
    if (transaction) {
      bulkAdder.transaction = transaction
    }
    bulkAdder.useUpdateWhenDuplicate()
    bulkAdder.setInsertKeys([
      'data_id',
      ...fieldItems.map((item) => item.key),
      'data_status',
      'author',
      'update_author',
    ])
    bulkAdder.declareTimestampKey(
      ...fieldItems.filter((field) => field.fieldType === DataFieldType.Datetime).map((item) => item.key)
    )
    for (let i = 0; i < records.length; ++i) {
      const data_id = records[i].data_id
      const dataItem = DataFieldHelper.purifyData(fieldItems, records[i]) as M_DataInfo
      dataItem.data_id = data_id
      if (!dataItem.data_id) {
        dataItem.data_id = makeUUID()
      }
      dataItem.author = author
      dataItem.update_author = author
      dataItem.data_status = DataStatus.Normal
      bulkAdder.putObject(dataItem as any)
    }
    await bulkAdder.execute()
  }

  public async getReviewingRecords(mapper: ApprovalPowerMap) {
    const searcher = this.getSearcher({
      'data_status.$in': Object.keys(mapper).filter((item) => !!mapper[item]),
    })
    searcher.setLimitInfo(-1, -1)
    return (await searcher.queryList()) as M_DataInfo[]
  }

  public async bulkUpsertRecords(
    records: M_DataInfo[],
    flags: { author?: string; canInsert?: boolean; canUpdate?: boolean }
  ) {
    const author = flags.author || ''
    const database = this.table.dbSpec().database

    const searcher = this.getSearcher({
      'data_id.$in': records.map((item) => item.data_id).filter((dataId) => !!dataId),
      'data_status.$notIn': [DataStatus.Deleting],
    })
    searcher.setLimitInfo(-1, -1)
    const existingItems = (await searcher.queryList()) as M_DataInfo[]
    const curDataMapper: { [dataId: string]: M_DataInfo } = {}
    for (const item of existingItems) {
      if (item.data_status === DataStatus.Creating || item.data_status === DataStatus.Updating) {
        item.draftData = DataFieldHelper.parseDraftData(item.draft_data_str)
      }
      curDataMapper[item.data_id] = item
    }
    const toUpdateItems = records.filter((record) => curDataMapper[record.data_id])
    const toInsertItems = records.filter((record) => !record.data_id)
    const fieldItems = this.fieldItems
    const tableName = this.table.sqlTableName()

    const runner = database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      if (flags.canInsert) {
        await this._bulkUpsertRecords(toInsertItems, author, transaction)
      } else {
        const bulkAdder = new SQLBulkAdder(database)
        bulkAdder.transaction = transaction
        bulkAdder.setTable(tableName)
        bulkAdder.setInsertKeys(['data_id', 'data_status', 'author', 'update_author', 'draft_data_str'])
        bulkAdder.useUpdateWhenDuplicate()
        for (let i = 0; i < toInsertItems.length; ++i) {
          const item = toInsertItems[i]
          const options = DataFieldHelper.purifyData(fieldItems, item) as M_DataInfo
          bulkAdder.putObject({
            data_id: item.data_id || makeUUID(),
            data_status: DataStatus.Creating,
            author: author,
            update_author: author,
            draft_data_str: JSON.stringify(options),
          })
        }
        await bulkAdder.execute()
      }
      if (flags.canUpdate) {
        await this._bulkUpsertRecords(toUpdateItems, author, transaction)
      } else {
        const bulkAdder = new SQLBulkAdder(database)
        bulkAdder.transaction = transaction
        bulkAdder.setTable(tableName)
        bulkAdder.setInsertKeys(['data_id', 'data_status', 'update_author', 'draft_data_str'])
        bulkAdder.useUpdateWhenDuplicate()
        for (let i = 0; i < toUpdateItems.length; ++i) {
          const item = toUpdateItems[i]
          const options = DataFieldHelper.purifyData(fieldItems, item.draftData || item) as M_DataInfo
          bulkAdder.putObject({
            data_id: item.data_id,
            data_status: DataStatus.Updating,
            update_author: author,
            draft_data_str: JSON.stringify(options),
          })
        }
        await bulkAdder.execute()
      }
    })
  }
}
