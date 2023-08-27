require "test_helper"

class DataTableTest < ActiveSupport::TestCase
  test "get all" do
    puts DataTable.all
    assert true
  end

  test "table methods" do
    table, = DataTable.all
    puts "table.sql_table_name => #{table.sql_table_name}"
  end

  test "table generate" do
    table = DataTable.generate({
                                  'name' => 'test',
                                  'fieldItems' => [
                                    {
                                      'name' => 'field_1',
                                      'fieldType' => 'Text',
                                    }
                                  ],
                                })
    puts table
  end
end
