import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { TableApis } from '@web/data-common/admin-api'
import { CommonAPI } from '@fangcha/app-request'
import { M_DataTable } from '@web/data-common/models'

export const useTableInfo = (tableId: string, version?: number): M_DataTable => {
  const [data, setData] = useState()
  useEffect(() => {
    MyRequest(new CommonAPI(TableApis.TableInfoGet, tableId))
      .quickSend()
      .then((response) => {
        setData(response)
      })
  }, [tableId, version])
  return data!
}
