import { FCDatabase } from 'fc-sql'
import { DBOptionsBuilder } from '@fangcha/tools/lib/database'
import { DataConfig } from '../DataConfig'

FCDatabase.instanceWithName('dataDB').init(new DBOptionsBuilder(DataConfig.dataDB).build() as any)

export const MyDatabase = {
  dataDB: FCDatabase.instanceWithName('dataDB'),
}
