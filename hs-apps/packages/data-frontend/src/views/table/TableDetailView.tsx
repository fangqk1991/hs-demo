import React, { useState } from 'react'
import { Breadcrumb, Button, Descriptions, Divider, message, Spin } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { useTableInfo } from './useTableInfo'
import { formatTime } from '../../core/formatTime'
import { TableFieldsPanel2 } from './TableFieldsPanel2'
import { TableInfoDialog } from './TableInfoDialog'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { TableApis } from '@web/data-common/admin-api'

export const TableDetailView: React.FC = () => {
  const { tableId = '' } = useParams()
  const [version, setVersion] = useState(0)
  const tableInfo = useTableInfo(tableId, version)

  if (!tableInfo) {
    return <Spin size='large' />
  }

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to={{ pathname: `/v1/table` }}>数据表</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{tableInfo.name}</Breadcrumb.Item>
      </Breadcrumb>
      <Divider />
      <Descriptions
        title={
          <div>
            <h3>基本信息</h3>
            <Button
              onClick={() => {
                const dialog = TableInfoDialog.dialogForEditing(tableInfo)
                dialog.show(async (params) => {
                  const request = MyRequest(new CommonAPI(TableApis.TableUpdate, tableInfo.tableId))
                  request.setBodyData(params)
                  await request.quickSend()
                  message.success('修改成功')
                  setVersion(version + 1)
                })
              }}
            >
              编辑
            </Button>
          </div>
        }
      >
        <Descriptions.Item label='ID'>{tableInfo.tableId}</Descriptions.Item>
        <Descriptions.Item label='名称'>{tableInfo.name}</Descriptions.Item>
        <Descriptions.Item label='创建人'>{tableInfo.author}</Descriptions.Item>
        <Descriptions.Item label='创建时间'>{formatTime(tableInfo.createdAt)}</Descriptions.Item>
        <Descriptions.Item label='最近更新人'>{tableInfo.updateAuthor}</Descriptions.Item>
        <Descriptions.Item label='最近更新时间'>{formatTime(tableInfo.updatedAt)}</Descriptions.Item>
      </Descriptions>
      <Divider />
      <h3>字段信息</h3>
      <TableFieldsPanel2 table={tableInfo} />

      <Divider />
      <Link to={{ pathname: `/v1/table/${tableInfo.tableId}/data` }}>
        <Button type={'primary'}>查看数据</Button>
      </Link>
    </div>
  )
}
