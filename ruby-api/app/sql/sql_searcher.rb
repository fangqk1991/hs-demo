class SqlSearcher < SqlBuilderBase
  attr_accessor :query_columns

  @_offset = -1
  @_length = -1
  @_order_rules = []

  def initialize
    super
    @_offset = -1
    @_length = -1
    @query_columns = []
    @_order_rules = []
  end

  def set_columns(columns)
    @query_columns = columns
  end

  def _columns_desc
    if @query_columns.length == 0
      return '*'
    end
    @query_columns.map do |column|
      column.match(/^\w+$/) ? "`#{column}`" : column
    end.join(', ')
  end

  def set_limit_info(offset, length)
    @_offset = offset.to_i
    @_length = length.to_i
    self
  end

  def export_sql
    check_table_valid
    query = "SELECT #{_columns_desc} FROM #{table}"
    query = "#{query} WHERE #{build_condition_str}" if @condition_columns.length > 0
    {
      query: query,
      stmt_values: @condition_values,
    }
  end

  def add_order_rule(sort_key, direction)
    direction = 'ASC' unless direction == 'DESC'
    @_order_rules.push({
                         'sortKey' => sort_key,
                         'sortDirection' => direction
                       })
  end

  def query_single
    set_limit_info(0, 1)
    item, = query_list
    item
  end

  def query_list
    if @_length == 0
      return []
    end
    data = export_sql
    puts data
    query = data[:query]
    if @_order_rules.length > 0
      order_items = @_order_rules.map { |rule|
        key = rule['sortKey']
        key = "`#{key}`" if key.match(/^\w+$/)
        "#{key} #{rule['sortDirection']}"
      }
      query = "#{query} ORDER BY #{order_items.join(', ')}"
    end
    if @_offset >= 0 && @_length >= 0
      query = "#{query} LIMIT #{@_offset}, #{@_length}"
    end
    sql = query.gsub(/\?/).with_index { |m, i| ActiveRecord::Base.connection.quote(data[:stmt_values][i]) }
    puts sql
    ActiveRecord::Base.connection.exec_query(sql)
  end

  def query_count
    query = "SELECT COUNT(*) AS count FROM #{table}"
    result = ActiveRecord::Base.connection.exec_query(query)
    result[0]['count']
  end
end
