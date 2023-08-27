class Constants
  JwtKey = 'data_token_jwt'

  FieldTypes = ['Text', 'Integer', 'Float', 'Date', 'Datetime']

  DataStatusList = ['Normal', 'Creating', 'Updating', 'Deleting', 'Deleted']

  SystemFields = [
    {
      'key' => 'data_id',
      'name' => 'data_id',
      'fieldType' => 'Text',
    },
    {
      'key' => 'data_status',
      'name' => '数据状态',
      'fieldType' => 'Text',
    },
    {
      'key' => 'created_at',
      'name' => '创建时间',
      'fieldType' => 'Datetime',
    },
    {
      'key' => 'updated_at',
      'name' => '更新时间',
      'fieldType' => 'Datetime',
    }
  ]
end
