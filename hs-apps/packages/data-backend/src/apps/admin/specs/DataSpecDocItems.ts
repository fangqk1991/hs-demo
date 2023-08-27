import { SwaggerDocItem } from '@fangcha/router'
import { TableSpecs } from './TableSpecs'
import { DataRecordSpecs } from './DataRecordSpecs'

export const DataSpecDocItems: SwaggerDocItem[] = [
  {
    name: 'Data',
    pageURL: '/api-docs/v1/data',
    specs: [...TableSpecs, ...DataRecordSpecs],
  },
]
