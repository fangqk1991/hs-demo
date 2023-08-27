import { DataStatus } from './DataStatus'

export interface M_DataInfo {
  rid: number
  data_id: string
  version: number
  data_status: DataStatus
  author: string
  update_author: string
  created_at: string
  updated_at: string
  draft_data_str: string

  draftData?: {}
}

export interface M_OperatorParams {
  author?: string
  withoutAudit?: boolean
}
