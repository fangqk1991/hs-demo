import { DataFieldHelper, M_DataInfo, M_DataTable } from '@web/data-common/models'
const { saveAs } = require('file-saver')

export class TableExcelHandler {
  public readonly table: M_DataTable

  constructor(table: M_DataTable) {
    this.table = table
  }

  public async exportExcel(fileName: string, rowList: M_DataInfo[], includingExtras = false) {
    const buffer = await DataFieldHelper.makeExcelBuffer(this.table.fieldItems, rowList, includingExtras)
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  public async exportTemplateFile() {
    return this.exportExcel(`${this.table.name}-模板`, [DataFieldHelper.getTableExampleData(this.table) as M_DataInfo])
  }

  public async exportRecords(records: M_DataInfo[]) {
    return this.exportExcel(`${this.table.name}-数据`, records, true)
  }
}
