import { Descriptor } from '@fangcha/tools'

export enum DataFieldType {
  Text = 'Text',
  Integer = 'Integer',
  Float = 'Float',
  Date = 'Date',
  Datetime = 'Datetime',
}

const values = [
  DataFieldType.Text,
  DataFieldType.Integer,
  DataFieldType.Float,
  DataFieldType.Date,
  DataFieldType.Datetime,
]

const describe = (code: DataFieldType) => {
  switch (code) {
    case DataFieldType.Text:
      return '文本'
    case DataFieldType.Integer:
      return '整数'
    case DataFieldType.Float:
      return '浮点数'
    case DataFieldType.Date:
      return '日期'
    case DataFieldType.Datetime:
      return '时间'
  }
  return 'Unknown'
}

export const DataFieldTypeDescriptor = new Descriptor(values, describe)
