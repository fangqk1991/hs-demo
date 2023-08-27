import React, { forwardRef, useImperativeHandle } from 'react'
import {
  ProForm,
  ProFormDatePicker,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormText,
} from '@ant-design/pro-components'
import { Form } from 'antd'
import { DataFieldType, M_TableField } from '@web/data-common/models'

interface Props {
  allFields: M_TableField[]
  myData: any
}

export const DataNormalForm: React.FC<Props> = forwardRef((props, ref) => {
  const myData = {
    ...props.myData,
  }
  props.allFields
    .filter((field) => field.fieldType === DataFieldType.Date || field.fieldType === DataFieldType.Datetime)
    .forEach((field) => {
      if (myData[field.key] !== undefined && !myData[field.key]) {
        myData[field.key] = null
      }
    })

  const [form] = Form.useForm<any>()

  useImperativeHandle(ref, () => ({
    exportResult: () => {
      const data = form.getFieldsValue()
      props.allFields
        .filter((field) => field.fieldType === DataFieldType.Date)
        .forEach((field) => {
          if (data[field.key] && data[field.key].format) {
            data[field.key] = data[field.key].format('YYYY-MM-DD')
          } else if (!data[field.key]) {
            data[field.key] = null
          }
        })
      props.allFields
        .filter((field) => field.fieldType === DataFieldType.Datetime)
        .forEach((field) => {
          if (data[field.key] && data[field.key].format) {
            data[field.key] = data[field.key].format()
          } else if (!data[field.key]) {
            data[field.key] = null
          }
        })
      return data
    },
  }))

  return (
    <div>
      <ProForm form={form} autoFocusFirstInput initialValues={myData} submitter={false}>
        {props.allFields.map((field) => {
          return (
            <ProForm.Item
              key={field.key}
              name={field.key}
              label={field.name}
              style={{
                margin: 0,
              }}
            >
              {(() => {
                switch (field.fieldType) {
                  case DataFieldType.Integer:
                  case DataFieldType.Float:
                    return <ProFormDigit />
                  case DataFieldType.Date:
                    return <ProFormDatePicker />
                  case DataFieldType.Datetime:
                    return <ProFormDateTimePicker />
                }
                return <ProFormText />
              })()}
            </ProForm.Item>
          )
        })}
      </ProForm>
    </div>
  )
})
