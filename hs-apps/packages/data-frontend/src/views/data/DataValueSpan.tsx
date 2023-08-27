import React from 'react'
import { DataFieldType, DataStatus, M_TableField } from '@web/data-common/models'
import { formatTime } from '../../core/formatTime'
import { Space } from 'antd'

interface Props {
  data: any
  field: M_TableField
}

const getVal = (data: any, field: M_TableField) => {
  let value = data[field.key]
  if (field.fieldType === DataFieldType.Datetime && value) {
    value = formatTime(data[field.key])
  }
  return value
}

export const DataValueSpan: React.FC<Props> = ({ data, field }) => {
  const curVal = getVal(data, field)

  if (data.data_status === DataStatus.Creating) {
    const draftData = data.draftData || {}
    const draftVal = getVal(draftData, field)
    if (curVal !== draftVal) {
      return (
        <b
          style={{
            color: 'red',
          }}
        >
          {draftVal}
        </b>
      )
    }
  } else if (data.data_status === DataStatus.Updating) {
    const draftData = data.draftData || {}
    const draftVal = getVal(draftData, field)
    if (curVal !== draftVal) {
      return (
        <Space direction={'vertical'}>
          <span>
            {curVal} {'-> '}
          </span>
          <b
            style={{
              color: 'red',
            }}
          >
            {draftVal}
          </b>
        </Space>
      )
    }
  }

  return <span>{curVal}</span>
}
