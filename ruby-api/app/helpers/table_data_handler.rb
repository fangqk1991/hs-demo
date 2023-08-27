class TableDataHandler
  def initialize(table)
    @table = table
    @field_items = table.field_items
  end

  def self.make_system_params(options = {})
    direction = options['_sortDirection'] || 'ASC'
    unless ['ASC', 'DESC'].include?(direction)
      if direction == 'ascending'
        direction = 'ASC'
      elsif direction == 'descending'
        direction = 'DESC'
      else
        direction = 'ASC'
      end
    end
    _offset = options['_offset'] || 0
    _length = options['_length'] || -1

    {
      sortKey: options['_sortKey'] || '',
      sortDirection: direction,
      offset: _offset.to_i || 0,
      length: _length.to_i || 0,
    }
  end

  def field_mapper
    [].concat(@field_items).concat(Constants::SystemFields).reduce({}) { |result, cur|
      result[cur['key']] = cur
      result
    }
  end

  def get_searcher(options = {})
    params = TableDataHandler.make_system_params(options)
    mapper = field_mapper
    searcher = SqlSearcher.new
    searcher.table = @table.sql_table_name
    searcher.set_columns(['*'])
    if params[:offset] >= 0 && params[:length] > 0
      searcher.set_limit_info(params[:offset], params[:length])
    end
    if !params[:sortKey].empty? && !mapper[params[:sortKey]].empty?
      searcher.add_order_rule(params[:sortKey], params[:sortDirection])
    end
    params_keys = options.keys
    params_keys.select { |key|
      key.match(/^\w+$/) && mapper[key] && (!options[key].nil? && !options[key].empty)
    }.each do |key|
      searcher.add_condition_kv(mapper[key]['key'], options[key])
    end
    params_keys.each do |key|
      matches = key.match(/^(\w+)\.(\$\w+)$/)
      if !matches || !mapper[matches[1]]
        next
      end
      match_field = mapper[matches[1]]
      column_key = match_field['key']
      symbol = matches[2]
      if symbol == '$in' && options[key].kind_of?(Array)
        searcher.add_condition_key_in_array(column_key, options[key])
      elsif symbol == '$inStr'
        values = options[key].split(',').map { |item| item.strip }.select { |item| !item.empty? }
        searcher.add_condition_key_in_array(column_key, values)
      end
    end
    searcher.add_special_condition('data_status != ?', ['Deleted'])
    searcher
  end

  def get_page_result(options, field_key_list = nil)
    params = TableDataHandler.make_system_params(options)
    searcher = get_searcher(options)
    if field_key_list
      searcher.set_columns(field_key_list)
    end
    items = searcher.query_list
    {
      offset: params[:offset],
      length: items.length,
      totalCount: searcher.query_count,
      items: items,
    }
  end

  def get_data_record(data_id)
    searcher = get_searcher
    searcher.add_condition_kv('data_id', data_id)
    searcher.query_single
  end

  def create_record(options = {}, flags = {})
    author = flags['author'] || ''
    options = purify_data(options)
    data_id = SecureRandom.uuid.gsub('-', '')
    adder = SqlAdder.new
    adder.table = @table.sql_table_name
    adder.insert_kv('data_id', data_id)
    adder.insert_kv('author', author)
    adder.insert_kv('update_author', author)
    if flags['withoutAudit']
      options.each do |key, value|
        adder.insert_kv(key, value)
      end
      adder.insert_kv('data_status', 'Normal')
      adder.insert_kv('draft_data_str', nil)
    else
      adder.insert_kv('data_status', 'Creating')
      adder.insert_kv('draft_data_str', JSON.unparse(options))
    end
    adder.execute
    get_data_record(data_id)
  end

  def update_record(data_info, options, flags)
    raise StandardError.new '数据当前处于待删除状态，不可修改' unless data_info['data_status'] != 'Deleting'
    options = purify_data(options)
    keys = options.keys
    raise StandardError.new '数据无修改' unless keys.length > 0

    modifier = SqlModifier.new
    modifier.table = @table.sql_table_name
    modifier.add_condition_kv('data_id', data_info['data_id'])
    modifier.update_kv('update_author', flags['author'] || '')
    if flags['withoutAudit']
      options.each do |key, value|
        modifier.update_kv(key, value)
      end
      modifier.update_kv('data_status', 'Normal')
      modifier.update_kv('draft_data_str', nil)
    else
      modifier.update_kv('data_status', 'Updating')
      modifier.update_kv('draft_data_str', JSON.unparse(options))
    end
    modifier.execute
    get_data_record(data_info['data_id'])
  end

  def delete_record(data_info, flags)
    raise StandardError.new '数据当前处于待删除状态，不可修改' unless data_info['data_status'] != 'Deleting'
    data_status = flags['withoutAudit'] ? 'Deleted' : 'Deleting'
    modifier = SqlModifier.new
    modifier.table = @table.sql_table_name
    modifier.update_kv('data_status', data_status)
    modifier.update_kv('update_author', flags['author'] || '')
    modifier.add_condition_kv('data_id', data_info['data_id'])
    modifier.execute
    data_status
  end

  def check_reviewing_permission(data_info, permission_map)
    if data_info['data_status'] === 'Creating'
      raise StandardError.new "缺少权限 #{DataPermissionKey::Data_Approval_Create}" unless permission_map[DataPermissionKey::Data_Approval_Create]
    elsif data_info['data_status'] === 'Updating'
      raise StandardError.new "缺少权限 #{DataPermissionKey::Data_Approval_Update}" unless permission_map[DataPermissionKey::Data_Approval_Update]
    elsif data_info['data_status'] === 'Deleting'
      raise StandardError.new "缺少权限 #{DataPermissionKey::Data_Approval_Delete}" unless permission_map[DataPermissionKey::Data_Approval_Delete]
    end
  end

  def pass_audit_data(data_info)
    raise StandardError.new '当前数据无需审批' unless data_info['data_status'] != 'Normal'
    modifier = SqlModifier.new
    modifier.table = @table.sql_table_name
    if data_info['data_status'] == 'Creating' || data_info['data_status'] == 'Updating'
      options = parse_json(data_info['draft_data_str'])
      options.each do |key, value|
        modifier.update_kv(key, value)
      end
      modifier.update_kv('data_status', 'Normal')
      modifier.update_kv('draft_data_str', nil)
    elsif data_info['data_status'] == 'Deleting'
      modifier.update_kv('data_status', 'Deleted')
    end
    modifier.add_condition_kv('data_id', data_info['data_id'])
    modifier.execute
  end

  def reject_audit_data(data_info)
    raise StandardError.new '当前数据无需审批' unless data_info['data_status'] != 'Normal'
    modifier = SqlModifier.new
    modifier.table = @table.sql_table_name
    if data_info['data_status'] == 'Creating'
      modifier.update_kv('data_status', 'Deleted')
    elsif data_info['data_status'] == 'Updating' || data_info['data_status'] == 'Deleting'
      modifier.update_kv('data_status', 'Normal')
    end
    modifier.update_kv('draft_data_str', nil)
    modifier.add_condition_kv('data_id', data_info['data_id'])
    modifier.execute
  end

  def __bulk_upsert_records(records, author)
    bulk_adder = SqlBulkAdder.new
    bulk_adder.table = @table.sql_table_name
    bulk_adder.set_insert_keys(['data_id', 'data_status', 'author', 'update_author'].concat(@field_items.map { |field| field['key'] }))
    records.each do |options|
      data_id = options['data_id']
      data_item = purify_data(options)
      data_item['data_id'] = data_id
      unless data_item['data_id']
        data_item['data_id'] = SecureRandom.uuid.gsub('-', '')
      end
      data_item['author'] = author
      data_item['update_author'] = author
      data_item['data_status'] = 'Normal'
      bulk_adder.put_object(data_item)
    end
    bulk_adder.execute
  end

  def bulk_upsert_records (records, flags)
    puts records
    author = flags['author'] || ''
    searcher = get_searcher({})
    searcher.add_condition_key_in_array('data_id', records.map { |record| record['data_id'] }.select { |item| !!item })
    searcher.add_condition_key_not_in_array('data_status', ['Deleting'])
    searcher.set_limit_info(-1, -1)
    existing_items = searcher.query_list
    cur_data_mapper = {}
    existing_items.each do |item|
      item['draftData'] = parse_json(item['draft_data_str'])
      cur_data_mapper[item['data_id']] = item
    end
    to_update_items = records.select { |item| !!cur_data_mapper[item['data_id']] }
    to_insert_items = records.select { |item| item['data_id'].nil? || item['data_id'].empty? }
    if flags['canInsert']
      __bulk_upsert_records(to_insert_items, author)
    else
      bulk_adder = SqlBulkAdder.new
      bulk_adder.table = @table.sql_table_name
      bulk_adder.set_insert_keys(['data_id', 'data_status', 'author', 'update_author', 'draft_data_str'])
      to_insert_items.each do |item|
        obj = {
          'data_id' => SecureRandom.uuid.gsub('-', ''),
          'data_status' => 'Creating',
          'author' => author,
          'update_author' => author,
          'draft_data_str' => JSON.unparse(purify_data(item)),
        }
        bulk_adder.put_object(obj)
      end
      bulk_adder.execute
    end
    if flags['canUpdate']
      __bulk_upsert_records(to_update_items, author)
    else
      bulk_adder = SqlBulkAdder.new
      bulk_adder.table = @table.sql_table_name
      bulk_adder.set_insert_keys(['data_id', 'data_status', 'update_author', 'draft_data_str'])
      to_update_items.each do |item|
        obj = {
          'data_id' => item['data_id'],
          'data_status' => 'Updating',
          'update_author' => author,
          'draft_data_str' => JSON.unparse(purify_data(item)),
        }
        bulk_adder.put_object(obj)
      end
      bulk_adder.execute
    end

  end

  def purify_data(data)
    field_items = @field_items
    data = field_items.select { |field| !data[field['key']].nil? }.reduce({}) { |result, field|
      result[field['key']] = data[field['key']]
      result
    }
    field_items.select { |field| field['fieldType'] != 'Text' }.each do |field|
      data[field['key']] = nil if data[field['key']] == ''
    end
    # TODO value check
    data
  end

  def parse_json(str)
    begin
      data = JSON.parse(str)
      return data
    rescue => e
      puts e
    end
    {}
  end
end
