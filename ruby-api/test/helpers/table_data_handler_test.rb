require "test_helper"

class TableDataHandlerTest < ActiveSupport::TestCase
  test "make_system_params" do
    puts TableDataHandler.make_system_params
  end

  test "field_mapper" do
    table,  = DataTable.all
    handler = TableDataHandler.new(table)
    puts handler.field_mapper
  end

  test "get_searcher" do
    table,  = DataTable.all
    handler = TableDataHandler.new(table)
    puts handler.get_searcher
  end

  test "create_record" do
    table,  = DataTable.all
    handler = TableDataHandler.new(table)
    puts handler.create_record({}, {})
  end
end
