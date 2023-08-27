import React, { useRef, useState } from 'react'
import { MyRequest, useVisitorCtx } from '@fangcha/auth-react'
import { Breadcrumb, Button, Divider, Dropdown, message, Space, Spin, Tag } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { DataRecordApis } from '@web/data-common/admin-api'
import { useTableInfo } from '../table/useTableInfo'
import { ColumnFilterType, ConfirmDialog, TableView, TableViewColumn, useQueryParams } from '@fangcha/react'
import {
  DataFieldHelper,
  DataPermissionKey,
  DataStatus,
  DataStatusDescriptor,
  M_DataInfo,
} from '@web/data-common/models'
import { PageResult } from '@fangcha/tools'
import { CommonAPI, RequestParams } from '@fangcha/app-request'
import { TypicalExcel } from '@fangcha/tools/lib/excel'
import { FilePickerDialog } from '../common/FilePickerDialog'
import { FrontendFileReader } from '@fangcha/tools/lib/frontend'
import { DownOutlined } from '@ant-design/icons'
import { TableExcelHandler } from '../table/TableExcelHandler'
import { DataEditDialog } from './DataEditDialog'
import { DataValueSpan } from './DataValueSpan'
import { DataStatusTag } from './DataStatusTag'
import { formatTime } from '../../core/formatTime'

export const DataPageView: React.FC = () => {
  const { tableId = '' } = useParams()
  const [version, setVersion] = useState(0)
  const visitorCtx = useVisitorCtx()
  const canCreate = !!visitorCtx.userInfo.permissionKeyMap[DataPermissionKey.Data_Approval_Create]
  const canUpdate = !!visitorCtx.userInfo.permissionKeyMap[DataPermissionKey.Data_Approval_Update]
  const canDelete = !!visitorCtx.userInfo.permissionKeyMap[DataPermissionKey.Data_Approval_Delete]

  const tableInfo = useTableInfo(tableId, version)
  const dataRef = useRef<M_DataInfo[]>([])
  const lastParamsRef = useRef<{}>({})
  const { queryParams, updateQueryParams, setQueryParams } = useQueryParams<{ keywords: string; [p: string]: any }>()

  if (!tableInfo) {
    return <Spin size='large' />
  }

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to={{ pathname: `/v1/table` }}>数据表</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={{ pathname: `/v1/table/${tableId}` }}>{tableInfo.name}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>数据一览</Breadcrumb.Item>
      </Breadcrumb>
      <Divider />

      <Space direction={'vertical'}>
        <Space>
          <Button
            type={'primary'}
            onClick={async () => {
              const dialog = new DataEditDialog({
                title: '创建数据记录',
                fields: tableInfo.fieldItems,
                withoutAudit: canCreate,
              })
              dialog.show(async (params) => {
                const request = MyRequest(new CommonAPI(DataRecordApis.RecordCreate, tableInfo.tableId))
                request.setBodyData(params)
                const { data_status } = await request.quickSend<M_DataInfo>()
                message.success(data_status === DataStatus.Normal ? '创建成功' : '创建申请已提交')
                setVersion(version + 1)
              })
            }}
          >
            创建数据
          </Button>

          <Button
            onClick={async () => {
              const dialog = new FilePickerDialog({
                title: '导入 Excel',
                description: (
                  <ul>
                    <li>data_id 值存在时，将执行更新操作，否则执行创建操作</li>
                    {!canCreate && <li style={{ color: '#ff4d4f' }}>创建操作需要审核</li>}
                    {!canUpdate && <li style={{ color: '#ff4d4f' }}>更新操作需要审核</li>}
                  </ul>
                ),
              })
              dialog.show(async (file) => {
                const buffer = FrontendFileReader.loadFileBuffer(file)
                await TypicalExcel.excelFromBuffer(buffer as any)
                  .then(async (excel) => {
                    const records = DataFieldHelper.transferNaturalRecords(tableInfo, excel.records())
                    const request = MyRequest(new CommonAPI(DataRecordApis.BatchRecordsPut, tableInfo.tableId))
                    request.setBodyData(records)
                    await request.quickSend()
                    message.success(`导入成功`)
                    setVersion(version + 1)
                  })
                  .catch((err) => {
                    message.error(`文件解析 / 上传失败`)
                    throw err
                  })
              })
            }}
          >
            导入 Excel
          </Button>

          <Dropdown
            menu={{
              items: [
                {
                  key: 'templates',
                  label: '导出 Excel 模板',
                  onClick: async () => {
                    await new TableExcelHandler(tableInfo).exportTemplateFile()
                  },
                },
                {
                  key: 'cur-page',
                  label: '导出当前页',
                  onClick: async () => {
                    await new TableExcelHandler(tableInfo).exportRecords(dataRef.current)
                  },
                },
                {
                  key: 'all-data',
                  label: '导出所有数据',
                  onClick: async () => {
                    const path = new CommonAPI(DataRecordApis.RecordExcelExport, tableInfo.tableId).api
                    const query = RequestParams.buildQuery(lastParamsRef.current)
                    window.open(`${path}?${query}`)
                  },
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type={'primary'}>
              <Space>
                导出
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>

          <Button
            onClick={() => {
              setQueryParams({})
            }}
          >
            重置过滤器
          </Button>
        </Space>
        <Space>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'pass-all',
                  label: '通过所有',
                  onClick: async () => {
                    if (!canCreate && !canDelete && !canDelete) {
                      message.error('您不具备任何操作的审批权')
                      return
                    }
                    const request = MyRequest(new CommonAPI(DataRecordApis.BatchRecordsPass, tableInfo.tableId))
                    await request.quickSend()
                    message.success('操作成功')
                    setVersion(version + 1)
                  },
                },
                {
                  key: 'reject-all',
                  label: '驳回所有',
                  onClick: async () => {
                    if (!canCreate && !canDelete && !canDelete) {
                      message.error('您不具备任何操作的审批权')
                      return
                    }
                    const request = MyRequest(new CommonAPI(DataRecordApis.BatchRecordsReject, tableInfo.tableId))
                    await request.quickSend()
                    message.success('操作成功')
                    setVersion(version + 1)
                  },
                },
              ],
            }}
            trigger={['click']}
          >
            <Button danger>
              批量处理待审核项
              <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      </Space>

      <Divider />

      <TableView
        reactiveQuery={true}
        rowKey={(item: M_DataInfo) => {
          return item.data_id
        }}
        columns={TableViewColumn.makeColumns<M_DataInfo>([
          {
            title: 'Data ID',
            render: (item) => (
              <>
                {item.data_id}
                <br />
                最近操作人: <Tag color={'geekblue'}>{item.update_author}</Tag>
              </>
            ),
          },
          ...tableInfo.fieldItems.map((field) => ({
            title: field.name,
            key: field.key,
            sorter: true,
            render: (item: M_DataInfo) => {
              return <DataValueSpan data={item} field={field} />
            },
          })),
          {
            title: '数据状态',
            filterType: ColumnFilterType.StrMultiSelector,
            value: queryParams[`data_status.$inStr`],
            onValueChanged: (newVal) => {
              updateQueryParams({
                'data_status.$inStr': newVal,
              })
            },
            options: DataStatusDescriptor.options().filter((option) => option.value !== DataStatus.Deleted),
            render: (item) => <DataStatusTag status={item.data_status} />,
          },
          {
            title: '创建 / 更新时间',
            key: 'created_at',
            sorter: true,
            render: (item) => (
              <>
                {formatTime(item.created_at)}
                <br />
                {formatTime(item.updated_at)}
              </>
            ),
          },
          {
            title: '操作',
            render: (item) => {
              return (
                <Space direction={'vertical'}>
                  <Space>
                    <a
                      onClick={() => {
                        const dialog = new DataEditDialog({
                          title: '创建数据记录',
                          fields: tableInfo.fieldItems,
                          data: item,
                          withoutAudit: canCreate,
                        })
                        dialog.show(async (params) => {
                          const request = MyRequest(new CommonAPI(DataRecordApis.RecordCreate, tableInfo.tableId))
                          request.setBodyData(params)
                          const { data_status } = await request.quickSend<M_DataInfo>()
                          message.success(data_status === DataStatus.Normal ? '创建成功' : '创建申请已提交')
                          setVersion(version + 1)
                        })
                      }}
                    >
                      复制
                    </a>
                    <a
                      onClick={() => {
                        const dialog = new DataEditDialog({
                          title: '修改数据记录',
                          fields: tableInfo.fieldItems,
                          data: item.draftData || item,
                          withoutAudit: canUpdate,
                        })
                        dialog.show(async (params) => {
                          const request = MyRequest(
                            new CommonAPI(DataRecordApis.RecordUpdate, tableInfo.tableId, item.data_id)
                          )
                          await request.setBodyData(params)
                          const { data_status } = await request.quickSend<M_DataInfo>()
                          message.success(data_status === DataStatus.Normal ? '修改成功' : '修改申请已提交')
                          setVersion(version + 1)
                        })
                      }}
                    >
                      修改
                    </a>
                    <a
                      onClick={() => {
                        const dialog = new ConfirmDialog({
                          content: `确定要删除吗？(${canDelete ? '本操作无需审核' : '本操作需要审核'})`,
                        })
                        dialog.show(async () => {
                          const request = MyRequest(
                            new CommonAPI(DataRecordApis.RecordDelete, tableInfo.tableId, item.data_id)
                          )
                          const { dataStatus } = await request.quickSend<{ dataStatus: DataStatus }>()
                          message.success(dataStatus === DataStatus.Deleted ? '删除成功' : '删除申请已提交')
                          setVersion(version + 1)
                        })
                      }}
                    >
                      删除
                    </a>
                  </Space>
                  {item.data_status !== DataStatus.Normal && (
                    <Space>
                      <a
                        style={{ color: '#52c41a' }}
                        onClick={async () => {
                          const request = MyRequest(
                            new CommonAPI(DataRecordApis.RecordAuditPass, tableInfo.tableId, item.data_id)
                          )
                          await request.quickSend()
                          message.success('操作成功')
                          setVersion(version + 1)
                        }}
                      >
                        通过
                      </a>
                      <a
                        style={{ color: '#ff4d4f' }}
                        onClick={async () => {
                          const request = MyRequest(
                            new CommonAPI(DataRecordApis.RecordAuditReject, tableInfo.tableId, item.data_id)
                          )
                          await request.quickSend()
                          message.success('操作成功')
                          setVersion(version + 1)
                        }}
                      >
                        驳回
                      </a>
                    </Space>
                  )}
                </Space>
              )
            },
          },
        ])}
        defaultSettings={{
          pageSize: 10,
          sortKey: 'created_at',
          sortDirection: 'descending',
        }}
        loadData={async (retainParams) => {
          const params = {
            ...retainParams,
            ...queryParams,
          }
          lastParamsRef.current = params
          const request = MyRequest(new CommonAPI(DataRecordApis.RecordPageDataGet, tableInfo.tableId))
          request.setQueryParams(params)
          const pageResult = await request.quickSend<PageResult<M_DataInfo>>()
          pageResult.items.forEach((item) => {
            if ([DataStatus.Creating, DataStatus.Updating].includes(item.data_status)) {
              item.draftData = DataFieldHelper.parseDraftData(item.draft_data_str)
            }
          })
          dataRef.current = pageResult.items
          return pageResult
        }}
      />
    </div>
  )
}
