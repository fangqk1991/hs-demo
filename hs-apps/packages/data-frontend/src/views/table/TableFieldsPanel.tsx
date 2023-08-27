import React from 'react'
import { Tag, Tooltip } from 'antd'
import { DataFieldTypeDescriptor, M_DataTable } from '@web/data-common/models'
import { TinyList } from '../common/TinyList'
import { InfoCircleFilled } from '@ant-design/icons'

interface Props {
  table: M_DataTable
}

export const TableFieldsPanel: React.FC<Props> = ({ table }) => {
  return (
    <div style={{ maxWidth: '500px' }}>
      {table.fieldItems.map((field) => (
        <Tag key={field.key} color={'geekblue'}>
          {field.name}
          <Tooltip
            title={
              <TinyList>
                <li>key: {field.key}</li>
                <li>字段类型: {DataFieldTypeDescriptor.describe(field.fieldType)}</li>
              </TinyList>
            }
          >
            <InfoCircleFilled style={{ marginLeft: '4px' }} />
          </Tooltip>
        </Tag>
      ))}
    </div>
  )
}
