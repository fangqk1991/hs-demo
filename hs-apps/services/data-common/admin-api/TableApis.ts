import { Api } from '@fangcha/swagger'

export const TableApis = {
  TablePageDataGet: {
    method: 'GET',
    route: '/api/v1/table',
    description: '数据表分页数据获取',
  } as Api,
  TableCreate: {
    method: 'POST',
    route: '/api/v1/table',
    description: '创建数据表',
  } as Api,
  TableInfoGet: {
    method: 'GET',
    route: '/api/v1/table/:tableId',
    description: '获取数据表信息',
  } as Api,
  TableUpdate: {
    method: 'PUT',
    route: '/api/v1/table/:tableId',
    description: '更新数据表',
  } as Api,
  TableDelete: {
    method: 'DELETE',
    route: '/api/v1/table/:tableId',
    description: '删除数据表',
  } as Api,
}
