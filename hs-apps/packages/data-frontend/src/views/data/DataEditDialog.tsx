import React, { useRef } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { M_TableField } from '@web/data-common/models'
import { DataNormalForm } from './DataNormalForm'

interface Props extends DialogProps {
  fields: M_TableField[]
  data?: any
  withoutAudit?: boolean
}

export class DataEditDialog extends ReactDialog<Props> {
  width = '80%'
  title = '数据记录'

  public rawComponent(): React.FC<Props> {
    return (props) => {
      let data = props.data
      if (!data) {
        data = {}
      }
      data = JSON.parse(JSON.stringify(data))

      const formRef = useRef({
        exportResult: () => null,
      })

      props.context.handleResult = async () => {
        return await formRef.current.exportResult()
      }
      return (
        <div>
          <DataNormalForm ref={formRef} allFields={props.fields} myData={data} />
          {props.withoutAudit ? (
            <p style={{ color: '#52c41a' }}>本操作无需审核</p>
          ) : (
            <p style={{ color: '#ff4d4f' }}>本操作需要审核</p>
          )}
        </div>
      )
    }
  }
}
