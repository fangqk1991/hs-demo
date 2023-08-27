import { DataFieldType } from './DataFieldType'
import { M_DataTable, M_TableField } from './DataTableModels'
import * as moment from 'moment/moment'
import assert from '@fangcha/assert'
import { M_DataInfo } from './M_DataInfo'
import { TypicalColumn, TypicalExcel } from '@fangcha/tools/lib/excel'
import { DataStatusDescriptor } from './DataStatus'

const formatTime = (timeStr: string, formatStr = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(timeStr).utcOffset(8).format(formatStr)
}

export class DataFieldHelper {
  public static getFieldExampleValue(fieldType: DataFieldType) {
    switch (fieldType) {
      case DataFieldType.Text:
        return 'Some text'
      case DataFieldType.Integer:
        return 0
      case DataFieldType.Float:
        return 0.1
      case DataFieldType.Date:
        return '2023-08-01'
      case DataFieldType.Datetime:
        return '2023-08-01 00:00:00'
    }
    return 'Some text'
  }

  public static getTableExampleData(tableInfo: M_DataTable) {
    return tableInfo.fieldItems.reduce((result, field) => {
      result[field.key] = this.getFieldExampleValue(field.fieldType)
      return result
    }, {})
  }

  public static transferNaturalRecords(tableInfo: M_DataTable, records: any[]) {
    return records.map((rawData) => {
      const data: any = {}
      if (rawData.data_id) {
        data.data_id = rawData.data_id
      }
      tableInfo.fieldItems.forEach((field) => {
        data[field.key] = rawData[field.name] !== undefined ? rawData[field.name] : null
        if (field.fieldType === DataFieldType.Datetime && data[field.key]) {
          const time = moment(data[field.key])
          data[field.key] = time.isValid() ? time.format() : null
        }
      })
      return data
    })
  }

  public static purifyData(fieldItems: M_TableField[], data: any) {
    data = fieldItems
      .filter((field) => data[field.key] !== undefined)
      .reduce((result, field) => {
        result[field.key] = data[field.key]
        return result
      }, {})
    data = { ...data }
    fieldItems
      .filter((field) => field.fieldType !== DataFieldType.Text)
      .forEach((field) => {
        if (data[field.key] === '') {
          data[field.key] = null
        }
      })
    for (const field of fieldItems) {
      const value = data[field.key]
      if (!value) {
        continue
      }
      switch (field.fieldType) {
        case DataFieldType.Integer:
        case DataFieldType.Float:
          assert.ok(!isNaN(value), `${field.name} 值格式有误`)
          break
        case DataFieldType.Date:
        case DataFieldType.Datetime:
          assert.ok(moment(value).isValid(), `${field.name} 值格式有误`)
          break
      }
    }
    return data
  }

  public static async makeExcelBuffer(fieldItems: M_TableField[], rowList: M_DataInfo[], includingExtras = false) {
    const columns: TypicalColumn<M_DataInfo>[] = [
      ...fieldItems.map((field) => {
        if (field.fieldType === DataFieldType.Datetime) {
          return {
            columnKey: field.key,
            columnName: field.name,
            columnValue: (item: any) => {
              return item[field.key] ? formatTime(item[field.key]) : ''
            },
            width: 18,
          }
        }
        return {
          columnKey: field.key,
          columnName: field.name,
          width: 10,
        }
      }),
    ]
    if (includingExtras) {
      columns.push(
        ...[
          {
            columnKey: 'data_id',
            columnName: 'data_id',
            width: 35,
          },
          {
            columnKey: 'data_status',
            columnName: '数据状态',
            columnValue: (item: M_DataInfo) => {
              return DataStatusDescriptor.describe(item.data_status)
            },
            width: 12,
          },
          {
            columnKey: 'created_at',
            columnName: '创建时间',
            columnValue: (item: M_DataInfo) => {
              return formatTime(item.created_at)
            },
            width: 18,
          },
          {
            columnKey: 'updated_at',
            columnName: '更新时间',
            columnValue: (item: M_DataInfo) => {
              return formatTime(item.updated_at)
            },
            width: 18,
          },
        ]
      )
    }
    const excel = TypicalExcel.excelWithTypicalColumns(columns)
    excel.addTypicalRowList(rowList)
    return excel.writeBuffer()
  }

  public static parseDraftData(dataStr: string) {
    const defaultData: any = {}
    try {
      return JSON.parse(dataStr) || defaultData
    } catch (e) {}
    return defaultData
  }
}
