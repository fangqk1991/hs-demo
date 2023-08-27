class SqlBulkAdder < SqlBuilderBase
  def initialize
    super
    @_insert_keys = []
    @_insert_objects = []
  end

  def set_insert_keys(keys)
    @_insert_keys = keys
  end

  def put_object(data)
    @_insert_objects.push(data)
  end

  def execute
    if @_insert_objects.length == 0
      return
    end
    raise StandardError.new 'insertKeys missing.' unless @_insert_keys.length > 0
    values_desc_list = @_insert_objects.map do |obj|
      vals = @_insert_keys.map { |key|
        ActiveRecord::Base.connection.quote(obj.key?(key) ? obj[key] : nil)
      }
      "(#{vals.join(', ')})"
    end
    addition_items = @_insert_keys.map { |key| "#{key} = VALUES(#{key})" }

    query = "INSERT INTO #{table}(#{@_insert_keys.join(', ')}) VALUES #{values_desc_list.join(', ')} ON DUPLICATE KEY UPDATE #{addition_items.join(', ')}"
    puts query
    ActiveRecord::Base.connection.execute(query)
  end
end
