class DataTable < ApplicationRecord
  self.table_name = "data_table"

  def field_items
    begin
      data = JSON.parse(field_items_str)
      return data
    rescue => e
      puts e
    end
    []
  end

  def sql_table_name
    "_t_#{self.table_id[0, 8]}"
  end

  def to_s
    JSON.unparse model_for_client
  end

  def self.generate(params)
    raise StandardError.new 'Params[name] invalid.' if params['name'].nil? || params['name'].empty?
    raise StandardError.new 'Params[fieldItems] invalid.' unless params['fieldItems'].kind_of?(Array)
    params['fieldItems'].each_with_index do |field, index|
      raise StandardError.new "Params[fieldItems[#{index}].name] invalid." if field['name'].nil? || field['name'].empty?
      raise StandardError.new "data_id 是保留字，不可用于字段名" if field['name'] == 'data_id'
      raise StandardError.new "Params[fieldItems[${index}].fieldType] invalid." unless Constants::FieldTypes.include?(field['fieldType'])
      hash = Digest::MD5.hexdigest(field['name'])[0, 8]
      field['key'] = "f_#{hash}"
    end
    raise StandardError.new '存在重复的字段名' if Set.new(params['fieldItems'].map { |field| field['name'] }).length != params['fieldItems'].length

    table = DataTable.new
    table.table_id = SecureRandom.uuid.gsub('-', '')
    table.name = params['name']
    table.field_items_str = JSON.unparse(params['fieldItems'])
    table.author = params['author'] || ''
    table.update_author = table.author
    table.save!

    column_descriptions = params['fieldItems'].map do |field|
      case field['fieldType']
      when 'Text'
        column_type = 'TEXT'
      when 'Integer'
        column_type = 'BIGINT'
      when 'Float'
        column_type = 'DOUBLE'
      when 'Date'
        column_type = 'DATE'
      when 'Datetime'
        column_type = 'TIMESTAMP'
      else
        column_type = 'TEXT'
      end
      "`#{field['key']}` #{column_type} NULL COMMENT '#{field['name']}'"
    end
    sql = "CREATE TABLE `#{table.sql_table_name}`
       (
           rid BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
           data_id CHAR(32) COLLATE ascii_bin NOT NULL UNIQUE,
           #{column_descriptions.join(',')},
           version BIGINT NOT NULL DEFAULT 0 COMMENT '版本号',
           data_status ENUM ('Normal','Creating','Updating','Deleting','Deleted') NOT NULL DEFAULT 'Normal',
           author VARCHAR(127) NOT NULL DEFAULT '' COMMENT '创建者',
           update_author VARCHAR(127) NOT NULL DEFAULT '' COMMENT '更新者',
           draft_data_str MEDIUMTEXT COMMENT '临时副本信息',
           created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
           updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
           INDEX (data_status)
       )"
    ActiveRecord::Base.connection.execute(sql)
    table
  end

  def update_infos(params)
    if params['name']
      self.name = params['name']
    end
    self.update_author = params['author'] || ''
    self.save!
  end

  def model_for_client
    {
      tableId: table_id,
      name: name,
      description: description,
      version: version,
      fieldItems: field_items,
      extrasInfo: extras_info,
      author: author,
      updateAuthor: update_author,
      createdAt: created_at,
      updatedAt: updated_at,
    }
  end
end
