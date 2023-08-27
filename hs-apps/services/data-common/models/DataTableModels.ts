import { DataFieldType } from './DataFieldType'

export interface M_TableFieldParams {
  key?: string
  name: string
  fieldType: DataFieldType
}

export interface M_TableField extends M_TableFieldParams {
  key: string
  name: string
  fieldType: DataFieldType
}

export interface M_DataTableParams {
  name: string
  fieldItems: M_TableFieldParams[]
  author?: string
}

export interface M_DataTable extends M_DataTableParams {
  tableId: string
  name: string
  description: string
  version: number
  fieldItems: M_TableField[]
  extrasInfo: {}
  author: string
  updateAuthor: string
  createdAt: string
  updatedAt: string
}

export const __SystemFields: M_TableField[] = [
  {
    key: 'data_id',
    name: 'data_id',
    fieldType: DataFieldType.Text,
  },
  {
    key: 'data_status',
    name: '数据状态',
    fieldType: DataFieldType.Text,
  },
  {
    key: 'created_at',
    name: '创建时间',
    fieldType: DataFieldType.Datetime,
  },
  {
    key: 'updated_at',
    name: '更新时间',
    fieldType: DataFieldType.Datetime,
  },
]
