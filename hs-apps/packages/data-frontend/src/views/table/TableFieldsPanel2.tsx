import React from 'react'
import { Tag, Tooltip } from 'antd'
import { DataFieldTypeDescriptor, M_DataTable } from '@web/data-common/models'
import { TinyList } from '../common/TinyList'
import { InfoCircleFilled } from '@ant-design/icons'

interface Props {
  table: M_DataTable
}

export const TableFieldsPanel2: React.FC<Props> = ({ table }) => {
  return (
    <TinyList>
      {table.fieldItems.map((field) => (
        <li key={field.key}>
          <Tag color={'geekblue'}>{DataFieldTypeDescriptor.describe(field.fieldType)}</Tag>
          <b> {field.name}</b>
          <Tooltip title={<span>key: {field.key}</span>}>
            <InfoCircleFilled style={{ marginLeft: '4px' }} />
          </Tooltip>
        </li>
      ))}
    </TinyList>
  )
}
