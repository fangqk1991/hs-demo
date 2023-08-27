import { Api } from '@fangcha/swagger'

export const DataRecordApis = {
  RecordPageDataGet: {
    method: 'GET',
    route: '/api/v1/table/:tableId/record',
    description: '分页数据获取',
  } as Api,
  RecordExcelExport: {
    method: 'GET',
    route: '/api/v0/table/:tableId/record-xls',
    description: '导出数据记录 Excel',
  } as Api,
  BatchRecordsPut: {
    method: 'PUT',
    route: '/api/v1/table/:tableId/batch-records/import',
    description: '批量导入数据',
  } as Api,
  BatchRecordsPass: {
    method: 'PUT',
    route: '/api/v0/table/:tableId/batch-records/pass',
    description: '数据记录批量通过',
  } as Api,
  BatchRecordsReject: {
    method: 'PUT',
    route: '/api/v0/table/:tableId/batch-records/reject',
    description: '数据记录批量驳回',
  } as Api,
  RecordCreate: {
    method: 'POST',
    route: '/api/v1/table/:tableId/record',
    description: '创建数据记录',
  } as Api,
  RecordInfoGet: {
    method: 'GET',
    route: '/api/v1/table/:tableId/record/:dataId',
    description: '获取数据记录',
  } as Api,
  RecordUpdate: {
    method: 'PUT',
    route: '/api/v1/table/:tableId/record/:dataId',
    description: '更新数据记录',
  } as Api,
  RecordDelete: {
    method: 'DELETE',
    route: '/api/v1/table/:tableId/record/:dataId',
    description: '删除数据记录',
  } as Api,
  RecordAuditPass: {
    method: 'PUT',
    route: '/api/v1/table/:tableId/record/:dataId/pass',
    description: '数据记录通过审批',
  } as Api,
  RecordAuditReject: {
    method: 'PUT',
    route: '/api/v1/table/:tableId/record/:dataId/reject',
    description: '数据记录驳回',
  } as Api,
  RecordIdPageDataGet: {
    method: 'GET',
    route: '/api/v1/table/:tableId/record-id',
    description: '分页数据 ID 获取',
    skipAuth: true,
    parameters: [
      {
        name: '_offset',
        type: 'number',
        in: 'query',
        description: '偏移量，缺省值为 0',
      },
      {
        name: '_length',
        type: 'number',
        in: 'query',
        description: '长度限制，小于等于 0 时将被忽略',
      },
    ],
    responseDemo: {
      totalCount: 1,
      dataIdList: ['4859024d6d2a4e9aabd702035058b530'],
    },
  } as Api,
}
