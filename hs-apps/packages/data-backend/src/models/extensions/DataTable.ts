import _DataTable from '../auto-build/_DataTable'
import {
  DataFieldType,
  DataFieldTypeDescriptor,
  DataStatus,
  DataStatusDescriptor,
  M_DataTable,
  M_DataTableParams,
  M_TableField,
} from '@web/data-common/models'
import assert from '@fangcha/assert'
import { makeUUID, md5 } from '@fangcha/tools'
import { FilterOptions } from 'fc-feed'

export class DataTable extends _DataTable {
  public constructor() {
    super()
  }

  public fc_searcher(params: FilterOptions = {}) {
    const searcher = super.fc_searcher(params)
    searcher.processor().addConditionKV('is_deleted', 0)
    return searcher
  }

  public static async findTable(tableId: string) {
    return (await this.findWithUid(tableId))!
  }

  public static async generateTable(params: M_DataTableParams) {
    assert.ok(!!params.name, 'Params[name] invalid.')
    assert.ok(Array.isArray(params.fieldItems), 'Params[fieldItems] invalid.')
    params.fieldItems.forEach((field, index) => {
      assert.ok(!!field.name, `Params[fieldItems[${index}].name] invalid.`)
      assert.ok(field.name !== 'data_id', `data_id 是保留字，不可用于字段名`)
      assert.ok(DataFieldTypeDescriptor.describe(field.fieldType), `Params[fieldItems[${index}].fieldType] invalid.`)
      field.key = `f_${md5(field.name).substring(0, 8)}`
    })
    assert.ok(
      [...new Set(params.fieldItems.map((item) => item.name))].length === params.fieldItems.length,
      '存在重复的字段名'
    )
    const table = new this()
    table.tableId = makeUUID()
    table.name = params.name
    table.fieldItemsStr = JSON.stringify(params.fieldItems)
    table.author = params.author || ''
    table.updateAuthor = table.author

    const database = table.dbSpec().database
    const tableName = table.sqlTableName()
    const tableHandler = database.tableHandler(tableName)
    assert.ok(!(await tableHandler.checkTableExists()), `数据表[${table.tableId}] 已存在`, 500)

    const columnDescriptions = [
      'rid BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY',
      'data_id CHAR(32) COLLATE ascii_bin NOT NULL UNIQUE',
      ...table.fieldItems().map((field) => {
        const columnType = (() => {
          switch (field.fieldType) {
            case DataFieldType.Text:
              return 'TEXT'
            case DataFieldType.Integer:
              return 'BIGINT'
            case DataFieldType.Float:
              return 'DOUBLE'
            case DataFieldType.Date:
              return 'DATE'
            case DataFieldType.Datetime:
              return 'TIMESTAMP'
          }
          return 'TEXT'
        })()
        return `\`${field.key}\` ${columnType} NULL COMMENT '${field.name}'`
      }),
      `version BIGINT NOT NULL DEFAULT 0 COMMENT '版本号'`,
      `data_status ENUM (${DataStatusDescriptor.values.map((val) => `'${val}'`).join(',')}) NOT NULL DEFAULT '${
        DataStatus.Normal
      }'`,
      `author VARCHAR(127) NOT NULL DEFAULT '' COMMENT '创建者'`,
      `update_author VARCHAR(127) NOT NULL DEFAULT '' COMMENT '更新者'`,
      `draft_data_str MEDIUMTEXT COMMENT '临时副本信息'`,
      `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'`,
      `updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'`,
      `INDEX (data_status)`,
    ]
    await database.update(
      `CREATE TABLE \`${tableName}\`
       (
           ${columnDescriptions.join(',')}
       )`,
      []
    )
    await table.addToDB()
    return table
  }

  public fieldItems(): M_TableField[] {
    const defaultData: M_TableField[] = []
    try {
      return JSON.parse(this.fieldItemsStr) || defaultData
    } catch (e) {}
    return defaultData
  }

  public toJSON() {
    return this.modelForClient()
  }

  public async updateInfos(params: M_DataTableParams) {
    this.fc_edit()
    if (params.name) {
      this.name = params.name
    }
    this.updateAuthor = params.author || ''
    await this.updateToDB()
  }

  public modelForClient() {
    const data = this.fc_pureModel() as M_DataTable
    data.fieldItems = this.fieldItems()
    delete data['fieldItemsStr']
    return data
  }

  public sqlTableName() {
    return `_t_${this.tableId.substring(0, 8)}`
  }
}
