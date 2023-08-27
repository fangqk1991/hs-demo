class SqlAdder < SqlBuilderBase
  def initialize
    super
    @_insert_keys = []
    @_insert_values = []
  end

  def insert_kv(key, value)
    @_insert_keys.push(key)
    @_insert_values.push(value)
  end

  def execute
    raise StandardError.new 'insertKeys missing.' unless @_insert_keys.length > 0
    raise StandardError.new 'the length of keys and values is not equal.' unless @_insert_keys.length == @_insert_values.length

    values = @_insert_values.map { |val| ActiveRecord::Base.connection.quote(val) }
    query = "INSERT INTO #{table}(#{@_insert_keys.join(', ')}) VALUES (#{values.join(', ')})"
    puts query
    ActiveRecord::Base.connection.execute(query)
  end
end
