import { DataTable } from '../../src/models/extensions/DataTable'
import { DataFieldType } from '@web/data-common/models'

describe('DataTable.test.ts', () => {
  it(`generateTable`, async () => {
    const feed = await DataTable.generateTable({
      name: `Table_${Math.floor(Math.random() * 10000)}`,
      fieldItems: [
        {
          fieldType: DataFieldType.Integer,
          name: 'C_Integer',
        },
        {
          fieldType: DataFieldType.Float,
          name: 'C_Float',
        },
        {
          fieldType: DataFieldType.Text,
          name: 'C_Text',
        },
        {
          fieldType: DataFieldType.Date,
          name: 'C_Date',
        },
        {
          fieldType: DataFieldType.Datetime,
          name: 'C_Datetime',
        },
      ],
    })
    console.info(feed.modelForClient())
  })
})
