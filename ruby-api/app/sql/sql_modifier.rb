class SqlModifier < SqlBuilderBase
  def initialize
    super
    @_update_columns = []
  end

  def update_kv(key, value)
    @_update_columns.push("#{key} = #{ActiveRecord::Base.connection.quote(value)}")
  end

  def execute
    if @_update_columns.length == 0
      return
    end
    query = "UPDATE #{table} SET #{@_update_columns.join(', ')} WHERE #{build_filled_condition_str}"
    puts query
    ActiveRecord::Base.connection.execute(query)
  end
end
