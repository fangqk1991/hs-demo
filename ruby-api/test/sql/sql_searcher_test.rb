require "test_helper"

class SqlSearcherTest < ActiveSupport::TestCase
  test "query_list" do
    searcher = SqlSearcher.new
    searcher.table = 'data_table'
    searcher.add_special_condition('_rid > ?', [0])
    puts searcher.query_list
  end

  test "query_count" do
    searcher = SqlSearcher.new
    searcher.table = 'data_table'
    puts 'query_count result: ', searcher.query_count
  end

  test "add_special_condition" do
    searcher = SqlSearcher.new
    searcher.table = 'data_table'
    searcher.add_special_condition('rid > ?', [0]).add_condition_kv('rid', 20)
    puts searcher.build_condition_str
  end

  test "export_sql" do
    searcher = SqlSearcher.new
    searcher.table = 'data_table'
    searcher.set_columns(['_rid', 'name'])
    searcher.add_special_condition('_rid > ?', [0]).add_condition_kv('_rid', 20)
    searcher.add_order_rule('_rid', 'ASC')
    puts searcher.export_sql
    puts searcher.query_list
  end
end
