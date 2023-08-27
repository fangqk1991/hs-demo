import { DBModelSchema, ModelGenerator } from '@fangcha/generator'
import { SafeTask } from '@fangcha/tools'
import { DataConfig } from '../src/DataConfig'

const modelTmpl = `${__dirname}/model.tmpl.ejs`
const extendTmpl = `${__dirname}/class.extends.model.ejs`

const dbGenerator = new ModelGenerator({
  dbConfig: DataConfig.dataDB,
  tmplFile: modelTmpl,
  extTmplFile: extendTmpl,
})

const schemas: DBModelSchema[] = [
  {
    generator: dbGenerator,
    dbProp: 'dataDB',
    tableName: 'data_table',
    outputFile: `${__dirname}/../src/models/auto-build/_DataTable.ts`,
    extFile: `${__dirname}/../src/models/extensions/DataTable.ts`,
    reloadOnAdded: true,
    reloadOnUpdated: true,
  },
]

SafeTask.run(async () => {
  for (const schema of schemas) {
    const generator = schema.generator!
    const data = await generator.generateData(schema)
    generator.buildModel(schema, data)
  }
})
