import React from 'react'
import { Tag } from 'antd'
import { DataStatus, DataStatusDescriptor } from '@web/data-common/models'

interface Props {
  status: DataStatus
}

export const DataStatusTag: React.FC<Props> = ({ status }) => {
  let color = ''
  switch (status) {
    case DataStatus.Normal:
      color = 'success'
      break
    case DataStatus.Creating:
    case DataStatus.Updating:
      color = 'warning'
      break
    case DataStatus.Deleting:
      color = 'error'
      break
  }
  return <Tag color={color}>{DataStatusDescriptor.describe(status)}</Tag>
}
