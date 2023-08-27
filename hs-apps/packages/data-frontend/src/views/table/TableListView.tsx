import React, { useReducer } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Button, Divider, message, Space } from 'antd'
import { ConfirmDialog, TableView, TableViewColumn } from '@fangcha/react'
import { PageResult } from '@fangcha/tools'
import { Link } from 'react-router-dom'
import { DataFieldType, M_DataTable } from '@web/data-common/models'
import { TableApis } from '@web/data-common/admin-api'
import { TableInfoDialog } from './TableInfoDialog'
import { CommonAPI } from '@fangcha/app-request'
import { formatTime } from '../../core/formatTime'
import { TypicalExcel } from '@fangcha/tools/lib/excel'
import { FrontendFileReader } from '@fangcha/tools/lib/frontend'
import { FilePickerDialog } from '../common/FilePickerDialog'
import { TableFieldsPanel } from './TableFieldsPanel'

export const TableListView: React.FC = () => {
  const [_, reloadData] = useReducer((x) => x + 1, 0)
  return (
    <div>
      <h2>数据表</h2>
      <Space>
        <Button
          type='primary'
          onClick={() => {
            const dialog = TableInfoDialog.dialogForCreating()
            dialog.show(async (params) => {
              const request = MyRequest(TableApis.TableCreate)
              request.setBodyData(params)
              await request.quickSend()
              message.success('创建成功')
              reloadData()
            })
          }}
        >
          创建表
        </Button>
        <Button
          onClick={() => {
            const dialog = new FilePickerDialog({
              title: '选择 Excel 以解析',
              description: '程序会将 Excel 首行描述解析为字段名并填充到创建表单中，在提交前您可根据需要调整描述',
            })
            dialog.show(async (file) => {
              const buffer = FrontendFileReader.loadFileBuffer(file)
              await TypicalExcel.excelFromBuffer(buffer as any)
                .then((excel) => {
                  const dialog = TableInfoDialog.dialogForCreating({
                    name: file.name.split('.')[0],
                    fieldItems: excel.columnKeys.map((key) => ({
                      name: key,
                      fieldType: DataFieldType.Text,
                    })),
                  })
                  dialog.show(async (params) => {
                    const request = MyRequest(TableApis.TableCreate)
                    request.setBodyData(params)
                    await request.quickSend()
                    message.success('创建成功')
                    reloadData()
                  })
                })
                .catch((err) => {
                  message.error(`文件解析失败，请选择 Excel 或 CSV 文件`)
                  throw err
                })
            })
          }}
        >
          解析 Excel 以创建
        </Button>
      </Space>
      <Divider />
      <TableView
        rowKey={(item: M_DataTable) => {
          return item.tableId
        }}
        columns={TableViewColumn.makeColumns<M_DataTable>([
          {
            title: '数据表名称',
            render: (item) => <Link to={{ pathname: `/v1/table/${item.tableId}` }}>{item.name}</Link>,
          },
          {
            title: '数据表字段',
            render: (item) => <TableFieldsPanel table={item} />,
          },
          {
            title: '创建时间',
            render: (item) => formatTime(item.createdAt),
          },
          {
            title: '操作',
            render: (item) => (
              <Space direction={'vertical'}>
                <Space>
                  <a
                    onClick={() => {
                      const dialog = TableInfoDialog.dialogForCreating(item)
                      dialog.show(async (params) => {
                        const request = MyRequest(TableApis.TableCreate)
                        request.setBodyData(params)
                        await request.quickSend()
                        message.success('创建成功')
                        reloadData()
                      })
                    }}
                  >
                    复制
                  </a>
                  <a
                    onClick={() => {
                      const dialog = TableInfoDialog.dialogForEditing(item)
                      dialog.show(async (params) => {
                        const request = MyRequest(new CommonAPI(TableApis.TableUpdate, item.tableId))
                        request.setBodyData(params)
                        await request.quickSend()
                        message.success('修改成功')
                        reloadData()
                      })
                    }}
                  >
                    修改
                  </a>
                  <a
                    onClick={() => {
                      const dialog = new ConfirmDialog({
                        content: `确定要删除吗？`,
                      })
                      dialog.show(async () => {
                        const request = MyRequest(new CommonAPI(TableApis.TableDelete, item.tableId))
                        await request.quickSend()
                        message.success('删除成功')
                        reloadData()
                      })
                    }}
                  >
                    删除
                  </a>
                </Space>
                <Space>
                  <Link to={{ pathname: `/v1/table/${item.tableId}/data` }}>
                    <a style={{ color: '#52c41a' }}>查看数据</a>
                  </Link>
                </Space>
              </Space>
            ),
          },
        ])}
        defaultSettings={{
          pageSize: 10,
          sortKey: 'createdAt',
          sortDirection: 'descending',
        }}
        loadData={async (retainParams) => {
          const request = MyRequest(TableApis.TablePageDataGet)
          request.setQueryParams(retainParams)
          return request.quickSend<PageResult<M_DataTable>>()
        }}
      />
    </div>
  )
}
