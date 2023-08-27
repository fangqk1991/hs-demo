class DataSpecHandler
  String @table_id

  def initialize(table_id)
    @table_id = table_id
  end

  def prepare_table
    unless @table
      table = DataTable.find_by({
                                  table_id: @table_id,
                                  is_deleted: 0,
                                })
      raise StandardError.new "数据表 [tableId = #{@table_id}] 不存在" unless table
      @table = table
    end
    @table
  end

  def table_handler
    TableDataHandler.new(prepare_table)
  end
end
