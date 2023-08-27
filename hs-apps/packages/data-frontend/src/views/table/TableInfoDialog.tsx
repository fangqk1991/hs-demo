import { ProForm, ProFormText } from '@ant-design/pro-components'
import { Button, ConfigProvider, Empty, Form, Select, Space, Table } from 'antd'
import React, { useState } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { DataFieldType, DataFieldTypeDescriptor, M_DataTableParams, M_TableField } from '@web/data-common/models'
import { InputCell } from '../common/InputCell'

interface Props extends DialogProps<M_DataTableParams> {
  forEditing?: boolean
}

export class TableInfoDialog extends ReactDialog<Props, M_DataTableParams> {
  title = '编辑数据表'
  width = 1000

  public static dialogForCreating(data?: M_DataTableParams) {
    const dialog = new TableInfoDialog({})
    dialog.title = '创建数据表'
    if (data) {
      dialog.props.curValue = data
    }
    return dialog
  }

  public static dialogForEditing(data: M_DataTableParams) {
    const dialog = new TableInfoDialog({
      curValue: data,
      forEditing: true,
    })
    dialog.title = '编辑数据表'
    return dialog
  }

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const [params, setParams] = useState(() => {
        return JSON.parse(
          JSON.stringify(
            props.curValue ||
              ({
                name: '',
                fieldItems: [],
              } as M_DataTableParams)
          )
        ) as M_DataTableParams
      })

      const [form] = Form.useForm<M_DataTableParams>()
      props.context.handleResult = () => {
        return {
          ...form.getFieldsValue(),
          fieldItems: params.fieldItems,
        } as M_DataTableParams
      }
      return (
        <ProForm<M_DataTableParams>
          style={{ marginTop: '12px' }}
          form={form}
          autoFocusFirstInput
          initialValues={params}
          submitter={false}
        >
          <ProFormText name='name' label='表名称' required={true} />
          {!props.forEditing && (
            <ConfigProvider
              renderEmpty={() => (
                <Empty>
                  <Button
                    type='primary'
                    onClick={() => {
                      setParams({
                        ...params,
                        fieldItems: [
                          ...params.fieldItems,
                          {
                            name: '',
                            fieldType: DataFieldType.Text,
                          },
                        ],
                      })
                    }}
                  >
                    添加
                  </Button>
                </Empty>
              )}
            >
              <Table
                rowKey={(item) => item.name}
                columns={[
                  {
                    title: '字段名称',
                    render: (item: M_TableField, _, index) => {
                      return (
                        <InputCell
                          defaultValue={item.name}
                          onValueChanged={(value) => {
                            params.fieldItems[index].name = value
                            // setParams({
                            //   ...params,
                            // })
                          }}
                        />
                      )
                    },
                  },
                  {
                    title: '字段类型',
                    render: (item: M_TableField, _, index) => {
                      return (
                        <Select
                          value={item.fieldType || DataFieldType.Text}
                          style={{ width: '100%' }}
                          onChange={(value) => {
                            params.fieldItems[index].fieldType = value
                            setParams({
                              ...params,
                            })
                          }}
                          options={DataFieldTypeDescriptor.options()}
                        />
                      )
                    },
                  },
                  {
                    title: '操作',
                    width: 100,
                    render: (item: M_TableField, _, index) => (
                      <Space>
                        <Button
                          type={'link'}
                          onClick={() => {
                            setParams({
                              ...params,
                              fieldItems: [
                                ...params.fieldItems.slice(0, index + 1),
                                {
                                  name: '',
                                  fieldType: DataFieldType.Text,
                                },
                                ...params.fieldItems.slice(index + 1),
                              ],
                            })
                          }}
                        >
                          添加
                        </Button>
                        <Button
                          type={'link'}
                          onClick={() => {
                            setParams({
                              ...params,
                              fieldItems: [...params.fieldItems.slice(0, index), ...params.fieldItems.slice(index + 1)],
                            })
                          }}
                        >
                          删除
                        </Button>
                      </Space>
                    ),
                  },
                ]}
                dataSource={params.fieldItems}
                pagination={false}
              />
            </ConfigProvider>
          )}
        </ProForm>
      )
    }
  }
}
