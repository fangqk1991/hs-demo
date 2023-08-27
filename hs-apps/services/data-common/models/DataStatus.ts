import { Descriptor } from '@fangcha/tools'

export enum DataStatus {
  Normal = 'Normal',
  Creating = 'Creating',
  Updating = 'Updating',
  Deleting = 'Deleting',
  Deleted = 'Deleted',
}

const values = [DataStatus.Normal, DataStatus.Creating, DataStatus.Updating, DataStatus.Deleting, DataStatus.Deleted]

const describe = (code: DataStatus) => {
  switch (code) {
    case DataStatus.Normal:
      return '常规'
    case DataStatus.Creating:
      return '创建审核中'
    case DataStatus.Updating:
      return '变更审核中'
    case DataStatus.Deleting:
      return '删除审核中'
    case DataStatus.Deleted:
      return '已删除'
  }
  return 'Unknown'
}

export const DataStatusDescriptor = new Descriptor(values, describe)
